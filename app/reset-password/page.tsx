import ResetPasswordForm from "./ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper-deep">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-line p-8">
        <h1 className="text-2xl font-semibold text-ink mb-1">Set new password</h1>
        <p className="text-sm text-ink-soft mb-6">Choose a strong password for your account.</p>

        {!token ? (
          <p className="text-sm text-red-600">
            This reset link is missing or invalid. Request a new one from the{" "}
            <a href="/forgot-password" className="text-brand hover:underline">
              forgot password
            </a>{" "}
            page.
          </p>
        ) : (
          <ResetPasswordForm token={token} />
        )}
      </div>
    </div>
  );
}
