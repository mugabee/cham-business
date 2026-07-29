import { notFound } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { getBorrowerById } from "@/lib/borrowers";
import BorrowerEditForm from "./BorrowerEditForm";

export default async function EditBorrowerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifySession();
  const { id } = await params;
  const borrower = await getBorrowerById(Number(id));

  if (!borrower) notFound();

  return (
    <div>
      <Link href={`/admin/borrowers/${borrower.id}`} className="text-sm text-amber-700 hover:underline">
        ← Back to borrower
      </Link>
      <h1 className="text-2xl font-semibold text-gray-900 mt-3 mb-6">Edit {borrower.fullName}</h1>
      <BorrowerEditForm borrower={borrower} />
    </div>
  );
}
