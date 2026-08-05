"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { logout } from "@/app/actions/auth";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/borrowers", label: "Borrowers" },
  { href: "/admin/loans", label: "Loans" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/payment-proofs", label: "Payment proofs" },
  { href: "/admin/complaints", label: "Complaints" },
  { href: "/admin/jobs", label: "Jobs" },
  { href: "/admin/accounting", label: "Accounting" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/audit", label: "Audit log" },
];

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const navLinks = (
    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
      {navItems.map(({ href, label }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`block rounded-lg px-3 py-2.5 text-sm transition-colors ${
              active ? "bg-brand-wash text-brand-deep font-semibold" : "text-ink-soft hover:bg-paper-deep"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-white border-b border-line px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="p-2 -ml-2 rounded-lg text-ink hover:bg-paper-deep"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-brand font-display">Cham Business</span>
        <div className="w-9" />
      </header>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-ink/40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: static on desktop, slide-in drawer on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-line flex flex-col transition-transform duration-200 ease-out
          lg:static lg:z-auto lg:w-56 lg:shrink-0 lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="px-5 py-5 border-b border-line flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-brand font-display">Cham Business</span>
            <p className="text-xs text-ink-soft mt-0.5">Admin</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="lg:hidden p-1 text-ink-soft hover:text-ink"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {navLinks}

        <div className="px-4 py-4 border-t border-line">
          <p className="text-xs text-ink-soft truncate mb-2">{email}</p>
          <form action={logout}>
            <button type="submit" className="text-xs text-ink-soft hover:text-accent-deep transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
