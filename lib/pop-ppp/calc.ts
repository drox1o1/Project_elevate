/**
 * Pop PPP calculation framework (PRD §11).
 *
 * Every index runs through these functions, so a gold chain, a kilogram of
 * bhindi and a dollar per win above replacement are all reduced to the same
 * shape: base value, current value, nominal change, real change, affordability.
 *
 * Formula version is stamped onto results so a figure rendered today can be
 * matched to the maths that produced it.
 */

import type { Observation, Series } from "./types";

export const FORMULA_VERSION = "1.0.0";

/* ---- series access -------------------------------------------------- */

/** Observation at `year`, or null when the series has no point there. */
export function observationAt(series: Series, year: number): Observation | null {
  return series.observations.find((o) => o.year === year) ?? null;
}

/** Value at `year`. Throws rather than silently inventing a number. */
export function valueAt(series: Series, year: number): number {
  const obs = observationAt(series, year);
  if (!obs) {
    throw new Error(
      `Pop PPP: no observation for ${year} in series "${series.id}".`
    );
  }
  return obs.value;
}

/** First year in the series. */
export function firstYear(series: Series): number {
  return series.observations[0].year;
}

/** Most recent year with an observation — never described as "today". */
export function latestYear(series: Series): number {
  return series.observations[series.observations.length - 1].year;
}

export function latestObservation(series: Series): Observation {
  return series.observations[series.observations.length - 1];
}

/* ---- §11.1–11.4: value and growth ----------------------------------- */

/** §11.1 / §11.2 — quantity × unit price. */
export function objectValue(unitPrice: number, unitFactor: number): number {
  return unitPrice * unitFactor;
}

/** §11.3 — nominal percentage change. */
export function percentChange(base: number, current: number): number {
  if (base === 0) return Number.NaN;
  return ((current - base) / base) * 100;
}

/** §11.4 — compound annual growth rate, as a percentage. */
export function cagr(base: number, current: number, years: number): number {
  if (base <= 0 || years <= 0) return Number.NaN;
  return (Math.pow(current / base, 1 / years) - 1) * 100;
}

/* ---- §11.5–11.6: inflation ------------------------------------------ */

/** §11.5 — what the base-year value is worth in present money. */
export function inflationAdjust(
  baseValue: number,
  baseCpi: number,
  currentCpi: number
): number {
  if (baseCpi === 0) return Number.NaN;
  return baseValue * (currentCpi / baseCpi);
}

/** §11.6 — appreciation net of general inflation, as a percentage. */
export function realAppreciation(
  currentValue: number,
  inflationAdjustedBase: number
): number {
  if (inflationAdjustedBase === 0) return Number.NaN;
  return ((currentValue - inflationAdjustedBase) / inflationAdjustedBase) * 100;
}

/* ---- §11.7–11.8: affordability -------------------------------------- */

/** §11.7 — how many months of income the object costs. */
export function monthsOfIncome(
  objectValue: number,
  monthlyIncome: number
): number {
  if (monthlyIncome <= 0) return Number.NaN;
  return objectValue / monthlyIncome;
}

/**
 * Months is the right unit for a gold chain and a useless one for a milkshake
 * — "0.0025 months of income" is arithmetically correct and unreadable. The
 * unit follows the magnitude, chosen once from the largest value in view so
 * both ends of a comparison share a scale.
 *
 * Sub-month units are *working* time, not elapsed time. If a month of earnings
 * comes from a month of work, then a cost of one-thousandth of monthly income
 * is one-thousandth of a month's working hours — roughly ten minutes, not
 * forty-four. Converting on calendar hours would overstate every small figure
 * by a factor of four, which is exactly the sort of quiet error this section
 * is supposed to make impossible.
 */
export type IncomeUnit = "months" | "days" | "hours" | "minutes";

/** A 40-hour week, averaged over a month: 40 × 52 ÷ 12. */
export const WORK_HOURS_PER_MONTH = 173.33;
const WORK_DAYS_PER_MONTH = WORK_HOURS_PER_MONTH / 8;

export function incomeUnitFor(maxMonths: number): IncomeUnit {
  if (!Number.isFinite(maxMonths)) return "months";
  if (maxMonths >= 1) return "months";
  if (maxMonths >= 1 / WORK_DAYS_PER_MONTH) return "days";
  if (maxMonths >= 1 / WORK_HOURS_PER_MONTH) return "hours";
  return "minutes";
}

export function convertIncomeTime(months: number, unit: IncomeUnit): number {
  switch (unit) {
    case "days":
      return months * WORK_DAYS_PER_MONTH;
    case "hours":
      return months * WORK_HOURS_PER_MONTH;
    case "minutes":
      return months * WORK_HOURS_PER_MONTH * 60;
    default:
      return months;
  }
}

