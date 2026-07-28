import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { listBorrowers } from "@/lib/borrowers";
import LoanForm from "./LoanForm";

export default async function NewLoanPage({
  searchParams,
}: {
  searchParams: Promise<{ borrowerId?: string }>;
}) {
  await verifySession();
  const { borrowerId } = await searchParams;
  const borrowers = await listBorrowers({});

  return (
    <div>
      <Link href="/admin/loans" className="text-sm text-amber-700 hover:underline">
        ← Back to loans
      </Link>
      <h1 className="text-2xl font-semibold text-gray-900 mt-3 mb-6">New loan</h1>
      <LoanForm
        borrowers={borrowers.map((b) => ({ id: b.id, fullName: b.fullName }))}
        preselectedBorrowerId={borrowerId ? Number(borrowerId) : undefined}
      />
    </div>
  );
}
