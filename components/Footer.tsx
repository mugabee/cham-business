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
            <div className="mt-4 flex gap-2">
              <a
                href={`https://www.tiktok.com/@${company.tiktok}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Cham Business on TikTok"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
                </svg>
              </a>
              <a
                href={`https://www.instagram.com/${company.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Cham Business on Instagram"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-soft)]">
              Company
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              <li><Link href="/loans" className="hover:text-white">Loans</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white">How it works</Link></li>
              <li><Link href="/resources" className="hover:text-white">Resources</Link></li>
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link href="/apply" className="hover:text-white">Apply</Link></li>
              <li><Link href="/contract-template" className="hover:text-white">Contract terms</Link></li>
              <li><Link href="/service-charter" className="hover:text-white">Service charter</Link></li>
              <li><Link href="/complaints" className="hover:text-white">How to complain</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-soft)]">
              Contact
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              <li>
                <a
                  href={company.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  {company.address}
                </a>
              </li>
              <li>{company.hours}</li>
              <li>
                <a href={`tel:${company.phone.replace(/\s/g, "")}`} className="hover:text-white">
                  {company.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${company.email}`} className="hover:text-white">
                  {company.email}
                </a>
                <span className="block text-xs text-white/45">
                  Mail bouncing? Try{" "}
                  <a href={`mailto:${company.altEmail}`} className="hover:text-white/70 underline">
                    {company.altEmail}
                  </a>
                </span>
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
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>© {new Date().getFullYear()} {company.name}. All rights reserved.</span>
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
