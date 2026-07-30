import type { Metadata } from "next";
import Link from "next/link";
import {
  CONFIDENCE_COPY,
  ConfidenceBadge,
} from "@/components/pop-indices/confidence-badge";
import { NoirBand } from "@/components/pop-indices/editorial";
import { SourceLedger } from "@/components/pop-indices/source-ledger";
import { DATASETS, GRAMS_PER_TOLA, SNAPSHOT_LABEL } from "@/lib/pop-indices/data";
import { FORMULA_VERSION } from "@/lib/pop-indices/calc";
import type { Confidence } from "@/lib/pop-indices/types";

export const metadata: Metadata = {
  title: "Pop Indices methodology | DUKU",
  description:
    "How references are selected, how base dates are chosen, how nominal and real values are handled, and what the confidence levels mean.",
};

interface Section {
  id: string;
  title: string;
  body: string[];
  /** Formula rows, rendered in the data face. */
  formulas?: { label: string; expression: string }[];
  list?: string[];
}

const SECTIONS: Section[] = [
  {
    id: "selection",
    title: "How references are selected",
    body: [
      "A scene is not an index. Five tests, four of which have to pass. Almost every candidate fails on the third.",
    ],
    list: [
      "Recognition — the scene, line or object is recognisable without explanation.",
      "Specificity — something in it can be counted. “50 tolas of gold” qualifies. “His lifestyle” does not.",
      "Data availability — a published series covers the thing named, from the anchor year to now.",
      "Economic meaning — the result says something about inflation, affordability, market value, scarcity or mispricing.",
      "Contrast — the gap between the scene and the present is worth showing.",
    ],
  },
  {
    id: "base-dates",
    title: "How base dates are chosen",
    body: [
      "The base year is the year the scene is economically about, which is not always the year the film came out. Sanju Baba anchors to 1999, the release of Vaastav, because the film never dates the chain. Moneyball anchors to 2002, the season depicted, not 2011 when the film released. Using the release year for a period film measures the wrong market.",
      "Where the anchor is genuinely arguable, the choice is stated on the index page next to the base figure, not buried down here.",
    ],
  },
  {
    id: "nominal-real",
    title: "Nominal versus real values",
    body: [
      "Charts open on nominal local currency, because that is the number someone would have handed over. It is also the most misleading number on the page. Over twenty-five years, most of what reads as appreciation is the currency losing value.",
      "So every index with a defensible CPI series carries an inflation-adjusted mode, which restates each year in the latest year's money. The gap between the two readings is the whole point.",
    ],
    formulas: [
      { label: "Base value", expression: "quantity × historical unit price" },
      { label: "Current value", expression: "quantity × latest verified unit price" },
      {
        label: "Nominal change",
        expression: "((current − base) ÷ base) × 100",
      },
      {
        label: "Compound annual growth",
        expression: "(current ÷ base) ^ (1 ÷ years) − 1",
      },
      {
        label: "Base value in today's money",
        expression: "base value × (current CPI ÷ base-year CPI)",
      },
      {
        label: "Real appreciation",
        expression:
          "((current value − inflation-adjusted base) ÷ inflation-adjusted base) × 100",
      },
    ],
  },
  {
    id: "affordability",
    title: "Salary and affordability comparisons",
    body: [
      "A price going up says nothing about whether the thing got harder to buy. That needs an income series, and the income series are the weakest part of this section.",
      "The Indian indices use per-capita net national income at current prices, divided by twelve. That is a national average across the whole population — not a wage, not an urban salary, nowhere near a Mumbai salary. It understates urban salaried earnings and overstates rural ones. The US indices use median usual weekly earnings for full-time workers, which is a real wage but leaves out the part-time and tipped workforce most exposed to restaurant prices. Neither is a payslip. Read affordability as a direction, not a figure.",
      "Anything under a month is expressed in working time, not elapsed time. A 40-hour week averaged over a month is 173.3 hours. One-thousandth of monthly income is about ten working minutes, not forty-four calendar ones. Calendar hours would overstate every small figure fourfold.",
    ],
    formulas: [
      { label: "Months of income", expression: "object value ÷ monthly income" },
      {
        label: "Affordability change",
        expression: "current months of income ÷ historical months of income",
      },
      {
        label: "Sub-month units",
        expression: "months × 173.33 = working hours (40 h × 52 ÷ 12)",
      },
      {
        label: "Minutes of work",
        expression: "price ÷ hourly wage × 60",
      },
    ],
  },
  {
    id: "currency",
    title: "Currency and geography",
    body: [
      "Each index is computed in the currency and geography of the scene. A rupee index stays in rupees. A dollar index stays in dollars. Converting everything into one reporting currency would stack an exchange-rate story on top of the price story and make both unreadable.",
      "Geography is held constant across a series. Delhi retail stays Delhi retail for the whole period. No series is assembled by splicing Mumbai wholesale onto Delhi retail onto a national quotation to fill a gap.",
    ],
  },
  {
    id: "confidence",
    title: "Data-confidence levels",
    body: [
      "Not every index is equally well sourced. Hiding that would be the fastest way to make the whole section worthless. Each index and each dataset carries one of three levels, printed next to the headline result — not in a footer.",
    ],
  },
  {
    id: "estimates",
    title: "Estimates and assumptions",
    body: [
      "Where a figure rests on an assumption, the assumption is named on the index page. The Sanju Baba Index assumes 24-karat purity, because the weight is quoted in tolas. It excludes making charges and GST, so it measures metal, not a jeweller's bill.",
      "A fictional quantity — the weight of a Continental gold coin — publishes as Estimated no matter how good the price series behind it is. Better data about the market cannot fix an assumption about the object.",
    ],
    formulas: [
      { label: "Grams per Indian tola", expression: `${GRAMS_PER_TOLA} g (fixed constant)` },
    ],
  },
  {
    id: "missing-data",
    title: "Missing data and conflicting sources",
    body: [
      "A year with no verified observation is interpolated from the years either side, drawn hollow, and labelled interpolated in its tooltip. It is never shown as an observation. Where a series has a real hole — two or more consecutive years missing — the connecting segment is dashed too.",
      "A segment is not dashed just because one end of it is interpolated. Several series are surveyed every second year, and dashing all of those would draw a well-sourced index as entirely unknown. Provenance is marked per point, where it applies.",
      "An observation that exists but is not final — a part-year average, an advance estimate — is flagged provisional and drawn hollow in the accent colour. Where two credible sources disagree, the index names the one it used and why. It does not average them quietly.",
      "Sometimes leaving data out is more honest than adjusting it. The Moneyball Index drops 2020 entirely. A sixty-game season has no comparable full-season price of a win, and pro-rating one would invent a figure nobody could defend.",
    ],
  },
  {
    id: "illegal-markets",
    title: "Illegal-market data policy",
    body: [
      "One published index concerns an illicit market. It is built on institutional and academic data only — DEA and UNODC price and purity reporting, published enforcement statistics, peer-reviewed work — and framed as crime economics.",
      "It carries no operational detail. No production or synthesis information, no sourcing, no location-specific pricing that could read as a market signal. An index that only becomes useful by crossing that line does not get published.",
      "It also carries no affordability or income comparison, and never will. These are not consumer goods bought out of monthly earnings, so pricing one against a salary would be wrong twice over. The purity adjustment makes years comparable. It does not make a market look like a shop.",
    ],
  },
  {
    id: "corrections",
    title: "Corrections, revisions and update frequency",
    body: [
      "Statistical agencies revise. When a source revises something already published here, the index is recalculated and the change is noted on the page. It is not overwritten quietly.",
      "Cadence once the pipeline runs: daily for market assets where that helps, monthly for retail commodities, annually or seasonally for sports data, with a human reading it before any published figure moves. Every page shows the date its data was last verified. An old observation is never dressed up as a live one.",
    ],
  },
  {
    id: "pipeline",
    title: "The data pipeline",
    body: [
      "Retrieval keeps the raw source. Normalisation converts it to the index's unit and records what it did. The formula layer runs the maths at a stamped version. Validation checks ranges, gaps and revisions. Then a person looks at it. Then it publishes.",
      `Right now this runs on a committed snapshot dated ${SNAPSHOT_LABEL}, not a live feed — the scheduled retrieval and validation stages are not wired up. Every figure in this build needs checking against its primary source before the section goes public. Formula version ${FORMULA_VERSION}.`,
    ],
  },
];

