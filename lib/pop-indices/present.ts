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
import { DATASETS, SNAPSHOT_LABEL, SNAPSHOT_SHORT, getSeries } from "./data";
import type {
  Confidence,
  Dataset,
  MarketDriver,
  PopIndex,
  SameMoneyRow,
  Series,
} from "./types";

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
  /** Short publisher credit for the share poster, e.g. "IBJA / RBI · MoSPI". */
  credit: string;
  /** Short snapshot stamp for the share poster, e.g. "Dec 2025". */
  snapshot: string;
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
        ? `The index grew ${formatMultiple(indexMultiple, locale)} against ${formatMultiple(
            benchmarkMultiple
          )} — it outran this benchmark.`
        : `The index grew ${formatMultiple(indexMultiple, locale)} against ${formatMultiple(
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
    credit: creditLine(datasets),
    snapshot: SNAPSHOT_SHORT,
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
  const { index, result, money, locale } = p;
  return {
    slug: index.slug,
    shortName: index.shortName,
    film: index.film,
    indexedUnit: index.indexedUnit,
    value: money(result.currentValue),
    change: formatPercent(result.percentChange, locale),
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
    change: formatPercent(p.result.percentChange, p.locale),
    changePositive: p.result.percentChange >= 0,
  };
}

/* ---- share card ------------------------------------------------------- */

/**
 * The three supporting figures on the share card.
 *
 * Chosen so the card says something the headline number cannot: how fast the
 * move was, how much of it survived inflation, and how the burden shifted.
 * Indices without a CPI or income series fall through to the period length
 * rather than showing a blank — the card is never padded with a dash.
 */
export function shareStatsFor(p: PresentedIndex) {
  const { result, locale } = p;
  const stats: { label: string; value: string }[] = [
    // formatPercent, not toFixed: a raw "-10.9%" sets an ASCII hyphen next to
    // the typographic minus in "−89.2%" on the same row.
    { label: "Per year", value: formatPercent(result.cagr, locale) },
  ];

  if (result.realAppreciation != null) {
    stats.push({
      label: "Real change",
      value: formatPercent(result.realAppreciation, locale),
    });
  }

  if (result.affordabilityChange != null) {
    stats.push({
      label:
        result.affordabilityChange >= 1 ? "Harder to afford" : "Easier to afford",
      value: formatMultiple(result.affordabilityChange, locale),
    });
  }

  if (stats.length < 3) {
    stats.push({
      label: "Span",
      value: `${result.years} years`,
    });
  }

  if (stats.length < 3 && p.priceSeries.observations.length) {
    stats.push({
      label: "Observations",
      value: p.priceSeries.observations.length.toLocaleString(locale),
    });
  }

  return stats.slice(0, 3);
}

/* ---- landing-grid card ------------------------------------------------ */

export function cardFor(p: PresentedIndex) {
  const { index, result, money, locale } = p;
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
    change: formatPercent(result.percentChange, locale),
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
  const { result, money, locale } = p;
  const metrics: {
    label: string;
    value: string;
    note?: string;
    provisional?: boolean;
  }[] = [
    {
      label: "Nominal change",
      value: formatPercent(result.percentChange, locale),
      note: `${result.baseYear} to ${result.latestYear}, unadjusted`,
    },
    {
      label: "Compound annual growth",
      value: `${formatPercent(result.cagr, locale)} a year`,
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
        value: formatPercent(result.realAppreciation, locale),
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
            ? `${formatMultiple(result.affordabilityChange, locale)} the ${result.baseYear} burden`
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

/* ---- the computing index ----------------------------------------------
 *
 * Everything below derives from the constituent series. Nothing is typed in:
 * weights, shares, the index level, the capability composite and the
 * price-per-capability reading are all computed here, so refreshing a
 * component price moves every figure on the page at once.
 */

export interface PresentedCapacity {
  unit: string;
  baseCapacity: string;
  latestCapacity: string;
  basePerUnit: string;
  latestPerUnit: string;
  changePerUnit: string;
  perUnitRose: boolean;
  lowPerUnit: string;
  lowYear: number;
  fallToLow: string;
  riseSinceLow: string;
  note?: string;
}

export interface PresentedConstituent {
  id: string;
  label: string;
  role: string;
  baseSpec: string;
  latestSpec: string;
  drivers: string[];
  insight: string;
  remark: string;
  confidence: Confidence;
  /** Formatted prices. */
  base: string;
  latest: string;
  /** True when the constituent is no longer bought separately. */
  absorbed: boolean;
  change: string;
  rose: boolean;
  /** Own index, base year = 100. Absent when the base price was zero. */
  indexNow?: string;
  baseWeight: number;
  latestWeight: number;
  /** Normalised 0–1 series for the inline sparkline. */
  spark: number[];
  years: number[];
  values: number[];
  capacity?: PresentedCapacity;
  /** Capability metrics this constituent supplies, with their growth. */
  capability: { label: string; base: string; latest: string; multiple: string }[];
}

export interface PresentedTierLine {
  constituentId: string;
  label: string;
  price: string;
  rawPrice: number;
  spec: string;
  note?: string;
  shareOfBuild: number;
  shareOfTower: number;
  included: boolean;
}

export interface PresentedTier {
  id: string;
  label: string;
  purpose: string;
  scope: string;
  confidence: Confidence;
  total: string;
  rawTotal: number;
  tower: string;
  lines: PresentedTierLine[];
  /** The single largest constituent, for the headline callout. */
  largest: { label: string; price: string; shareOfBuild: string; shareOfTower: string };
}

export interface PresentedComputing {
  baseYear: number;
  latestYear: number;
  /** Weighted price index, base year = 100. */
  indexNow: string;
  indexSeries: { year: number; value: number }[];
  indexChange: string;
  /** Capability composite, base year = 100. */
  capabilityNow: string;
  capabilitySeries: { year: number; value: number }[];
  capabilityMultiple: string;
  /** Price per unit of capability, base year = 100. */
  perCapabilitySeries: { year: number; value: number }[];
  perCapabilityNow: string;
  perCapabilityChange: string;
  /** The year price-per-capability bottomed, and what happened after. */
  troughYear: number;
  riseSinceTrough: string;
  realChange?: string;
  constituents: PresentedConstituent[];
  capabilityMetrics: {
    label: string;
    unit: string;
    weight: string;
    base: string;
    latest: string;
    multiple: string;
    constituentLabel: string;
  }[];
  tiers: PresentedTier[];
  headlineTiers: PresentedTier[];
  drivers: MarketDriver[];
  constituentLabels: Record<string, string>;
  sameMoney: {
    amount: number;
    label: string;
    rows: (SameMoneyRow & { capabilityLabel: string; barWidth: number })[];
  }[];
  /** Superlatives for the overview strip. */
  mostExpensive: string;
  fastestGrowing: string;
  largestDeflation: string;
}

function seriesAt(s: Series, year: number): number {
  return observationAt(s, year)?.value ?? 0;
}

/**
 * The weighted price index.
 *
 * Base-year weights, so the index measures price movement rather than a change
 * of shopping list. A constituent that starts at zero cannot have a base-100
 * series of its own, so it is carried at its rupee contribution instead — which
 * is what happens to graphics in the compute tier if that tier ever gets a
 * history.
 */
function weightedIndex(
  lines: Series[],
  years: number[],
  baseYear: number
): { year: number; value: number }[] {
  const baseTotal = lines.reduce((s, l) => s + seriesAt(l, baseYear), 0);
  return years.map((y) => ({
    year: y,
    value:
      (lines.reduce((s, l) => s + seriesAt(l, y), 0) / baseTotal) * 100,
  }));
}

export function computingFor(p: PresentedIndex): PresentedComputing | undefined {
  const c = p.index.computing;
  if (!c) return undefined;

  const locale = p.locale;
  const money = p.money;
  const baseYear = p.index.baseYear;
  const priceLines = c.constituents.map((k) => getSeries(k.seriesId));
  const years = priceLines[0].observations.map((o) => o.year);
  const latest = years[years.length - 1];

  const totalAt = (y: number) =>
    priceLines.reduce((s, l) => s + seriesAt(l, y), 0);
  const baseTotal = totalAt(baseYear);
  const latestTotal = totalAt(latest);

  /* ---- price index ------------------------------------------------- */
  const indexSeries = weightedIndex(priceLines, years, baseYear);
  const indexNow = indexSeries[indexSeries.length - 1].value;

  /* ---- capability composite ---------------------------------------- */
  const capSeries = c.capability.map((m) => getSeries(m.seriesId));
  const capabilitySeries = years.map((y) => ({
    year: y,
    value: c.capability.reduce((s, m, i) => {
      const base = seriesAt(capSeries[i], baseYear);
      if (base === 0) return s;
      return s + (seriesAt(capSeries[i], y) / base) * 100 * m.weight;
    }, 0),
  }));
  const capabilityNow = capabilitySeries[capabilitySeries.length - 1].value;

  /* ---- price per unit of capability -------------------------------- */
  const perCapabilitySeries = years.map((y, i) => ({
    year: y,
    value: (indexSeries[i].value / capabilitySeries[i].value) * 100,
  }));
  const trough = perCapabilitySeries.reduce((min, o) =>
    o.value < min.value ? o : min
  );
  const perCapNow = perCapabilitySeries[perCapabilitySeries.length - 1].value;

  /* ---- per-constituent -------------------------------------------- */
  const constituents: PresentedConstituent[] = c.constituents.map((k, i) => {
    const s = priceLines[i];
    const values = years.map((y) => seriesAt(s, y));
    const b = seriesAt(s, baseYear);
    const l = seriesAt(s, latest);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    let capacity: PresentedCapacity | undefined;
    if (k.capacitySeriesId) {
      const cs = getSeries(k.capacitySeriesId);
      const perUnit = (y: number) => {
        const cap = seriesAt(cs, y);
        return cap > 0 ? seriesAt(s, y) / cap : 0;
      };
      const inRange = years.filter((y) => seriesAt(cs, y) > 0);
      const low = inRange.reduce((best, y) =>
        perUnit(y) < perUnit(best) ? y : best
      );
      const pb = perUnit(baseYear);
      const pl = perUnit(latest);
      const decimals = Math.max(pb, pl) < 100 ? 2 : 0;
      const rupee = (v: number) =>
        `${p.index.currencySymbol}${v.toLocaleString(locale, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}`;
      // Drives are sold in decimal terabytes; memory never reaches the bound.
      const cap = (v: number) =>
        v >= 1000
          ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)} TB`
          : `${v} ${k.capacityUnit ?? "GB"}`;
      const perUnitChange = percentChange(pb, pl);
      capacity = {
        unit: `${p.index.currencySymbol} per ${k.capacityUnit ?? "GB"}`,
        baseCapacity: cap(seriesAt(cs, baseYear)),
        latestCapacity: cap(seriesAt(cs, latest)),
        basePerUnit: rupee(pb),
        latestPerUnit: rupee(pl),
        changePerUnit: formatPercent(perUnitChange, locale),
        perUnitRose: perUnitChange >= 0,
        lowPerUnit: rupee(perUnit(low)),
        lowYear: low,
        fallToLow: formatPercent(percentChange(pb, perUnit(low)), locale),
        riseSinceLow: formatPercent(percentChange(perUnit(low), pl), locale),
        note: cs.normalisation,
      };
    }

    const capability = c.capability
      .filter((m) => m.constituentId === k.id)
      .map((m) => {
        const ms = getSeries(m.seriesId);
        const mb = seriesAt(ms, baseYear);
        const ml = seriesAt(ms, latest);
        const fmt = (v: number) =>
          `${v.toLocaleString(locale, { maximumFractionDigits: v < 10 ? 2 : 0 })} ${m.unit}`;
        return {
          label: m.label,
          base: fmt(mb),
          latest: fmt(ml),
          multiple: mb > 0 ? `${(ml / mb).toFixed(1)}×` : "—",
        };
      });

    const pct = b > 0 ? percentChange(b, l) : 0;
    return {
      id: k.id,
      label: k.label,
      role: k.role,
      baseSpec: k.baseSpec,
      latestSpec: k.latestSpec,
      drivers: k.drivers,
      insight: k.insight,
      remark: k.remark,
      confidence: k.confidence,
      base: money(b),
      latest: l === 0 ? "Included" : money(l),
      absorbed: l === 0,
      change: b > 0 ? formatPercent(pct, locale) : "—",
      rose: pct >= 0,
      indexNow: b > 0 ? ((l / b) * 100).toFixed(0) : undefined,
      baseWeight: baseTotal > 0 ? b / baseTotal : 0,
      latestWeight: latestTotal > 0 ? l / latestTotal : 0,
      spark: range === 0 ? values.map(() => 0.5) : values.map((v) => (v - min) / range),
      years,
      values,
      capacity,
      capability,
    };
  });

  /* ---- tiers -------------------------------------------------------- */
  const labels: Record<string, string> = Object.fromEntries(
    c.constituents.map((k) => [k.id, k.label])
  );
  const displayish = new Set(["display", "peripherals"]);
  const tiers: PresentedTier[] = c.tiers.map((t) => {
    const total = t.lines.reduce((s, l) => s + l.price, 0);
    const tower = t.lines
      .filter((l) => !displayish.has(l.constituentId))
      .reduce((s, l) => s + l.price, 0);
    const lines: PresentedTierLine[] = t.lines.map((l) => ({
      constituentId: l.constituentId,
      label: labels[l.constituentId] ?? l.constituentId,
      price: l.price === 0 ? "Included" : money(l.price),
      rawPrice: l.price,
      spec: l.spec,
      note: l.note,
      shareOfBuild: total > 0 ? l.price / total : 0,
      shareOfTower: displayish.has(l.constituentId)
        ? 0
        : tower > 0
          ? l.price / tower
          : 0,
      included: l.price === 0,
    }));
    const top = [...lines].sort((a, b) => b.rawPrice - a.rawPrice)[0];
    return {
      id: t.id,
      label: t.label,
      purpose: t.purpose,
      scope: t.scope,
      confidence: t.confidence,
      total: money(total),
      rawTotal: total,
      tower: money(tower),
      lines,
      largest: {
        label: top.label,
        price: top.price,
        shareOfBuild: `${(top.shareOfBuild * 100).toFixed(1)}%`,
        shareOfTower: `${(top.shareOfTower * 100).toFixed(1)}%`,
      },
    };
  });

  /* ---- superlatives -------------------------------------------------- */
  const priced = constituents.filter((k) => !k.absorbed);
  const mostExpensive = [...constituents].sort(
    (a, b) => b.latestWeight - a.latestWeight
  )[0];
  const fastest = [...priced].sort((a, b) => {
    const av = Number(a.indexNow ?? 0);
    const bv = Number(b.indexNow ?? 0);
    return bv - av;
  })[0];
  const deflation = [...constituents].sort((a, b) => {
    const av = a.absorbed ? -1 : Number(a.indexNow ?? Infinity);
    const bv = b.absorbed ? -1 : Number(b.indexNow ?? Infinity);
    return av - bv;
  })[0];

  /* ---- same money ---------------------------------------------------- */
  const maxCapability = Math.max(
    ...c.sameMoney.flatMap((band) => band.rows.map((r) => r.capability))
  );
  const sameMoney = c.sameMoney.map((band) => ({
    amount: band.amount,
    label: band.label,
    rows: band.rows.map((r) => ({
      ...r,
      capabilityLabel: r.capability.toLocaleString(locale, {
        maximumFractionDigits: 0,
      }),
      barWidth: (r.capability / maxCapability) * 100,
    })),
  }));

  /* ---- real terms, where a CPI series exists ------------------------- */
  let realChange: string | undefined;
  if (p.cpiSeries) {
    const cpiBase = seriesAt(p.cpiSeries, baseYear);
    const cpiNow = seriesAt(p.cpiSeries, latest);
    if (cpiBase > 0 && cpiNow > 0) {
      const deflated = (latestTotal / (cpiNow / cpiBase) / baseTotal) * 100;
      realChange = formatPercent(deflated - 100, locale);
    }
  }

  return {
    baseYear,
    latestYear: latest,
    indexNow: indexNow.toFixed(1),
    indexSeries,
    indexChange: formatPercent(indexNow - 100, locale),
    capabilityNow: capabilityNow.toLocaleString(locale, {
      maximumFractionDigits: 0,
    }),
    capabilitySeries,
    capabilityMultiple: `${(capabilityNow / 100).toFixed(1)}×`,
    perCapabilitySeries,
    perCapabilityNow: perCapNow.toFixed(1),
    perCapabilityChange: formatPercent(perCapNow - 100, locale),
    troughYear: trough.year,
    riseSinceTrough: formatPercent(percentChange(trough.value, perCapNow), locale),
    realChange,
    constituents,
    capabilityMetrics: c.capability.map((m, i) => {
      const mb = seriesAt(capSeries[i], baseYear);
      const ml = seriesAt(capSeries[i], latest);
      const fmt = (v: number) =>
        v.toLocaleString(locale, { maximumFractionDigits: v < 10 ? 2 : 0 });
      return {
        label: m.label,
        unit: m.unit,
        weight: `${(m.weight * 100).toFixed(0)}%`,
        base: fmt(mb),
        latest: fmt(ml),
        multiple: mb > 0 ? `${(ml / mb).toFixed(1)}×` : "—",
        constituentLabel: labels[m.constituentId] ?? m.constituentId,
      };
    }),
    tiers,
    headlineTiers: c.headlineTierIds
      .map((id) => tiers.find((t) => t.id === id))
      .filter((t): t is PresentedTier => Boolean(t)),
    drivers: c.drivers,
    constituentLabels: labels,
    sameMoney,
    mostExpensive: mostExpensive.label,
    fastestGrowing: fastest.label,
    largestDeflation: deflation.label,
  };
}

/* ---- landing "featured index" affordability line ---------------------- */

export function featuredLines(p: PresentedIndex): string[] {
  const { result, money, locale } = p;
  const lines = [
    `In ${result.baseYear} it cost ${money(result.baseValue)}. At the last verified date it costs ${money(
      result.currentValue
    )} — ${formatPercent(result.percentChange, locale)}, or ${result.cagr.toFixed(
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
