export type RepaymentFrequency = "daily" | "weekly" | "monthly";

export interface ScheduleInstalment {
  instalmentNumber: number;
  dueDate: Date;
  amountDue: number;
}

export function totalInterest(principal: number, termMonths: number): number {
  return principal * 0.05 * termMonths;
}

export function totalRepayable(principal: number, termMonths: number): number {
  return principal + totalInterest(principal, termMonths);
}

function instalmentCount(termMonths: number, frequency: RepaymentFrequency): number {
  switch (frequency) {
    case "monthly": return termMonths;
    case "weekly":  return termMonths * 4;
    case "daily":   return termMonths * 30;
  }
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function nthDueDate(start: Date, n: number, frequency: RepaymentFrequency): Date {
  switch (frequency) {
    case "monthly": {
      const d = new Date(start);
      d.setMonth(d.getMonth() + n);
      return d;
    }
    case "weekly": return addDays(start, n * 7);
    case "daily":  return addDays(start, n);
  }
}

/**
 * Spreads totalRepayable evenly across instalments.
 * All amounts are whole RWF; the final instalment absorbs rounding remainder.
 */
export function generateSchedule(
  principal: number,
  termMonths: number,
  frequency: RepaymentFrequency,
  startDate: Date
): ScheduleInstalment[] {
  const total = totalRepayable(principal, termMonths);
  const count = instalmentCount(termMonths, frequency);
  const base = Math.floor(total / count);
  const remainder = total - base * count;

  return Array.from({ length: count }, (_, i) => ({
    instalmentNumber: i + 1,
    dueDate: nthDueDate(startDate, i + 1, frequency),
    amountDue: i === count - 1 ? base + remainder : base,
  }));
}

// ---------------------------------------------------------------------------
// Example checks (run with: npx tsx lib/loan-math.ts)
// ---------------------------------------------------------------------------
if (process.argv[1]?.endsWith("loan-math.ts")) {
  const p = 1_000_000, t = 4;
  const interest = totalInterest(p, t);
  const repayable = totalRepayable(p, t);

  console.assert(interest === 200_000,  `interest: expected 200000, got ${interest}`);
  console.assert(repayable === 1_200_000, `repayable: expected 1200000, got ${repayable}`);

  const schedule = generateSchedule(p, t, "monthly", new Date("2025-01-01"));
  console.assert(schedule.length === 4, `monthly count: expected 4, got ${schedule.length}`);
  const sumMonthly = schedule.reduce((s, r) => s + r.amountDue, 0);
  console.assert(sumMonthly === repayable, `monthly sum: expected ${repayable}, got ${sumMonthly}`);

  const weekly = generateSchedule(p, t, "weekly", new Date("2025-01-01"));
  console.assert(weekly.length === 16, `weekly count: expected 16, got ${weekly.length}`);
  const sumWeekly = weekly.reduce((s, r) => s + r.amountDue, 0);
  console.assert(sumWeekly === repayable, `weekly sum: expected ${repayable}, got ${sumWeekly}`);

  const daily = generateSchedule(p, t, "daily", new Date("2025-01-01"));
  console.assert(daily.length === 120, `daily count: expected 120, got ${daily.length}`);
  const sumDaily = daily.reduce((s, r) => s + r.amountDue, 0);
  console.assert(sumDaily === repayable, `daily sum: expected ${repayable}, got ${sumDaily}`);

  console.log("All checks passed.");
  console.log(`  totalInterest(1 000 000, 4) = ${interest.toLocaleString()} RWF`);
  console.log(`  totalRepayable(1 000 000, 4) = ${repayable.toLocaleString()} RWF`);
  console.log(`  Monthly schedule (4 instalments of ${schedule[0].amountDue.toLocaleString()} RWF):`);
  schedule.forEach(r =>
    console.log(`    #${r.instalmentNumber}  ${r.dueDate.toISOString().slice(0, 10)}  ${r.amountDue.toLocaleString()} RWF`)
  );
}
