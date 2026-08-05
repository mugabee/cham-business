import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/dal";
import { getJobApplicantResumeById } from "@/lib/job-applicants";
import { readUploadedFile } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await verifySession();
  const { id } = await params;
  const resume = await getJobApplicantResumeById(Number(id));
  if (!resume) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = await readUploadedFile(resume.storedFilename);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": resume.mimeType,
      "Content-Disposition": `inline; filename="${resume.originalFilename.replace(/"/g, "")}"`,
    },
  });
}
