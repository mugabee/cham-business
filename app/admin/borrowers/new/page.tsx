import Link from "next/link";
import { verifySession } from "@/lib/dal";
import BorrowerForm from "./BorrowerForm";

export default async function NewBorrowerPage() {
  await verifySession();

  return (
    <div>
      <Link href="/admin/borrowers" className="text-sm text-amber-700 hover:underline">
        ← Back to borrowers
      </Link>
      <h1 className="text-2xl font-semibold text-gray-900 mt-3 mb-6">Add borrower</h1>
      <BorrowerForm />
    </div>
  );
}
