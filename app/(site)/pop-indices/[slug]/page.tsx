import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AffordabilityPanel } from "@/components/pop-indices/affordability-panel";
import {
  CapabilityPanel,
  CompositionBars,
  ConstituentGrid,
  DriverTimeline,
  IndexOverview,
  TierComparison,
} from "@/components/pop-indices/computing-index";
import { SameMoney } from "@/components/pop-indices/same-money";
import { ColdOpen } from "@/components/pop-indices/cold-open";
import { CountryPanel } from "@/components/pop-indices/country-panel";
import { NoirBand, SectionHeading } from "@/components/pop-indices/editorial";
import { EquationBlock } from "@/components/pop-indices/equation-block";
import { HeadlineResult } from "@/components/pop-indices/headline-result";
import { IndexChart } from "@/components/pop-indices/index-chart";
import { IndexRail } from "@/components/pop-indices/index-rail";
import { ShareCard } from "@/components/pop-indices/share-card";
import { ShareLinks } from "@/components/pop-indices/share-links";
import { SourceLedger } from "@/components/pop-indices/source-ledger";
import { formatMultiple, formatPercent } from "@/lib/pop-indices/calc";
import {
  INDICES,
  LIVE_INDICES,
  ROYALE_COUNTRIES,
  SNAPSHOT_LABEL,
  getIndex,
} from "@/lib/pop-indices/data";
import {
  affordabilityFor,
  computingFor,
  equationStepsFor,
  metricsFor,
  presentIndex,
  railEntryFor,
  rawValuesFor,
  seriesValues,
  shareStatsFor,
  sparkFor,
} from "@/lib/pop-indices/present";
import { imageFor } from "@/lib/pop-indices/images";

export function generateStaticParams() {
  return INDICES.filter((i) => i.status === "live").map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const index = getIndex(slug);
  if (!index) return { title: "Index not found | Pop Indices" };
  return {
    title: `${index.name} | Pop Indices`,
    description: index.subtitle,
  };
}

const ROUNDING_RULE =
  "Displayed money is rounded to the nearest whole currency unit above 100, and to two decimals below it. Percentages show one decimal below 1,000% and none above. All arithmetic runs on unrounded values — rounding is applied at render only.";

