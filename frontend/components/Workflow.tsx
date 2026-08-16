const steps = [
  {
    number: "01",
    code: "SYS",
    title: "System Decomposition",
    description:
      "Break the engineering system into meaningful components, functions, interfaces, and operating conditions before analyzing potential failures.",
  },
  {
    number: "02",
    code: "FAIL",
    title: "Failure Analysis",
    description:
      "Identify potential failure modes, causes, effects, and propagation paths using AI-assisted engineering reasoning.",
  },
  {
    number: "03",
    code: "RISK",
    title: "Risk Prioritization",
    description:
      "Evaluate severity, occurrence, and detection to identify failure modes requiring the most attention.",
  },
  {
    number: "04",
    code: "VERIFY",
    title: "Mitigation & Verification",
    description:
      "Generate engineering controls, mitigation strategies, and verification tests for high-priority risks.",
  },
];

export default function Workflow() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden border-t border-slate-200 bg-[#eeede8] px-6 py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-slate-400" />

              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                FMEA Methodology
              </p>
            </div>

            <h2 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              From system description
              <br />
              <span className="text-slate-400">
                to engineering decisions.
              </span>
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              FMEA Engineer follows a structured analysis workflow to transform
              a system description into traceable engineering risk insights,
              mitigation strategies, and verification tests.
            </p>
          </div>

          <div className="text-left lg:text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">
              Analysis Sequence
            </p>

            <p className="mt-2 font-mono text-xs text-slate-500">
              SYS → FAIL → RISK → VERIFY
            </p>
          </div>
        </div>

        <div className="mt-20 grid overflow-hidden rounded-2xl border border-slate-300 bg-slate-300 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group relative min-h-[330px] bg-[#f5f4ef] p-8 transition-colors duration-500 hover:bg-white"
            >
              <div className="absolute inset-x-8 top-0 h-px origin-left scale-x-0 bg-slate-700 transition-transform duration-500 group-hover:scale-x-100" />

              <div className="flex items-start justify-between">
                <span className="font-mono text-xs text-slate-400">
                  {step.number}
                </span>

                <span className="font-mono text-[10px] tracking-[0.2em] text-slate-400">
                  {step.code}
                </span>
              </div>

              <div className="mt-16">
                <h3 className="text-xl font-medium tracking-tight text-slate-950">
                  {step.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {step.description}
                </p>
              </div>

              <div className="absolute bottom-8 left-8 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400 transition-colors group-hover:text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 transition-colors group-hover:bg-slate-600" />
                Analysis Stage
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 border-t border-slate-300 pt-8 sm:grid-cols-3">
          <div>
            <p className="font-mono text-xs text-slate-400">INPUT</p>
            <p className="mt-2 text-sm text-slate-600">
              Engineering system description
            </p>
          </div>

          <div>
            <p className="font-mono text-xs text-slate-400">PROCESS</p>
            <p className="mt-2 text-sm text-slate-600">
              AI-assisted FMEA reasoning
            </p>
          </div>

          <div>
            <p className="font-mono text-xs text-slate-400">OUTPUT</p>
            <p className="mt-2 text-sm text-slate-600">
              Risk analysis, mitigation & verification
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}