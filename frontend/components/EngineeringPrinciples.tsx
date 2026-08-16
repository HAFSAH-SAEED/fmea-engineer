const principles = [
  {
    number: "01",
    title: "Traceable Reasoning",
    description:
      "Each identified failure mode is connected to its component, function, cause, effect, and propagation path.",
  },
  {
    number: "02",
    title: "Risk-Based Prioritization",
    description:
      "Severity, occurrence, and detection estimates are used to prioritize failure modes requiring engineering attention.",
  },
  {
    number: "03",
    title: "Engineering Mitigation",
    description:
      "The analysis translates identified risks into practical controls, mitigations, and engineering recommendations.",
  },
  {
    number: "04",
    title: "Verification-Driven",
    description:
      "High-priority risks are paired with verification tests so recommendations can be evaluated against system behavior.",
  },
];

export default function EngineeringPrinciples() {
  return (
    <section className="relative overflow-hidden border-t border-slate-300 bg-[#f5f4ef] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-stretch gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          
          {/* LEFT SIDE */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-slate-500" />

              <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-500">
                Engineering Approach
              </p>
            </div>

            <h2 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Built around
              <br />
              <span className="text-slate-400">
                engineering reasoning.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              FMEA Engineer is designed to make AI-assisted risk analysis
              structured, traceable, and useful for engineering review rather
              than treating the output as an unexplained prediction.
            </p>

            {/* LARGE CORE PRINCIPLE CARD */}
            <div className="mt-10 flex flex-1 flex-col justify-between rounded-2xl border border-slate-300 bg-white p-8 sm:p-10">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-slate-400" />

                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
                      Core Principle
                    </p>
                  </div>

                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 font-mono text-xs text-slate-400">
                    ∙
                  </span>
                </div>

                <p className="mt-12 max-w-lg text-2xl leading-10 tracking-tight text-slate-800 sm:text-3xl">
                  AI estimates support engineering decisions — they do not
                  replace engineering validation.
                </p>
              </div>

              <div className="mt-12 flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-300 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-slate-500">
                  Traceable
                </span>

                <span className="rounded-full border border-slate-300 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-slate-500">
                  Risk-Aware
                </span>

                <span className="rounded-full border border-slate-300 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-slate-500">
                  Verification-Driven
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="grid overflow-hidden rounded-2xl border border-slate-300 bg-slate-300 sm:grid-cols-2">
            {principles.map((principle, index) => (
              <div
                key={principle.number}
                className={`group relative flex min-h-[270px] flex-col bg-white p-8 transition-colors duration-300 hover:bg-[#eeede8] ${
                  index % 2 === 0 ? "sm:border-r border-slate-300" : ""
                } ${
                  index < 2 ? "border-b border-slate-300" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs text-slate-400">
                    {principle.number}
                  </span>

                  <span className="h-2.5 w-2.5 rounded-full border border-slate-400 transition-colors duration-300 group-hover:bg-slate-700" />
                </div>

                <div className="mt-auto">
                  <h3 className="text-xl font-semibold tracking-tight text-slate-950">
                    {principle.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {principle.description}
                  </p>

                  <div className="mt-8 font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400">
                    Engineering Principle
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ENGINEERING LOGIC */}
        <div className="mt-12 flex flex-col gap-4 border-t border-slate-300 pt-5 sm:flex-row sm:items-center">
          <span className="font-mono text-[9px] tracking-[0.2em] text-slate-400">
            ENGINEERING LOGIC
          </span>

          <span className="hidden h-px flex-1 bg-slate-300 sm:block" />

          <span className="font-mono text-[9px] tracking-[0.2em] text-slate-500">
            TRACE → PRIORITIZE → MITIGATE → VERIFY
          </span>
        </div>
      </div>
    </section>
  );
}