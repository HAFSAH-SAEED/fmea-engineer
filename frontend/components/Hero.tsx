"use client";

import { useState } from "react";
import EngineeringGrid from "@/components/EngineeringGrid";

export default function Hero() {
  const [active, setActive] = useState(false);

  return (
    <section className="relative overflow-hidden bg-[#f5f4ef] px-5 pt-28 text-[#080a12] sm:px-8 lg:px-12">
      <EngineeringGrid />

      {/* Main technical frame */}
      <div className="pointer-events-none absolute inset-x-5 top-24 bottom-5 border border-slate-200 sm:inset-x-8 lg:inset-x-12" />

      {/* Corner marks */}
      <div className="pointer-events-none absolute left-5 top-24 h-8 w-8 border-l border-t border-slate-400 sm:left-8 lg:left-12" />
      <div className="pointer-events-none absolute right-5 top-24 h-8 w-8 border-r border-t border-slate-400 sm:right-8 lg:right-12" />
      <div className="pointer-events-none absolute bottom-5 left-5 h-8 w-8 border-b border-l border-slate-400 sm:left-8 lg:left-12" />
      <div className="pointer-events-none absolute bottom-5 right-5 h-8 w-8 border-b border-r border-slate-400 sm:right-8 lg:right-12" />

      <div className="relative z-10 mx-auto flex max-w-[1450px] flex-col">
        {/* =====================================================
            TOP BAR
        ===================================================== */}

        <div className="flex items-center justify-between px-2">
          <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-600">
            FMEA ENGINEER
          </div>

          <div className="hidden items-center gap-8 text-sm text-slate-500 sm:flex">
            <a
              href="#how-it-works"
              className="transition-colors duration-200 hover:text-black"
            >
              How It Works
            </a>

            <a
              href="/analysis"
              className="transition-colors duration-200 hover:text-black"
            >
              Analysis
            </a>

            <a
              href="https://github.com/HAFSAH-SAEED/fmea-engineer"
              target="_blank"
              rel="noreferrer"
              className="transition-colors duration-200 hover:text-black"
            >
              GitHub
            </a>
          </div>

          <a
            href="/analysis"
            className="rounded-full border border-slate-300 px-5 py-2.5 text-sm transition-all duration-300 hover:border-slate-500 hover:bg-white/60"
          >
            Start Analysis
          </a>
        </div>

        {/* =====================================================
            HERO CONTENT
        ===================================================== */}

        <div className="relative flex flex-col items-center pt-14 text-center sm:pt-16 lg:pt-18">
          {/* Very subtle oversized background word */}
          <div className="pointer-events-none absolute left-1/2 top-[42%] -z-10 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-serif text-[14rem] font-medium leading-none tracking-[-0.08em] text-slate-900/[0.022] sm:text-[18rem] lg:text-[23rem]">
            FMEA
          </div>

          {/* Eyebrow */}
          <div className="mb-6 flex items-center gap-3">
            <span
              className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${
                active
                  ? "bg-[#d4553a] shadow-[0_0_12px_rgba(212,85,58,0.45)]"
                  : "bg-slate-400"
              }`}
            />

            <span className="font-mono text-[9px] uppercase tracking-[0.34em] text-slate-500">
              AI-Assisted Failure Mode & Effects Analysis
            </span>

            <span className="h-px w-8 bg-slate-300" />
          </div>

          {/* =====================================================
              HEADLINE
          ===================================================== */}

          <h1 className="relative z-10 max-w-[1200px] font-serif text-[4.2rem] font-medium leading-[0.88] tracking-[-0.06em] sm:text-[5.8rem] md:text-[7rem] lg:text-[8rem]">
            Engineering Risk,
            <br />

            <span className="text-[#94a5bd]">
              Made Traceable.
            </span>
          </h1>

          {/* Description */}
          <p className="relative z-10 mt-7 max-w-[650px] text-base leading-7 text-slate-500 sm:text-lg sm:leading-8">
            Identify how engineering systems fail, trace how failures
            propagate, and determine which risks demand action.
          </p>

          {/* =====================================================
              BUTTONS
          ===================================================== */}

          <div className="relative z-20 mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/analysis"
              onMouseEnter={() => setActive(true)}
              onMouseLeave={() => setActive(false)}
              className="group inline-flex items-center gap-4 rounded-full bg-[#080a12] px-7 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#171a25]"
            >
              Start FMEA Analysis

              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>

            <a
              href="#how-it-works"
              className="rounded-full border border-slate-300 px-7 py-3.5 text-sm text-slate-600 transition-all duration-300 hover:border-slate-500 hover:bg-white/50"
            >
              View Methodology
            </a>
          </div>

          {/* =====================================================
              MINIMAL INTERACTIVE TRACE
          ===================================================== */}

          <div className="relative mt-10 h-[165px] w-full max-w-[1080px] overflow-hidden sm:mt-12 sm:h-[180px]">
            {/* Horizontal engineering baseline */}
            <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-200" />

            {/* Active trace */}
            <div
              className={`absolute left-1/2 top-1/2 h-px -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ${
                active
                  ? "w-[72%] bg-[#d4553a]"
                  : "w-[20%] bg-slate-400"
              }`}
            />

            {/* Central marker */}
            <div
              className={`absolute left-1/2 top-1/2 flex h-[62px] w-[62px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-[#f5f4ef] transition-all duration-700 ${
                active
                  ? "border-[#d4553a]"
                  : "border-slate-300"
              }`}
            >
              <div
                className={`h-2.5 w-2.5 rounded-full transition-all duration-500 ${
                  active
                    ? "bg-[#d4553a] shadow-[0_0_14px_rgba(212,85,58,0.55)]"
                    : "bg-slate-400"
                }`}
              />
            </div>

            {/* Left endpoint */}
            <div className="absolute left-[8%] top-1/2 -translate-y-1/2">
              <div
                className={`h-3 w-3 rounded-full border bg-[#f5f4ef] transition-all duration-500 ${
                  active ? "border-[#d4553a]" : "border-slate-300"
                }`}
              />

              <span className="absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap font-mono text-[7px] uppercase tracking-[0.22em] text-slate-400">
                System
              </span>
            </div>

            {/* Right endpoint */}
            <div className="absolute right-[8%] top-1/2 -translate-y-1/2">
              <div
                className={`h-3 w-3 rounded-full border bg-[#f5f4ef] transition-all duration-500 ${
                  active ? "border-[#d4553a]" : "border-slate-300"
                }`}
              />

              <span className="absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap font-mono text-[7px] uppercase tracking-[0.22em] text-slate-400">
                Risk
              </span>
            </div>

            {/* Technical labels */}
            <div className="absolute left-[17%] top-[20%] font-mono text-[7px] uppercase tracking-[0.2em] text-slate-300">
              Failure Mode
            </div>

            <div className="absolute right-[17%] top-[20%] font-mono text-[7px] uppercase tracking-[0.2em] text-slate-300">
              Effect
            </div>

            <div className="absolute bottom-[17%] left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[7px] uppercase tracking-[0.25em] text-slate-400">
              Trace → Evaluate → Prioritize
            </div>

            {/* Active pulse */}
            {active && (
              <div className="absolute left-[8%] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#d4553a] shadow-[0_0_18px_rgba(212,85,58,0.55)]">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#d4553a]/30" />
              </div>
            )}
          </div>

          {/* =====================================================
              WORKFLOW
          ===================================================== */}

          <div className="relative z-20 grid w-full max-w-[1080px] grid-cols-2 border-t border-slate-200 sm:grid-cols-4">
            {[
              ["01", "System Decomposition"],
              ["02", "Failure Identification"],
              ["03", "Propagation Analysis"],
              ["04", "Risk Prioritization"],
            ].map(([number, label], index) => (
              <div
                key={number}
                className={`flex min-h-[78px] flex-col items-center justify-center gap-2 px-3 ${
                  index !== 3 ? "sm:border-r sm:border-slate-200" : ""
                } ${
                  index % 2 === 0
                    ? "border-r border-slate-200"
                    : ""
                } ${
                  index < 2
                    ? "border-b border-slate-200 sm:border-b-0"
                    : ""
                }`}
              >
                <span className="font-mono text-[8px] tracking-[0.2em] text-slate-400">
                  {number}
                </span>

                <span className="text-center font-serif text-xs text-slate-500">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* =====================================================
              FOOTNOTE
          ===================================================== */}

          <div className="pb-3 pt-4 font-mono text-[7px] uppercase tracking-[0.3em] text-slate-400">
            AI estimates support engineering decisions — human validation
            required
          </div>
        </div>
      </div>
    </section>
  );
}