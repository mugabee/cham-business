import { notFound } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { getPaymentById } from "@/lib/payments";
import { formatRWF, formatDate } from "@/lib/format";
import PaymentEditForm from "./PaymentEditForm";

const methodLabel = { mtn: "MTN Mobile Money", airtel: "Airtel Money", bank: "Bank transfer" } as const;

export default async function EditPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifySession();
  const { id } = await params;
  const payment = await getPaymentById(Number(id));

  if (!payment) notFound();

  return (
    <div>
      <Link href={`/admin/loans/${payment.loanId}`} className="text-sm text-amber-700 hover:underline">
        ← Back to loan
      </Link>
      <h1 className="text-2xl font-semibold text-gray-900 mt-3 mb-1">Edit payment</h1>
      <p className="text-sm text-gray-500 mb-6">
        {payment.borrowerName} — {formatRWF(payment.amount)} via {methodLabel[payment.method]} on{" "}
        {formatDate(payment.paidAt)}
      </p>
      <PaymentEditForm payment={payment} />
    </div>
  );
}
