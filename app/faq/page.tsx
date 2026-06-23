"use client";

import { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { faqs } from "@/lib/site";

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <PageHeader
        eyebrow="FAQ"
        title="Questions, answered plainly"
        subtitle="If you don't see what you're looking for, just get in touch — we're happy to help."
      />

      <section className="mx-auto max-w-3xl px-5 py-16">
        <div className="space-y-3">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-display font-bold text-[var(--color-ink)]">
                    {item.q}
                  </span>
                  <svg
                    width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    className={`shrink-0 text-[var(--color-brand)] transition-transform ${isOpen ? "rotate-45" : ""}`}
                    aria-hidden="true"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 leading-relaxed text-[var(--color-ink-soft)]">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-[var(--color-ink-soft)]">Still have a question?</p>
          <Link
            href="/apply"
            className="mt-4 inline-block rounded-full bg-[var(--color-brand)] px-7 py-3 font-semibold text-white transition-colors hover:bg-[var(--color-brand-deep)]"
          >
            Apply or get in touch
          </Link>
        </div>
      </section>
    </>
  );
}
