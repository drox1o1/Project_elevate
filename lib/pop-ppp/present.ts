/**
 * Presentation layer: turns a PopIndex plus its series into the exact strings
 * and shapes the pages render.
 *
 * It lives here rather than in the pages so the landing grid and the detail
 * page cannot drift — a card and a headline that disagree about the same
 * index would undermine the one thing this section is selling.
 */

import {
  cagr,
  computeIndex,
  formatIncomeTime,
  formatMoney,
  incomeUnitNoun,
  formatMultiple,
  formatPercent,
  incomeUnitFor,
  latestYear,
  observationAt,
  percentChange,
  valueAt,
  type IndexResult,
  type MoneyFormat,
} from "./calc";
import { DATASETS, SNAPSHOT_LABEL, getSeries } from "./data";
import type { Dataset, PopIndex, Series } from "./types";

export interface BenchmarkComparison {
  label: string;
  rationale: string;
  /** Growth multiple of the benchmark across the index period. */
  benchmarkMultiple: number;
  /** Growth multiple of the index itself. */
  indexMultiple: number;
  /** True when the index outran the benchmark. */
  outran: boolean;
  summary: string;
}

export interface PresentedIndex {
  index: PopIndex;
  result: IndexResult;
  priceSeries: Series;
  cpiSeries?: Series;
  incomeSeries?: Series;
  comparisonSeries?: Series;
  datasets: Dataset[];
  /** Locale used for every figure on the page. */
  locale: string;
  /** The serialisable rule, safe to hand to a client component. */
  moneyFormat: MoneyFormat;
  /** Server-side convenience wrapper around `moneyFormat`. */
  money: (n: number) => string;
  /** Human label for the latest observation, never "today". */
  latestLabel: string;
  baseLabel: string;
  reveal: string;
  sourceNote: string;
  benchmarkComparisons: BenchmarkComparison[];
}

function localeFor(currency: string): string {
  return currency === "INR" ? "en-IN" : "en-US";
}

/**
 * $ millions and ₹ are both "money", but a $8.6M-per-WAR figure reads badly
 * as `$8,600,000`. Series quoted in millions say so in their unit, so the
 * rule follows the unit rather than the currency.
 */
function moneyFormatFor(
  currency: string,
  symbol: string,
  unit: string,
  locale: string
): MoneyFormat {
  return /million/i.test(unit)
    ? { kind: "millions", symbol, locale }
    : { kind: "currency", currency, locale };
}

/**
 * The credit line for a share card. Drops a publisher that is already
 * contained in a longer one, so "MoSPI / Labour Bureau · MoSPI" collapses to
 * the specific credit rather than repeating the agency.
 */
function creditLine(datasets: Dataset[]): string {
  const names = datasets
    .map((d) => d.shortPublisher)
    .filter((v, i, a) => a.indexOf(v) === i);
  return names
    .filter((n) => !names.some((other) => other !== n && other.includes(n)))
    .join(" · ");
}

