import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Confidence } from "@/lib/pop-indices/types";

/**
 * The index rail — persistent navigation across every published index.
 *
 * It carries a value and a sparkline per row, not just a title, so the rail
 * doubles as a contents page and a comparison: you can see that the burger
 * and the chain moved in completely different shapes without opening either.
 *
 * Server-rendered with no JS. Sticky on desktop; on small screens it becomes
 * a horizontally scrolling strip, because a 26-row sidebar on a phone is a
 * wall, not navigation.
 */

export interface RailEntry {
  slug: string;
  shortName: string;
  film: string;
  indexedUnit: string;
  value: string;
  change: string;
  changePositive: boolean;
  confidence: Confidence;
  /** Normalised 0–1 series for the sparkline. */
  spark: number[];
  accent: { light: string; dark: string };
  /** Key art thumbnail, when the index has any. */
  imageSrc?: string | null;
}

const SPARK_W = 56;
const SPARK_H = 16;

function Spark({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const d = points
    .map(
      (n, i) =>
        `${i === 0 ? "M" : "L"} ${((i / (points.length - 1)) * SPARK_W).toFixed(1)} ${(
          SPARK_H -
          n * (SPARK_H - 2) -
          1
        ).toFixed(1)}`
    )
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
      width={SPARK_W}
      height={SPARK_H}
      fill="none"
      aria-hidden="true"
      className="shrink-0 overflow-visible"
    >
      <path
        d={d}
        stroke="var(--pop-accent)"
        strokeWidth={1.25}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

const CONFIDENCE_MARK: Record<Confidence, string> = {
  verified: "●",
  reconstructed: "◐",
  estimated: "○",
  "current-market": "◈",
};

export function IndexRail({
  entries,
  activeSlug,
  className,
}: {
  entries: RailEntry[];
  activeSlug?: string;
  className?: string;
}) {
  return (
    <nav aria-label="All indices" className={cn("min-w-0", className)}>
      {/* Scoped accents for every row, in one style element. */}
      <style>
        {entries
          .map(
            (e) =>
              `[data-rail-row="${e.slug}"]{--pop-accent:${e.accent.light}}` +
              `.dark [data-rail-row="${e.slug}"]{--pop-accent:${e.accent.dark}}`
          )
          .join("")}
      </style>

      <p className="hidden font-mono type-caption uppercase tracking-[0.14em] text-muted-foreground lg:block">
        The indices
      </p>

      {/* Horizontal strip on small screens, stacked rail from lg up. */}
      <ul
        className={cn(
          "-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2",
          "lg:mx-0 lg:mt-3 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0"
        )}
      >
        {entries.map((e, i) => {
          const active = e.slug === activeSlug;
          return (
            <li
              key={e.slug}
              data-rail-row={e.slug}
              className="min-w-0 shrink-0 snap-start lg:shrink"
            >
              <Link
                href={`/pop-indices/${e.slug}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex w-[13.5rem] flex-col gap-1 rounded-lg border p-3 transition-colors duration-200",
                  "lg:w-auto lg:rounded-none lg:border-0 lg:border-l-2 lg:py-3 lg:pl-4 lg:pr-2",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-[var(--pop-accent)] bg-[color-mix(in_oklab,var(--pop-accent)_8%,transparent)] lg:border-l-[var(--pop-accent)]"
                    : "border-border hover:bg-muted/50 lg:border-l-border"
                )}
              >
                <div className="flex items-center gap-2">
                  {e.imageSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={e.imageSrc}
                      alt=""
                      loading="lazy"
                      className="size-5 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <span className="font-mono type-caption text-muted-foreground numeric">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  )}
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate type-label font-medium",
                      active ? "text-foreground" : "text-foreground/85"
                    )}
                  >
                    {e.shortName}
                  </span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 font-mono type-caption text-muted-foreground"
                    title={e.confidence}
                  >
                    {CONFIDENCE_MARK[e.confidence]}
                  </span>
                </div>

                <p className="truncate type-caption text-muted-foreground">
                  {e.film} · {e.indexedUnit}
                </p>

                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate font-mono type-meta text-foreground numeric">
                    {e.value}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <Spark points={e.spark} />
                    <span
                      className={cn(
                        "font-mono type-caption numeric",
                        e.changePositive ? "text-market-up" : "text-market-down"
                      )}
                    >
                      {e.change}
                    </span>
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 hidden flex-col gap-2 border-t border-border pt-4 lg:flex">
        <Link
          href="/pop-indices"
          className="type-meta text-muted-foreground underline-offset-4 transition-colors duration-200 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          All of Pop Indices
        </Link>
        <Link
          href="/pop-indices/methodology"
          className="type-meta text-muted-foreground underline-offset-4 transition-colors duration-200 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Methodology
        </Link>
        <Link
          href="/pop-indices#submit"
          className="type-meta text-muted-foreground underline-offset-4 transition-colors duration-200 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Suggest a scene
        </Link>
      </div>
    </nav>
  );
}
