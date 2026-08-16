import { Spotlight } from "@/components/ui/spotlight";
import EngineeringGrid from "@/components/EngineeringGrid";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f5f4ef] px-6 text-center">
      <EngineeringGrid />

      <Spotlight
        className="-top-40 left-0 opacity-10 md:-top-20 md:left-60"
        fill="#334155"
      />

      <div className="relative z-10 flex w-full max-w-7xl flex-col items-center">
        <div className="mb-8 flex items-center gap-3 text-xs uppercase tracking-[0.32em] text-slate-500">
          <span className="h-px w-10 bg-slate-300" />
          Engineering Risk Analysis
          <span className="h-px w-10 bg-slate-300" />
        </div>

        <h1 className="max-w-6xl text-5xl font-semibold leading-[0.92] tracking-[-0.04em] text-slate-950 sm:text-7xl lg:text-[7.5rem]">
          Engineering Risk,
          <br />
          <span className="text-slate-400">
            Analyzed Intelligently.
          </span>
        </h1>

        <p className="mt-10 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
          Analyze complex engineering systems by decomposing components,
          identifying failure modes, tracing propagation paths, prioritizing
          risk, and generating mitigation and verification strategies.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="/analysis"
            className="rounded-full bg-slate-950 px-8 py-3.5 text-sm font-medium text-white transition-all hover:bg-slate-800"
          >
            Start FMEA Analysis
          </a>

          <a
            href="#how-it-works"
            className="rounded-full border border-slate-300 bg-[#f5f4ef] px-8 py-3.5 text-sm font-medium text-slate-800 transition-all hover:border-slate-500 hover:bg-white"
          >
            View Methodology
          </a>
        </div>

        <div className="mt-24 w-full max-w-6xl border-y border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-5">
            <div className="border-b border-slate-200 px-5 py-6 md:border-b-0 md:border-r">
              <p className="font-mono text-[10px] tracking-[0.2em] text-slate-400">
                01
              </p>
              <p className="mt-3 text-sm text-slate-700">
                System
                <br />
                Decomposition
              </p>
            </div>

            <div className="border-b border-slate-200 px-5 py-6 md:border-b-0 md:border-r">
              <p className="font-mono text-[10px] tracking-[0.2em] text-slate-400">
                02
              </p>
              <p className="mt-3 text-sm text-slate-700">
                Failure Mode
                <br />
                Identification
              </p>
            </div>

            <div className="border-b border-slate-200 px-5 py-6 md:border-b-0 md:border-r">
              <p className="font-mono text-[10px] tracking-[0.2em] text-slate-400">
                03
              </p>
              <p className="mt-3 text-sm text-slate-700">
                Propagation
                <br />
                Analysis
              </p>
            </div>

            <div className="border-b border-slate-200 px-5 py-6 md:border-b-0 md:border-r">
              <p className="font-mono text-[10px] tracking-[0.2em] text-slate-400">
                04
              </p>
              <p className="mt-3 text-sm text-slate-700">
                Risk
                <br />
                Prioritization
              </p>
            </div>

            <div className="col-span-2 px-5 py-6 md:col-span-1">
              <p className="font-mono text-[10px] tracking-[0.2em] text-slate-400">
                05
              </p>
              <p className="mt-3 text-sm text-slate-700">
                Mitigation &
                <br />
                Verification
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.22em] text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          AI-assisted engineering estimates · Human validation required
        </div>
      </div>
    </section>
  );
}