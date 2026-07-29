import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScrollFade } from "@/components/site/scroll-fade";
import { AffordabilityPanel } from "@/components/pop-ppp/affordability-panel";
import { ColdOpen } from "@/components/pop-ppp/cold-open";
import { EquationBlock } from "@/components/pop-ppp/equation-block";
import { HeadlineResult } from "@/components/pop-ppp/headline-result";
import { IndexChart } from "@/components/pop-ppp/index-chart";
import { ShareCard } from "@/components/pop-ppp/share-card";
import { SourceLedger } from "@/components/pop-ppp/source-ledger";
import { formatMultiple, formatPercent } from "@/lib/pop-ppp/calc";
import { INDICES, SNAPSHOT_LABEL, getIndex } from "@/lib/pop-ppp/data";
import {
  affordabilityFor,
  equationStepsFor,
  metricsFor,
  presentIndex,
  rawValuesFor,
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

  return (
    <main>
      {/* ── A · Cold open ────────────────────────────────────────────── */}
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
        meta={[
          { label: "Film", value: `${index.film} (${index.releaseYear})` },
          { label: "Base year", value: String(index.baseYear) },
          { label: "Indexed unit", value: index.indexedUnit },
          { label: "Geography", value: index.geography },
          { label: "Currency", value: index.currency },
        ]}
      />

      {/* ── B · The reveal ──────────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
          <HeadlineResult
            reveal={p.reveal}
            baseLabel={p.baseLabel}
            baseValue={p.money(result.baseValue)}
            currentLabel={p.latestLabel}
            currentValue={result.currentValue}
            format={p.moneyFormat}
            remark={index.remark}
            metrics={metricsFor(p)}
          />

          <p className="mt-8 max-w-3xl type-meta leading-6 text-muted-foreground">
            <span className="uppercase tracking-[0.06em]">Base year — </span>
            {index.baseYearNote}
          </p>
        </div>
      </section>

      {/* ── C · Primary historical chart ────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
          <ScrollFade>
            <h2 className="font-pixel text-xl uppercase tracking-wide sm:text-2xl">
              What it was worth, each year
            </h2>
            <p className="mt-3 max-w-2xl type-body leading-6 text-muted-foreground">
              Nominal local currency by default. Switch modes to strip out
              inflation, express the figure in months of income, or read it as
              quantity and percentage change.
            </p>
          </ScrollFade>

          <div className="mt-8 min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-6">
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

          {/* Benchmark comparisons — "did it outrun X?" */}
          {p.benchmarkComparisons.length > 0 ? (
            <div className="mt-10">
              <h3 className="type-title text-foreground">
                Did it outrun the benchmarks?
              </h3>
              <ul className="mt-4 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
                {p.benchmarkComparisons.map((b) => (
                  <li key={b.label} className="bg-card p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="type-label text-foreground">{b.label}</span>
                      <span
                        className={
                          b.outran
                            ? "font-mono type-meta text-market-up numeric"
                            : "font-mono type-meta text-market-down numeric"
                        }
                      >
                        {b.outran ? "Outran" : "Lagged"}
                      </span>
                    </div>
                    <p className="mt-2 font-mono type-meta text-muted-foreground numeric">
                      Index {formatMultiple(b.indexMultiple)} · benchmark{" "}
                      {formatMultiple(b.benchmarkMultiple)}
                    </p>
                    <p className="mt-2 type-meta leading-6 text-muted-foreground">
                      {b.rationale}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      {/* ── D · The complete equation ───────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
          <ScrollFade>
            <h2 className="font-pixel text-xl uppercase tracking-wide sm:text-2xl">
              The complete equation
            </h2>
            <p className="mt-3 max-w-2xl type-body leading-6 text-muted-foreground">
              Not a footnote. Every step, every number, the dataset it came from
              and the rounding rule applied to it.
            </p>
          </ScrollFade>

          <EquationBlock
            className="mt-8"
            steps={equationStepsFor(p)}
            raw={rawValuesFor(p)}
            roundingRule={ROUNDING_RULE}
          />

          <p className="mt-8 max-w-3xl type-meta leading-6 text-muted-foreground">
            <span className="uppercase tracking-[0.06em]">Conversion — </span>
            {index.unitFactorNote}
          </p>
        </div>
      </section>

      {/* ── E · Purchasing-power comparison ────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <ScrollFade>
            <h2 className="font-pixel text-xl uppercase tracking-wide sm:text-2xl">
              Price is only the first question
            </h2>
            <p className="mt-3 max-w-2xl type-body leading-6 text-muted-foreground">
              How much it cost, how much the underlying thing appreciated, and
              how hard it was for a person to afford — three different questions
              with three different answers.
            </p>
          </ScrollFade>
          <AffordabilityPanel
            id={index.slug}
            items={affordabilityFor(p)}
            accent={index.accent}
            className="mt-10"
          />
        </div>
      </section>

      {/* ── F · What drove the change? ─────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
          <ScrollFade>
            <h2 className="font-pixel text-xl uppercase tracking-wide sm:text-2xl">
              What drove the change
            </h2>
          </ScrollFade>

          <div className="mt-8 flex max-w-3xl flex-col gap-5">
            {index.interpretation.map((para) => (
              <p key={para.slice(0, 40)} className="type-body leading-7 text-foreground">
                {para}
              </p>
            ))}
          </div>

          <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
            {index.drivers.map((d) => (
              <div key={d.title} className="bg-card p-5">
                <h3 className="type-title text-foreground">{d.title}</h3>
                <p className="mt-1.5 type-meta leading-6 text-muted-foreground">
                  {d.detail}
                </p>
              </div>
            ))}
          </div>

          {index.caveats && index.caveats.length > 0 ? (
            <div className="mt-10 max-w-3xl rounded-xl border border-border bg-muted/30 p-5">
              <h3 className="type-title text-foreground">
                What this index does not claim
              </h3>
              <ul className="mt-3 flex flex-col gap-2.5">
                {index.caveats.map((c) => (
                  <li
                    key={c.slice(0, 40)}
                    className="flex gap-2.5 type-meta leading-6 text-muted-foreground"
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
        </div>
      </section>

      {/* ── G · Source ledger ──────────────────────────────────────── */}
      <section id="source-ledger" className="scroll-mt-20 border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
          <ScrollFade>
            <h2 className="font-pixel text-xl uppercase tracking-wide sm:text-2xl">
              Source ledger
            </h2>
            <p className="mt-3 max-w-2xl type-body leading-6 text-muted-foreground">
              Every dataset behind this page, with the adjustments applied on the
              way in and how gaps are treated. Last verified {SNAPSHOT_LABEL}.
            </p>
          </ScrollFade>
          <SourceLedger datasets={p.datasets} className="mt-8" />
          <p className="mt-6 max-w-3xl type-caption leading-5 text-muted-foreground">
            Pop PPP is editorial and educational. Historical returns are
            described, never projected, and nothing here is investment advice.
            Film titles, characters and dialogue are referenced for commentary
            and remain the property of their rights holders.
          </p>
        </div>
      </section>

      {/* ── H · Shareable summary ──────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
          <ScrollFade>
            <h2 className="font-pixel text-xl uppercase tracking-wide sm:text-2xl">
              Take it with you
            </h2>
            <p className="mt-3 max-w-2xl type-body leading-6 text-muted-foreground">
              The card carries the source note with it. A figure that travels
              without its provenance is the thing this section exists to avoid.
            </p>
          </ScrollFade>

          <div className="mt-8 max-w-xl">
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
            />
          </div>
        </div>
      </section>

      {/* ── Other indices ──────────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <p className="type-overline text-muted-foreground">Other indices</p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
            {INDICES.filter((i) => i.status === "live" && i.slug !== index.slug).map(
              (other) => (
                <li key={other.slug}>
                  <Link
                    href={`/pop-ppp/${other.slug}`}
                    className="type-label text-foreground underline-offset-4 transition-colors duration-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {other.name}
                  </Link>
                </li>
              )
            )}
            <li>
              <Link
                href="/pop-ppp"
                className="type-label text-muted-foreground underline-offset-4 transition-colors duration-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                All of Pop PPP
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
