
export default function Footer() {
  return (
    <footer className="border-t border-slate-300 bg-[#f5f4ef] px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <a
              href="/"
              className="font-mono text-sm font-semibold tracking-[0.2em] text-slate-950"
            >
              FMEA ENGINEER
            </a>

            <p className="mt-3 max-w-md text-xs leading-6 text-slate-500">
              AI-assisted failure analysis for structured engineering
              risk assessment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500">
            <a
              href="/"
              className="transition-colors hover:text-slate-950"
            >
              Home
            </a>

            <a
              href="#how-it-works"
              className="transition-colors hover:text-slate-950"
            >
              Methodology
            </a>

            <a
              href="/analysis"
              className="transition-colors hover:text-slate-950"
            >
              Analysis
            </a>

            <a
              href="https://github.com/HAFSAH-SAEED/fmea-engineer"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-slate-950"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-3 border-t border-slate-300 pt-5 sm:flex-row sm:items-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400">
            FMEA / ENGINEERING RISK ANALYSIS
          </p>

          <p className="text-[10px] text-slate-400">
            AI estimates require engineering validation.
          </p>
        </div>
      </div>
    </footer>
  );
}