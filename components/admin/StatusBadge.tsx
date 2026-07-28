const toneClasses = {
  neutral: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
} as const;

export default function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: keyof typeof toneClasses;
}) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}
