import Link from "next/link";

const toneClasses = {
  neutral: "text-ink",
  warning: "text-accent-deep",
  success: "text-green-700",
  danger: "text-red-600",
} as const;

export default function StatCard({
  label,
  value,
  href,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: string | number;
  href?: string;
  tone?: keyof typeof toneClasses;
  hint?: string;
}) {
  const content = (
    <div className="bg-white rounded-2xl border border-line p-5 h-full transition-shadow hover:shadow-md">
      <p className="text-sm text-ink-soft">{label}</p>
      <p className={`text-3xl font-bold font-display mt-1 ${toneClasses[tone]}`}>{value}</p>
      {hint && <p className="text-xs text-ink-soft mt-2">{hint}</p>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }
  return content;
}
