import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { listPendingPaymentProofs } from "@/lib/payment-proofs";
import { formatRWF, formatDate } from "@/lib/format";
import PaymentProofReviewControls from "@/components/admin/PaymentProofReviewControls";

const methodLabel = { mtn: "MTN Mobile Money", airtel: "Airtel Money", bank: "Bank transfer" } as const;

export default async function PaymentProofsPage() {
  await verifySession();
  const proofs = await listPendingPaymentProofs();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Payment proofs</h1>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Borrower</th>
              <th className="px-4 py-3 font-medium">Amount claimed</th>
              <th className="px-4 py-3 font-medium">Method</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium">Evidence</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {proofs.map((proof) => (
              <tr key={proof.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/loans/${proof.loanId}`} className="font-medium text-gray-900 hover:text-amber-700">
                    {proof.borrowerName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-700">{formatRWF(proof.amountClaimed)}</td>
                <td className="px-4 py-3 text-gray-700">{methodLabel[proof.method]}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(proof.createdAt)}</td>
                <td className="px-4 py-3">
                  <a
                    href={`/api/admin/payment-proofs/${proof.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-700 hover:underline font-medium"
                  >
                    View →
                  </a>
                </td>
                <td className="px-4 py-3">
                  <PaymentProofReviewControls id={proof.id} />
                </td>
              </tr>
            ))}
            {proofs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No pending payment proofs.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
