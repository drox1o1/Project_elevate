import { cn } from "@/lib/utils";

/**
 * Purchasing-power comparison (PRD §E).
 *
 * Price appreciation on its own answers the least interesting of the three
 * questions this section cares about:
 *
 *   1. How much did it cost?
 *   2. How much did the underlying thing appreciate?
 *   3. How hard was it for a person to afford?
 *
 * Each block below is one of those questions, with the two figures that
 * answer it shown against each other rather than in a table where the reader
 * has to do the division themselves.
 */

export interface ComparisonPair {
  /** Question this block answers. */
  title: string;
  /** Plain-language framing under the title. */
  question: string;
  then: { label: string; value: string; magnitude: number };
  now: { label: string; value: string; magnitude: number };
  /** The reading — what the gap means. */
  verdict: string;
  /** Rendered in the estimate treatment. */
  provisional?: boolean;
}

function Bars({
  pair,
  accentVar,
}: {
  pair: ComparisonPair;
  accentVar: string;
}) {
  const max = Math.max(pair.then.magnitude, pair.now.magnitude, Number.EPSILON);
  const rows = [
    { ...pair.then, tone: "var(--muted-foreground)" },
    { ...pair.now, tone: accentVar },
  ];

  return (
    <div className="mt-4 flex flex-col gap-3">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="type-caption uppercase tracking-[0.06em] text-muted-foreground">
              {row.label}
            </span>
            <span className="type-label text-foreground numeric">{row.value}</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full"
              style={{
                width: `${Math.max(2, (row.magnitude / max) * 100)}%`,
                background: row.tone,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AffordabilityPanel({
  id,
  items,
  accent,
  className,
}: {
  /** Stable scope for the dark-mode accent override — use the index slug. */
  id: string;
  items: ComparisonPair[];
  accent: { light: string; dark: string };
  className?: string;
}) {
  return (
    <div
      data-pop-afford={id}
      className={cn("grid gap-5 md:grid-cols-3", className)}
      style={{ "--pop-accent": accent.light } as React.CSSProperties}
    >
      <style>{`.dark [data-pop-afford="${id}"]{--pop-accent:${accent.dark}}`}</style>
      {items.map((item) => (
        <section
          key={item.title}
          className="flex flex-col rounded-xl border border-border bg-card p-5"
        >
          <h3 className="type-title text-foreground">{item.title}</h3>
          <p className="mt-1 type-meta leading-6 text-muted-foreground">
            {item.question}
          </p>
          <Bars pair={item} accentVar="var(--pop-accent)" />
          <p
            className={cn(
              "mt-4 border-t border-border pt-3 type-meta leading-6",
              item.provisional ? "text-warning" : "text-foreground"
            )}
          >
            {item.verdict}
          </p>
        </section>
      ))}
    </div>
  );
}
