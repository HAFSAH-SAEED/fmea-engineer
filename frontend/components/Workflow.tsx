const steps = [
  {
    number: "01",
    title: "System Decomposition",
    description:
      "Break the engineering system into meaningful components, functions, and interfaces before analyzing potential failures.",
  },
  {
    number: "02",
    title: "Failure Analysis",
    description:
      "Identify potential failure modes, their causes, effects, and propagation paths using AI-assisted engineering reasoning.",
  },
  {
    number: "03",
    title: "Risk Prioritization",
    description:
      "Evaluate severity, occurrence, and detection to identify the failure modes that require the most attention.",
  },
  {
    number: "04",
    title: "Mitigation & Verification",
    description:
      "Generate engineering controls, mitigation strategies, and verification tests for high-priority risks.",
  },
];

export default function Workflow() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden border-t border-zinc-900 bg-black px-6 py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            The Workflow
          </p>

          <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            From system description
            <br />
            <span className="text-zinc-500">
              to engineering decisions.
            </span>
          </h2>

          <p className="mt-6 text-lg leading-8 text-zinc-500">
            FMEA Engineer guides a structured multi-stage analysis to turn a
            system description into actionable engineering risk insights.
          </p>
        </div>

        <div className="mt-20 grid gap-px overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-800 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group relative bg-black p-8 transition-all duration-500 hover:bg-zinc-950"
            >
              <div className="absolute inset-x-8 top-0 h-px origin-left scale-x-0 bg-zinc-500 transition-transform duration-500 group-hover:scale-x-100" />

              <span className="text-sm text-zinc-600">
                {step.number}
              </span>

              <h3 className="mt-16 text-xl font-medium text-white">
                {step.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-zinc-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}