/** How the unit is named in a label: "Months of income", "Minutes of work". */
export function incomeUnitNoun(unit: IncomeUnit): string {
  const word = unit.charAt(0).toUpperCase() + unit.slice(1);
  return unit === "months" ? `${word} of income` : `${word} of work`;
}

/** "177.5 months", "26 minutes" — value and unit, already converted. */
export function formatIncomeTime(
  months: number,
  unit: IncomeUnit,
  locale = "en-IN"
): string {
  if (!Number.isFinite(months)) return "—";
  const v = convertIncomeTime(months, unit);
  const decimals = v < 10 ? 1 : 0;
  return `${v.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} ${unit}`;
}

/**
 * §11.8 — affordability change. Above 1 means the object costs more months
 * of income than it used to; below 1 means it got easier to afford.
 *
 * Deliberately computed on months rather than on a display unit: the ratio is
 * unit-invariant, and computing it after conversion would invite rounding
 * differences between two rows that must agree.
 */
export function affordabilityChange(
  currentMonths: number,
  historicalMonths: number
): number {
  if (historicalMonths === 0) return Number.NaN;
  return currentMonths / historicalMonths;
}

/* ---- chart transforms ------------------------------------------------ */

export type ChartMode =
  | "nominal"
  | "real"
  | "income"
  | "quantity"
  | "percent";

export interface TransformInput {
  series: Series;
  unitFactor: number;
  baseYear: number;
  /** CPI series used for the "real" mode. */
  cpi?: Series;
  /** Monthly income series used for the "income" mode. */
  income?: Series;
}

export interface ChartPoint {
  year: number;
  value: number;
  imputed: boolean;
  provisional: boolean;
}

/**
 * Project a price series into one of the five reading modes.
 *
 * nominal  — object value in local currency of the day
 * real     — object value restated in the latest year's money
 * income   — months of income the object costs
 * quantity — how much of the underlying unit one base-year outlay buys
 * percent  — cumulative percentage change against the base year
 *
 * Years without a matching CPI or income observation are dropped rather than
 * imputed, so a mode never invents a point the sources do not support.
 */
export function transformSeries(
  input: TransformInput,
  mode: ChartMode
): ChartPoint[] {
  const { series, unitFactor, baseYear, cpi, income } = input;
  const latest = latestYear(series);
  const points: ChartPoint[] = [];

  const baseObs = observationAt(series, baseYear);
  const baseValue = baseObs ? objectValue(baseObs.value, unitFactor) : Number.NaN;

  for (const obs of series.observations) {
    const nominal = objectValue(obs.value, unitFactor);
    let value: number;

    switch (mode) {
      case "nominal":
        value = nominal;
        break;
      case "real": {
        if (!cpi) continue;
        const thisCpi = observationAt(cpi, obs.year);
        const latestCpi = observationAt(cpi, latest);
        if (!thisCpi || !latestCpi) continue;
        value = inflationAdjust(nominal, thisCpi.value, latestCpi.value);
        break;
      }
      case "income": {
        if (!income) continue;
        const inc = observationAt(income, obs.year);
        if (!inc) continue;
        value = monthsOfIncome(nominal, inc.value);
        break;
      }
      case "quantity": {
        // What the base-year outlay buys, in the series' own unit.
        if (!Number.isFinite(baseValue)) continue;
        value = baseValue / obs.value;
        break;
      }
      case "percent": {
        if (!Number.isFinite(baseValue)) continue;
        value = percentChange(baseValue, nominal);
        break;
      }
    }

    points.push({
      year: obs.year,
      value,
      imputed: obs.imputed ?? false,
      provisional: obs.provisional ?? false,
    });
  }

  return points;
}

/* ---- headline result -------------------------------------------------- */

export interface IndexResult {
  baseYear: number;
  latestYear: number;
  years: number;
  baseValue: number;
  currentValue: number;
  percentChange: number;
  cagr: number;
  /** Base value restated in latest-year money. Null without a CPI series. */
  inflationAdjustedBase: number | null;
  /** Appreciation net of inflation. Null without a CPI series. */
  realAppreciation: number | null;
  monthsOfIncomeThen: number | null;
  monthsOfIncomeNow: number | null;
  affordabilityChange: number | null;
  /** True when the latest observation is not yet final. */
  latestProvisional: boolean;
  formulaVersion: string;
}

export interface ResultInput extends TransformInput {
  cpi?: Series;
  income?: Series;
}

/**
 * The full headline block for an index. Optional inputs degrade to null
 * rather than to a guess — a missing income series means the affordability
 * row is absent, not zero.
 */
