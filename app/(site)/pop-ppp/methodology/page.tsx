import type { Metadata } from "next";
import Link from "next/link";
import {
  CONFIDENCE_COPY,
  ConfidenceBadge,
} from "@/components/pop-ppp/confidence-badge";
import { NoirBand } from "@/components/pop-ppp/editorial";
import { SourceLedger } from "@/components/pop-ppp/source-ledger";
import { DATASETS, GRAMS_PER_TOLA, SNAPSHOT_LABEL } from "@/lib/pop-ppp/data";
import { FORMULA_VERSION } from "@/lib/pop-ppp/calc";
import type { Confidence } from "@/lib/pop-ppp/types";

export const metadata: Metadata = {
  title: "Pop PPP methodology | DUKU",
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
      "A scene is not an index. A reference qualifies only when it satisfies at least four of five tests, and in practice the fourth and fifth are where most candidates die.",
    ],
    list: [
      "Recognition — the scene, line or object is widely recognisable without explanation.",
      "Specificity — it contains a measurable object, quantity or transaction. “50 tolas of gold” qualifies; “his lifestyle” does not.",
      "Data availability — a defensible historical series exists for the thing named, covering the period from the anchor year to now.",
      "Economic meaning — the result reveals something about inflation, affordability, market value, scarcity or pricing inefficiency.",
      "Narrative contrast — the result opens an interesting gap between the fictional moment and the present.",
    ],
  },
  {
    id: "base-dates",
    title: "How base dates are chosen",
    body: [
      "The base year is the year the scene is economically about, which is not always the release year. For the Sanju Baba Index it is the 1999 release of Vaastav, because the film does not date the chain. For the Moneyball Index it is 2002 — the season depicted — not 2011, when the film came out. Choosing the release year for a period film would measure the wrong market.",
      "Where an anchor is genuinely ambiguous, the choice is stated on the index page next to the base-year figure rather than buried here.",
    ],
  },
  {
    id: "nominal-real",
    title: "Nominal versus real values",
    body: [
      "Charts default to nominal local currency, because that is the number a person would have handed over at the time. Nominal figures are also the most misleading number on the page: most of what looks like appreciation over twenty-five years is the currency losing value.",
      "Every index that has a defensible CPI series therefore offers an inflation-adjusted mode, which restates every year in the latest year's money. The difference between the two readings is the part worth arguing about.",
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
      "Price appreciation says nothing about whether a thing became harder to buy. That question needs an income series, and the income series are the weakest link in this section.",
      "The Indian indices use per-capita net national income at current prices, divided by twelve. It is a national average across the entire population — not a wage, not an urban salary, and certainly not a Mumbai salary. It understates urban salaried earnings and overstates rural ones. The US indices use median usual weekly earnings for full-time workers, which is a genuine wage but excludes the part-time and tipped workforce most exposed to restaurant prices. Neither is a payslip. Read the affordability rows as a direction of travel.",
      "Where the figure is smaller than a month, it is expressed in working time rather than elapsed time: a 40-hour week averaged over a month is 173.3 hours. A cost of one-thousandth of monthly income is about ten working minutes, not forty-four calendar minutes. Converting on calendar hours would overstate every small figure fourfold.",
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
      "Indices are computed in the currency and geography of the scene, not converted into a single reporting currency. A rupee index stays in rupees; a dollar index stays in dollars. Cross-currency conversion would add an exchange-rate story on top of the price story and make both harder to read.",
      "Geography is held constant within a series. Delhi retail stays Delhi retail for the whole period; a series is never assembled by splicing Mumbai wholesale onto Delhi retail onto a national CPI quotation to fill gaps.",
    ],
  },
  {
    id: "confidence",
    title: "Data-confidence levels",
    body: [
      "Not every index can be equally well sourced, and pretending otherwise would be the most damaging thing this section could do. Every index and every dataset carries one of three levels, shown beside the headline result rather than in the footer.",
    ],
  },
  {
    id: "estimates",
    title: "Estimates and assumptions",
    body: [
      "Where a figure depends on an assumption, the assumption is named on the index page. The Sanju Baba Index assumes 24-karat purity because the weight is quoted in tolas; it also excludes making charges and GST, so it measures metal value rather than a jeweller's bill.",
      "Fictional quantities — the weight of a Continental gold coin, for instance — will always publish as Estimated, however good the price series behind them is. An assumption about the object cannot be upgraded by better data about the market.",
    ],
    formulas: [
      { label: "Grams per Indian tola", expression: `${GRAMS_PER_TOLA} g (fixed constant)` },
    ],
  },
  {
    id: "missing-data",
    title: "Missing data and conflicting sources",
    body: [
      "A year with no verified observation is interpolated from adjacent years, drawn as a hollow point on the chart, and labelled as interpolated in its tooltip. It is never presented as an observation. Where the series has a genuine hole — two or more consecutive years missing — the connecting segment is dashed as well.",
      "A segment is not dashed merely because one of its endpoints is interpolated. Several series are surveyed every second year, and dashing every stretch of those would render a well-sourced index as entirely unknown, which is both wrong and useless. Provenance is marked at the point level, where it actually applies.",
      "An observation that exists but is not yet final — a part-year average, an advance estimate — is flagged provisional and drawn as a hollow point in the accent colour. Where two credible sources disagree, the index states which was preferred and why rather than silently averaging them.",
      "Excluding data is sometimes more honest than adjusting it. The Moneyball Index omits 2020 entirely: a sixty-game season has no comparable full-season price of a win, and pro-rating it would invent a figure nobody could defend.",
    ],
  },
  {
    id: "illegal-markets",
    title: "Illegal-market data policy",
    body: [
      "One index in this release concerns an illicit market, and two more are in the catalogue. They are built strictly on institutional and academic data — DEA and UNODC price and purity reporting, published enforcement statistics, peer-reviewed literature — and framed as crime economics and public policy.",
      "They contain no operational detail of any kind: no production or synthesis information, no procurement or sourcing guidance, no location-specific pricing that could function as a market signal. An index that could only be made useful by crossing that line will not be published.",
      "They also carry no affordability or income comparison, and never will. Framing an illicit drug as a household purchase would be analytically wrong — these are not consumer goods bought out of monthly earnings — and editorially indefensible. The purity adjustment exists to make prices comparable across years, not to make a market look like a shop.",
    ],
  },
  {
    id: "corrections",
    title: "Corrections, revisions and update frequency",
    body: [
      "Statistical agencies revise. When a source revises a figure this section has published, the index is recalculated and the change is noted on the index page rather than quietly overwritten.",
      "Intended cadence once the pipeline is live: daily for market assets where it is useful, monthly for retail commodities, annually or seasonally for sports datasets, with editorial review before any figure changes on a published page. Every page shows the date its data was last verified — an old observation is never labelled as a live one.",
    ],
  },
  {
    id: "pipeline",
    title: "The data pipeline",
    body: [
      "Retrieval preserves the raw source. Normalisation converts it into the index's unit and records what it did. The formula layer runs the calculations at a stamped version. Validation checks ranges, gaps and revisions. Only then does a figure publish, and only after a human has looked at it.",
      `This release runs on a committed snapshot dated ${SNAPSHOT_LABEL} rather than a live feed: the scheduled retrieval and validation stages are not wired up yet. Every figure in this build needs re-verification against its primary source before the section is published publicly. Current formula version: ${FORMULA_VERSION}.`,
    ],
  },
];

