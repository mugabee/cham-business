import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ApplyForm from "@/components/ApplyForm";

export const metadata: Metadata = {
  title: "Apply",
  description:
    "Apply for a quick personal loan in Kigali, Rwanda with Cham Business Ltd. A short online form, a decision within 24 hours, no hidden fees.",
  alternates: { canonical: "/apply" },
};

// See app/(public)/page.tsx for why this is forced dynamic.
export const dynamic = "force-dynamic";

export default function ApplyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Apply"
        title="Apply for a loan"
        subtitle="Takes about three minutes. We'll email you a verification code before you submit."
      />

      <section className="mx-auto max-w-2xl px-5 py-16">
        <ApplyForm />
      </section>
    </>
  );
}
