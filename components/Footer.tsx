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
              <li>{company.address}</li>
              <li>
                <a href={`tel:${company.phone.replace(/\s/g, "")}`} className="hover:text-white">
                  {company.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${company.email}`} className="hover:text-white">
                  {company.email}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${company.whatsapp.replace("+", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-4 h-4 fill-current">
                    <path d="M16 .4C7.4.4.4 7.4.4 16c0 2.8.7 5.4 2 7.7L.3 31.6l8.2-2.1A15.6 15.6 0 0 0 16 31.6C24.6 31.6 31.6 24.6 31.6 16S24.6.4 16 .4zm7.1 22.7c-.4-.2-2.3-1.1-2.6-1.3-.4-.1-.6-.2-.9.2-.3.4-1 1.3-1.2 1.5-.2.2-.5.3-.9.1a11 11 0 0 1-3.2-2 12 12 0 0 1-2.2-2.8c-.2-.4 0-.6.2-.8l.6-.7.4-.7v-.7l-1.2-2.9c-.3-.7-.6-.6-.9-.6h-.7c-.3 0-.7.1-1 .4-.4.4-1.4 1.4-1.4 3.3 0 2 1.5 3.9 1.7 4.1.2.3 2.9 4.4 7 6.2 1 .4 1.7.7 2.3.9.97.3 1.86.26 2.56.16.78-.12 2.3-.94 2.63-1.85.32-.9.32-1.68.22-1.85-.1-.16-.33-.26-.7-.46z" />
                  </svg>
                  WhatsApp
                </a>
              </li>
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