export function computeIndex(input: ResultInput): IndexResult {
  const { series, unitFactor, baseYear, cpi, income } = input;
  const latest = latestYear(series);
  const years = latest - baseYear;

  const baseValue = objectValue(valueAt(series, baseYear), unitFactor);
  const currentValue = objectValue(valueAt(series, latest), unitFactor);

  let adjustedBase: number | null = null;
  let real: number | null = null;
  if (cpi) {
    const baseCpi = observationAt(cpi, baseYear);
    const latestCpi = observationAt(cpi, latest);
    if (baseCpi && latestCpi) {
      adjustedBase = inflationAdjust(baseValue, baseCpi.value, latestCpi.value);
      real = realAppreciation(currentValue, adjustedBase);
    }
  }

  let monthsThen: number | null = null;
  let monthsNow: number | null = null;
  let affordability: number | null = null;
  if (income) {
    const incThen = observationAt(income, baseYear);
    const incNow = observationAt(income, latest);
    if (incThen && incNow) {
      monthsThen = monthsOfIncome(baseValue, incThen.value);
      monthsNow = monthsOfIncome(currentValue, incNow.value);
      affordability = affordabilityChange(monthsNow, monthsThen);
    }
  }

  return {
    baseYear,
    latestYear: latest,
    years,
    baseValue,
    currentValue,
    percentChange: percentChange(baseValue, currentValue),
    cagr: cagr(baseValue, currentValue, years),
    inflationAdjustedBase: adjustedBase,
    realAppreciation: real,
    monthsOfIncomeThen: monthsThen,
    monthsOfIncomeNow: monthsNow,
    affordabilityChange: affordability,
    latestProvisional: latestObservation(series).provisional ?? false,
    formulaVersion: FORMULA_VERSION,
  };
}

/* ---- formatting ------------------------------------------------------- */

/** Currency, grouped for its locale, no decimals unless the value is small. */
export function formatCurrency(
  value: number,
  currency: string,
  locale = "en-IN"
): string {
  if (!Number.isFinite(value)) return "—";
  const decimals = Math.abs(value) < 100 ? 2 : 0;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * A serialisable money-formatting rule.
 *
 * Server components cannot hand a formatter function to a client component,
 * and duplicating the rule on both sides is how a card and a headline end up
 * disagreeing about the same figure. So the rule travels as data and both
 * sides run it through `formatMoney`.
 */
export type MoneyFormat =
  | { kind: "currency"; currency: string; locale: string }
  | { kind: "millions"; symbol: string; locale: string };

export function formatMoney(fmt: MoneyFormat, value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (fmt.kind === "millions") {
    return `${fmt.symbol}${value.toLocaleString(fmt.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}M`;
  }
  return formatCurrency(value, fmt.currency, fmt.locale);
}

/** Compact currency for axis ticks: ₹1.02L, ₹65.3K, $8.6M. */
export function formatCompactCurrency(
  value: number,
  symbol: string,
  locale = "en-IN"
): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs === 0) return `${symbol}0`;
  if (locale === "en-IN") {
    if (abs >= 1e7) return `${sign}${symbol}${(abs / 1e7).toFixed(2)}Cr`;
    if (abs >= 1e5) return `${sign}${symbol}${(abs / 1e5).toFixed(2)}L`;
    if (abs >= 1e3) return `${sign}${symbol}${(abs / 1e3).toFixed(1)}K`;
  } else {
    if (abs >= 1e9) return `${sign}${symbol}${(abs / 1e9).toFixed(2)}B`;
    if (abs >= 1e6) return `${sign}${symbol}${(abs / 1e6).toFixed(2)}M`;
    if (abs >= 1e3) return `${sign}${symbol}${(abs / 1e3).toFixed(1)}K`;
  }
  return `${sign}${symbol}${abs.toFixed(abs < 10 ? 2 : 0)}`;
}

/** Signed percentage, one decimal below 1000%, none above. */
export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const decimals = abs >= 1000 ? 0 : 1;
  return `${value >= 0 ? "+" : "−"}${abs.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

export function formatMultiple(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toLocaleString("en-IN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}×`;
}

export function formatMonths(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toLocaleString("en-IN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} months`;
}

/**
 * The text equivalent every chart carries (PRD §24). Screen readers get the
 * same sentence a sighted reader would take from the shape of the line.
 */
export function chartSummary(
  label: string,
  points: ChartPoint[],
  format: (n: number) => string
): string {
  if (points.length < 2) return `${label}: not enough observations to chart.`;
  const first = points[0];
  const last = points[points.length - 1];
  const change = percentChange(first.value, last.value);
  const peak = points.reduce((a, b) => (b.value > a.value ? b : a));
  const direction = change >= 0 ? "an increase" : "a decrease";
  const peakNote =
    peak.year !== last.year ? ` The series peaked in ${peak.year} at ${format(peak.value)}.` : "";
  return (
    `${label}: ${format(first.value)} in ${first.year}, ` +
    `${format(last.value)} in ${last.year} — ${direction} of ` +
    `${Math.abs(change).toFixed(1)}% across ${points.length} annual observations.` +
    peakNote
  );
}
