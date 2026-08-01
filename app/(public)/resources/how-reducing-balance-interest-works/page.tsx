import type { Metadata } from "next";
import Link from "next/link";
import ArticleLayout from "@/components/ArticleLayout";
import { H2, P, Callout, CompareTable } from "@/components/ArticleProse";
import { getResourceBySlug } from "@/lib/resources";
import { generateSchedule, monthlyPayment, totalInterest, totalRepayable } from "@/lib/loan-math";

const article = getResourceBySlug("how-reducing-balance-interest-works")!;

export const metadata: Metadata = {
  title: article.title,
  description: article.excerpt,
  alternates: { canonical: `/resources/${article.slug}` },
};

export const dynamic = "force-dynamic";

const PRINCIPAL = 1_000_000;
const TERM = 4;
const schedule = generateSchedule(PRINCIPAL, TERM, new Date("2026-01-01"));
const payment = monthlyPayment(PRINCIPAL, TERM);
const interest = totalInterest(schedule);
const repayable = totalRepayable(PRINCIPAL, schedule);

function rwf(n: number): string {
  return `RWF ${Math.round(n).toLocaleString()}`;
}

export default function Page() {
  return (
    <ArticleLayout
      article={article}
      subtitle="The same 5% rate can cost very different amounts depending on how it's calculated. Here's the difference."
    >
      <P>
        "5% per month" sounds like one number, but how that 5% gets applied changes what you
        actually pay. There are two common approaches, and they're not the same thing.
      </P>

      <H2>Flat rate vs. reducing balance</H2>
      <P>
        A <strong className="text-[var(--color-ink)]">flat rate</strong> charges interest on the
        full original loan amount for every single instalment, even after you've paid a chunk of
        it back. A{" "}
        <strong className="text-[var(--color-ink)]">reducing balance</strong> — what we use —
        charges interest only on what you still owe. As your balance goes down, the interest
        portion of your payment goes down with it.
      </P>

      <Callout>
        Same 5% rate, same loan amount, same term — a flat rate can end up costing meaningfully
        more in total interest than reducing balance, because it never lets your interest bill
        shrink as you repay.
      </Callout>

      <H2>A worked example</H2>
      <P>
        Borrow {rwf(PRINCIPAL)} over {TERM} months at 5% per month on the reducing balance:
      </P>
      <CompareTable
        columns={["Principal", "Monthly payment", "Total interest", "Total repayment"]}
        rows={[[rwf(PRINCIPAL), rwf(payment), rwf(interest), rwf(repayable)]]}
      />
      <P>
        Notice the monthly payment stays identical every month — but underneath, the mix
        changes. Here's the actual breakdown:
      </P>
      <CompareTable
        columns={["Instalment", "Interest portion", "Principal portion", "Balance after"]}
        rows={schedule.map((row) => [
          `#${row.instalmentNumber}`,
          rwf(row.interestPortion),
          rwf(row.principalPortion),
          rwf(row.remainingBalance),
        ])}
      />
      <P>
        The interest portion shrinks every month — from{" "}
        {rwf(schedule[0].interestPortion)} in month 1 down to just {rwf(schedule.at(-1)!.interestPortion)} in
        the final month — because there's simply less principal left to charge interest on.
      </P>

      <H2>Why this matters to you</H2>
      <P>
        It means paying extra toward your loan early, where possible, has a real, immediate
        effect: less outstanding balance means less interest charged on every instalment after
        that. It also means there's no benefit to us in dragging out your loan artificially — the
        math rewards you for repaying, which is the entire point of choosing reducing balance in
        the first place.
      </P>
      <P>
        Want to try your own numbers?{" "}
        <Link href="/loans" className="text-[var(--color-brand)] hover:underline">
          Use the loan calculator on our Loans page
        </Link>{" "}
        to see your monthly payment and full schedule before you apply.
      </P>
    </ArticleLayout>
  );
}
