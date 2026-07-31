import { cn } from "@/lib/utils";
import { ConfidenceBadge } from "@/components/pop-indices/confidence-badge";
import type {
  PresentedComputing,
  PresentedConstituent,
  PresentedTier,
} from "@/lib/pop-indices/present";

/**
 * The computing index: a machine treated as an index and its parts as
 * constituents.
 *
 * Every figure here is derived in `computingFor` from the constituent series —
 * weights, shares, the index level, the capability composite. Nothing is
 * hand-entered, so refreshing one component price moves the whole page and no
 * two numbers can drift apart.
 *
 * Server components throughout. The only interaction is disclosure and hover,
 * so it is CSS and `<details>`; nothing here owns an animation.
 */

/* ---- shared bits ------------------------------------------------------ */

function Spark({ values, tone }: { values: number[]; tone: string }) {
  if (values.length < 2) return null;
  const W = 100;
  const H = 26;
  const pad = 2;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - pad - v * (H - pad * 2);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="h-[26px] w-full overflow-visible"
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
        cy={H - pad - values[values.length - 1] * (H - pad * 2)}
        r={2}
        fill={tone}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * A constituent getting dearer is not a failure, so the default chip is
 * neutral. Signed tone is reserved for figures where direction is the finding.
 */
function Chip({
  value,
  rose,
  tone = "neutral",
  className,
}: {
  value: string;
  rose?: boolean;
  tone?: "neutral" | "signed" | "accent";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 font-mono type-caption numeric",
        tone === "neutral" && "bg-muted text-foreground",
        tone === "accent" && "bg-[color-mix(in_oklab,var(--pop-accent)_16%,transparent)] text-[var(--pop-accent)]",
        tone === "signed" &&
          (rose ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"),
        className
      )}
    >
      {value}
    </span>
  );
}

/** Constituents carry a stepped accent so the composition bar reads as a set. */
function toneFor(i: number, total: number) {
  const mix = 92 - Math.round((i / Math.max(1, total - 1)) * 68);
  return `color-mix(in oklab, var(--pop-accent) ${mix}%, var(--muted-foreground))`;
}

/* ---- 1 · index overview ----------------------------------------------- */

