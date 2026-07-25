import ForgotPasswordForm from "./ForgotPasswordForm";

// See app/login/page.tsx for why this is forced dynamic.
export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Reset password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        <ForgotPasswordForm />

        <p className="mt-4 text-center text-sm text-gray-500">
          <a href="/login" className="text-amber-600 hover:underline">Back to login</a>
        </p>
      </div>
    </div>
  );
}