export function presentIndex(index: PopIndex): PresentedIndex {
  const priceSeries = getSeries(index.priceSeriesId);
  const cpiSeries = index.cpiSeriesId ? getSeries(index.cpiSeriesId) : undefined;
  const incomeSeries = index.incomeSeriesId
    ? getSeries(index.incomeSeriesId)
    : undefined;
  const comparisonSeries = index.comparisonSeriesId
    ? getSeries(index.comparisonSeriesId)
    : undefined;

  const result = computeIndex({
    series: priceSeries,
    unitFactor: index.unitFactor,
    baseYear: index.baseYear,
    cpi: cpiSeries,
    income: incomeSeries,
  });

  const locale = localeFor(index.currency);
  const moneyFormat = moneyFormatFor(
    index.currency,
    index.currencySymbol,
    priceSeries.unit,
    locale
  );
  const money = (n: number) => formatMoney(moneyFormat, n);
  const latest = latestYear(priceSeries);

  const datasets = index.datasetIds
    .map((id) => DATASETS[id])
    .filter((d): d is Dataset => Boolean(d));

  /* --- benchmark comparisons (the "did it outrun X?" block) ----------- */

  const indexMultiple = result.currentValue / result.baseValue;
  const benchmarkComparisons: BenchmarkComparison[] = [];
  for (const b of index.benchmarks) {
    const series = getSeries(b.seriesId);
    const then = observationAt(series, index.baseYear);
    const now = observationAt(series, latest);
    if (!then || !now) continue;
    const benchmarkMultiple = now.value / then.value;
    const outran = indexMultiple > benchmarkMultiple;
    benchmarkComparisons.push({
      label: b.label,
      rationale: b.rationale,
      benchmarkMultiple,
      indexMultiple,
      outran,
      summary: outran
        ? `The index grew ${formatMultiple(indexMultiple)} against ${formatMultiple(
            benchmarkMultiple
          )} — it outran this benchmark.`
        : `The index grew ${formatMultiple(indexMultiple)} against ${formatMultiple(
            benchmarkMultiple
          )} — it lagged this benchmark.`,
    });
  }

  return {
    index,
    result,
    priceSeries,
    cpiSeries,
    incomeSeries,
    comparisonSeries,
    datasets,
    locale,
    moneyFormat,
    money,
    latestLabel: `Value at last verified date (${latest})`,
    baseLabel: `Value at ${index.baseYear}`,
    reveal: index.reveal,
    sourceNote: `${creditLine(datasets)}. Snapshot ${SNAPSHOT_LABEL}. Editorial, not investment advice.`,
    benchmarkComparisons,
  };
}

/* ---- rail, ticker and artwork feeds ---------------------------------- */

/**
 * Normalised 0–1 series for sparklines and generative artwork. Normalising
 * here rather than in each component keeps the rail sparkline and the card
 * artwork drawing the same shape from the same numbers.
 */
