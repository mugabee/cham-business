export interface ScheduleInstalment {
  instalmentNumber: number;
  dueDate: Date;
  interestPortion: number;
  principalPortion: number;
  amountDue: number;
  remainingBalance: number;
}

const MONTHLY_RATE = 0.05;

/**
 * Standard amortization formula: A = P * r / (1 - (1 + r)^-n)
 * Returns the equal monthly payment rounded to whole RWF.
 */
export function monthlyPayment(
  principal: number,
  termMonths: number,
  monthlyRate = MONTHLY_RATE
): number {
  const r = monthlyRate;
  const n = termMonths;
  return Math.round((principal * r) / (1 - Math.pow(1 + r, -n)));
}

/**
 * Builds the full reducing-balance amortization schedule.
 * Each month: interest = balance * rate, principal = payment - interest.
 * The final instalment is adjusted so the balance closes at exactly 0.
 */
export function generateSchedule(
  principal: number,
  termMonths: number,
  startDate: Date,
  monthlyRate = MONTHLY_RATE
): ScheduleInstalment[] {
  const payment = monthlyPayment(principal, termMonths, monthlyRate);
  let balance = principal;
  const schedule: ScheduleInstalment[] = [];

  for (let i = 1; i <= termMonths; i++) {
    const interest = Math.round(balance * monthlyRate);
    const isLast = i === termMonths;

    // On the last instalment pay exactly whatever balance remains
    const principalPart = isLast ? balance : Math.round(payment - interest);
    const totalDue = isLast ? balance + interest : payment;
    balance = isLast ? 0 : balance - principalPart;

    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    schedule.push({
      instalmentNumber: i,
      dueDate,
      interestPortion: interest,
      principalPortion: principalPart,
      amountDue: totalDue,
      remainingBalance: balance,
    });
  }

  return schedule;
}

/** Sum of all interest portions across the schedule. */
export function totalInterest(schedule: ScheduleInstalment[]): number {
  return schedule.reduce((s, r) => s + r.interestPortion, 0);
}

/** Principal + total interest. */
export function totalRepayable(
  principal: number,
  schedule: ScheduleInstalment[]
): number {
  return principal + totalInterest(schedule);
}

// ---------------------------------------------------------------------------
// Verification (run with: npx tsx lib/loan-math.ts)
// ---------------------------------------------------------------------------
if (process.argv[1]?.endsWith("loan-math.ts")) {
  const principal = 1_000_000;
  const term = 4;
  const start = new Date("2025-01-01");

  const payment = monthlyPayment(principal, term);
  const schedule = generateSchedule(principal, term, start);
  const interest = totalInterest(schedule);
  const repayable = totalRepayable(principal, schedule);

  console.log(`Monthly payment : ${payment.toLocaleString()} RWF`);
  console.log(`Total interest  : ${interest.toLocaleString()} RWF`);
  console.log(`Total repayable : ${repayable.toLocaleString()} RWF`);
  console.log(`Final balance   : ${schedule.at(-1)!.remainingBalance} RWF\n`);

  console.log("Schedule:");
  console.log(
    `${"#".padEnd(3)} ${"Due date".padEnd(12)} ${"Payment".padStart(10)} ${"Interest".padStart(10)} ${"Principal".padStart(10)} ${"Balance".padStart(12)}`
  );
  schedule.forEach((r) =>
    console.log(
      `${String(r.instalmentNumber).padEnd(3)} ${r.dueDate.toISOString().slice(0, 10).padEnd(12)} ${String(r.amountDue).padStart(10)} ${String(r.interestPortion).padStart(10)} ${String(r.principalPortion).padStart(10)} ${String(r.remainingBalance).padStart(12)}`
    )
  );

  // Assertions
  console.assert(payment === 282_012, `payment: expected 282012, got ${payment}`);
  console.assert(interest === 128_047, `interest: expected 128047, got ${interest}`);
  console.assert(repayable === 1_128_047, `repayable: expected 1128047, got ${repayable}`);
  console.assert(schedule.at(-1)!.remainingBalance === 0, "final balance must be 0");
  console.log("\nAll assertions passed.");
}
