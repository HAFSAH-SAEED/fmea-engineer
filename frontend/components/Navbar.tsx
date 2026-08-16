export default function Navbar() {
  return (
    <nav className="absolute left-0 right-0 top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <a
          href="/"
          className="text-sm font-semibold tracking-[0.25em] text-zinc-900 transition-colors hover:text-slate-700"
        >
          FMEA ENGINEER
        </a>

        <div className="hidden items-center gap-10 text-sm text-slate-600 md:flex">
          <a
            href="#how-it-works"
            className="transition-colors hover:text-slate-950"
          >
            How It Works
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

        <a
          href="/analysis"
          className="rounded-full border border-slate-400 bg-transparent px-5 py-2.5 text-sm font-medium text-slate-900 transition-all hover:border-slate-900 hover:bg-slate-900 hover:text-white"
        >
          Start Analysis
        </a>
      </div>
    </nav>
  );
}