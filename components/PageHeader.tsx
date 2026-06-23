import Wave from "@/components/Wave";

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-[var(--color-brand)] text-white">
      <div className="mx-auto max-w-6xl px-5 pb-28 pt-16 md:pt-20">
        {eyebrow && (
          <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-5 max-w-2xl font-display text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/85">
            {subtitle}
          </p>
        )}
      </div>
      <Wave className="absolute bottom-0 left-0 w-full" />
    </section>
  );
}
