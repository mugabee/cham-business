import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { listActiveLoansForPicker } from "@/lib/loans";
import PaymentForm from "./PaymentForm";

export default async function NewPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ loanId?: string }>;
}) {
  await verifySession();
  const { loanId } = await searchParams;
  const loans = await listActiveLoansForPicker();

  return (
    <div>
      <Link href="/admin/payments" className="text-sm text-brand hover:underline">
        ← Back to payments
      </Link>
      <h1 className="text-2xl font-semibold text-ink mt-3 mb-6">Record payment</h1>
      <PaymentForm loans={loans} preselectedLoanId={loanId ? Number(loanId) : undefined} />
    </div>
  );
}