export function IndexOverview({
  data,
  className,
}: {
  data: PresentedComputing;
  className?: string;
}) {
  const rows = [
    { label: `Index, ${data.latestYear}`, value: data.indexNow, note: `${data.baseYear} = 100` },
    { label: "Total change", value: data.indexChange, note: "Nominal rupees" },
    {
      label: "Inflation adjusted",
      value: data.realChange ?? "—",
      note: "Net of Indian CPI",
    },
    {
      label: "Capability index",
      value: data.capabilityNow,
      note: `${data.capabilityMultiple} the ${data.baseYear} machine`,
    },
    {
      label: "Price per capability",
      value: data.perCapabilityChange,
      note: `Bottomed in ${data.troughYear}`,
    },
    {
      label: "Largest constituent",
      value: data.mostExpensive,
      note: `By share of the ${data.latestYear} business build`,
    },
    {
      label: "Fastest riser",
      value: data.fastestGrowing,
      note: "By percentage, and from the smallest base",
    },
    {
      label: "Largest fall",
      value: data.largestDeflation,
      note: "Absorbed into the processor, not discounted",
    },
  ];

  return (
    <dl
      className={cn(
        "grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {rows.map((r) => (
        <div key={r.label} className="bg-card p-5">
          <dt className="font-mono type-caption uppercase tracking-[0.1em] text-muted-foreground">
            {r.label}
          </dt>
          <dd className="mt-2 text-xl font-semibold tracking-[-0.02em] text-foreground numeric">
            {r.value}
          </dd>
          <dd className="mt-1 type-caption text-muted-foreground">{r.note}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---- 2 · two-machine comparison ---------------------------------------- */

function TierColumn({
  tier,
  labels,
  accentLead,
}: {
  tier: PresentedTier;
  labels: string[];
  accentLead: boolean;
}) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-2xl border p-6 sm:p-7",
        accentLead
          ? "border-[color-mix(in_oklab,var(--pop-accent)_40%,transparent)] bg-[color-mix(in_oklab,var(--pop-accent)_5%,transparent)]"
          : "border-border bg-card"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="type-title text-foreground">{tier.label}</h3>
          <p className="mt-1 type-caption text-muted-foreground">{tier.scope}</p>
        </div>
        <ConfidenceBadge level={tier.confidence} />
      </div>

      <p
        className="mt-5 font-mono text-3xl tracking-[-0.02em] numeric sm:text-4xl"
        style={{ color: accentLead ? "var(--pop-accent)" : undefined }}
      >
        {tier.total}
      </p>
      <p className="mt-4 max-w-md type-meta leading-6 text-muted-foreground">
        {tier.purpose}
      </p>

      <ul className="mt-6 flex flex-col divide-y divide-border border-y border-border">
        {tier.lines.map((l) => (
          <li key={l.constituentId} className="flex flex-col gap-1 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="type-label text-foreground">{l.label}</span>
              <span
                className={cn(
                  "font-mono type-label numeric",
                  l.included ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {l.price}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="type-caption leading-5 text-muted-foreground">
                {l.spec}
              </span>
              {l.included ? null : (
                <span className="shrink-0 font-mono type-caption text-muted-foreground numeric">
                  {(l.shareOfBuild * 100).toFixed(1)}%
                </span>
              )}
            </div>
            <span
              aria-hidden="true"
              className="mt-1 block h-[3px] w-full overflow-hidden rounded-full bg-muted"
            >
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${Math.max(l.included ? 0 : 1.5, l.shareOfBuild * 100 * 2)}%`,
                  background: toneFor(labels.indexOf(l.label), labels.length),
                }}
              />
            </span>
            {l.note ? (
              <span className="type-caption leading-5 text-muted-foreground">
                {l.note}
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      <p className="mt-5 type-meta leading-6 text-foreground">
        Largest constituent: <strong className="font-semibold">{tier.largest.label}</strong>{" "}
        at {tier.largest.price} — {tier.largest.shareOfBuild} of the build,{" "}
        {tier.largest.shareOfTower} of the tower.
      </p>
    </section>
  );
}

export function TierComparison({
  data,
  accent,
  id,
  className,
}: {
  data: PresentedComputing;
  accent: { light: string; dark: string };
  id: string;
  className?: string;
}) {
  const labels = data.constituents.map((k) => k.label);
  return (
    <div
      data-pop-tier={id}
      className={cn("min-w-0", className)}
      style={{ "--pop-accent": accent.light } as React.CSSProperties}
    >
      <style>{`.dark [data-pop-tier="${id}"]{--pop-accent:${accent.dark}}`}</style>
      <div className="grid gap-5 lg:grid-cols-2">
        {data.headlineTiers.map((t, i) => (
          <TierColumn key={t.id} tier={t} labels={labels} accentLead={i === 1} />
        ))}
      </div>
      <p className="mt-6 max-w-3xl type-body leading-7 text-foreground">
        The first machine does the same job. The second is what people
        increasingly mean when they say compute — and the difference between
        them is almost entirely two constituents.
      </p>
    </div>
  );
}

/* ---- 3 · composition ---------------------------------------------------- */

export function CompositionBars({
  data,
  className,
}: {
  data: PresentedComputing;
  className?: string;
}) {
  const labels = data.constituents.map((k) => k.label);
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {data.tiers.map((t) => (
        <div key={t.id}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="type-label text-foreground">{t.label}</span>
            <span className="font-mono type-label text-muted-foreground numeric">
              {t.total}
            </span>
          </div>
          <div className="mt-2 flex h-10 w-full gap-px overflow-hidden rounded-md">
            {t.lines
              .filter((l) => l.rawPrice > 0)
              .map((l) => (
                <span
                  key={l.constituentId}
                  title={`${l.label} — ${l.price} — ${(l.shareOfBuild * 100).toFixed(1)}%`}
                  className="relative block h-full first:rounded-l-md last:rounded-r-md"
                  style={{
                    width: `${l.shareOfBuild * 100}%`,
                    background: toneFor(labels.indexOf(l.label), labels.length),
                  }}
                />
              ))}
          </div>
          <p className="mt-2 type-caption text-muted-foreground">
            Largest: {t.largest.label}, {t.largest.shareOfBuild} of the build.
          </p>
        </div>
      ))}

      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        {data.constituents.map((k, i) => (
          <li
            key={k.id}
            className="flex items-center gap-2 type-caption text-muted-foreground"
          >
            <span
              aria-hidden="true"
              className="inline-block size-2.5 shrink-0 rounded-[2px]"
              style={{ background: toneFor(i, data.constituents.length) }}
            />
            {k.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---- 4 · constituent cards ---------------------------------------------- */

function ConstituentCard({
  k,
  i,
  total,
  data,
}: {
  k: PresentedConstituent;
  i: number;
  total: number;
  data: PresentedComputing;
}) {
  const tone = toneFor(i, total);
  return (
    <details className="group rounded-2xl border border-border bg-card open:bg-muted/20">
      <summary className="flex cursor-pointer list-none flex-col gap-4 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-6 [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="type-title text-foreground">{k.label}</h3>
            <p className="mt-1 type-meta leading-6 text-muted-foreground">
              {k.role}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="mt-1 shrink-0 font-mono type-caption text-muted-foreground transition-transform duration-200 group-open:rotate-45"
          >
            +
          </span>
        </div>

        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <span className="font-mono type-label text-muted-foreground numeric">
            {k.base}
          </span>
          <span aria-hidden="true" className="text-muted-foreground">
            →
          </span>
          <span
            className="font-mono text-xl numeric"
            style={{ color: k.absorbed ? undefined : tone }}
          >
            {k.latest}
          </span>
          <Chip value={k.change} rose={k.rose} />
          {k.indexNow ? (
            <span className="font-mono type-caption text-muted-foreground numeric">
              index {k.indexNow}
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_6.5rem] items-end gap-4">
          <div className="min-w-0">
            <p className="type-caption leading-5 text-muted-foreground">
              {k.baseSpec} <span aria-hidden="true">→</span> {k.latestSpec}
            </p>
            <p className="mt-1.5 type-caption text-muted-foreground numeric">
              {(k.baseWeight * 100).toFixed(1)}% of the {data.baseYear} build{" "}
              <span aria-hidden="true">→</span>{" "}
              {(k.latestWeight * 100).toFixed(1)}% of the {data.latestYear}
            </p>
          </div>
          <Spark values={k.spark} tone={tone} />
        </div>
      </summary>

      <div className="flex flex-col gap-6 border-t border-border px-5 pb-6 pt-5 sm:px-6">
        {k.capacity ? (
          <div>
            <p className="font-mono type-caption uppercase tracking-[0.1em] text-muted-foreground">
              Priced by capacity — {k.capacity.unit}
            </p>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-xl text-muted-foreground numeric">
                {k.capacity.basePerUnit}
              </span>
              <span aria-hidden="true" className="text-muted-foreground">
                →
              </span>
              <span className="font-mono text-xl numeric" style={{ color: tone }}>
                {k.capacity.latestPerUnit}
              </span>
              <Chip
                value={k.capacity.changePerUnit}
                rose={k.capacity.perUnitRose}
                tone="signed"
              />
              <span className="type-caption text-muted-foreground numeric">
                {k.capacity.baseCapacity} → {k.capacity.latestCapacity} installed
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border">
              <div className="bg-card p-3">
                <dt className="type-caption uppercase tracking-[0.06em] text-muted-foreground">
                  Cheapest, {k.capacity.lowYear}
                </dt>
                <dd className="mt-1 font-mono type-label text-foreground numeric">
                  {k.capacity.lowPerUnit}
                </dd>
              </div>
              <div className="bg-card p-3">
                <dt className="type-caption uppercase tracking-[0.06em] text-muted-foreground">
                  Fall to {k.capacity.lowYear}
                </dt>
                <dd className="mt-1 font-mono type-label text-success numeric">
                  {k.capacity.fallToLow}
                </dd>
              </div>
              <div className="bg-card p-3">
                <dt className="type-caption uppercase tracking-[0.06em] text-muted-foreground">
                  Since {k.capacity.lowYear}
                </dt>
                <dd className="mt-1 font-mono type-label text-destructive numeric">
                  {k.capacity.riseSinceLow}
                </dd>
              </div>
            </dl>
            {k.capacity.note ? (
              <p className="mt-3 type-caption leading-5 text-muted-foreground">
                {k.capacity.note}
              </p>
            ) : null}
          </div>
        ) : null}

        {k.capability.length > 0 ? (
          <div>
            <p className="font-mono type-caption uppercase tracking-[0.1em] text-muted-foreground">
              What the money bought
            </p>
            {/* Gap-px grids show the border colour through an empty cell, so
                the two-column layout only applies when there are two to fill. */}
            <dl
              className={cn(
                "mt-3 grid gap-px overflow-hidden rounded-lg border border-border bg-border",
                k.capability.length > 1 && "sm:grid-cols-2"
              )}
            >
              {k.capability.map((m) => (
                <div key={m.label} className="bg-card p-3">
                  <dt className="type-caption uppercase tracking-[0.06em] text-muted-foreground">
                    {m.label}
                  </dt>
                  <dd className="mt-1 font-mono type-label text-foreground numeric">
                    {m.base} <span aria-hidden="true">→</span> {m.latest}
                    <span className="ml-2 text-muted-foreground">{m.multiple}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        <div>
          <p className="font-mono type-caption uppercase tracking-[0.1em] text-muted-foreground">
            What sets this price
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {k.drivers.map((d) => (
              <li
                key={d}
                className="flex gap-3 type-meta leading-6 text-muted-foreground"
              >
                <span aria-hidden="true">—</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="max-w-2xl type-body leading-7 text-foreground">{k.insight}</p>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="max-w-xl type-meta italic leading-6 text-muted-foreground">
            {k.remark}
          </p>
          <ConfidenceBadge level={k.confidence} />
        </div>
      </div>
    </details>
  );
}

export function ConstituentGrid({
  data,
  accent,
  id,
  className,
}: {
  data: PresentedComputing;
  accent: { light: string; dark: string };
  id: string;
  className?: string;
}) {
  return (
    <div
      data-pop-const={id}
      className={cn("grid gap-4 lg:grid-cols-2", className)}
      style={{ "--pop-accent": accent.light } as React.CSSProperties}
    >
      <style>{`.dark [data-pop-const="${id}"]{--pop-accent:${accent.dark}}`}</style>
      {data.constituents.map((k, i) => (
        <ConstituentCard
          key={k.id}
          k={k}
          i={i}
          total={data.constituents.length}
          data={data}
        />
      ))}
    </div>
  );
}

/* ---- 5 · price versus capability ---------------------------------------- */

export function CapabilityPanel({
  data,
  accent,
  id,
  className,
}: {
  data: PresentedComputing;
  accent: { light: string; dark: string };
  id: string;
  className?: string;
}) {
  const W = 720;
  const H = 260;
  const padL = 8;
  const padB = 26;

  // Both series are indices on the same base, but capability runs to ~2,200
  // against a price index of ~220. A shared linear axis would draw price as a
  // flat line, so the panel is log-scaled and says so.
  const all = [...data.indexSeries, ...data.capabilitySeries].map((o) => o.value);
  const lo = Math.log10(Math.max(1, Math.min(...all)));
  const hi = Math.log10(Math.max(...all));
  const x = (i: number) =>
    padL + (i / (data.indexSeries.length - 1)) * (W - padL * 2);
  const y = (v: number) =>
    H - padB - ((Math.log10(Math.max(1, v)) - lo) / (hi - lo)) * (H - padB - 12);
  const path = (rows: { value: number }[]) =>
    rows.map((o, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(o.value).toFixed(1)}`).join(" ");

  return (
    <div
      data-pop-cap={id}
      className={cn("min-w-0", className)}
      style={{ "--pop-accent": accent.light } as React.CSSProperties}
    >
      <style>{`.dark [data-pop-cap="${id}"]{--pop-accent:${accent.dark}}`}</style>

      <div className="grid gap-5 sm:grid-cols-3">
        {[
          {
            label: "Price index",
            value: data.indexNow,
            note: `What the machine costs. ${data.baseYear} = 100.`,
          },
          {
            label: "Capability index",
            value: data.capabilityNow,
            note: `What it can do. ${data.capabilityMultiple} the base machine.`,
          },
          {
            label: "Price per capability",
            value: data.perCapabilityNow,
            note: `${data.perCapabilityChange} since ${data.baseYear}.`,
          },
        ].map((r, i) => (
          <div key={r.label} className="rounded-xl border border-border bg-card p-5">
            <p className="font-mono type-caption uppercase tracking-[0.1em] text-muted-foreground">
              {r.label}
            </p>
            <p
              className="mt-2 font-mono text-3xl numeric"
              style={{ color: i === 2 ? "var(--pop-accent)" : undefined }}
            >
              {r.value}
            </p>
            <p className="mt-2 type-caption leading-5 text-muted-foreground">
              {r.note}
            </p>
          </div>
        ))}
      </div>

      <figure className="mt-8 overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6">
        <figcaption className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="flex items-center gap-2 type-caption text-muted-foreground">
            <span
              aria-hidden="true"
              className="inline-block h-0.5 w-5 rounded-full"
              style={{ background: "var(--pop-accent)" }}
            />
            Capability
          </span>
          <span className="flex items-center gap-2 type-caption text-muted-foreground">
            <span
              aria-hidden="true"
              className="inline-block h-0.5 w-5 rounded-full bg-muted-foreground"
            />
            Price
          </span>
          <span className="type-caption text-muted-foreground">
            Log scale, {data.baseYear} = 100
          </span>
        </figcaption>
        <div className="mt-4 overflow-x-auto">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-[260px] w-full min-w-[36rem]"
            role="img"
            aria-label={`Capability rose to ${data.capabilityNow} while price rose to ${data.indexNow}, both indexed to 100 in ${data.baseYear}.`}
          >
            <path
              d={path(data.capabilitySeries)}
              fill="none"
              stroke="var(--pop-accent)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={path(data.indexSeries)}
              fill="none"
              stroke="var(--muted-foreground)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {[0, data.indexSeries.length - 1].map((i) => (
              <text
                key={i}
                x={x(i)}
                y={H - 8}
                textAnchor={i === 0 ? "start" : "end"}
                className="fill-[var(--muted-foreground)] font-mono text-[11px]"
              >
                {data.indexSeries[i].year}
              </text>
            ))}
          </svg>
        </div>
      </figure>

      <div className="mt-8 rounded-2xl border border-[color-mix(in_oklab,var(--pop-accent)_40%,transparent)] bg-[color-mix(in_oklab,var(--pop-accent)_6%,transparent)] p-6 sm:p-8">
        <p className="font-mono type-caption uppercase tracking-[0.14em] text-muted-foreground">
          The finding
        </p>
        <p className="mt-4 max-w-3xl text-balance text-xl font-semibold leading-tight tracking-[-0.02em] text-foreground sm:text-2xl">
          Price per unit of capability fell every year from {data.baseYear} to{" "}
          {data.troughYear}. Then it rose {data.riseSinceTrough}.
        </p>
        <p className="mt-5 max-w-3xl type-meta leading-6 text-muted-foreground">
          Computing capability grew far faster than price for most of two
          decades, which is the whole reason a computer stopped being a capital
          purchase. The current shift is different in kind: consumer machines now
          compete with enterprise infrastructure for their two most valuable
          constituents, and lose. That is not a technology slowing down. It is a
          buyer being outbid.
        </p>
      </div>

      <div className="mt-8">
        <p className="font-mono type-caption uppercase tracking-[0.1em] text-muted-foreground">
          What goes into the capability index
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                {["Metric", "Supplied by", "Weight", String(data.baseYear), String(data.latestYear), "Change"].map(
                  (h, i) => (
                    <th
                      key={h}
                      scope="col"
                      className={cn(
                        "pb-3 pr-4 font-mono type-caption font-normal uppercase tracking-[0.1em] text-muted-foreground last:pr-0",
                        i >= 2 && "text-right"
                      )}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {data.capabilityMetrics.map((m) => (
                <tr key={m.label} className="border-b border-border">
                  <td className="py-3 pr-4 type-label text-foreground">
                    {m.label}
                    <span className="ml-2 type-caption text-muted-foreground">
                      {m.unit}
                    </span>
                  </td>
                  <td className="py-3 pr-4 type-meta text-muted-foreground">
                    {m.constituentLabel}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono type-label text-muted-foreground numeric">
                    {m.weight}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono type-label text-muted-foreground numeric">
                    {m.base}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono type-label text-foreground numeric">
                    {m.latest}
                  </td>
                  <td className="py-3 text-right">
                    <Chip value={m.multiple} tone="accent" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-3xl type-caption leading-5 text-muted-foreground">
          Weights are published rather than tuned, and they are a judgement. A
          capability index nobody can audit is a number with a shrug attached.
          Benchmark suites change between hardware generations, so read a
          twenty-two-fold gain as an order of magnitude, not a precise multiple.
        </p>
      </div>
    </div>
  );
}

/* ---- 6 · market drivers -------------------------------------------------- */

const ARROW: Record<"up" | "down" | "flat", string> = {
  up: "▲",
  down: "▼",
  flat: "—",
};

export function DriverTimeline({
  data,
  className,
}: {
  data: PresentedComputing;
  className?: string;
}) {
  return (
    <ol className={cn("flex flex-col gap-px overflow-hidden rounded-2xl border border-border bg-border", className)}>
      {data.drivers.map((d) => (
        <li key={d.id} className="bg-card p-5 sm:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="type-title text-foreground">{d.label}</h3>
            <span className="font-mono type-caption uppercase tracking-[0.1em] text-muted-foreground">
              {d.period}
            </span>
          </div>
          <p className="mt-3 max-w-3xl type-body leading-7 text-foreground">
            {d.summary}
          </p>

          <ul className="mt-4 flex flex-wrap gap-2">
            {d.topics.map((t) => (
              <li
                key={t}
                className="rounded-full border border-border px-2.5 py-1 type-caption text-muted-foreground"
              >
                {t}
              </li>
            ))}
          </ul>

          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {d.effects.map((e) => (
              <li
                key={e.constituentId}
                className="flex items-start gap-2.5 rounded-lg bg-muted/40 px-3 py-2"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 font-mono type-caption",
                    e.direction === "up" && "text-destructive",
                    e.direction === "down" && "text-success",
                    e.direction === "flat" && "text-muted-foreground"
                  )}
                >
                  {ARROW[e.direction]}
                </span>
                <span className="min-w-0 type-caption leading-5">
                  <span className="text-foreground">
                    {data.constituentLabels[e.constituentId] ?? e.constituentId}
                  </span>
                  <span className="text-muted-foreground"> — {e.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
