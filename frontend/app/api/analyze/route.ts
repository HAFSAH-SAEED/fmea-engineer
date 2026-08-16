import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

const MAX_DESCRIPTION_LENGTH = 10_000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const PYTHON_TIMEOUT_MS = 5 * 60 * 1000;

const requestLog = new Map<string, { count: number; resetAt: number }>();

function getClientIdentifier(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(identifier: string) {
  const now = Date.now();
  const existing = requestLog.get(identifier);

  if (!existing || now >= existing.resetAt) {
    requestLog.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });

    return false;
  }

  if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  existing.count += 1;
  return false;
}

function runFmeaEngine(systemDescription: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const projectRoot = path.resolve(process.cwd(), "..");
    const pythonFile = path.join(projectRoot, "fmea_engineer.py");

    console.log("Starting FMEA engine...");
    console.log("Project root:", projectRoot);
    console.log("Python file:", pythonFile);

    const pythonProcess = spawn(
      "python",
      [pythonFile, systemDescription],
      {
        cwd: projectRoot,
        shell: false,
        env: {
          ...process.env,
          PYTHONIOENCODING: "utf-8",
          PYTHONUTF8: "1",
        },
      },
    );

    let stdout = "";
    let stderr = "";

    const timeout = setTimeout(() => {
      pythonProcess.kill();

      reject(
        new Error(
          "FMEA analysis timed out. Please try again with a shorter system description.",
        ),
      );
    }, PYTHON_TIMEOUT_MS);

    pythonProcess.stdout.on("data", (data) => {
      const output = data.toString();
      stdout += output;

      console.log("FMEA engine output:", output);
    });

    pythonProcess.stderr.on("data", (data) => {
      const output = data.toString();
      stderr += output;

      console.error("FMEA engine stderr:", output);
    });

    pythonProcess.on("error", (error) => {
      clearTimeout(timeout);

      console.error("Failed to start Python process:", error);

      reject(error);
    });

    pythonProcess.on("close", (code) => {
      clearTimeout(timeout);

      console.log("FMEA Python process closed with code:", code);
      console.log("FMEA stdout length:", stdout.length);
      console.log("FMEA stderr length:", stderr.length);

      if (code !== 0) {
        console.error("========== FMEA ENGINE FAILURE ==========");
        console.error("Exit code:", code);
        console.error("STDOUT:");
        console.error(stdout);
        console.error("STDERR:");
        console.error(stderr);
        console.error("=========================================");

        const actualError =
          stdout.trim() ||
          stderr.trim() ||
          `Python process exited with code ${code}.`;

        reject(
          new Error(
            `The FMEA engine failed.\n\n${actualError}`,
          ),
        );

        return;
      }

      const startMarker = "===== fmea-report.md =====";
      const endMarker = "===== end report =====";

      const startIndex = stdout.indexOf(startMarker);
      const endIndex = stdout.indexOf(endMarker);

      if (startIndex === -1 || endIndex === -1) {
        console.error(
          "Unexpected FMEA engine output:",
          stdout,
        );

        reject(
          new Error(
            "The FMEA engine completed but did not return a valid report.",
          ),
        );

        return;
      }

      const report = stdout
        .slice(startIndex + startMarker.length, endIndex)
        .trim();

      if (!report) {
        reject(
          new Error("The FMEA engine returned an empty report."),
        );

        return;
      }

      resolve(report);
    });
  });
}

export async function POST(request: NextRequest) {
  const clientIdentifier = getClientIdentifier(request);

  if (isRateLimited(clientIdentifier)) {
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json(
      {
        error: "Request must use application/json.",
      },
      {
        status: 415,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid JSON request.",
      },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    return NextResponse.json(
      {
        error: "Request body must be a JSON object.",
      },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const systemDescription = (
    body as Record<string, unknown>
  ).systemDescription;

  if (typeof systemDescription !== "string") {
    return NextResponse.json(
      {
        error: "systemDescription must be a string.",
      },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const cleanedDescription = systemDescription.trim();

  if (!cleanedDescription) {
    return NextResponse.json(
      {
        error: "System description cannot be empty.",
      },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  if (cleanedDescription.length > MAX_DESCRIPTION_LENGTH) {
    return NextResponse.json(
      {
        error: `System description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`,
      },
      {
        status: 413,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  if (!process.env.BACKBOARD_API_KEY) {
    console.error("BACKBOARD_API_KEY is not configured.");

    return NextResponse.json(
      {
        error: "The analysis service is not configured.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  try {
    const report = await runFmeaEngine(cleanedDescription);

    return NextResponse.json(
      {
        success: true,
        report,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("FMEA analysis error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "FMEA analysis failed.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}