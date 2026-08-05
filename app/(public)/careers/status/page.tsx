import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import JobStatusCheckForm from "@/components/JobStatusCheckForm";

export const metadata: Metadata = {
  title: "Check your application status",
  description: "Check the status of your job application at Cham Business Ltd.",
  alternates: { canonical: "/careers/status" },
};

export const dynamic = "force-dynamic";

export default function CareerStatusPage() {
  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title="Check your application status"
        subtitle="Enter the email address you applied with."
      />

      <section className="mx-auto max-w-2xl px-5 py-16">
        <JobStatusCheckForm />
      </section>
    </>
  );
}
