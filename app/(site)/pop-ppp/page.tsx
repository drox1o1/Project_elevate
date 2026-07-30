import type { Metadata } from "next";
import Link from "next/link";
import { ScrollFade } from "@/components/site/scroll-fade";
import { ScrollRevealGrid } from "@/registry/default/motion/scroll-reveal-grid";
import { ConfidenceBadge } from "@/components/pop-ppp/confidence-badge";
import { Grain, NoirBand, SectionHeading } from "@/components/pop-ppp/editorial";
import { HeroEquation } from "@/components/pop-ppp/hero-equation";
import { IndexArtwork } from "@/components/pop-ppp/index-artwork";
import { IndexCard } from "@/components/pop-ppp/index-card";
import { IndexChart } from "@/components/pop-ppp/index-chart";
import { PipelineStrip } from "@/components/pop-ppp/pipeline-strip";
import { ReferenceSubmit } from "@/components/pop-ppp/reference-submit";
import { ValueTicker } from "@/components/pop-ppp/value-ticker";
import {
  LIVE_INDICES,
  RESEARCH_QUEUE,
  SNAPSHOT_LABEL,
  SOURCE_COUNT,
  getIndex,
} from "@/lib/pop-ppp/data";
import {
  cardFor,
  featuredLines,
  presentIndex,
  seriesValues,
  tickerItemFor,
} from "@/lib/pop-ppp/present";
import { formatPercent } from "@/lib/pop-ppp/calc";

export const metadata: Metadata = {
  title: "Pop PPP — Pop Culture Purchasing Power Parity | DUKU",
  description:
    "Iconic scenes, objects and transactions converted into real economic indices using historical prices, transparent equations and unnecessarily serious analysis.",
};

const HERO_STAGES = [
  { text: "“50 tola.”", caption: "Vaastav, 1999" },
  { text: "50 × 11.6638 g", caption: "The unit" },
  { text: "583.19 g of 24-karat gold", caption: "The quantity" },
  { text: "58.319 × ₹4,234", caption: "Gold price, 1999" },
  { text: "₹59,19,379", caption: "Value at last verified date" },
  { text: "“$5 shake?”", caption: "Pulp Fiction, 1994" },
  { text: "$5.00 × restaurant CPI", caption: "The deflator that decides it" },
  { text: "$13.25", caption: "Still, precisely, a lot for a milkshake" },
  { text: "“Royale with Cheese.”", caption: "Same burger, eight economies" },
  { text: "price ÷ hourly wage", caption: "Minutes of work per burger" },
  { text: "13 min → 20 min", caption: "Australia to France" },
];

const PIPELINE = [
  {
    label: "Scene",
    detail: "A moment specific enough to contain a measurable thing.",
    example: "“50 tola.”",
  },
  {
    label: "Unit",
    detail: "The object, quantity or transaction, stated precisely.",
    example: "50 tolas of 24-karat gold",
  },
  {
    label: "Dataset",
    detail: "A published historical series that actually covers it.",
    example: "IBJA / RBI gold price per 10 g",
  },
  {
    label: "Equation",
    detail: "Every transformation shown, with its source and rounding rule.",
    example: "58.319 × price per 10 g",
  },
  {
    label: "Index",
    detail: "Value, real change, and how hard it was to afford.",
    example: "₹59,19,379 · +2,297%",
  },
];

const NOT_THIS = [
  "A generic inflation calculator",
  "A meme archive",
  "A film trivia site",
  "Investment advice",
  "Unsourced approximations",
];

const FEASIBILITY_LABEL: Record<number, string> = {
  5: "Data is ready",
  4: "Data is workable",
  3: "Data is the hard part",
  2: "Data may not support it",
};

