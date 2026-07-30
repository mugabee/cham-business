"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutPortalAction } from "@/app/actions/portal-auth";

export default function PortalNav({ fullName }: { fullName: string }) {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <Link href="/portal" className="text-sm font-semibold text-amber-700">
            Cham Business
          </Link>
          <p className="text-xs text-gray-400 mt-0.5">
            {fullName} {pathname !== "/portal" && <span> — My account</span>}
          </p>
        </div>
        <form action={logoutPortalAction}>
          <button type="submit" className="text-xs text-gray-500 hover:text-red-600 transition-colors">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
