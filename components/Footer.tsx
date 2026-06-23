import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 bg-[var(--color-forest-deep)] text-[var(--color-cream)]">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand + blurb */}
          <div className="md:col-span-2">
            <span className="font-display text-2xl font-semibold text-[var(--color-gold-soft)]">
              Cham Business Ltd
            </span>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--color-cream)]/70">
              A registered non-deposit lender providing fair personal loans to
              individuals across Rwanda.
            </p>
          </div>

          {/* Pages */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
              Company
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--color-cream)]/70">
              <li><Link href="/loans" className="hover:text-[var(--color-cream)]">Loans</Link></li>
              <li><Link href="/how-it-works" className="hover:text-[var(--color-cream)]">How it works</Link></li>
              <li><Link href="/about" className="hover:text-[var(--color-cream)]">About</Link></li>
              <li><Link href="/faq" className="hover:text-[var(--color-cream)]">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
              Contact
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--color-cream)]/70">
              <li>Kigali, Rwanda</li>
              <li>+250 7XX XXX XXX</li>
              <li>info@chambusiness.rw</li>
            </ul>
          </div>
        </div>

        {/* Legal strip */}
        <div className="mt-12 border-t border-[var(--color-cream)]/15 pt-6 text-xs leading-relaxed text-[var(--color-cream)]/55">
          <p>
            Cham Business Ltd is a non-deposit lending institution. We do not
            accept deposits from the public. Loans are subject to eligibility,
            affordability assessment, and approval. Company registration no.
            [TIN/RDB number]. Licensed by [regulator — to confirm].
          </p>
          <p className="mt-4">
            © {new Date().getFullYear()} Cham Business Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
