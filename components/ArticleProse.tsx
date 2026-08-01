// Small, consistent building blocks for long-form article content --
// the project doesn't have @tailwindcss/typography installed, so these
// stand in for a "prose" class rather than pulling in a new dependency
// for five pages.

export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-12 mb-4 font-display text-2xl font-bold text-[var(--color-ink)] first:mt-0">
      {children}
    </h2>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-5 leading-relaxed text-[var(--color-ink-soft)]">{children}</p>;
}

export function Ul({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mb-5 space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 leading-relaxed text-[var(--color-ink-soft)]">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-brand)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Callout({
  label = "Key takeaway",
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="my-8 rounded-2xl border border-[var(--color-brand)]/25 bg-[var(--color-brand-wash)] p-6">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-deep)]">
        {label}
      </p>
      <div className="leading-relaxed text-[var(--color-ink)]">{children}</div>
    </div>
  );
}

export function CompareTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: string[][];
}) {
  return (
    <div className="my-8 overflow-x-auto rounded-2xl border border-[var(--color-line)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--color-paper-deep)] text-left text-[var(--color-ink-soft)]">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-line)]">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-4 py-3 ${j === 0 ? "font-medium text-[var(--color-ink)]" : "text-[var(--color-ink-soft)]"}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
