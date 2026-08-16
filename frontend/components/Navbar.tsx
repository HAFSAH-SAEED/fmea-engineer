export default function Navbar() {
  return (
    <nav className="absolute left-0 right-0 top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <a
          href="/"
          className="text-sm font-semibold tracking-[0.2em] text-white"
        >
          FMEA ENGINEER
        </a>

        <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          <a
            href="#how-it-works"
            className="transition-colors hover:text-white"
          >
            How It Works
          </a>

          <a
            href="/analysis"
            className="transition-colors hover:text-white"
          >
            Analysis
          </a>

          <a
            href="https://github.com/HAFSAH-SAEED/fmea-engineer"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            GitHub
          </a>
        </div>

        <a
          href="/analysis"
          className="rounded-full border border-zinc-700 px-5 py-2.5 text-sm font-medium text-white transition-all hover:border-zinc-500 hover:bg-white hover:text-black"
        >
          Start Analysis
        </a>
      </div>
    </nav>
  );
}