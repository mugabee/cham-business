import Link from "next/link";
import { company } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-24 bg-[var(--color-brand-deep)] text-white">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <span className="font-display text-2xl font-bold text-white">
              {company.name}
            </span>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
              A registered non-deposit lender providing fair, friendly personal
              loans to individuals across Rwanda.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-soft)]">
              Company
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              <li><Link href="/loans" className="hover:text-white">Loans</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white">How it works</Link></li>
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link href="/apply" className="hover:text-white">Apply</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-soft)]">
              Contact
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              <li>{company.city}</li>
              <li>{company.phone}</li>
              <li>{company.email}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/15 pt-6 text-xs leading-relaxed text-white/55">
          <p>{company.registrationNote} Loans are subject to eligibility, affordability assessment, and approval.</p>
          <p className="mt-4">© {new Date().getFullYear()} {company.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