export default function PopPppPage() {
  const presented = LIVE_INDICES.map(presentIndex);
  const featured = presentIndex(getIndex("sanju-baba-50-tola")!);
  const featuredCopy = featuredLines(featured);
  const ticker = presented.map(tickerItemFor);

  return (
    <main>
      {/* ── Hero · scene register ────────────────────────────────────── */}
      <NoirBand
        accent={{ light: "hsl(41 74% 58%)", dark: "hsl(41 74% 58%)" }}
        scopeId="pop-hero"
      >
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:pt-28">
          <p className="font-mono type-caption uppercase tracking-[0.2em] text-white/45">
            Pop Culture Purchasing Power Parity
          </p>
          <h1 className="mt-6 max-w-4xl text-balance text-[2.5rem] font-semibold leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
            Popular culture remembers the line.
            <span className="mt-1 block text-white/45">
              Economics remembers the price.
            </span>
          </h1>
          <p className="mt-7 max-w-2xl text-balance text-[0.9375rem] leading-7 text-white/55">
            Iconic scenes, objects and transactions converted into real economic
            indices using historical prices, transparent equations and
            unnecessarily serious analysis.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="#indices"
              className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-medium text-black transition-transform duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              Explore the indices
            </Link>
            <Link
              href="/pop-ppp/methodology"
              className="inline-flex h-11 items-center rounded-full border border-white/25 px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              See how the maths works
            </Link>
          </div>
        </div>

        {/* The reference resolving into an economic unit. */}
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <HeroEquation stages={HERO_STAGES} invert />
          </div>
        </div>

        <ValueTicker items={ticker} />
      </NoirBand>

      {/* ── Featured index ──────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
          <SectionHeading
            ordinal="01"
            eyebrow="Featured index"
            title={featured.index.name}
            lead={featured.index.subtitle}
          />

          <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
            <ScrollFade>
              <blockquote className="relative">
                <p className="text-balance text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-4xl">
                  &ldquo;{featured.index.dialogue}&rdquo;
                </p>
                <footer className="mt-4 type-meta text-muted-foreground">
                  {featured.index.character} · {featured.index.film},{" "}
                  {featured.index.releaseYear}
                </footer>
              </blockquote>

              <div className="mt-8">
                <ConfidenceBadge level={featured.index.confidence} />
              </div>

              <div className="mt-7 flex flex-col gap-4">
                {featuredCopy.map((line) => (
                  <p key={line} className="max-w-md type-body leading-7 text-foreground">
                    {line}
                  </p>
                ))}
              </div>

              <p className="mt-6 max-w-md type-body italic leading-7 text-muted-foreground">
                {featured.index.remark}
              </p>

              <Link
                href={`/pop-ppp/${featured.index.slug}`}
                className="mt-9 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-transform duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
              >
                Open the full index
              </Link>
            </ScrollFade>

            <div className="min-w-0">
              <div
                className="relative overflow-hidden rounded-3xl border border-border p-5 sm:p-7"
                style={{ "--pop-accent": featured.index.accent.light } as React.CSSProperties}
              >
                <style>{`.dark [data-pop-featured]{--pop-accent:${featured.index.accent.dark}}`}</style>
                <div data-pop-featured>
                  <div className="flex flex-wrap items-end justify-between gap-6">
                    <div>
                      <p className="font-mono type-caption uppercase tracking-[0.1em] text-muted-foreground numeric">
                        {featured.result.baseYear}
                      </p>
                      <p className="mt-1.5 font-mono text-xl text-muted-foreground numeric">
                        {featured.money(featured.result.baseValue)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono type-caption uppercase tracking-[0.1em] text-muted-foreground numeric">
                        {featured.result.latestYear} · last verified
                      </p>
                      <p className="mt-1.5 font-mono text-3xl font-semibold tracking-[-0.02em] text-foreground numeric sm:text-4xl">
                        {featured.money(featured.result.currentValue)}
                      </p>
                      <p className="mt-1 font-mono type-meta text-market-up numeric">
                        {formatPercent(featured.result.percentChange)} ·{" "}
                        {featured.result.cagr.toFixed(1)}% a year
                      </p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <IndexChart
                      title="What 50 tolas of gold were worth each year"
                      priceSeries={featured.priceSeries}
                      unitFactor={featured.index.unitFactor}
                      baseYear={featured.index.baseYear}
                      moneyFormat={featured.moneyFormat}
                      currencySymbol={featured.index.currencySymbol}
                      locale={featured.locale}
                      cpiSeries={featured.cpiSeries}
                      incomeSeries={featured.incomeSeries}
                      events={featured.index.events}
                      quantityUnit={
                        featured.priceSeries.pricedUnit ?? featured.priceSeries.unit
                      }
                      accent={featured.index.accent}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Index grid ──────────────────────────────────────────────── */}
      <section id="indices" className="scroll-mt-20 border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
          <SectionHeading
            ordinal="02"
            eyebrow="The collection"
            title="Six indices, six different kinds of data"
            lead="A commodity, a purchasing-power comparison, a retail food price, a labour market, a restaurant menu and an illicit market. If one system holds across all six, it holds."
          />

          <ScrollRevealGrid className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {presented.map((p, i) => (
              <IndexCard key={p.index.slug} data={cardFor(p)} ordinal={i + 1} />
            ))}
          </ScrollRevealGrid>
        </div>
      </section>

      {/* ── What is being measured ─────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
          <SectionHeading
            ordinal="03"
            eyebrow="Method"
            title="What is actually being measured"
            lead="We do not estimate what a film lifestyle would cost. We isolate one specific object or transaction and trace its real-world price."
          />
          <PipelineStrip stages={PIPELINE} className="mt-14" />

          <ScrollFade className="mt-16 max-w-2xl">
            <p className="font-mono type-caption uppercase tracking-[0.14em] text-muted-foreground">
              What this is not
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {NOT_THIS.map((n) => (
                <li
                  key={n}
                  className="rounded-full border border-border px-3 py-1.5 type-caption text-muted-foreground"
                >
                  {n}
                </li>
              ))}
            </ul>
          </ScrollFade>
        </div>
      </section>

      {/* ── Trust ──────────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
          <SectionHeading
            ordinal="04"
            eyebrow="Trust"
            title="Uncertainty, shown rather than hidden"
            lead="Every figure is traceable to an observation, and every observation to a dataset with a publisher and a date a human last checked it. An estimate is labelled as an estimate."
          />

          <dl className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Datasets cited", value: String(SOURCE_COUNT) },
              { label: "Published indices", value: String(LIVE_INDICES.length) },
              { label: "In the research queue", value: String(RESEARCH_QUEUE.length) },
              { label: "Snapshot last verified", value: SNAPSHOT_LABEL },
              { label: "Values shown", value: "Nominal by default, real on demand" },
              {
                label: "Confidence levels",
                value: "Verified · Reconstructed · Estimated",
              },
            ].map((row) => (
              <div key={row.label} className="bg-card p-5 sm:p-6">
                <dt className="font-mono type-caption uppercase tracking-[0.1em] text-muted-foreground">
                  {row.label}
                </dt>
                <dd className="mt-2 type-title text-foreground numeric">{row.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 rounded-2xl border border-warning/35 bg-warning/5 p-5 sm:p-6">
            <p className="type-title text-warning">
              Snapshot build — figures pending source re-verification
            </p>
            <p className="mt-2 max-w-3xl type-meta leading-6 text-muted-foreground">
              The series in this release are a committed snapshot compiled from
              the publications named in each source ledger, not a live feed. The
              scheduled retrieval and validation pipeline is not wired up yet, so
              every figure needs checking against its primary source before this
              section goes public. Observations that are not yet final are
              labelled provisional wherever they appear.
            </p>
          </div>

          <div className="mt-8">
            <Link
              href="/pop-ppp/methodology"
              className="inline-flex h-11 items-center rounded-full border border-input bg-background px-5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
            >
              Read the methodology
            </Link>
          </div>
        </div>
      </section>

      {/* ── Research queue ────────────────────────────────────────── */}
      <section id="queue" className="scroll-mt-20 border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
          <SectionHeading
            ordinal="05"
            eyebrow="Research queue"
            title={`${RESEARCH_QUEUE.length} references under research`}
            lead="Feasibility is about the data, never about the joke. A reference can be perfect and still sit at two stars because no defensible series exists for the thing it names — which is where most of these will die."
          />

          <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 xl:grid-cols-3">
            {RESEARCH_QUEUE.map((u) => (
              <li key={u.slug} className="flex flex-col bg-card p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="type-title text-foreground">{u.name}</h3>
                    <p className="mt-1 font-mono type-caption uppercase tracking-[0.08em] text-muted-foreground numeric">
                      {u.film} · {u.releaseYear}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-border px-2 py-0.5 font-mono type-caption uppercase tracking-[0.06em] text-muted-foreground">
                    {u.status === "researching" ? "Researching" : "Planned"}
                  </span>
                </div>

                <p className="mt-4 type-label text-foreground">{u.indexedUnit}</p>
                <p className="mt-2 type-meta leading-6 text-muted-foreground">
                  {u.mainQuestion}
                </p>
                <p className="mt-3 flex-1 type-caption leading-5 text-muted-foreground">
                  {u.dataSource}
                </p>

                <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
                  <span
                    className="font-mono type-caption text-[var(--pop-accent,currentColor)]"
                    aria-label={`Data feasibility ${u.feasibility} out of 5`}
                  >
                    {"●".repeat(u.feasibility)}
                    <span className="opacity-25">{"●".repeat(5 - u.feasibility)}</span>
                  </span>
                  <span className="type-caption text-muted-foreground">
                    {FEASIBILITY_LABEL[u.feasibility] ?? "Feasibility under review"}
                  </span>
                </div>

                {u.remark ? (
                  <p className="mt-3 type-caption italic leading-5 text-muted-foreground">
                    {u.remark}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>

          <div className="mt-14 max-w-2xl">
            <h3 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
              Suggest a reference
            </h3>
            <p className="mt-2 type-body leading-7 text-muted-foreground">
              The bottleneck is never the scene. It is whether a defensible
              historical series exists for the thing the scene names.
            </p>
            <ReferenceSubmit className="mt-6" />
          </div>
        </div>
      </section>

      {/* ── Closing · scene register ──────────────────────────────── */}
      <NoirBand
        accent={{ light: "hsl(41 74% 58%)", dark: "hsl(41 74% 58%)" }}
        scopeId="pop-close"
        glow={false}
      >
        <div className="relative mx-auto max-w-6xl px-4 py-24">
          <Grain opacity={0.05} />
          <IndexArtwork
            values={seriesValues(featured)}
            motif="rings"
            weight="bold"
            className="pointer-events-none absolute -right-24 top-1/2 h-[26rem] w-[26rem] -translate-y-1/2 opacity-[0.14]"
          />
          <div className="relative max-w-3xl">
            <p className="text-balance text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl">
              Cinema exaggerates.
              <span className="block text-white/45">Markets keep receipts.</span>
            </p>
            <p className="mt-7 max-w-xl type-body leading-7 text-white/55">
              A Duku Design experiment in economics, interaction and cultural
              memory — research, data modelling, information design and product
              engineering in one artefact.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/#access"
                className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-medium text-black transition-transform duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                Work with Duku
              </Link>
              <Link
                href="/pop-ppp/methodology"
                className="inline-flex h-11 items-center rounded-full border border-white/25 px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                Methodology
              </Link>
            </div>
          </div>
        </div>
      </NoirBand>
    </main>
  );
}
