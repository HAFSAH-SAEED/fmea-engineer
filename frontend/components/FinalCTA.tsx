export default function FinalCTA() {
  return (
    <section className="border-t border-slate-300 bg-[#eeede8] px-6 py-14">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-2xl border border-slate-300 bg-slate-950 px-8 py-14 text-white sm:px-12 lg:px-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />

          <div className="relative z-10 flex flex-col justify-between gap-12 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-slate-500" />

                <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-400">
                  Engineering Analysis
                </p>
              </div>

              <h2 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
                Turn system complexity
                <br />
                <span className="text-slate-500">
                  into actionable risk insight.
                </span>
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400">
                Describe your engineering system and generate a structured
                FMEA analysis covering failure modes, risk prioritization,
                mitigation, and verification.
              </p>
            </div>

            <div className="shrink-0">
              <a
                href="/analysis"
                className="inline-flex rounded-full bg-white px-8 py-3.5 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
              >
                Start FMEA Analysis
              </a>
            </div>
          </div>

          <div className="relative z-10 mt-12 flex flex-col justify-between gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:items-center">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">
              FMEA / FINAL ASSESSMENT
            </span>

            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">
              AI ESTIMATES · HUMAN VALIDATION REQUIRED
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}