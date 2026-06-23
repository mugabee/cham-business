"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/loans", label: "Loans" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-line)] bg-[var(--color-cream)]/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5" aria-label="Cham Business home">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--color-forest)] text-[var(--color-gold)]">
            {/* Stylised hills mark */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M2 18c3-6 5-6 7-2 2-7 5-9 8-2 1 2 3 4 5 4v4H2v-4Z" fill="currentColor" />
            </svg>
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-[var(--color-forest)]">
            Cham Business
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-forest)]"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/apply"
            className="rounded-full bg-[var(--color-forest)] px-5 py-2.5 text-sm font-semibold text-[var(--color-cream)] transition-colors hover:bg-[var(--color-forest-soft)]"
          >
            Apply now
          </Link>
        </div>

        {/* Mobile toggle */}
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

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-[var(--color-line)] px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-ink-soft)] hover:bg-[var(--color-cream-deep)]"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/apply"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-[var(--color-forest)] px-5 py-3 text-center text-sm font-semibold text-[var(--color-cream)]"
            >
              Apply now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
