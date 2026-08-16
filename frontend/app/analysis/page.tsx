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
    <main className="min-h-screen bg-[#f5f4ef] px-6 py-24 text-slate-950">
      <div className="mx-auto max-w-7xl">
        {/* PAGE HEADER */}
        <header className="mb-12">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-slate-500" />

            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
              Engineering Analysis
            </p>
          </div>

          <div className="mt-5 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
                Analyze an engineering system.
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
                Describe the system you want to analyze. FMEA Engineer will
                decompose the system, identify failure modes, trace propagation,
                prioritize risk, and recommend mitigation and verification.
              </p>
            </div>

            <div className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
              FMEA / ANALYSIS
            </div>
          </div>
        </header>

        {/* INPUT PANEL */}
        <section className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 bg-[#eeede8] px-8 py-5 sm:flex-row sm:items-center">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">
                Input 01
              </p>

              <h2 className="mt-1 text-sm font-semibold text-slate-900">
                Engineering System Description
              </h2>
            </div>

            <span className="font-mono text-[10px] text-slate-400">
              SYSTEM / FUNCTION / CONDITIONS
            </span>
          </div>

          <div className="p-8">
            <label
              htmlFor="system"
              className="text-sm font-medium text-slate-800"
            >
              Describe the system, components, functions, and operating
              conditions.
            </label>

            <textarea
              id="system"
              value={systemDescription}
              onChange={(event) =>
                setSystemDescription(event.target.value)
              }
              disabled={loading}
              placeholder="Example: Arduino autonomous robot using an ultrasonic sensor, Arduino controller, L298N motor driver, DC motors, and battery..."
              className="mt-4 min-h-52 w-full resize-y rounded-xl border border-slate-300 bg-[#f8f7f3] p-5 text-sm leading-7 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            />

            <div className="mt-6 flex flex-col gap-5 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-2xl">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  Engineering Notice
                </p>

                <p className="mt-2 text-xs leading-6 text-slate-500">
                  AI-generated Severity, Occurrence, Detection, and RPN
                  estimates are preliminary engineering assessments and
                  require validation.
                </p>
              </div>

              <button
                type="button"
                onClick={runAnalysis}
                disabled={loading}
                className="rounded-full bg-slate-950 px-7 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Analyzing..." : "Run FMEA Analysis"}
              </button>
            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <p className="font-medium">Analysis Error</p>
                <p className="mt-1">{error}</p>
              </div>
            )}
          </div>
        </section>

        {/* LOADING STATE */}
        {loading && (
          <section className="mt-10 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-[#eeede8] px-8 py-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">
                FMEA Engine
              </p>
            </div>

            <div className="p-8">
              <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                    Running engineering analysis...
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                    The system is being decomposed, failure modes are being
                    analyzed, risks are being prioritized, and mitigations are
                    being generated.
                  </p>
                </div>

                <div className="font-mono text-xs text-slate-400">
                  SYS → FAIL → RISK → VERIFY
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 border-y border-slate-200 sm:grid-cols-4">
                {[
                  ["01", "Decompose"],
                  ["02", "Failure Modes"],
                  ["03", "Risk"],
                  ["04", "Verify"],
                ].map(([number, label], index) => (
                  <div
                    key={number}
                    className={`px-4 py-4 ${
                      index !== 3 ? "border-r border-slate-200" : ""
                    }`}
                  >
                    <p className="font-mono text-[10px] text-slate-400">
                      {number}
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 h-1 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-slate-800" />
              </div>
            </div>
          </section>
        )}

        {/* REPORT */}
        {report && !loading && (
          <section className="mt-14">
            <div className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-slate-500" />

                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
                    Analysis Complete
                  </p>
                </div>

                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                  FMEA Engineering Report
                </h2>
              </div>

              <div className="text-left sm:text-right">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  Assessment Status
                </p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  Generated Successfully
                </p>
              </div>
            </div>

            <article className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
              {/* REPORT HEADER */}
              <div className="border-b border-slate-300 bg-[#eeede8]">
                <div className="flex flex-col justify-between gap-5 px-8 py-6 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
                      FMEA ENGINEER
                    </p>

                    <h3 className="mt-2 text-xl font-semibold text-slate-950">
                      Failure Mode & Effects Analysis
                    </h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      Document Type
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-700">
                      Engineering Risk Assessment
                    </p>
                  </div>
                </div>

                <div className="grid border-t border-slate-300 sm:grid-cols-3">
                  <div className="border-b border-slate-300 px-8 py-4 sm:border-b-0 sm:border-r">
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400">
                      Analysis
                    </p>

                    <p className="mt-1 text-xs text-slate-700">
                      AI-assisted FMEA
                    </p>
                  </div>

                  <div className="border-b border-slate-300 px-8 py-4 sm:border-b-0 sm:border-r">
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400">
                      Output
                    </p>

                    <p className="mt-1 text-xs text-slate-700">
                      Risk & Mitigation Assessment
                    </p>
                  </div>

                  <div className="px-8 py-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400">
                      Validation
                    </p>

                    <p className="mt-1 text-xs text-slate-700">
                      Engineering Review Required
                    </p>
                  </div>
                </div>
              </div>

              {/* REPORT CONTENT */}
              <div className="overflow-x-auto px-8 py-10">
                <div className="max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="mb-10 border-b border-slate-300 pb-6 text-3xl font-semibold tracking-tight text-slate-950">
                          {children}
                        </h1>
                      ),

                      h2: ({ children }) => (
                        <h2 className="mb-6 mt-14 flex items-center gap-4 border-b border-slate-200 pb-4 text-2xl font-semibold text-slate-950">
                          <span className="h-2 w-2 shrink-0 rounded-full bg-slate-700" />
                          {children}
                        </h2>
                      ),

                      h3: ({ children }) => (
                        <h3 className="mb-3 mt-9 text-lg font-semibold text-slate-900">
                          {children}
                        </h3>
                      ),

                      p: ({ children }) => (
                        <p className="mb-5 text-sm leading-7 text-slate-600">
                          {children}
                        </p>
                      ),

                      ul: ({ children }) => (
                        <ul className="mb-7 ml-6 list-disc space-y-2 text-sm leading-7 text-slate-600">
                          {children}
                        </ul>
                      ),

                      ol: ({ children }) => (
                        <ol className="mb-7 ml-6 list-decimal space-y-2 text-sm leading-7 text-slate-600">
                          {children}
                        </ol>
                      ),

                      li: ({ children }) => (
                        <li className="pl-1">{children}</li>
                      ),

                      strong: ({ children }) => (
                        <strong className="font-semibold text-slate-950">
                          {children}
                        </strong>
                      ),

                      em: ({ children }) => (
                        <em className="text-slate-500">{children}</em>
                      ),

                      blockquote: ({ children }) => (
                        <blockquote className="my-7 border-l-2 border-slate-500 bg-slate-50 px-6 py-5 text-sm leading-7 text-slate-600">
                          {children}
                        </blockquote>
                      ),

                      code: ({ children }) => (
                        <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700">
                          {children}
                        </code>
                      ),

                      table: ({ children }) => (
                        <div className="my-10 overflow-x-auto rounded-xl border border-slate-300 shadow-sm">
                          <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
                            {children}
                          </table>
                        </div>
                      ),

                      thead: ({ children }) => (
                        <thead className="bg-slate-900 text-white">
                          {children}
                        </thead>
                      ),

                      tbody: ({ children }) => (
                        <tbody className="divide-y divide-slate-200">
                          {children}
                        </tbody>
                      ),

                      tr: ({ children }) => (
                        <tr className="transition-colors hover:bg-slate-50">
                          {children}
                        </tr>
                      ),

                      th: ({ children }) => (
                        <th className="border-r border-slate-700 px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-100 last:border-r-0">
                          {children}
                        </th>
                      ),

                      td: ({ children }) => (
                        <td className="border-r border-slate-200 px-4 py-4 align-top text-xs leading-6 text-slate-600 last:border-r-0">
                          {children}
                        </td>
                      ),

                      hr: () => (
                        <hr className="my-10 border-slate-200" />
                      ),
                    }}
                  >
                    {report}
                  </ReactMarkdown>
                </div>
              </div>

              {/* REPORT FOOTER */}
              <div className="border-t border-slate-300 bg-[#eeede8] px-8 py-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400">
                    FMEA ENGINEER · AI-ASSISTED ENGINEERING ANALYSIS
                  </p>

                  <p className="text-xs text-slate-500">
                    Estimates require engineering validation.
                  </p>
                </div>
              </div>
            </article>
          </section>
        )}
      </div>
    </main>
  );
}