import { NextResponse } from "next/server";
import { verifySession } from "@/lib/dal";
import { getLoanLedgerRows } from "@/lib/accounting";
import { formatDate } from "@/lib/format";

function csvEscape(value: string | number): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export async function GET() {
  await verifySession();

  const ledger = await getLoanLedgerRows();

  const header = [
    "Borrower",
    "Phone",
    "Principal",
    "Term (months)",
    "Disbursed",
    "Status",
    "Total due",
    "Total paid",
    "Outstanding",
    "Overdue",
  ];

  const rows = ledger.map((row) => [
    row.borrowerName,
    row.phone,
    row.principal,
    row.termMonths,
    formatDate(row.disbursedAt),
    row.status,
    row.totalDue,
    row.totalPaid,
    row.outstanding,
    row.overdue,
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="loan-ledger-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