const LEVELS: Confidence[] = ["verified", "reconstructed", "estimated"];

const LEVEL_EXAMPLES: Record<Confidence, string> = {
  verified: "Gold prices, MLB payrolls, CPI, listed equities.",
  reconstructed:
    "Menu-archive prices for shakes and burgers, paneer retail prices, $/WAR estimates, back-cast CPI.",
  estimated:
    "Illicit-market price and purity reporting, fictional object weights, collector value of invented artefacts.",
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
              href="/pop-ppp"
              className="underline-offset-4 transition-colors duration-200 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              Pop PPP
            </Link>{" "}
            / Methodology
          </p>
          <h1 className="mt-6 max-w-3xl text-balance text-[2.25rem] font-semibold leading-[1.02] tracking-[-0.035em] text-white sm:text-6xl">
            How the numbers are made
          </h1>
          <p className="mt-7 max-w-2xl text-[0.9375rem] leading-7 text-white/55">
            The joke is in the scene. Nothing in this document is funny, on
            purpose — methodology language is where humour stops being an asset.
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
            Every dataset in Pop PPP
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
            Pop PPP is editorial and educational. Historical returns are
            described, never projected, and nothing on this site is investment
            advice or a recommendation. Film titles, characters and dialogue are
            referenced for commentary and criticism and remain the property of
            their respective rights holders.
          </p>
          <Link
            href="/pop-ppp"
            className="mt-6 inline-flex h-10 items-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground shadow-xs transition-colors duration-200 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
          >
            Back to the indices
          </Link>
        </div>
      </section>
    </main>
  );
}
