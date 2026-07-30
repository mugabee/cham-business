import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/dal";
import { getPaymentProofFile } from "@/lib/payment-proofs";
import { readUploadedFile } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await verifySession();
  const { id } = await params;
  const doc = await getPaymentProofFile(Number(id));
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = await readUploadedFile(doc.storedFilename);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Disposition": `inline; filename="${doc.originalFilename.replace(/"/g, "")}"`,
    },
  });
}
