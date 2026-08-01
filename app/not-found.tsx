import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-paper)] px-5 text-center">
      <span className="font-display text-7xl font-extrabold text-[var(--color-brand)]">404</span>
      <h1 className="mt-4 font-display text-2xl font-bold text-[var(--color-ink)]">
        We couldn't find that page
      </h1>
      <p className="mt-3 max-w-sm text-[var(--color-ink-soft)]">
        The link might be outdated, or the page may have moved. Here are some places to go
        instead:
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-[var(--color-brand)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-deep)]"
        >
          Go to homepage
        </Link>
        <Link
          href="/loans"
          className="rounded-full border border-[var(--color-line)] px-6 py-2.5 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper-deep)]"
        >
          See our loans
        </Link>
        <Link
          href="/apply"
          className="rounded-full border border-[var(--color-line)] px-6 py-2.5 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper-deep)]"
        >
          Apply now
        </Link>
      </div>
    </div>
  );
}
