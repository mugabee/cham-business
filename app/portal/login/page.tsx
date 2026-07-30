import PortalLoginForm from "./PortalLoginForm";

export const dynamic = "force-dynamic";

export default function PortalLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Log in</h1>
        <p className="text-sm text-gray-500 mb-6">Cham Business Ltd — your account</p>

        <PortalLoginForm />

        <p className="mt-4 text-center text-sm text-gray-500">
          Haven&apos;t applied yet?{" "}
          <a href="/apply" className="text-amber-600 hover:underline">
            Apply for a loan
          </a>
        </p>
      </div>
    </div>
  );
}
