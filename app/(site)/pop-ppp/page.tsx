import type { Metadata } from "next";
import Link from "next/link";
import { ScrollFade } from "@/components/site/scroll-fade";
import { ScrollRevealGrid } from "@/registry/default/motion/scroll-reveal-grid";
import { ConfidenceBadge } from "@/components/pop-ppp/confidence-badge";
import { HeroEquation } from "@/components/pop-ppp/hero-equation";
import { IndexCard } from "@/components/pop-ppp/index-card";
import { IndexChart } from "@/components/pop-ppp/index-chart";
import { PipelineStrip } from "@/components/pop-ppp/pipeline-strip";
import { ReferenceSubmit } from "@/components/pop-ppp/reference-submit";
import {
  LIVE_INDICES,
  SNAPSHOT_LABEL,
  SOURCE_COUNT,
  UPCOMING,
  getIndex,
} from "@/lib/pop-ppp/data";
import { cardFor, featuredLines, presentIndex } from "@/lib/pop-ppp/present";
import { formatPercent } from "@/lib/pop-ppp/calc";

export const metadata: Metadata = {
  title: "Pop PPP — Pop Culture Purchasing Power Parity | DUKU",
  description:
    "Iconic scenes, objects and transactions converted into real economic indices using historical data, transparent equations and interactive charts.",
};

const HERO_STAGES = [
  { text: "“50 tola.”", caption: "The scene" },
  { text: "50 × 11.6638 g", caption: "The unit" },
  { text: "583.19 g of 24-karat gold", caption: "The quantity" },
  { text: "58.319 × ₹4,234", caption: "Gold price, 1999" },
  { text: "₹2,46,923", caption: "Value at release" },
  { text: "58.319 × ₹1,01,500", caption: "Gold price, last verified" },
  { text: "₹59,19,379", caption: "Value today" },
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
};

