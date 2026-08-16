import { Spotlight } from "@/components/ui/spotlight";
import EngineeringGrid from "@/components/EngineeringGrid";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <EngineeringGrid />

      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />

      <div className="relative z-10 flex max-w-5xl flex-col items-center">
        <p className="mb-6 text-sm uppercase tracking-[0.3em] text-zinc-400">
          AI-Assisted Engineering
        </p>

        <h1 className="max-w-5xl text-5xl font-semibold tracking-tight text-white sm:text-7xl lg:text-8xl">
          Engineering Risk,
          <br />
          <span className="text-zinc-500">
            Analyzed Intelligently.
          </span>
        </h1>

        <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400">
          FMEA Engineer uses AI to identify failure modes, trace failure
          propagation, prioritize risk, and generate engineering mitigation
          and verification recommendations.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="/analysis"
            className="rounded-full bg-white px-7 py-3 font-medium text-black transition hover:bg-zinc-200"
          >
            Start Analysis
          </a>

          <a
            href="#how-it-works"
            className="rounded-full border border-zinc-700 px-7 py-3 font-medium text-white transition hover:bg-zinc-900"
          >
            How It Works
          </a>
        </div>

        <div className="mt-20 flex flex-wrap justify-center gap-3 text-sm text-zinc-500">
          <span className="rounded-full border border-zinc-800 px-4 py-2">
            System Decomposition
          </span>

          <span className="rounded-full border border-zinc-800 px-4 py-2">
            Failure Propagation
          </span>

          <span className="rounded-full border border-zinc-800 px-4 py-2">
            Risk Prioritization
          </span>

          <span className="rounded-full border border-zinc-800 px-4 py-2">
            Mitigation & Verification
          </span>
        </div>
      </div>
    </section>
  );
}