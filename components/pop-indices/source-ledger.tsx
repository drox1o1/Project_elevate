import { cn } from "@/lib/utils";
import { ConfidenceBadge } from "@/components/pop-indices/confidence-badge";
import type { Dataset } from "@/lib/pop-indices/types";

/**
 * The source ledger (PRD §G).
 *
 * Trust is a product feature here, not legal copy at the bottom: every
 * dataset behind the page is listed with its publisher, range, unit, the
 * adjustments applied on the way in, how gaps are treated, and when a human
 * last checked it.
 *
 * Built on native details/summary — it collapses to accessible rows on small
 * screens, works before hydration, and is keyboard-operable with no JS.
 */

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="grid gap-0.5 py-2 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
      <dt className="type-caption uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0 type-meta leading-6 text-foreground">{value}</dd>
    </div>
  );
}

export function SourceLedger({
  datasets,
  className,
}: {
  datasets: Dataset[];
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <ul className="flex flex-col divide-y divide-border border-y border-border">
        {datasets.map((d) => (
          <li key={d.id} id={`dataset-${d.id}`} className="scroll-mt-24">
            <details className="group">
              <summary
                className={cn(
                  "flex cursor-pointer list-none flex-wrap items-baseline gap-x-3 gap-y-1.5 py-4",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                <span
                  aria-hidden="true"
                  className="font-mono type-caption text-muted-foreground transition-transform duration-200 group-open:rotate-90"
                >
                  ▸
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block type-title text-foreground">{d.title}</span>
                  <span className="mt-0.5 block type-meta text-muted-foreground">
                    {d.publisher}
                  </span>
                </span>
                <ConfidenceBadge level={d.confidence} />
                <span className="font-mono type-caption text-muted-foreground numeric">
                  {d.startDate.slice(0, 4)}–{d.endDate.slice(0, 4)}
                </span>
              </summary>

              <dl className="divide-y divide-border/60 pb-4 pl-0 sm:pl-6">
                <Row label="Publisher" value={d.publisher} />
                <Row
                  label="Date range"
                  value={`${d.startDate} to ${d.endDate}`}
                />
                <Row label="Geography" value={d.geography} />
                <Row label="Frequency" value={d.frequency} />
                <Row label="Original unit" value={d.originalUnit} />
                <Row label="Normalised unit" value={d.normalisedUnit} />
                <Row label="Currency" value={d.currency} />
                <Row label="Adjustments" value={d.adjustments} />
                <Row label="Missing data" value={d.missingData} />
                <Row label="Last checked" value={d.retrievedOn} />
                <Row label="Licensing" value={d.licence} />
                <div className="grid gap-0.5 py-2 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
                  <dt className="type-caption uppercase tracking-[0.06em] text-muted-foreground">
                    Source
                  </dt>
                  <dd className="min-w-0">
                    <a
                      href={d.sourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="break-all type-meta text-foreground underline decoration-dotted underline-offset-4 transition-colors duration-150 hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {d.sourceUrl}
                    </a>
                  </dd>
                </div>
              </dl>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
