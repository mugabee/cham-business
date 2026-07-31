import { verifyBorrowerSession } from "@/lib/borrower-dal";
import PortalNav from "@/components/portal/PortalNav";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyBorrowerSession();

  return (
    <div className="min-h-screen bg-paper-deep">
      <PortalNav fullName={session.fullName} />
      <main className="max-w-4xl mx-auto p-4 sm:p-6">{children}</main>
    </div>
  );
}
