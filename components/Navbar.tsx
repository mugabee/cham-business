"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/loans", label: "Loans" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
  { href: "/careers", label: "Careers" },
  { href: "/faq", label: "FAQ" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-line)] bg-[var(--color-paper)]/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Cham Business home">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[var(--color-brand)] text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 14c0-4 3-7 8-7s8 3 8 7-3 6-8 6c-1.4 0-2.7-.2-3.8-.6L4 21l1-3.4A6.6 6.6 0 0 1 4 14Z" fill="currentColor" />
            </svg>
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-[var(--color-brand)]">
            Cham Business
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-brand)]"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/apply"
            className="rounded-full bg-[var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-deep)]"
          >
            Apply now
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-[var(--color-line)] px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--color-ink-soft)] hover:bg-[var(--color-brand-wash)]"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/apply"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-[var(--color-brand)] px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Apply now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
