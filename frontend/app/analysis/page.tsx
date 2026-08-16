"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AnalysisPage() {
  const [systemDescription, setSystemDescription] = useState("");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runAnalysis() {
    setError("");
    setReport("");

    const description = systemDescription.trim();

    if (!description) {
      setError("Please describe the engineering system first.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemDescription: description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Analysis failed. Please try again.",
        );
      }

      setReport(data.report);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while running the analysis.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            FMEA Analysis
          </p>

          <h1 className="mt-5 text-5xl font-semibold tracking-tight">
            Analyze an engineering system.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-500">
            Describe the system you want to analyze. FMEA Engineer will
            decompose the system, identify failure modes, trace propagation,
            prioritize risk, and recommend mitigation and verification.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-8">
          <label
            htmlFor="system"
            className="text-sm font-medium text-zinc-300"
          >
            Engineering system description
          </label>

          <textarea
            id="system"
            value={systemDescription}
            onChange={(event) =>
              setSystemDescription(event.target.value)
            }
            disabled={loading}
            placeholder="Example: Arduino autonomous robot using an ultrasonic sensor, Arduino controller, L298N motor driver, DC motors, and battery..."
            className="mt-4 min-h-52 w-full resize-y rounded-xl border border-zinc-800 bg-black p-5 text-sm leading-7 text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
          />

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-600">
              AI-generated risk scores are engineering estimates and
              require validation.
            </p>

            <button
              type="button"
              onClick={runAnalysis}
              disabled={loading}
              className="rounded-full bg-white px-7 py-3 font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Run FMEA Analysis"}
            </button>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-300">
              {error}
            </div>
          )}
        </div>

        {loading && (
          <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-8">
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
              FMEA Engine
            </p>

            <h2 className="mt-3 text-2xl font-medium">
              Running engineering analysis...
            </h2>

            <p className="mt-3 text-zinc-500">
              The system is being decomposed, failure modes are being
              analyzed, risks are being prioritized, and mitigations are
              being generated.
            </p>

            <div className="mt-6 h-1 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-white" />
            </div>
          </div>
        )}

        {report && !loading && (
          <section className="mt-10">
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                Analysis Complete
              </p>

              <h2 className="mt-3 text-3xl font-semibold">
                FMEA Engineering Report
              </h2>
            </div>

            <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
              <div className="overflow-x-auto p-8">
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="mb-8 border-b border-zinc-800 pb-5 text-3xl font-semibold tracking-tight text-white">
                          {children}
                        </h1>
                      ),

                      h2: ({ children }) => (
                        <h2 className="mb-5 mt-12 border-b border-zinc-800 pb-3 text-2xl font-semibold text-white">
                          {children}
                        </h2>
                      ),

                      h3: ({ children }) => (
                        <h3 className="mb-3 mt-8 text-lg font-semibold text-white">
                          {children}
                        </h3>
                      ),

                      p: ({ children }) => (
                        <p className="mb-5 text-sm leading-7 text-zinc-300">
                          {children}
                        </p>
                      ),

                      ul: ({ children }) => (
                        <ul className="mb-6 ml-6 list-disc space-y-2 text-sm leading-7 text-zinc-300">
                          {children}
                        </ul>
                      ),

                      ol: ({ children }) => (
                        <ol className="mb-6 ml-6 list-decimal space-y-2 text-sm leading-7 text-zinc-300">
                          {children}
                        </ol>
                      ),

                      li: ({ children }) => (
                        <li className="pl-1">
                          {children}
                        </li>
                      ),

                      strong: ({ children }) => (
                        <strong className="font-semibold text-white">
                          {children}
                        </strong>
                      ),

                      blockquote: ({ children }) => (
                        <blockquote className="my-6 border-l-2 border-zinc-600 bg-zinc-900/50 px-5 py-4 text-sm text-zinc-400">
                          {children}
                        </blockquote>
                      ),

                      table: ({ children }) => (
                        <div className="my-8 overflow-x-auto rounded-xl border border-zinc-800">
                          <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
                            {children}
                          </table>
                        </div>
                      ),

                      thead: ({ children }) => (
                        <thead className="bg-zinc-900 text-zinc-100">
                          {children}
                        </thead>
                      ),

                      tbody: ({ children }) => (
                        <tbody className="divide-y divide-zinc-800">
                          {children}
                        </tbody>
                      ),

                      tr: ({ children }) => (
                        <tr className="transition hover:bg-zinc-900/50">
                          {children}
                        </tr>
                      ),

                      th: ({ children }) => (
                        <th className="border-r border-zinc-800 px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-300 last:border-r-0">
                          {children}
                        </th>
                      ),

                      td: ({ children }) => (
                        <td className="border-r border-zinc-800 px-4 py-4 align-top text-xs leading-6 text-zinc-400 last:border-r-0">
                          {children}
                        </td>
                      ),

                      hr: () => (
                        <hr className="my-10 border-zinc-800" />
                      ),
                    }}
                  >
                    {report}
                  </ReactMarkdown>
                </div>
              </div>
            </article>
          </section>
        )}
      </div>
    </main>
  );
}