const LEVELS: Confidence[] = ["verified", "reconstructed", "estimated"];

const LEVEL_EXAMPLES: Record<Confidence, string> = {
  verified:
    "Gold prices, CPI, MLB payrolls, listed equities and their split history.",
  reconstructed:
    "Menu-archive prices for shakes and burgers, paneer and okra retail, desktop PC price points, $/WAR estimates, back-cast CPI.",
  estimated:
    "Illicit-market price and purity reporting, Delhi plot rates, fictional object weights.",
};

export default function MethodologyPage() {
  const datasets = Object.values(DATASETS);

  return (
    <main>
      <NoirBand
        accent={{ light: "hsl(41 74% 58%)", dark: "hsl(41 74% 58%)" }}
        scopeId="pop-methodology"
      >
        <div className="mx-auto max-w-5xl px-4 pb-20 pt-20 sm:pt-24">
          <p className="font-mono type-caption uppercase tracking-[0.2em] text-white/45">
            <Link
              href="/pop-indices"
              className="underline-offset-4 transition-colors duration-200 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              Pop Indices
            </Link>{" "}
            / Methodology
          </p>
          <h1 className="mt-6 max-w-3xl text-balance text-[2.25rem] font-semibold leading-[1.02] tracking-[-0.035em] text-white sm:text-6xl">
            How the numbers are made
          </h1>
          <p className="mt-7 max-w-2xl text-[0.9375rem] leading-7 text-white/55">
            The joke is in the scene, not in here. Every rule that decides a
            figure on these pages is written down below, including the ones that
            make the section look worse.
          </p>
        </div>
      </NoirBand>

      {/* Contents */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <nav aria-label="Methodology contents">
          <p className="font-mono type-caption uppercase tracking-[0.14em] text-muted-foreground">
            Contents
          </p>
          <ol className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {SECTIONS.map((s, i) => (
              <li key={s.id} className="flex gap-3">
                <span className="font-mono type-caption text-muted-foreground numeric">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <a
                  href={`#${s.id}`}
                  className="type-label text-foreground underline-offset-4 transition-colors duration-200 hover:text-muted-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </section>

      {SECTIONS.map((s) => (
        <section key={s.id} id={s.id} className="scroll-mt-20 border-t border-border">
          <div className="mx-auto max-w-5xl px-4 py-14">
            <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
              <h2 className="text-xl font-semibold leading-tight tracking-[-0.02em] text-foreground lg:sticky lg:top-24 lg:self-start lg:text-2xl">
                {s.title}
              </h2>
              <div className="min-w-0">
                <div className="flex max-w-2xl flex-col gap-4">
                  {s.body.map((para) => (
                    <p key={para.slice(0, 40)} className="type-body leading-7 text-foreground">
                      {para}
                    </p>
                  ))}
                </div>

                {s.list ? (
                  <ul className="mt-6 flex max-w-2xl flex-col gap-3">
                    {s.list.map((item) => (
                      <li
                        key={item.slice(0, 40)}
                        className="flex gap-3 type-body leading-6 text-muted-foreground"
                      >
                        <span aria-hidden="true">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {s.formulas ? (
                  <dl className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border">
                    {s.formulas.map((f) => (
                      <div
                        key={f.label}
                        className="grid gap-1 bg-card p-4 sm:grid-cols-[14rem_minmax(0,1fr)] sm:items-baseline sm:gap-4"
                      >
                        <dt className="type-caption uppercase tracking-[0.06em] text-muted-foreground">
                          {f.label}
                        </dt>
                        <dd className="min-w-0 break-words font-mono type-label text-foreground numeric">
                          {f.expression}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                {s.id === "confidence" ? (
                  <div className="mt-6 flex flex-col gap-4">
                    {LEVELS.map((level) => (
                      <div
                        key={level}
                        className="rounded-xl border border-border bg-card p-5"
                      >
                        <ConfidenceBadge level={level} />
                        <p className="mt-3 type-body leading-6 text-foreground">
                          {CONFIDENCE_COPY[level].blurb}
                        </p>
                        <p className="mt-1.5 type-meta leading-6 text-muted-foreground">
                          <span className="uppercase tracking-[0.06em]">
                            Typically —{" "}
                          </span>
                          {LEVEL_EXAMPLES[level]}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Every dataset in the section, in one ledger */}
      <section id="all-sources" className="scroll-mt-20 border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <p className="font-mono type-caption uppercase tracking-[0.14em] text-muted-foreground">
            Provenance
          </p>
          <h2 className="mt-4 text-[1.75rem] font-semibold leading-tight tracking-[-0.03em] text-foreground sm:text-4xl">
            Every dataset in Pop Indices
          </h2>
          <p className="mt-3 max-w-2xl type-body leading-6 text-muted-foreground">
            {datasets.length} datasets across the published indices, with
            publisher, range, unit, adjustments and the date each was last
            checked.
          </p>
          <SourceLedger datasets={datasets} className="mt-8" />
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <p className="max-w-3xl type-meta leading-6 text-muted-foreground">
            Pop Indices is editorial and educational. Historical returns are
            described, never projected, and nothing on this site is investment
            advice or a recommendation. Film titles, characters and dialogue are
            referenced for commentary and criticism and remain the property of
            their respective rights holders.
          </p>
          <Link
            href="/pop-indices"
            className="mt-6 inline-flex h-10 items-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground shadow-xs transition-colors duration-200 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
          >
            Back to the indices
          </Link>
        </div>
      </section>
    </main>
  );
}
