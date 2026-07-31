"use client";
import Link from "next/link";
import { logoutPortalAction } from "@/app/actions/portal-auth";

export default function PortalNav({ fullName }: { fullName: string }) {
  return (
    <header className="bg-white border-b border-line sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/portal" className="text-sm sm:text-base font-semibold text-brand font-display">
          Cham Business
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="hidden sm:inline text-sm text-ink-soft truncate max-w-[10rem]">{fullName}</span>
          <form action={logoutPortalAction}>
            <button
              type="submit"
              className="text-xs sm:text-sm text-ink-soft hover:text-accent-deep transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
