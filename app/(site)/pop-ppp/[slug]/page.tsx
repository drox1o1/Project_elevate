import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AffordabilityPanel } from "@/components/pop-ppp/affordability-panel";
import { ColdOpen } from "@/components/pop-ppp/cold-open";
import { CountryPanel } from "@/components/pop-ppp/country-panel";
import { NoirBand, SectionHeading } from "@/components/pop-ppp/editorial";
import { EquationBlock } from "@/components/pop-ppp/equation-block";
import { HeadlineResult } from "@/components/pop-ppp/headline-result";
import { IndexChart } from "@/components/pop-ppp/index-chart";
import { IndexRail } from "@/components/pop-ppp/index-rail";
import { ShareCard } from "@/components/pop-ppp/share-card";
import { SourceLedger } from "@/components/pop-ppp/source-ledger";
import { formatMultiple, formatPercent } from "@/lib/pop-ppp/calc";
import {
  INDICES,
  LIVE_INDICES,
  ROYALE_COUNTRIES,
  SNAPSHOT_LABEL,
  getIndex,
} from "@/lib/pop-ppp/data";
import {
  affordabilityFor,
  equationStepsFor,
  metricsFor,
  presentIndex,
  railEntryFor,
  rawValuesFor,
  seriesValues,
} from "@/lib/pop-ppp/present";

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
  if (!index) return { title: "Index not found | Pop PPP" };
  return {
    title: `${index.name} | Pop PPP`,
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
  const rail = LIVE_INDICES.map((i) => railEntryFor(presentIndex(i)));
  const values = seriesValues(p);

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

            {/* ── C · Primary historical chart ────────────────────── */}
            <section className="border-t border-border py-16 sm:py-20">
              <SectionHeading
                ordinal="01"
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
                          {formatMultiple(b.indexMultiple)}
                          <span className="text-muted-foreground">
                            {" "}
                            vs {formatMultiple(b.benchmarkMultiple)}
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
              ordinal="02"
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
            {/* ── D · The complete equation ───────────────────────── */}
            <section className="border-t border-border py-16 sm:py-20">
              <SectionHeading
                ordinal={index.slug === "royale-with-cheese" ? "03" : "02"}
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
                ordinal={index.slug === "royale-with-cheese" ? "04" : "03"}
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
                ordinal={index.slug === "royale-with-cheese" ? "05" : "04"}
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
                ordinal={index.slug === "royale-with-cheese" ? "06" : "05"}
                eyebrow="Provenance"
                title="Source ledger"
                lead={`Every dataset behind this page, with the adjustments applied on the way in and how gaps are treated. Last verified ${SNAPSHOT_LABEL}.`}
              />
              <SourceLedger datasets={p.datasets} className="mt-10" />
              <p className="mt-8 max-w-3xl type-caption leading-5 text-muted-foreground">
                Pop PPP is editorial and educational. Historical returns are
                described, never projected, and nothing here is investment advice.
                Film titles, characters and dialogue are referenced for commentary
                and remain the property of their rights holders.
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* ── H · Shareable summary — scene register ─────────────────── */}
      <NoirBand accent={index.accent} scopeId={`${index.slug}-share`} glow={false}>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
          <SectionHeading
            eyebrow="Take it with you"
            title="The card carries its own provenance"
            lead="A figure that travels without its source is the thing this section exists to avoid, so the export always includes the credit line."
            invert
          />
          <div className="mt-12 max-w-xl">
            <ShareCard
              indexName={index.name}
              reference={`${index.character} · ${index.film}, ${index.releaseYear}`}
              dialogue={index.dialogue}
              baseLabel={String(result.baseYear)}
              baseValue={p.money(result.baseValue)}
              currentLabel={`${result.latestYear}, last verified`}
              currentValue={p.money(result.currentValue)}
              change={formatPercent(result.percentChange)}
              remark={index.remark}
              sourceNote={p.sourceNote}
              accent={index.accent.dark}
              invert
            />
          </div>
        </div>
      </NoirBand>
    </main>
  );
}
