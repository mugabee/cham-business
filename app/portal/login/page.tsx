import PortalLoginForm from "./PortalLoginForm";

export const dynamic = "force-dynamic";

export default function PortalLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper-deep px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-line p-8">
        <p className="text-sm font-semibold text-brand font-display mb-4">Cham Business</p>
        <h1 className="text-2xl font-semibold text-ink mb-1">Log in</h1>
        <p className="text-sm text-ink-soft mb-6">Track your loan and payments</p>

        <PortalLoginForm />

        <p className="mt-4 text-center text-sm text-ink-soft">
          Haven&apos;t applied yet?{" "}
          <a href="/apply" className="text-brand hover:underline">
            Apply for a loan
          </a>
        </p>
      </div>
    </div>
  );
}
