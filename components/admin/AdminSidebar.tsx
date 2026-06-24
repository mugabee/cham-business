"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/borrowers", label: "Borrowers" },
  { href: "/admin/loans", label: "Loans" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/accounting", label: "Accounting" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/audit", label: "Audit log" },
];

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-5 py-5 border-b border-gray-100">
        <span className="text-sm font-semibold text-amber-700">
          Cham Business
        </span>
        <p className="text-xs text-gray-400 mt-0.5">Admin</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-amber-50 text-amber-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 truncate mb-2">{email}</p>
        <form action={logout}>
          <button
            type="submit"
            className="text-xs text-gray-500 hover:text-red-600 transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
