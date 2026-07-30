import { verifyBorrowerSession } from "@/lib/borrower-dal";
import PortalNav from "@/components/portal/PortalNav";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyBorrowerSession();

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalNav fullName={session.fullName} />
      <main className="max-w-4xl mx-auto p-6">{children}</main>
    </div>
  );
}
