import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";

export type MonthlyPoint = { month: string; value: number };

/** New loans disbursed per month, last 12 months. */
export async function getNewLoansOverTime(): Promise<MonthlyPoint[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT DATE_FORMAT(disbursed_at, '%Y-%m') AS month, COUNT(*) AS count
     FROM loans
     WHERE disbursed_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
     GROUP BY month
     ORDER BY month ASC`
  );
  return rows.map((row) => ({ month: row.month, value: Number(row.count) }));
}

/**
 * Approximate portfolio value over time: cumulative principal disbursed
 * minus cumulative amount collected, by month. Not a true historical
 * snapshot (would need a scheduled job this host can't run) -- a
 * reasonable approximation for a trend line.
 */
export async function getPortfolioValueOverTime(): Promise<MonthlyPoint[]> {
  const [disbursedRows] = await pool.query<RowDataPacket[]>(
    `SELECT DATE_FORMAT(disbursed_at, '%Y-%m') AS month, SUM(principal) AS total
     FROM loans GROUP BY month ORDER BY month ASC`
  );
  const [collectedRows] = await pool.query<RowDataPacket[]>(
    `SELECT DATE_FORMAT(paid_at, '%Y-%m') AS month, SUM(amount) AS total
     FROM payments GROUP BY month ORDER BY month ASC`
  );

  const months = new Set<string>([
    ...disbursedRows.map((r) => r.month),
    ...collectedRows.map((r) => r.month),
  ]);
  const disbursedByMonth = new Map(disbursedRows.map((r) => [r.month, Number(r.total)]));
  const collectedByMonth = new Map(collectedRows.map((r) => [r.month, Number(r.total)]));

  let running = 0;
  return [...months].sort().map((month) => {
    running += (disbursedByMonth.get(month) ?? 0) - (collectedByMonth.get(month) ?? 0);
    return { month, value: running };
  });
}

/** Collection rate (%) per month: amount collected vs. amount due that month. */
export async function getCollectionRateByMonth(): Promise<MonthlyPoint[]> {
  const [dueRows] = await pool.query<RowDataPacket[]>(
    `SELECT DATE_FORMAT(due_date, '%Y-%m') AS month, SUM(total_due) AS total
     FROM repayment_schedule GROUP BY month ORDER BY month ASC`
  );
  const [collectedRows] = await pool.query<RowDataPacket[]>(
    `SELECT DATE_FORMAT(paid_at, '%Y-%m') AS month, SUM(amount) AS total
     FROM payments GROUP BY month ORDER BY month ASC`
  );

  const collectedByMonth = new Map(collectedRows.map((r) => [r.month, Number(r.total)]));

  return dueRows.map((row) => {
    const due = Number(row.total);
    const collected = collectedByMonth.get(row.month) ?? 0;
    return { month: row.month, value: due > 0 ? Math.round((collected / due) * 100) : 0 };
  });
}

export type AgingBucket = { label: string; value: number };

/** Overdue amount grouped into aging buckets, in place of a time-series
 * "trend" -- a true trend needs historical snapshots this host can't
 * schedule, so this is the closest useful substitute. */
export async function getOverdueAging(): Promise<AgingBucket[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT DATEDIFF(CURDATE(), rs.due_date) AS days_overdue, (rs.total_due - rs.amount_paid) AS amount
     FROM repayment_schedule rs
     JOIN loans l ON l.id = rs.loan_id
     WHERE rs.due_date < CURDATE() AND rs.status <> 'paid' AND l.status = 'active'`
  );

  const buckets = { "0-30": 0, "31-60": 0, "61-90": 0, "90+": 0 };
  for (const row of rows) {
    const days = Number(row.days_overdue);
    const amount = Number(row.amount);
    if (days <= 30) buckets["0-30"] += amount;
    else if (days <= 60) buckets["31-60"] += amount;
    else if (days <= 90) buckets["61-90"] += amount;
    else buckets["90+"] += amount;
  }

  return Object.entries(buckets).map(([label, value]) => ({ label, value }));
}
