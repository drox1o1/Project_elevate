import { cn } from "@/lib/utils";
import type { PresentedBom, PresentedComponentLine } from "@/lib/pop-indices/present";

/**
 * The build, line by line.
 *
 * A single total is the least informative way to price an assembly: the parts
 * move in opposite directions and the sum sits still, so the total reports a
 * calm that never existed. This panel shows the composition twice — base year
 * and latest — the per-line arc, and the two lines sold by capacity, where the
 * module price and the price of a gigabyte disagree with each other.
 *
 * Server component. No state, so the hovers are CSS and nothing here owns an
 * animation.
 */

/** Sparkline from a 0–1 normalised series. Decorative — the numbers are beside it. */
function Spark({
  values,
  tone,
  className,
}: {
  values: number[];
  tone: string;
  className?: string;
}) {
  if (values.length < 2) return null;
  const W = 100;
  const H = 28;
  const pad = 2;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - pad - v * (H - pad * 2);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const last = values[values.length - 1];

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={cn("h-7 w-full overflow-visible", className)}
    >
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={tone}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={W}
        cy={H - pad - last * (H - pad * 2)}
        r={2}
        fill={tone}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Tone for a line: capacity-priced parts carry the accent, the rest recede. */
function toneFor(line: PresentedComponentLine, i: number, total: number) {
  if (line.capacity) return "var(--pop-accent)";
  const mix = 46 - Math.round((i / Math.max(1, total - 1)) * 26);
  return `color-mix(in oklab, var(--pop-accent) ${mix}%, var(--muted-foreground))`;
}

/** One year's composition as a single stacked bar. */
function Composition({
  label,
  total,
  lines,
  share,
}: {
  label: string;
  total: string;
  lines: PresentedComponentLine[];
  share: (l: PresentedComponentLine) => number;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono type-caption uppercase tracking-[0.1em] text-muted-foreground">
          {label}
        </span>
        <span className="type-label text-foreground numeric">{total}</span>
      </div>
      <div className="mt-2 flex h-9 w-full gap-px overflow-hidden rounded-md">
        {lines.map((l, i) => (
          <span
            key={l.id}
            title={`${l.label} — ${(share(l) * 100).toFixed(1)}%`}
            className="block h-full first:rounded-l-md last:rounded-r-md"
            style={{
              width: `${share(l) * 100}%`,
              background: toneFor(l, i, lines.length),
            }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * A component getting dearer is not a failure and getting cheaper is not a
 * win, so the invoice rows stay neutral. Red and green are reserved for the
 * capacity cards, where the direction is the actual finding.
 */
function ChangeChip({
  change,
  rose,
  tone = "neutral",
}: {
  change: string;
  rose: boolean;
  tone?: "neutral" | "signed";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 font-mono type-caption numeric",
        tone === "neutral"
          ? "bg-muted text-foreground"
          : rose
            ? "bg-destructive/10 text-destructive"
            : "bg-success/10 text-success"
      )}
    >
      {change}
    </span>
  );
}

export function BillOfMaterials({
  id,
  bom,
  accent,
  className,
}: {
  /** Stable scope for the dark-mode accent override — use the index slug. */
  id: string;
  bom: PresentedBom;
  accent: { light: string; dark: string };
  className?: string;
}) {
  const capacityLines = bom.lines.filter((l) => l.capacity);

  return (
    <div
      data-pop-bom={id}
      className={cn("min-w-0", className)}
      style={{ "--pop-accent": accent.light } as React.CSSProperties}
    >
      <style>{`.dark [data-pop-bom="${id}"]{--pop-accent:${accent.dark}}`}</style>

      <p className="max-w-2xl type-body leading-7 text-foreground">{bom.lead}</p>

      {/* Composition, then and now */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Composition
          label={`Composition ${bom.baseYear}`}
          total={bom.baseTotal}
          lines={bom.lines}
          share={(l) => l.baseShare}
        />
        <Composition
          label={`Composition ${bom.latestYear}`}
          total={bom.latestTotal}
          lines={bom.lines}
          share={(l) => l.latestShare}
        />
      </div>

      {capacityLines.length > 0 ? (
        <p className="mt-3 type-caption leading-5 text-muted-foreground">
          <span
            aria-hidden="true"
            className="mr-2 inline-block size-2 rounded-[2px] align-baseline"
            style={{ background: "var(--pop-accent)" }}
          />
          Segments run in table order, left to right. The two in full colour are{" "}
          {capacityLines.map((l) => l.label.toLowerCase()).join(" and ")} — the
          only lines here priced by capacity.
        </p>
      ) : null}

      {/* The invoice */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[46rem] border-collapse text-left">
          <caption className="sr-only">
            Every priced line of the build in {bom.baseYear} and {bom.latestYear},
            with its change across the period and its share of the total.
          </caption>
          <thead>
            <tr className="border-b border-border">
              {[
                { label: "Line", align: "text-left" },
                { label: String(bom.baseYear), align: "text-right" },
                { label: String(bom.latestYear), align: "text-right" },
                { label: "Change", align: "text-right" },
                { label: `Share ${bom.latestYear}`, align: "text-right" },
                { label: "Arc", align: "text-left" },
              ].map((h) => (
                <th
                  key={h.label}
                  scope="col"
                  className={cn(
                    "pb-3 pr-4 font-mono type-caption font-normal uppercase tracking-[0.1em] text-muted-foreground last:pr-0",
                    h.align
                  )}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bom.lines.map((l, i) => (
              <tr
                key={l.id}
                className="border-b border-border align-top transition-colors duration-200 hover:bg-muted/40"
              >
                <td className="max-w-[20rem] py-4 pr-6">
                  <span className="type-label text-foreground">{l.label}</span>
                  <span className="mt-1 block type-caption leading-5 text-muted-foreground">
                    {l.baseSpec} <span aria-hidden="true">→</span> {l.latestSpec}
                  </span>
                </td>
                <td className="py-4 pr-4 text-right font-mono type-label text-muted-foreground numeric">
                  {l.base}
                </td>
                <td className="py-4 pr-4 text-right font-mono type-label text-foreground numeric">
                  {l.latest}
                </td>
                <td className="py-4 pr-4 text-right">
                  <ChangeChip change={l.change} rose={l.rose} />
                </td>
                <td className="w-[7rem] py-4 pr-4">
                  <span className="block text-right font-mono type-caption text-muted-foreground numeric">
                    {(l.latestShare * 100).toFixed(1)}%
                  </span>
                  <span className="mt-1.5 block h-1 w-full overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${Math.max(2, l.latestShare * 100 * 4)}%`,
                        background: toneFor(l, i, bom.lines.length),
                      }}
                    />
                  </span>
                </td>
                <td className="w-[7rem] py-4">
                  <Spark values={l.spark} tone={toneFor(l, i, bom.lines.length)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 type-caption leading-5 text-muted-foreground">
        Lines sum to the build total in every year. Share bars are scaled ×4 so
        a 7% line is still visible; the figure beside each is the true share.
      </p>

      {/* Sold by capacity — where the two prices disagree */}
      {capacityLines.length > 0 ? (
        <div className="mt-12">
          <h3 className="type-title text-foreground">
            The two lines sold by the gigabyte
          </h3>
          <p className="mt-2 max-w-2xl type-meta leading-6 text-muted-foreground">
            For every other line, a price is a price. For these two it depends
            entirely on what you divide by — and the module and the gigabyte
            spent sixteen years disagreeing.
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {capacityLines.map((l) => {
              const c = l.capacity!;
              return (
                <section
                  key={l.id}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h4 className="type-title text-foreground">{l.label}</h4>
                    <span className="font-mono type-caption text-muted-foreground numeric">
                      {c.baseCapacity} <span aria-hidden="true">→</span>{" "}
                      {c.latestCapacity}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-mono text-2xl text-muted-foreground numeric">
                      {c.basePerUnit}
                    </span>
                    <span aria-hidden="true" className="text-muted-foreground">
                      →
                    </span>
                    <span
                      className="font-mono text-2xl numeric"
                      style={{ color: "var(--pop-accent)" }}
                    >
                      {c.latestPerUnit}
                    </span>
                    <ChangeChip
                      change={c.changePerUnit}
                      rose={c.perUnitRose}
                      tone="signed"
                    />
                  </div>
                  <p className="mt-1 type-caption text-muted-foreground">
                    Per gigabyte installed, {bom.baseYear} to {bom.latestYear}
                  </p>

                  <dl className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border">
                    <div className="bg-card p-3">
                      <dt className="type-caption uppercase tracking-[0.06em] text-muted-foreground">
                        Cheapest, {c.lowYear}
                      </dt>
                      <dd className="mt-1 font-mono type-label text-foreground numeric">
                        {c.lowPerUnit}
                      </dd>
                    </div>
                    <div className="bg-card p-3">
                      <dt className="type-caption uppercase tracking-[0.06em] text-muted-foreground">
                        Fall to {c.lowYear}
                      </dt>
                      <dd className="mt-1 font-mono type-label text-success numeric">
                        {c.fallToLow}
                      </dd>
                    </div>
                    {bom.shock && l.shock ? (
                      <div className="bg-card p-3">
                        <dt className="type-caption uppercase tracking-[0.06em] text-muted-foreground">
                          {bom.shock.fromYear}–{bom.shock.toYear}
                        </dt>
                        <dd className="mt-1 font-mono type-label text-destructive numeric">
                          {l.shock.change}
                        </dd>
                      </div>
                    ) : (
                      <div className="bg-card p-3">
                        <dt className="type-caption uppercase tracking-[0.06em] text-muted-foreground">
                          Since {c.lowYear}
                        </dt>
                        <dd className="mt-1 font-mono type-label text-destructive numeric">
                          {c.riseSinceLow}
                        </dd>
                      </div>
                    )}
                  </dl>

                  <p className="mt-4 type-meta leading-6 text-foreground">
                    {l.note}
                  </p>
                  {c.note ? (
                    <p className="mt-3 border-t border-border pt-3 type-caption leading-5 text-muted-foreground">
                      {c.note}
                    </p>
                  ) : null}
                </section>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* The shock */}
      {bom.shock ? (
        <div
          className="mt-12 rounded-2xl border p-6 sm:p-8"
          style={{
            borderColor: "color-mix(in oklab, var(--pop-accent) 40%, transparent)",
            background: "color-mix(in oklab, var(--pop-accent) 6%, transparent)",
          }}
        >
          <p className="font-mono type-caption uppercase tracking-[0.14em] text-muted-foreground">
            {bom.shock.fromYear} to {bom.shock.toYear}
          </p>
          <p className="mt-4 max-w-3xl text-balance text-xl font-semibold leading-tight tracking-[-0.02em] text-foreground sm:text-2xl">
            {bom.shock.note}
          </p>
          <dl className="mt-7 grid gap-6 sm:grid-cols-3">
            {[
              { label: "The build", value: bom.shock.buildChange },
              {
                label: "Of that rise, from memory and storage",
                value: bom.shock.contributionShare,
              },
              {
                label: `Their share of the ${bom.latestYear} build`,
                value: `${Math.round(
                  bom.lines
                    .filter((l) => l.capacity)
                    .reduce((s, l) => s + l.latestShare, 0) * 100
                )}%`,
              },
            ].map((row) => (
              <div key={row.label}>
                <dt className="type-caption uppercase tracking-[0.06em] text-muted-foreground">
                  {row.label}
                </dt>
                <dd
                  className="mt-2 font-mono text-3xl numeric"
                  style={{ color: "var(--pop-accent)" }}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-7 max-w-3xl type-meta leading-6 text-muted-foreground">
            Neither of those parts got worse, scarcer to manufacture, or harder
            to design. They got bought by somebody else. The wafers that make
            desktop memory also make the high-bandwidth memory stacked beside an
            AI accelerator, where the same silicon earns considerably more — and
            the drives that hold training data come off the same lines as the one
            in this build.
          </p>
        </div>
      ) : null}
    </div>
  );
}
