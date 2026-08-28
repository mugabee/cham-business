import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { company } from "@/lib/site";
import { COMPLAINT_CATEGORIES } from "@/lib/complaint-categories";

export const metadata: Metadata = {
  title: "How to Complain",
  description: "How to file a complaint with Cham Business Ltd and what happens after you do.",
  alternates: { canonical: "/complaints" },
};

export const dynamic = "force-dynamic";

export default function ComplaintsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Support"
        title="Not happy with something? Tell us."
        subtitle="A complaint is not a hassle -- it's how we catch what we're getting wrong."
      />

      <section className="mx-auto max-w-2xl px-5 py-16">
        <div className="space-y-6 text-[var(--color-ink-soft)]">
          <div>
            <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">
              If you're already a borrower
            </h2>
            <p className="mt-2 leading-relaxed">
              Log in to your{" "}
              <Link href="/portal/login" className="text-[var(--color-brand)] hover:underline">
                borrower portal
              </Link>{" "}
              and use the Complaints section there. This links your complaint directly to your loan
              file, so our team has the full picture from the start.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">
              If you're not able to use the portal
            </h2>
            <p className="mt-2 leading-relaxed">
              Contact us directly and a staff member will log the complaint on your behalf:
            </p>
            <ul className="mt-3 space-y-1.5">
              <li>
                Phone:{" "}
                <a href={`tel:${company.phone.replace(/\s/g, "")}`} className="text-[var(--color-brand)] hover:underline">
                  {company.phone}
                </a>
              </li>
              <li>
                Email:{" "}
                <a href={`mailto:${company.email}`} className="text-[var(--color-brand)] hover:underline">
                  {company.email}
                </a>
              </li>
              <li>
                WhatsApp:{" "}
                <a
                  href={`https://wa.me/${company.whatsapp.replace("+", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-brand)] hover:underline"
                >
                  {company.phone}
                </a>
              </li>
              <li>{company.hours}</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">
              What you can complain about
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {COMPLAINT_CATEGORIES.map((c) => (
                <li key={c} className="rounded-lg bg-[var(--color-paper-deep)] px-3 py-2 text-[var(--color-ink)]">
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">
              What happens next
            </h2>
            <p className="mt-2 leading-relaxed">
              We acknowledge every complaint promptly and work to resolve it within a reasonable
              time. You can see the status of your complaint at any point by checking your borrower
              portal. See our{" "}
              <Link href="/service-charter" className="text-[var(--color-brand)] hover:underline">
                service charter
              </Link>{" "}
              for our other commitments to you.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
