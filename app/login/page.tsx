import LoginForm from "./LoginForm";

// Force dynamic rendering: this page was being statically prerendered and
// cached (LiteSpeed reverse proxy honoring Next's long s-maxage for static
// pages), which both served stale content across deploys and could show the
// login form to an already-authenticated user instead of letting proxy.ts's
// per-request redirect take effect.
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper-deep">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-line p-8">
        <h1 className="text-2xl font-semibold text-ink mb-1">
          Staff login
        </h1>
        <p className="text-sm text-ink-soft mb-6">Cham Business Ltd — admin</p>

        <LoginForm />

        <p className="mt-4 text-center text-sm text-ink-soft">
          <a href="/forgot-password" className="text-brand hover:underline">
            Forgot password?
          </a>
        </p>
      </div>
    </div>
  );
}