export default async function IndexDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const index = getIndex(slug);
  if (!index || index.status !== "live") notFound();

  const p = presentIndex(index);
  const { result } = p;
  const rail = LIVE_INDICES.map((i) => ({
    ...railEntryFor(presentIndex(i)),
    imageSrc: imageFor(i.slug),
  }));
  const values = seriesValues(p);
  const imageSrc = imageFor(index.slug);
  const computing = computingFor(p);

  /* One line a person can paste anywhere: what it was, what it is, how far. */
  const shareHeadline = `${p.money(result.baseValue)} in ${result.baseYear} → ${p.money(
    result.currentValue
  )} in ${result.latestYear}, ${formatPercent(result.percentChange, p.locale)}.`;

  /**
   * Section numbers are derived, not written down. Two sections are
   * conditional, and hand-numbering around them is how a page ends up with two
   * sections called 03.
   */
  const order = [
    ...(computing ? ["overview"] : []),
    "chart",
    ...(index.slug === "royale-with-cheese" ? ["countries"] : []),
    ...(computing
      ? ["tiers", "constituents", "capability", "drivers", "same-money"]
      : []),
    "equation",
    "affordability",
    "interpretation",
    "ledger",
  ];
  const ord = (key: string) => String(order.indexOf(key) + 1).padStart(2, "0");

  return (
    <main>
      {/* ── A · Cold open — scene register ──────────────────────────── */}
      <ColdOpen
        dialogue={index.dialogue}
        gloss={
          index.dialogueGloss
            ? `${index.dialogueGloss} — ${index.character}, ${index.film} (${index.releaseYear})`
            : `${index.character} · ${index.film}, ${index.releaseYear}`
        }
        dialogueVerified={index.dialogueVerified}
        indexName={index.name}
        subtitle={index.subtitle}
        confidence={index.confidence}
        accent={index.accent}
        motif={index.motif}
        values={values}
        imageSrc={imageSrc}
        meta={[
          { label: "Film", value: `${index.film} (${index.releaseYear})` },
          { label: "Base year", value: String(index.baseYear) },
          { label: "Indexed unit", value: index.indexedUnit },
          { label: "Geography", value: index.geography },
          { label: "Currency", value: index.currency },
        ]}
      />

      {/* Rail + content. The rail is the section's spine on desktop and a
          scrolling strip on phones. */}
      <div className="mx-auto max-w-[92rem] px-4">
        <div className="lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-14 xl:gap-20">
          <div className="border-b border-border py-5 lg:border-b-0 lg:py-0">
            <div className="lg:sticky lg:top-20 lg:max-h-[calc(100svh-6rem)] lg:overflow-y-auto lg:py-12">
              <IndexRail entries={rail} activeSlug={index.slug} />
            </div>
          </div>

          <div className="min-w-0">
            {/* ── B · The reveal ──────────────────────────────────── */}
            <section className="py-16 sm:py-20">
              <HeadlineResult
                reveal={p.reveal}
                baseLabel={p.baseLabel}
                baseValue={p.money(result.baseValue)}
                currentLabel={p.latestLabel}
                currentValue={result.currentValue}
                format={p.moneyFormat}
                remark={index.remark}
                metrics={metricsFor(p)}
                accent={index.accent}
                scopeId={index.slug}
              />

              <p className="mt-10 max-w-3xl type-meta leading-6 text-muted-foreground">
                <span className="font-mono uppercase tracking-[0.08em]">
                  Base year —{" "}
                </span>
                {index.baseYearNote}
              </p>
            </section>

            {/* ── B2 · Index overview — constituent indices only ──── */}
            {computing ? (
              <section
                id="overview"
                className="scroll-mt-20 border-t border-border py-16 sm:py-20"
              >
                <SectionHeading
                  ordinal={ord("overview")}
                  eyebrow="Index overview"
                  title="The machine as an index"
                  lead={`Ten constituents, weighted at their ${computing.baseYear} shares. Every figure below is computed from the constituent series — none of it is typed in, so repricing one part moves the whole page.`}
                />
                <IndexOverview data={computing} className="mt-10" />
                <p className="mt-6 max-w-3xl type-caption leading-5 text-muted-foreground">
                  The index level is derived, not published. It has not been
                  validated against an independent historical dataset, and the
                  confidence label on each constituent is the honest read on how
                  much weight any one of these figures can carry.
                </p>
              </section>
            ) : null}

            {/* ── C · Primary historical chart ────────────────────── */}
            <section className="border-t border-border py-16 sm:py-20">
              <SectionHeading
                ordinal={ord("chart")}
                eyebrow="The series"
                title="What it was worth, each year"
                lead="Nominal local currency by default. Switch modes to strip out inflation, express the figure as earning time, or read it as quantity and percentage change."
              />

              <div className="mt-10 min-w-0">
                <IndexChart
                  title={`${index.indexedUnit} — ${p.priceSeries.label}`}
                  priceSeries={p.priceSeries}
                  unitFactor={index.unitFactor}
                  baseYear={index.baseYear}
                  moneyFormat={p.moneyFormat}
                  currencySymbol={index.currencySymbol}
                  locale={p.locale}
                  cpiSeries={p.cpiSeries}
                  incomeSeries={p.incomeSeries}
                  comparisonSeries={p.comparisonSeries}
                  events={index.events}
                  quantityUnit={p.priceSeries.pricedUnit ?? p.priceSeries.unit}
                  accent={index.accent}
                />
              </div>

              {p.benchmarkComparisons.length > 0 ? (
                <div className="mt-14">
                  <h3 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
                    Did it outrun the benchmarks?
                  </h3>
                  <ul className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
                    {p.benchmarkComparisons.map((b) => (
                      <li key={b.label} className="bg-card p-5 sm:p-6">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="type-label text-foreground">{b.label}</span>
                          <span
                            className={
                              b.outran
                                ? "font-mono type-caption uppercase tracking-[0.08em] text-market-up"
                                : "font-mono type-caption uppercase tracking-[0.08em] text-market-down"
                            }
                          >
                            {b.outran ? "Outran" : "Lagged"}
                          </span>
                        </div>
                        <p className="mt-3 font-mono text-lg text-foreground numeric">
                          {formatMultiple(b.indexMultiple, p.locale)}
                          <span className="text-muted-foreground">
                            {" "}
                            vs {formatMultiple(b.benchmarkMultiple, p.locale)}
                          </span>
                        </p>
                        <p className="mt-2 type-meta leading-6 text-muted-foreground">
                          {b.rationale}
                        </p>
                      </li>
                    ))}
                    {/* Keeps the gap-px container from showing through on an
                        odd count — an empty grey cell reads as a broken card. */}
                    {p.benchmarkComparisons.length % 2 === 1 ? (
                      <li aria-hidden="true" className="hidden bg-card sm:block" />
                    ) : null}
                  </ul>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </div>

      {/* ── Cross-country panel — scene register, full bleed ───────── */}
      {index.slug === "royale-with-cheese" ? (
        <NoirBand accent={index.accent} scopeId={`${index.slug}-panel`}>
          <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
            <SectionHeading
              ordinal={ord("countries")}
              eyebrow="Purchasing-power parity"
              title="Same burger. Different economy."
              lead="Hold the product physically identical and let the currency, the tax treatment, the wage and the name on the menu change around it. What is left is purchasing-power parity."
              invert
            />
            <CountryPanel
              className="mt-12"
              countries={ROYALE_COUNTRIES}
              usPrice={ROYALE_COUNTRIES[0].price}
            />
          </div>
        </NoirBand>
      ) : null}

      {/* Remaining sections run full width under the rail. */}
      <div className="mx-auto max-w-[92rem] px-4">
        <div className="lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-14 xl:gap-20">
          <div aria-hidden="true" className="hidden lg:block" />
          <div className="min-w-0">
            {computing ? (
              <>
                {/* ── C2 · Two machines ─────────────────────────────── */}
                <section
                  id="tiers"
                  className="scroll-mt-20 border-t border-border py-16 sm:py-20"
                >
                  <SectionHeading
                    ordinal={ord("tiers")}
                    eyebrow="Two machines"
                    title="Same job, and what people now mean by compute"
                    lead="Two reconstructions, priced at the snapshot. The first does the work Rocket Singh's customers actually did. The second is the machine the phrase has come to describe."
                  />
                  <TierComparison
                    id={index.slug}
                    data={computing}
                    accent={index.accent}
                    className="mt-10"
                  />

                  <div className="mt-14">
                    <h3 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
                      Where the money sits, by tier
                    </h3>
                    <p className="mt-2 max-w-2xl type-meta leading-6 text-muted-foreground">
                      Shares are computed from the prices, so they move whenever a
                      constituent is repriced. Nothing here is a fixed weight.
                    </p>
                    <CompositionBars data={computing} className="mt-6" />
                  </div>
                </section>

                {/* ── C3 · Constituents ─────────────────────────────── */}
                <section
                  id="constituents"
                  className="scroll-mt-20 border-t border-border py-16 sm:py-20"
                >
                  <SectionHeading
                    ordinal={ord("constituents")}
                    eyebrow="Constituents"
                    title="Ten markets in a steel box"
                    lead="Each constituent has its own price history, its own capability history and its own set of markets that decide it. Open one to see what set the price."
                  />
                  <ConstituentGrid
                    id={index.slug}
                    data={computing}
                    accent={index.accent}
                    className="mt-10"
                  />
                </section>

                {/* ── C4 · Price versus capability ──────────────────── */}
                <section
                  id="capability"
                  className="scroll-mt-20 border-t border-border py-16 sm:py-20"
                >
                  <SectionHeading
                    ordinal={ord("capability")}
                    eyebrow="Price versus capability"
                    title="What it costs against what it can do"
                    lead="A price index on its own says nothing about a technology product. Two indices on the same base, and the ratio between them, say almost everything."
                  />
                  <CapabilityPanel
                    id={index.slug}
                    data={computing}
                    accent={index.accent}
                    className="mt-10"
                  />
                </section>

                {/* ── C5 · Why the index moved ──────────────────────── */}
                <section
                  id="drivers"
                  className="scroll-mt-20 border-t border-border py-16 sm:py-20"
                >
                  <SectionHeading
                    ordinal={ord("drivers")}
                    eyebrow="Why the index moved"
                    title="Six markets, none of them the computer market"
                    lead="Every force below sets prices somewhere else and arrives here as a consequence. The cabinet is in most of these lists precisely because nothing touches it."
                  />
                  <DriverTimeline data={computing} className="mt-10" />
                </section>

                {/* ── C6 · Same money ───────────────────────────────── */}
                <section
                  id="same-money"
                  className="scroll-mt-20 border-t border-border py-16 sm:py-20"
                >
                  <SectionHeading
                    ordinal={ord("same-money")}
                    eyebrow="Same money"
                    title="What could Rocket Singh build with the same money?"
                    lead="Hold the rupees still and let the year move. For fifteen years this table only ever got better."
                  />
                  <SameMoney
                    id={index.slug}
                    data={computing}
                    accent={index.accent}
                    className="mt-10"
                  />
                </section>
              </>
            ) : null}

            {/* ── D · The complete equation ───────────────────────── */}
            <section className="border-t border-border py-16 sm:py-20">
              <SectionHeading
                ordinal={ord("equation")}
                eyebrow="Calculation"
                title="The complete equation"
                lead="Not a footnote. Every step, every number, the dataset it came from and the rounding rule applied to it."
              />

              <EquationBlock
                className="mt-10"
                steps={equationStepsFor(p)}
                raw={rawValuesFor(p)}
                roundingRule={ROUNDING_RULE}
              />

              <p className="mt-10 max-w-3xl type-meta leading-6 text-muted-foreground">
                <span className="font-mono uppercase tracking-[0.08em]">
                  Conversion —{" "}
                </span>
                {index.unitFactorNote}
              </p>
            </section>

            {/* ── E · Purchasing-power comparison ────────────────── */}
            <section className="border-t border-border py-16 sm:py-20">
              <SectionHeading
                ordinal={ord("affordability")}
                eyebrow="Affordability"
                title="Price is only the first question"
                lead="How much it cost, how much the underlying thing appreciated, and how hard it was for a person to afford — three different questions with three different answers."
              />
              <AffordabilityPanel
                id={index.slug}
                items={affordabilityFor(p)}
                accent={index.accent}
                className="mt-10"
              />
            </section>

            {/* ── F · What drove the change ──────────────────────── */}
            <section className="border-t border-border py-16 sm:py-20">
              <SectionHeading
                ordinal={ord("interpretation")}
                eyebrow="Interpretation"
                title="What drove the change"
              />

              <div className="mt-10 flex max-w-3xl flex-col gap-6">
                {index.interpretation.map((para) => (
                  <p
                    key={para.slice(0, 40)}
                    className="text-[0.9375rem] leading-8 text-foreground"
                  >
                    {para}
                  </p>
                ))}
              </div>

              <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
                {index.drivers.map((d) => (
                  <div key={d.title} className="bg-card p-5 sm:p-6">
                    <h3 className="type-title text-foreground">{d.title}</h3>
                    <p className="mt-2 type-meta leading-6 text-muted-foreground">
                      {d.detail}
                    </p>
                  </div>
                ))}
              </div>

              {index.caveats && index.caveats.length > 0 ? (
                <div className="mt-12 max-w-3xl rounded-2xl border border-border bg-muted/30 p-5 sm:p-6">
                  <h3 className="type-title text-foreground">
                    What this index does not claim
                  </h3>
                  <ul className="mt-4 flex flex-col gap-3">
                    {index.caveats.map((c) => (
                      <li
                        key={c.slice(0, 40)}
                        className="flex gap-3 type-meta leading-6 text-muted-foreground"
                      >
                        <span aria-hidden="true" className="text-muted-foreground">
                          —
                        </span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>

            {/* ── G · Source ledger ─────────────────────────────── */}
            <section
              id="source-ledger"
              className="scroll-mt-20 border-t border-border py-16 sm:py-20"
            >
              <SectionHeading
                ordinal={ord("ledger")}
                eyebrow="Provenance"
                title="Source ledger"
                lead={`Every dataset behind this page, with the adjustments applied on the way in and how gaps are treated. Last verified ${SNAPSHOT_LABEL}.`}
              />
              <SourceLedger datasets={p.datasets} className="mt-10" />
              <p className="mt-8 max-w-3xl type-caption leading-5 text-muted-foreground">
                Pop Indices is editorial and educational. Historical returns are
                described, never projected, and nothing here is investment advice.
                Film titles, characters and dialogue are referenced for commentary
                and remain the property of their rights holders.
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* ── G2 · Closing — scene register, computing index only ───── */}
      {computing ? (
        <NoirBand
          accent={index.accent}
          scopeId={`${index.slug}-close`}
          glow={false}
        >
          <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
            <p className="max-w-4xl text-balance text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl">
              The computer became more powerful.
              <span className="block text-white/45">
                The market around it became more concentrated.
              </span>
            </p>
            <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
              <div className="flex flex-col gap-5">
                <p className="type-body leading-7 text-white/60">
                  This is not a measure of computer inflation. It is a record of
                  where the value inside a computer went.
                </p>
                <ul className="flex flex-col gap-3">
                  {[
                    "From the processor to the graphics card",
                    "From local storage to somebody else's infrastructure",
                    "From consumer memory to server memory",
                    "From personal productivity to artificial intelligence",
                  ].map((line) => (
                    <li
                      key={line}
                      className="flex gap-3 type-body leading-6 text-white/75"
                    >
                      <span aria-hidden="true" className="text-white/35">
                        →
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col justify-end gap-6">
                <p className="text-balance text-xl font-medium leading-snug text-white sm:text-2xl">
                  In 2009, Rocket Singh had to understand the customer. In 2026
                  he would also need to understand the data centre.
                </p>
                <p className="type-caption leading-5 text-white/45">
                  A Duku Design experiment in cultural memory, product economics
                  and the changing price of compute.
                </p>
              </div>
            </div>
          </div>
        </NoirBand>
      ) : null}

      {/* ── H · Shareable summary — scene register ─────────────────── */}
      <NoirBand accent={index.accent} scopeId={`${index.slug}-share`} glow={false}>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
          <SectionHeading
            eyebrow="Take it with you"
            title="The card carries its own provenance"
            lead="A figure that travels without its source is the thing this section exists to avoid, so the export always includes the credit line."
            invert
          />
          <ShareLinks
            className="mt-10"
            invert
            indexName={index.name}
            headline={shareHeadline}
            path={`/pop-indices/${index.slug}`}
          />

          <div className="mt-12 max-w-lg">
            <ShareCard
              indexName={index.name}
              reference={`${index.character} · ${index.film}, ${index.releaseYear}`}
              dialogue={index.dialogue}
              baseValue={p.money(result.baseValue)}
              currentValue={p.money(result.currentValue)}
              change={formatPercent(result.percentChange, p.locale)}
              changePositive={result.percentChange >= 0}
              remark={index.remark}
              stats={shareStatsFor(p)}
              spark={sparkFor(p)}
              baseYear={result.baseYear}
              latestYear={result.latestYear}
              credit={p.credit}
              snapshot={p.snapshot}
              accent={index.accent.dark}
              confidence={index.confidence}
              imageSrc={imageSrc}
            />
          </div>
        </div>
      </NoirBand>
    </main>
  );
}