export function sparkFor(p: PresentedIndex): number[] {
  const values = p.priceSeries.observations.map((o) => o.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  if (range === 0) return values.map(() => 0.5);
  return values.map((v) => (v - min) / range);
}

/** Raw series values, for artwork that normalises itself. */
export function seriesValues(p: PresentedIndex): number[] {
  return p.priceSeries.observations.map((o) => o.value);
}

export function railEntryFor(p: PresentedIndex) {
  const { index, result, money } = p;
  return {
    slug: index.slug,
    shortName: index.shortName,
    film: index.film,
    indexedUnit: index.indexedUnit,
    value: money(result.currentValue),
    change: formatPercent(result.percentChange),
    changePositive: result.percentChange >= 0,
    confidence: index.confidence,
    spark: sparkFor(p),
    accent: index.accent,
  };
}

export function tickerItemFor(p: PresentedIndex) {
  return {
    shortName: p.index.shortName,
    value: p.money(p.result.currentValue),
    change: formatPercent(p.result.percentChange),
    changePositive: p.result.percentChange >= 0,
  };
}

/* ---- landing-grid card ------------------------------------------------ */

export function cardFor(p: PresentedIndex) {
  const { index, result, money } = p;
  return {
    slug: index.slug,
    shortName: index.shortName,
    film: index.film,
    releaseYear: index.releaseYear,
    dialogue: index.dialogue,
    indexedUnit: index.indexedUnit,
    baseYear: result.baseYear,
    latestYear: result.latestYear,
    baseValue: money(result.baseValue),
    currentValue: money(result.currentValue),
    change: formatPercent(result.percentChange),
    changePositive: result.percentChange >= 0,
    reading: index.remark,
    confidence: index.confidence,
    motif: index.motif,
    accent: index.accent,
    values: seriesValues(p),
  };
}

/* ---- headline metric grid --------------------------------------------- */

export function metricsFor(p: PresentedIndex) {
  const { result, money } = p;
  const metrics: {
    label: string;
    value: string;
    note?: string;
    provisional?: boolean;
  }[] = [
    {
      label: "Nominal change",
      value: formatPercent(result.percentChange),
      note: `${result.baseYear} to ${result.latestYear}, unadjusted`,
    },
    {
      label: "Compound annual growth",
      value: `${result.cagr.toFixed(1)}% a year`,
      note: `Across ${result.years} years`,
    },
  ];

  if (result.inflationAdjustedBase != null && result.realAppreciation != null) {
    metrics.push(
      {
        label: `${result.baseYear} value in ${result.latestYear} money`,
        value: money(result.inflationAdjustedBase),
        note: "Base value restated using CPI",
      },
      {
        label: "Real appreciation",
        value: formatPercent(result.realAppreciation),
        note: "Net of general inflation",
      }
    );
  }

  if (result.monthsOfIncomeThen != null && result.monthsOfIncomeNow != null) {
    const unit = incomeUnitFor(
      Math.max(result.monthsOfIncomeThen, result.monthsOfIncomeNow)
    );
    const noun = incomeUnitNoun(unit);
    metrics.push(
      {
        label: `${noun}, ${result.baseYear}`,
        value: formatIncomeTime(result.monthsOfIncomeThen, unit, p.locale),
        note: p.incomeSeries?.label,
      },
      {
        label: `${noun}, ${result.latestYear}`,
        value: formatIncomeTime(result.monthsOfIncomeNow, unit, p.locale),
        note:
          result.affordabilityChange != null
            ? `${formatMultiple(result.affordabilityChange)} the ${result.baseYear} burden`
            : undefined,
      }
    );
  }

  if (result.latestProvisional) {
    metrics.push({
      label: "Latest observation",
      value: "Provisional",
      note: `The ${result.latestYear} figure is not yet final. Values on this page will move when it publishes.`,
      provisional: true,
    });
  }

  return metrics;
}

/* ---- affordability blocks -------------------------------------------- */

export function affordabilityFor(p: PresentedIndex) {
  const { result, money, index, priceSeries, locale } = p;
  const items: {
    title: string;
    question: string;
    then: { label: string; value: string; magnitude: number };
    now: { label: string; value: string; magnitude: number };
    verdict: string;
  }[] = [];

  // 1 — months of income
  if (result.monthsOfIncomeThen != null && result.monthsOfIncomeNow != null) {
    const unit = incomeUnitFor(
      Math.max(result.monthsOfIncomeThen, result.monthsOfIncomeNow)
    );
    const harder = result.monthsOfIncomeNow > result.monthsOfIncomeThen;
    items.push({
      title: "Time on the clock",
      question: `How long an average income has to run to cover it.`,
      then: {
        label: String(result.baseYear),
        value: formatIncomeTime(result.monthsOfIncomeThen, unit, locale),
        magnitude: result.monthsOfIncomeThen,
      },
      now: {
        label: String(result.latestYear),
        value: formatIncomeTime(result.monthsOfIncomeNow, unit, locale),
        magnitude: result.monthsOfIncomeNow,
      },
      verdict: harder
        ? `Harder to afford: ${formatMultiple(
            result.affordabilityChange ?? Number.NaN
          )} the income burden it carried in ${result.baseYear}.`
        : `Easier to afford: ${formatMultiple(
            result.affordabilityChange ?? Number.NaN
          )} the income burden it carried in ${result.baseYear} — income grew faster than the price.`,
    });
  }

  // 2 — quantity the base-year outlay buys
  const baseUnitPrice = valueAt(priceSeries, result.baseYear);
  const latestUnitPrice = valueAt(priceSeries, result.latestYear);
  const unitsThen = result.baseValue / baseUnitPrice;
  const unitsNow = result.baseValue / latestUnitPrice;
  const quantityUnit = priceSeries.pricedUnit ?? priceSeries.unit;
  items.push({
    title: "What the old money buys",
    question: `What the ${result.baseYear} outlay of ${money(
      result.baseValue
    )} would buy at ${result.latestYear} prices.`,
    then: {
      label: `${result.baseYear} prices`,
      value: `${unitsThen.toLocaleString(locale, {
        maximumFractionDigits: 2,
      })} ${quantityUnit}`,
      magnitude: unitsThen,
    },
    now: {
      label: `${result.latestYear} prices`,
      value: `${unitsNow.toLocaleString(locale, {
        maximumFractionDigits: 2,
      })} ${quantityUnit}`,
      magnitude: unitsNow,
    },
    verdict: `The same money buys ${(
      (unitsNow / unitsThen) *
      100
    ).toFixed(1)}% of what it did — the rest is price.`,
  });

  // 3 — inflation-adjusted value
  if (result.inflationAdjustedBase != null && result.realAppreciation != null) {
    items.push({
      title: "Inflation-adjusted value",
      question: `What the ${result.baseYear} price is worth in ${result.latestYear} money, against what the thing actually costs.`,
      then: {
        label: `${result.baseYear} price, restated`,
        value: money(result.inflationAdjustedBase),
        magnitude: result.inflationAdjustedBase,
      },
      now: {
        label: `${result.latestYear} price, actual`,
        value: money(result.currentValue),
        magnitude: result.currentValue,
      },
      verdict:
        result.realAppreciation >= 0
          ? `Real appreciation of ${formatPercent(
              result.realAppreciation
            )}. This part is not inflation — ${index.indexedUnit} genuinely got dearer.`
          : `Real change of ${formatPercent(
              result.realAppreciation
            )}. Adjusted for inflation it is cheaper than it was, however the nominal price reads.`,
    });
  }

  return items;
}

/* ---- equation steps, with citations resolved -------------------------- */

/**
 * Resolves each step's dataset id into a ledger anchor and a short publisher
 * label, so the client component receives plain data.
 */
export function equationStepsFor(p: PresentedIndex) {
  return p.index.equation.map((step) => {
    if (!step.datasetId) return step;
    const dataset = DATASETS[step.datasetId];
    return {
      ...step,
      sourceHref: `#dataset-${step.datasetId}`,
      sourceLabel: dataset ? dataset.shortPublisher : step.datasetId,
    };
  });
}

/* ---- raw values behind the rounded display --------------------------- */

export function rawValuesFor(p: PresentedIndex) {
  const { result, index, priceSeries } = p;
  const baseUnit = valueAt(priceSeries, result.baseYear);
  const latestUnit = valueAt(priceSeries, result.latestYear);

  const raw: { label: string; value: string; note?: string }[] = [
    {
      label: "Unit conversion factor",
      value: String(index.unitFactor),
      note: index.unitFactorNote,
    },
    {
      label: `Unit price, ${result.baseYear}`,
      value: `${baseUnit} (${priceSeries.unit})`,
    },
    {
      label: `Unit price, ${result.latestYear}`,
      value: `${latestUnit} (${priceSeries.unit})`,
    },
    {
      label: `Base value, unrounded`,
      value: String(result.baseValue),
    },
    {
      label: `Current value, unrounded`,
      value: String(result.currentValue),
    },
    {
      label: "Percentage change, unrounded",
      value: String(result.percentChange),
    },
    {
      label: "CAGR, unrounded",
      value: String(result.cagr),
      note: `Over ${result.years} years`,
    },
  ];

  if (result.inflationAdjustedBase != null) {
    raw.push({
      label: "Inflation-adjusted base, unrounded",
      value: String(result.inflationAdjustedBase),
    });
  }
  if (result.realAppreciation != null) {
    raw.push({
      label: "Real appreciation, unrounded",
      value: String(result.realAppreciation),
    });
  }
  if (result.monthsOfIncomeThen != null) {
    raw.push({
      label: "Months of income, unrounded",
      value: `${result.monthsOfIncomeThen} → ${result.monthsOfIncomeNow}`,
    });
  }

  raw.push({
    label: "Formula version",
    value: result.formulaVersion,
    note: `Calculated from the snapshot dated ${SNAPSHOT_LABEL}.`,
  });

  return raw;
}

/* ---- landing "featured index" affordability line ---------------------- */

export function featuredLines(p: PresentedIndex): string[] {
  const { result, money, locale } = p;
  const lines = [
    `In ${result.baseYear} it cost ${money(result.baseValue)}. At the last verified date it costs ${money(
      result.currentValue
    )} — ${formatPercent(result.percentChange)}, or ${result.cagr.toFixed(
      1
    )}% a year for ${result.years} years.`,
  ];
  if (result.monthsOfIncomeThen != null && result.monthsOfIncomeNow != null) {
    const unit = incomeUnitFor(
      Math.max(result.monthsOfIncomeThen, result.monthsOfIncomeNow)
    );
    lines.push(
      `Measured against average income it moved from ${formatIncomeTime(
        result.monthsOfIncomeThen,
        unit,
        locale
      )} of earnings to ${formatIncomeTime(result.monthsOfIncomeNow, unit, locale)}.`
    );
  }
  return lines;
}

/** Re-exported so pages import their maths from one place. */
export { cagr, percentChange, formatPercent, formatMultiple, formatMoney };
export type { MoneyFormat };