export default function PopPppPage() {
  const presented = LIVE_INDICES.map(presentIndex);
  const featured = presentIndex(getIndex("sanju-baba-50-tola")!);
  const featuredCopy = featuredLines(featured);

  return (
    <main>
      {/* ── 1 · Hero ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-4 pb-12 pt-20 sm:pt-24">
        <ScrollFade>
          <p className="font-pixel type-overline text-muted-foreground">
            Pop Culture Purchasing Power Parity
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl">
            Popular culture remembers the line.
            <br />
            <span className="text-muted-foreground">
              Economics remembers the price.
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-balance type-body leading-7 text-muted-foreground">
            Pop PPP converts iconic scenes, objects and transactions into real
            economic indices — using historical data, transparent equations and
            charts you can interrogate. The joke gets you in. The methodology is
            why you stay.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="#indices"
              className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
            >
              Explore the indices
            </Link>
            <Link
              href="/pop-ppp/methodology"
              className="inline-flex h-10 items-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground shadow-xs transition-colors duration-200 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
            >
              See how the maths works
            </Link>
          </div>
        </ScrollFade>

        <div className="mt-14 rounded-2xl border border-border bg-card px-4 py-8 sm:px-8">
          <HeroEquation stages={HERO_STAGES} />
          <p className="mt-6 text-center type-meta text-muted-foreground">
            One index, resolving. A four-second line with a twenty-six-year
            holding period.
          </p>
        </div>
      </section>

      {/* ── 2 · Featured index ───────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <ScrollFade>
            <p className="font-pixel type-overline text-muted-foreground">
              Featured index
            </p>
          </ScrollFade>

          <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
            <ScrollFade>
              <blockquote>
                <p className="text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
                  &ldquo;{featured.index.dialogue}&rdquo;
                </p>
                <footer className="mt-3 type-meta text-muted-foreground">
                  {featured.index.character} · {featured.index.film},{" "}
                  {featured.index.releaseYear}
                </footer>
              </blockquote>
              <h2 className="mt-8 type-metric text-foreground">
                {featured.index.name}
              </h2>
              <p className="mt-2 max-w-md type-body leading-6 text-muted-foreground">
                {featured.index.subtitle}
              </p>
              <div className="mt-4">
                <ConfidenceBadge level={featured.index.confidence} />
              </div>
              <div className="mt-6 flex flex-col gap-3">
                {featuredCopy.map((line) => (
                  <p key={line} className="max-w-md type-body leading-6 text-foreground">
                    {line}
                  </p>
                ))}
              </div>
              <p className="mt-5 max-w-md type-body italic leading-6 text-muted-foreground">
                {featured.index.remark}
              </p>
              <Link
                href={`/pop-ppp/${featured.index.slug}`}
                className="mt-7 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
              >
                Open the full index
              </Link>
            </ScrollFade>

            <div className="min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="type-caption uppercase tracking-[0.06em] text-muted-foreground">
                    {featured.result.baseYear}
                  </p>
                  <p className="mt-1 type-metric text-muted-foreground numeric">
                    {featured.money(featured.result.baseValue)}
                  </p>
                </div>
                <div>
                  <p className="type-caption uppercase tracking-[0.06em] text-muted-foreground">
                    {featured.result.latestYear} · last verified
                  </p>
                  <p className="mt-1 type-metric text-foreground numeric">
                    {featured.money(featured.result.currentValue)}
                  </p>
                </div>
              </div>
              <p className="mt-3 font-mono type-meta text-market-up numeric">
                {formatPercent(featured.result.percentChange)} nominal ·{" "}
                {featured.result.cagr.toFixed(1)}% a year
              </p>

              <div className="mt-6">
                <IndexChart
                  title={`What ${featured.index.quantity} ${featured.index.quantityUnit}s of gold were worth each year`}
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
      </section>

      {/* ── 3 · Index grid ──────────────────────────────────────────── */}
      <section id="indices" className="scroll-mt-20 border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <ScrollFade>
            <h2 className="font-pixel text-xl uppercase tracking-wide sm:text-2xl">
              The indices
            </h2>
            <p className="mt-3 max-w-2xl type-body leading-6 text-muted-foreground">
              Three published indices, deliberately chosen to sit on three
              different kinds of data: a commodity, a retail food price and a
              labour market. If the system holds across those, it holds.
            </p>
          </ScrollFade>

          <ScrollRevealGrid className="mt-10">
            {presented.map((p) => (
              <IndexCard key={p.index.slug} data={cardFor(p)} />
            ))}
          </ScrollRevealGrid>
        </div>
      </section>

      {/* ── 4 · What is being measured? ─────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <ScrollFade>
            <h2 className="font-pixel text-xl uppercase tracking-wide sm:text-2xl">
              What is being measured?
            </h2>
            <p className="mt-3 max-w-2xl type-body leading-6 text-muted-foreground">
              We do not estimate what a film lifestyle would cost. We isolate
              one specific object or transaction and trace its real-world price.
            </p>
          </ScrollFade>
          <PipelineStrip stages={PIPELINE} className="mt-12" />

          <ScrollFade className="mt-14 max-w-2xl">
            <p className="type-overline text-muted-foreground">
              What this is not
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {NOT_THIS.map((n) => (
                <li
                  key={n}
                  className="rounded-full border border-border px-3 py-1 type-caption text-muted-foreground"
                >
                  {n}
                </li>
              ))}
            </ul>
          </ScrollFade>
        </div>
      </section>

      {/* ── 5 · Methodology and trust ───────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <ScrollFade>
            <h2 className="font-pixel text-xl uppercase tracking-wide sm:text-2xl">
              Trust, as a visible feature
            </h2>
            <p className="mt-3 max-w-2xl type-body leading-6 text-muted-foreground">
              Every figure on this site is traceable to an observation, and
              every observation to a dataset with a publisher and a date a human
              last checked it.
            </p>
          </ScrollFade>

          <dl className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Datasets cited", value: String(SOURCE_COUNT) },
              { label: "Published indices", value: String(LIVE_INDICES.length) },
              { label: "Snapshot last verified", value: SNAPSHOT_LABEL },
              { label: "Base years", value: "1999 · 2002 · 2009" },
              { label: "Values shown", value: "Nominal by default, real on demand" },
              { label: "Confidence levels", value: "Verified · Reconstructed · Estimated" },
            ].map((row) => (
              <div key={row.label} className="bg-card p-5">
                <dt className="type-caption uppercase tracking-[0.06em] text-muted-foreground">
                  {row.label}
                </dt>
                <dd className="mt-1.5 type-title text-foreground numeric">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 rounded-xl border border-warning/35 bg-warning/5 p-5">
            <p className="type-title text-warning">
              Snapshot build — figures pending source re-verification
            </p>
            <p className="mt-2 max-w-3xl type-meta leading-6 text-muted-foreground">
              The series in this release are a committed snapshot compiled from
              the publications named in each source ledger, not a live feed. The
              scheduled retrieval and validation pipeline is not wired up yet,
              so every figure needs checking against its primary source before
              this section goes public. Observations that are not yet final are
              labelled provisional wherever they appear.
            </p>
          </div>

          <div className="mt-8">
            <Link
              href="/pop-ppp/methodology"
              className="inline-flex h-10 items-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground shadow-xs transition-colors duration-200 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
            >
              Read the methodology
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6 · Upcoming indices ────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <ScrollFade>
            <h2 className="font-pixel text-xl uppercase tracking-wide sm:text-2xl">
              On the research queue
            </h2>
            <p className="mt-3 max-w-2xl type-body leading-6 text-muted-foreground">
              What is being worked on, and how tractable the data looks. Nothing
              is listed as an index until it has one.
            </p>
          </ScrollFade>

          <ul className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2">
            {UPCOMING.map((u) => (
              <li key={u.slug} className="flex flex-col bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="type-title text-foreground">{u.name}</h3>
                    <p className="mt-0.5 type-meta text-muted-foreground">{u.film}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-border px-2 py-0.5 font-mono type-caption uppercase tracking-[0.06em] text-muted-foreground">
                    {u.status === "researching" ? "Researching" : "Planned"}
                  </span>
                </div>
                <p className="mt-3 type-label text-foreground">{u.indexedUnit}</p>
                <p className="mt-2 type-meta leading-6 text-muted-foreground">
                  {u.dataSource}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className="font-mono type-caption text-muted-foreground"
                    aria-label={`Data feasibility ${u.feasibility} out of 5`}
                  >
                    {"●".repeat(u.feasibility)}
                    <span className="opacity-30">{"●".repeat(5 - u.feasibility)}</span>
                  </span>
                  <span className="type-caption text-muted-foreground">
                    {FEASIBILITY_LABEL[u.feasibility] ?? "Feasibility under review"}
                  </span>
                </div>
                {u.note ? (
                  <p className="mt-3 type-meta italic leading-6 text-muted-foreground">
                    {u.note}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>

          <div className="mt-12 max-w-2xl">
            <h3 className="type-title text-foreground">Suggest a reference</h3>
            <p className="mt-2 type-body leading-6 text-muted-foreground">
              The bottleneck is never the scene. It is whether a defensible
              historical series exists for the thing the scene names.
            </p>
            <ReferenceSubmit className="mt-5" />
          </div>
        </div>
      </section>

      {/* ── 7 · Duku connection ─────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <ScrollFade>
            <h2 className="text-balance text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
              This is what Duku Design does: turn complicated systems into
              interfaces people want to explore.
            </h2>
            <p className="mt-4 type-body leading-7 text-muted-foreground">
              Pop PPP is an experiment in exactly that — research, data
              modelling, information design and product engineering in one
              artefact. Not everything in cinema appreciates with age.
              Fortunately, Sanju Baba bought gold.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/#access"
                className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
              >
                Work with Duku
              </Link>
              <Link
                href="/pop-ppp/methodology"
                className="inline-flex h-10 items-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground shadow-xs transition-colors duration-200 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
              >
                Methodology
              </Link>
            </div>
          </ScrollFade>
        </div>
      </section>
    </main>
  );
}
