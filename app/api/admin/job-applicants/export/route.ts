import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/dal";
import { listAllApplicants } from "@/lib/job-applicants";
import { APPLICANT_STATUS_LABELS, type ApplicantStatus } from "@/lib/job-types";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

function csvEscape(value: string | number): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export async function GET(req: NextRequest) {
  await verifySession();

  const { searchParams } = new URL(req.url);
  const applicants = await listAllApplicants({
    search: searchParams.get("q") ?? undefined,
    status: (searchParams.get("status") as ApplicantStatus | null) ?? undefined,
  });

  const header = ["Name", "Email", "Phone", "Applied for", "Submitted", "Status"];

  const rows = applicants.map((a) => [
    a.fullName,
    a.email,
    a.phone,
    a.jobPostingTitle,
    formatDate(a.submittedAt),
    APPLICANT_STATUS_LABELS[a.status],
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="job-applicants-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
