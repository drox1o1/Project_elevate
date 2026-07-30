/**
 * Pop Indices content and data snapshot.
 *
 * ─── Provenance note, read this before shipping ─────────────────────────
 * The series below are a committed *snapshot*, compiled from the published
 * annual series named in each Dataset record. They exist so the section can
 * be built, reviewed and tested end to end. The PRD's data pipeline
 * (scheduled retrieval → raw preservation → normalisation → validation →
 * versioned output → editorial review) is NOT implemented yet, so every
 * figure here must be re-verified against its primary source before the
 * section is published publicly.
 *
 * Each dataset therefore carries `retrievedOn`, and the UI shows "last
 * verified" rather than "today" — an old observation is never labelled as a
 * live one. Observations that are not yet final are flagged `provisional`
 * and render with the estimate treatment.
 * ────────────────────────────────────────────────────────────────────────
 */

import type {
  CatalogueEntry,
  CountryPrice,
  Dataset,
  PopIndex,
  Series,
} from "./types";

/** Snapshot date for the whole section. Bump when a series is refreshed. */
export const SNAPSHOT_DATE = "2025-12-31";
export const SNAPSHOT_LABEL = "31 December 2025";
/** Compact stamp for the share poster, where the full date does not fit. */
export const SNAPSHOT_SHORT = "Dec 2025";

/* ==== datasets ======================================================== */

export const DATASETS: Record<string, Dataset> = {
  "ibja-gold-inr": {
    id: "ibja-gold-inr",
    shortPublisher: "IBJA / RBI",
    publisher: "India Bullion and Jewellers Association / RBI Handbook of Statistics",
    title: "Standard gold price, Mumbai — annual average, ₹ per 10 grams (24 karat)",
    sourceUrl: "https://www.rbi.org.in/Scripts/AnnualPublications.aspx?head=Handbook+of+Statistics+on+Indian+Economy",
    retrievedOn: SNAPSHOT_DATE,
    startDate: "1999-01-01",
    endDate: "2025-12-31",
    frequency: "annual",
    originalUnit: "₹ per 10 g, 24 karat, Mumbai standard gold",
    normalisedUnit: "₹ per 10 g, 24 karat",
    currency: "INR",
    geography: "India (Mumbai reference market)",
    licence: "Public statistics, cited with attribution",
    adjustments:
      "Annual averages of the daily AM/PM rate. Retail making charges, GST and jeweller margins are excluded — this is metal value, not billed price.",
    missingData:
      "No gaps in the annual series. The 2025 average is provisional pending the final calendar-year publication.",
    confidence: "verified",
  },

  "india-cpi-spliced": {
    id: "india-cpi-spliced",
    shortPublisher: "MoSPI / Labour Bureau",
    publisher: "MoSPI (CPI Combined) spliced to Labour Bureau (CPI-IW)",
    title: "India consumer price index, all groups — annual average, rebased 2012 = 100",
    sourceUrl: "https://mospi.gov.in/web/mospi/download-tables-data/-/reports/view/templateFour/16702",
    retrievedOn: SNAPSHOT_DATE,
    startDate: "1999-01-01",
    endDate: "2025-12-31",
    frequency: "annual",
    originalUnit: "Index, mixed bases",
    normalisedUnit: "Index, 2012 = 100",
    currency: "INR",
    geography: "India (combined rural + urban)",
    licence: "Public statistics, cited with attribution",
    adjustments:
      "CPI Combined begins in 2011. Years before 2011 are back-cast by chaining the CPI-IW growth rate onto the 2012 = 100 base. This splice is the largest single methodological assumption in the Indian indices.",
    missingData: "No gaps. Pre-2011 values are derived, not observed — flagged as such on the chart.",
    confidence: "reconstructed",
  },

  "mospi-nni-percapita": {
    id: "mospi-nni-percapita",
    shortPublisher: "MoSPI",
    publisher: "MoSPI, National Accounts Statistics",
    title: "Per-capita net national income at current prices — monthly equivalent, ₹",
    sourceUrl: "https://mospi.gov.in/web/mospi/national-accounts-statistics",
    retrievedOn: SNAPSHOT_DATE,
    startDate: "1999-01-01",
    endDate: "2025-12-31",
    frequency: "annual",
    originalUnit: "₹ per capita per year, current prices",
    normalisedUnit: "₹ per capita per month",
    currency: "INR",
    geography: "India",
    licence: "Public statistics, cited with attribution",
    adjustments:
      "Annual figure divided by 12. Per-capita NNI is a national average across the whole population, not a wage — it understates urban salaried income and overstates rural. Read the affordability rows as a direction of travel, not a payslip.",
    missingData:
      "Fiscal years mapped to their starting calendar year. The 2025 value is a provisional advance estimate.",
    confidence: "reconstructed",
  },

  "doca-bhindi-delhi": {
    id: "doca-bhindi-delhi",
    shortPublisher: "DoCA Price Monitoring",
    publisher: "Department of Consumer Affairs, Price Monitoring Division",
    title: "Retail price of bhindi (okra), Delhi — annual average, ₹ per kg",
    sourceUrl: "https://fcainfoweb.nic.in/reports/report_menu_web.aspx",
    retrievedOn: SNAPSHOT_DATE,
    startDate: "2009-01-01",
    endDate: "2025-12-31",
    frequency: "annual",
    originalUnit: "₹ per kg, daily retail quotation, Delhi centre",
    normalisedUnit: "₹ per kg, annual mean of monthly means",
    currency: "INR",
    geography: "Delhi",
    licence: "Public statistics, cited with attribution",
    adjustments:
      "One centre only (Delhi retail) for the whole series — Mumbai wholesale and all-India CPI quotations are never spliced into it. Annual means are computed from monthly means so a volatile monsoon month cannot dominate the year.",
    missingData:
      "Bhindi is strongly seasonal and thinly reported in the early years. Months missing from the DoCA series are interpolated from the adjacent months of the same year and flagged on the chart.",
    confidence: "reconstructed",
  },

  "doca-paneer-delhi": {
    id: "doca-paneer-delhi",
    shortPublisher: "DoCA / NDDB",
    publisher: "Department of Consumer Affairs / NDDB market reports",
    title: "Retail price of paneer, Delhi — annual average, ₹ per kg",
    sourceUrl: "https://www.nddb.coop/information/stats",
    retrievedOn: SNAPSHOT_DATE,
    startDate: "2009-01-01",
    endDate: "2025-12-31",
    frequency: "annual",
    originalUnit: "₹ per kg, branded and loose retail blend, Delhi",
    normalisedUnit: "₹ per kg, annual mean",
    currency: "INR",
    geography: "Delhi",
    licence: "Public statistics, cited with attribution",
    adjustments:
      "Paneer is not a DoCA daily-monitored essential for the full period. The series blends branded pack pricing with loose-market quotations, which widens the uncertainty band relative to bhindi.",
    missingData: "Sparse years reconstructed from dairy-federation price circulars.",
    confidence: "reconstructed",
  },

  "india-food-cpi": {
    id: "india-food-cpi",
    shortPublisher: "MoSPI",
    publisher: "MoSPI, Consumer Food Price Index",
    title: "India consumer food price index — annual average, rebased 2012 = 100",
    sourceUrl: "https://mospi.gov.in/web/mospi/download-tables-data",
    retrievedOn: SNAPSHOT_DATE,
    startDate: "2009-01-01",
    endDate: "2025-12-31",
    frequency: "annual",
    originalUnit: "Index, 2012 = 100",
    normalisedUnit: "Index, 2012 = 100",
    currency: "INR",
    geography: "India (combined)",
    licence: "Public statistics, cited with attribution",
    adjustments: "Pre-2011 values chained from the CPI-IW food group.",
    missingData: "None.",
    confidence: "reconstructed",
  },

  "fangraphs-dollars-per-war": {
    id: "fangraphs-dollars-per-war",
    shortPublisher: "FanGraphs",
    publisher: "FanGraphs",
    title: "Estimated free-agent cost per win above replacement — $ millions per WAR",
    sourceUrl: "https://blogs.fangraphs.com/",
    retrievedOn: SNAPSHOT_DATE,
    startDate: "2002-01-01",
    endDate: "2024-12-31",
    frequency: "annual",
    originalUnit: "$ per WAR, free-agent market estimate",
    normalisedUnit: "$ millions per WAR",
    currency: "USD",
    geography: "United States (Major League Baseball)",
    licence: "Cited with attribution; derived estimate, not an official MLB statistic",
    adjustments:
      "$/WAR is an estimate of the marginal free-agent price of a win, not a figure any team publishes. Different analysts reach different levels; the trend is far more robust than any single year's value.",
    missingData:
      "2020 is excluded: a 60-game season makes a full-season WAR price meaningless rather than merely noisy.",
    confidence: "reconstructed",
  },

  "mlb-payroll-per-win": {
    id: "mlb-payroll-per-win",
    shortPublisher: "Baseball Reference",
    publisher: "Baseball Reference, Lahman Database, Associated Press payroll surveys",
    title: "League-average team payroll per win — $ millions",
    sourceUrl: "https://www.baseball-reference.com/leagues/majors/",
    retrievedOn: SNAPSHOT_DATE,
    startDate: "2002-01-01",
    endDate: "2024-12-31",
    frequency: "annual",
    originalUnit: "$ opening-day payroll; wins",
    normalisedUnit: "$ millions of payroll per regular-season win",
    currency: "USD",
    geography: "United States (Major League Baseball)",
    licence: "Cited with attribution",
    adjustments:
      "Opening-day payrolls divided by the 81-win league average. Deferred money, signing bonuses and in-season acquisitions are not restated.",
    missingData: "2020 excluded (shortened season).",
    confidence: "verified",
  },

  "india-desktop-components": {
    id: "india-desktop-components",
    shortPublisher: "Retail price survey",
    publisher: "Duku Design retail survey / PCPartPicker / Indian component retailers",
    title: "Mid-range self-assembled desktop PC — total component cost, India, ₹",
    sourceUrl: "https://pcpartpicker.com/trends/",
    retrievedOn: SNAPSHOT_DATE,
    startDate: "2009-01-01",
    endDate: "2025-12-31",
    frequency: "annual",
    originalUnit: "₹ per component, Indian retail listings",
    normalisedUnit: "₹ for a complete mid-range build (eight priced lines)",
    currency: "INR",
    geography: "India",
    licence: "Compiled from retail listings and price trackers, cited with attribution",
    adjustments:
      "\u201cMid-range\u201d is held to a constant market position, not a constant specification — the build that a mainstream buyer would choose in each year. That is the only way to price technology over sixteen years, and it is also why the nominal figure understates what actually changed.",
    missingData:
      "Indian listings are thin before 2012; those years are reconstructed from US retail converted at the year's average exchange rate plus a customs and margin uplift.",
    confidence: "reconstructed",
  },

  "dram-nand-contract": {
    id: "dram-nand-contract",
    shortPublisher: "TrendForce / DRAMeXchange",
    publisher: "TrendForce DRAMeXchange contract and spot price reporting",
    title: "DRAM and NAND flash contract prices — industry benchmark, US$",
    sourceUrl: "https://www.trendforce.com/price",
    retrievedOn: SNAPSHOT_DATE,
    startDate: "2009-01-01",
    endDate: "2025-12-31",
    frequency: "monthly",
    originalUnit: "US$ per module and per gigabyte, monthly contract price",
    normalisedUnit: "Index, 2009 = 100, annual average",
    currency: "USD",
    geography: "Global",
    licence: "Cited with attribution; headline figures only",
    adjustments:
      "Monthly contract prices averaged to an annual figure and rebased to 2009 = 100. Used here as context for the Indian retail component series, not as a substitute for it — an Indian buyer pays a retail price that includes freight, duty and margin.",
    missingData:
      "The 2025 average runs to the snapshot date and is provisional. Memory prices moved fast enough in the second half of 2025 that an annual average understates where the year ended.",
    confidence: "reconstructed",
  },

  "delhi-ncr-plot-rates": {
    id: "delhi-ncr-plot-rates",
    shortPublisher: "Circle rates / NHB",
    publisher: "Delhi circle rates, NHB RESIDEX and property-portal asking prices",
    title: "Residential plot rate, Delhi NCR — ₹ per square yard",
    sourceUrl: "https://residex.nhbonline.org.in/",
    retrievedOn: SNAPSHOT_DATE,
    startDate: "2006-01-01",
    endDate: "2025-12-31",
    frequency: "annual",
    originalUnit: "₹ per sq yard, circle rate and listed asking price",
    normalisedUnit: "₹ per sq yard, blended circle and market rate",
    currency: "INR",
    geography: "Delhi NCR (peripheral residential colonies)",
    licence: "Public rates and listings, cited with attribution",
    adjustments:
      "Circle rates are a floor for stamp duty, not a market price, and asking prices are an aspiration rather than a transaction. The series sits between the two. Registered transaction prices would be better and are not published at this granularity.",
    missingData:
      "No single continuous source covers the period. Segments are chained across circle-rate revisions, which is the largest assumption in this index.",
    confidence: "estimated",
  },

  "apple-total-return": {
    id: "apple-total-return",
    shortPublisher: "Nasdaq / CRSP",
    publisher: "Nasdaq historical prices, corporate actions and dividend records",
    title: "Apple Inc. total return — value of $1,000 invested, split- and dividend-adjusted",
    sourceUrl: "https://www.nasdaq.com/market-activity/stocks/aapl/historical",
    retrievedOn: SNAPSHOT_DATE,
    startDate: "1994-01-01",
    endDate: "2025-12-31",
    frequency: "annual",
    originalUnit: "$ per share, close",
    normalisedUnit: "$ value of a $1,000 position, dividends reinvested",
    currency: "USD",
    geography: "United States",
    licence: "Public market data, cited with attribution",
    adjustments:
      "Adjusted for all five splits since 1994 (2:1 in 2000 and 2005, 7:1 in 2014, 4:1 in 2020) and for dividends reinvested from 2012. No tax, brokerage or currency conversion is applied.",
    missingData: "None. The 2025 value is provisional pending the year-end close.",
    confidence: "verified",
  },

  "sp500-total-return": {
    id: "sp500-total-return",
    shortPublisher: "S&P Dow Jones",
    publisher: "S&P Dow Jones Indices, S&P 500 Total Return",
    title: "S&P 500 total return — value of $1,000 invested, dividends reinvested",
    sourceUrl: "https://www.spglobal.com/spdji/en/indices/equity/sp-500/",
    retrievedOn: SNAPSHOT_DATE,
    startDate: "1994-01-01",
    endDate: "2025-12-31",
    frequency: "annual",
    originalUnit: "Index level, total return",
    normalisedUnit: "$ value of a $1,000 position, dividends reinvested",
    currency: "USD",
    geography: "United States",
    licence: "Cited with attribution",
    adjustments: "Gross total return: no fund fees, tax or tracking error.",
    missingData: "None. The 2025 value is provisional.",
    confidence: "verified",
  },

  "bls-fafh-cpi": {
    id: "bls-fafh-cpi",
    shortPublisher: "US BLS",
    publisher: "U.S. Bureau of Labor Statistics",
    title: "CPI for all urban consumers, food away from home — annual average, 1982–84 = 100",
    sourceUrl: "https://www.bls.gov/cpi/",
    retrievedOn: SNAPSHOT_DATE,
    startDate: "1994-01-01",
    endDate: "2025-12-31",
    frequency: "annual",
    originalUnit: "Index, 1982–84 = 100",
    normalisedUnit: "Index, 1982–84 = 100",
    currency: "USD",
    geography: "United States (urban)",
    licence: "Public domain (US federal statistics)",
    adjustments:
      "Restaurant inflation, not headline CPI. It is the right deflator for a menu price and it has run consistently hotter than all-items CPI.",
    missingData: "None. The 2025 average is provisional.",
    confidence: "verified",
  },

  "us-premium-shake-menus": {
    id: "us-premium-shake-menus",
    shortPublisher: "Menu archive survey",
    publisher: "Duku Design menu-archive survey",
    title: "Premium restaurant milkshake — US menu survey, $ per shake",
    sourceUrl: "https://www.bls.gov/cpi/",
    retrievedOn: SNAPSHOT_DATE,
    startDate: "1994-01-01",
    endDate: "2025-12-31",
    frequency: "annual",
    originalUnit: "$ per milkshake, individual restaurant menus",
    normalisedUnit: "$ per premium restaurant milkshake, US mean",
    currency: "USD",
    geography: "United States",
    licence: "Compiled from archived menus, cited with attribution",
    adjustments:
      "The 1994 anchor is the film's own on-screen price, which is unusual: most indices have to infer the base value, this one is stated in dialogue. Later years are a mean of archived diner and premium-restaurant menu prices, excluding tax and tip.",
    missingData:
      "Menu archives are patchy. Odd years are interpolated from adjacent surveyed years and flagged on the chart.",
    confidence: "reconstructed",
  },

  "bls-median-weekly-earnings": {
    id: "bls-median-weekly-earnings",
    shortPublisher: "US BLS",
    publisher: "U.S. Bureau of Labor Statistics, Current Population Survey",
    title: "Median usual weekly earnings, full-time wage and salary workers — monthly equivalent, $",
    sourceUrl: "https://www.bls.gov/cps/",
    retrievedOn: SNAPSHOT_DATE,
    startDate: "1994-01-01",
    endDate: "2025-12-31",
    frequency: "annual",
    originalUnit: "$ per week, median, current dollars",
    normalisedUnit: "$ per month (weekly × 52 ÷ 12)",
    currency: "USD",
    geography: "United States",
    licence: "Public domain (US federal statistics)",
    adjustments:
      "Full-time workers only, so it excludes the part-time and tipped workforce most exposed to restaurant prices. Work-time conversions assume a 40-hour week.",
    missingData: "Odd years interpolated. The 2025 value is provisional.",
    confidence: "verified",
  },

  "mcdonalds-qpc-us": {
    id: "mcdonalds-qpc-us",
    shortPublisher: "Menu archive survey",
    publisher: "Duku Design menu-archive survey / The Economist Big Mac Index",
    title: "McDonald's Quarter Pounder with Cheese — US menu price, $",
    sourceUrl: "https://www.economist.com/big-mac-index",
    retrievedOn: SNAPSHOT_DATE,
    startDate: "1994-01-01",
    endDate: "2025-12-31",
    frequency: "annual",
    originalUnit: "$ per burger, franchise menu boards",
    normalisedUnit: "$ per Quarter Pounder with Cheese, US national mean",
    currency: "USD",
    geography: "United States",
    licence: "Compiled from archived menus and published indices, cited with attribution",
    adjustments:
      "McDonald's prices are set by franchisees, so a national mean hides a wide urban/rural spread. Sales tax is excluded because it varies by state.",
    missingData: "Odd years interpolated between surveyed years.",
    confidence: "reconstructed",
  },

  "oecd-hourly-wages": {
    id: "oecd-hourly-wages",
    shortPublisher: "OECD / national statistics",
    publisher: "OECD Earnings Database and national statistical offices",
    title: "Median gross hourly earnings by country — local currency",
    sourceUrl: "https://data-explorer.oecd.org/",
    retrievedOn: SNAPSHOT_DATE,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    frequency: "annual",
    originalUnit: "Local currency per hour, median gross earnings",
    normalisedUnit: "Local currency per hour",
    currency: "Multiple",
    geography: "OECD member countries",
    licence: "Public statistics, cited with attribution",
    adjustments:
      "Gross of tax and social contributions. Take-home affordability would differ substantially between these countries, and in the opposite direction from the gross figures in several cases.",
    missingData: "Latest available year used where a country reports with a lag.",
    confidence: "reconstructed",
  },

  "dea-meth-price-purity": {
    id: "dea-meth-price-purity",
    shortPublisher: "DEA / UNODC",
    publisher: "US Drug Enforcement Administration price and purity reporting; UNODC World Drug Report",
    title: "Methamphetamine — reported price per gram and purity, United States",
    sourceUrl: "https://www.unodc.org/unodc/en/data-and-analysis/world-drug-report.html",
    retrievedOn: SNAPSHOT_DATE,
    startDate: "2007-01-01",
    endDate: "2024-12-31",
    frequency: "annual",
    originalUnit: "$ per gram and percentage purity, law-enforcement seizure and purchase records",
    normalisedUnit: "$ per pure gram (reported price ÷ purity)",
    currency: "USD",
    geography: "United States",
    licence: "Public institutional reporting, cited with attribution",
    adjustments:
      "Derived from law-enforcement purchase and seizure records, which are a sample of an unobservable market rather than a price index. Levels carry wide uncertainty; the direction of travel is the robust finding. Purity-adjustment is the standard method for making illicit prices comparable across years.",
    missingData:
      "Reporting is irregular and revised. Values are smoothed to annual means and every observation should be read as an order of magnitude.",
    confidence: "estimated",
  },

  "us-cpi-all-items": {
    id: "us-cpi-all-items",
    shortPublisher: "US BLS",
    publisher: "U.S. Bureau of Labor Statistics",
    title: "CPI for all urban consumers, all items — annual average, 1982–84 = 100",
    sourceUrl: "https://www.bls.gov/cpi/",
    retrievedOn: SNAPSHOT_DATE,
    startDate: "1994-01-01",
    endDate: "2025-12-31",
    frequency: "annual",
    originalUnit: "Index, 1982–84 = 100",
    normalisedUnit: "Index, 1982–84 = 100",
    currency: "USD",
    geography: "United States (urban)",
    licence: "Public domain (US federal statistics)",
    missingData: "None.",
    confidence: "verified",
  },
};

/* ==== series ========================================================== */

/** Shorthand for building an annual series from [year, value] pairs. */
function annual(
  id: string,
  datasetId: string,
  label: string,
  unit: string,
  rows: readonly (readonly [number, number] | readonly [number, number, "imputed" | "provisional"])[],
  extra: Partial<Series> = {}
): Series {
  return {
    id,
    datasetId,
    label,
    unit,
    observations: rows.map(([year, value, flag]) => ({
      year,
      value,
      ...(flag === "imputed" ? { imputed: true } : {}),
      ...(flag === "provisional" ? { provisional: true } : {}),
    })),
    ...extra,
  };
}

/**
 * One line of the desktop build. Every component series covers the same span
 * (2009–2025), comes from the same retail survey and is quoted in rupees, so
 * spelling that out eight times would only create eight chances to get it
 * wrong. The last year is provisional on every line, as it is on the total.
 */
function pcLine(
  id: string,
  label: string,
  values: readonly number[],
  unit = "₹ per build",
  normalisation?: string
): Series {
  const START = 2009;
  return annual(
    id,
    "india-desktop-components",
    label,
    unit,
    values.map((v, i) =>
      i === values.length - 1
        ? ([START + i, v, "provisional"] as const)
        : ([START + i, v] as const)
    ),
    { currency: "INR", ...(normalisation ? { normalisation } : {}) }
  );
}

export const SERIES: Record<string, Series> = {
  "gold-inr-10g": annual(
    "gold-inr-10g",
    "ibja-gold-inr",
    "Gold, 24 karat",
    "₹ per 10 g",
    [
      [1999, 4234],
      [2000, 4400],
      [2001, 4300],
      [2002, 4990],
      [2003, 5600],
      [2004, 5850],
      [2005, 7000],
      [2006, 8400],
      [2007, 10800],
      [2008, 12500],
      [2009, 14500],
      [2010, 18500],
      [2011, 26400],
      [2012, 31050],
      [2013, 29600],
      [2014, 28006],
      [2015, 26343],
      [2016, 28623],
      [2017, 29667],
      [2018, 31438],
      [2019, 35220],
      [2020, 48651],
      [2021, 48720],
      [2022, 52670],
      [2023, 65330],
      [2024, 77913],
      [2025, 101500, "provisional"],
    ],
    {
      currency: "INR",
      pricedUnit: "× 10 g of gold",
      normalisation: "Annual mean of the daily Mumbai standard-gold rate.",
    }
  ),

  "india-cpi": annual(
    "india-cpi",
    "india-cpi-spliced",
    "India CPI, all groups",
    "Index, 2012 = 100",
    [
      [1999, 43.2, "imputed"],
      [2000, 44.9, "imputed"],
      [2001, 46.6, "imputed"],
      [2002, 48.6, "imputed"],
      [2003, 50.4, "imputed"],
      [2004, 52.3, "imputed"],
      [2005, 54.5, "imputed"],
      [2006, 57.7, "imputed"],
      [2007, 61.4, "imputed"],
      [2008, 66.5, "imputed"],
      [2009, 73.8, "imputed"],
      [2010, 82.7, "imputed"],
      [2011, 91.4],
      [2012, 100.0],
      [2013, 110.2],
      [2014, 117.6],
      [2015, 121.7],
      [2016, 127.7],
      [2017, 131.9],
      [2018, 136.9],
      [2019, 142.1],
      [2020, 151.6],
      [2021, 159.2],
      [2022, 169.9],
      [2023, 179.3],
      [2024, 187.6],
      [2025, 194.5, "provisional"],
    ],
    { currency: "INR", normalisation: "CPI-IW growth chained onto the 2012 = 100 CPI-C base before 2011." }
  ),

  "india-food-cpi": annual(
    "india-food-cpi",
    "india-food-cpi",
    "India food CPI",
    "Index, 2012 = 100",
    [
      [2009, 73.0, "imputed"],
      [2010, 83.9, "imputed"],
      [2011, 90.1],
      [2012, 100.0],
      [2013, 112.5],
      [2014, 120.4],
      [2015, 125.0],
      [2016, 131.3],
      [2017, 134.0],
      [2018, 135.3],
      [2019, 141.3],
      [2020, 154.7],
      [2021, 162.0],
      [2022, 173.3],
      [2023, 187.0],
      [2024, 200.4],
      [2025, 207.6, "provisional"],
    ],
    { currency: "INR" }
  ),

  "india-income-monthly": annual(
    "india-income-monthly",
    "mospi-nni-percapita",
    "Per-capita net national income",
    "₹ per month",
    [
      [1999, 1391],
      [2000, 1462],
      [2001, 1545],
      [2002, 1616],
      [2003, 1760],
      [2004, 1918],
      [2005, 2244],
      [2006, 2551],
      [2007, 2926],
      [2008, 3325],
      [2009, 3821],
      [2010, 4470],
      [2011, 5107],
      [2012, 5674],
      [2013, 6377],
      [2014, 6988],
      [2015, 7591],
      [2016, 8368],
      [2017, 9146],
      [2018, 9958],
      [2019, 10746],
      [2020, 10399],
      [2021, 11255],
      [2022, 12842],
      [2023, 14396],
      [2024, 15741],
      [2025, 17075, "provisional"],
    ],
    { currency: "INR", normalisation: "Annual per-capita NNI at current prices ÷ 12." }
  ),

  "bhindi-delhi-kg": annual(
    "bhindi-delhi-kg",
    "doca-bhindi-delhi",
    "Bhindi (okra), Delhi retail",
    "₹ per kg",
    [
      [2009, 22],
      [2010, 25],
      [2011, 26],
      [2012, 28],
      [2013, 30, "imputed"],
      [2014, 32],
      [2015, 33],
      [2016, 35],
      [2017, 34],
      [2018, 36],
      [2019, 40],
      [2020, 44],
      [2021, 42],
      [2022, 45],
      [2023, 48],
      [2024, 52],
      [2025, 55, "provisional"],
    ],
    {
      currency: "INR",
      pricedUnit: "kg of bhindi",
      normalisation: "Annual mean of monthly means, Delhi centre only.",
    }
  ),

  "paneer-delhi-kg": annual(
    "paneer-delhi-kg",
    "doca-paneer-delhi",
    "Paneer, Delhi retail",
    "₹ per kg",
    [
      [2009, 160],
      [2010, 172],
      [2011, 186, "imputed"],
      [2012, 200],
      [2013, 214, "imputed"],
      [2014, 228],
      [2015, 240],
      [2016, 252],
      [2017, 262],
      [2018, 274],
      [2019, 290],
      [2020, 308],
      [2021, 318],
      [2022, 340],
      [2023, 368],
      [2024, 396],
      [2025, 420, "provisional"],
    ],
    { currency: "INR", pricedUnit: "kg of paneer" }
  ),

  "mlb-dollars-per-war": annual(
    "mlb-dollars-per-war",
    "fangraphs-dollars-per-war",
    "Free-agent cost per win above replacement",
    "$ millions per WAR",
    [
      [2002, 1.4],
      [2003, 1.7],
      [2004, 2.0],
      [2005, 2.4],
      [2006, 3.2],
      [2007, 3.9],
      [2008, 4.4],
      [2009, 4.4],
      [2010, 4.4],
      [2011, 4.5],
      [2012, 5.0],
      [2013, 5.6],
      [2014, 6.5],
      [2015, 7.2],
      [2016, 7.7],
      [2017, 8.0],
      [2018, 8.2],
      [2019, 8.0],
      [2021, 7.3],
      [2022, 7.6],
      [2023, 8.1],
      [2024, 8.6],
    ],
    {
      currency: "USD",
      pricedUnit: "wins above replacement",
      normalisation:
        "2020 omitted — a 60-game season has no comparable full-season price.",
    }
  ),

  "mlb-payroll-per-win": annual(
    "mlb-payroll-per-win",
    "mlb-payroll-per-win",
    "League-average payroll per win",
    "$ millions per win",
    [
      [2002, 0.83],
      [2003, 0.88],
      [2004, 0.87],
      [2005, 0.94],
      [2006, 1.06],
      [2007, 1.11],
      [2008, 1.17],
      [2009, 1.17],
      [2010, 1.2],
      [2011, 1.24],
      [2012, 1.32],
      [2013, 1.41],
      [2014, 1.51],
      [2015, 1.6],
      [2016, 1.66],
      [2017, 1.72],
      [2018, 1.72],
      [2019, 1.76],
      [2021, 1.72],
      [2022, 1.83],
      [2023, 1.9],
      [2024, 1.95],
    ],
    { currency: "USD", pricedUnit: "wins" }
  ),

  "india-desktop-pc": annual(
    "india-desktop-pc",
    "india-desktop-components",
    "Mid-range desktop build, India",
    "\u20b9 per complete build",
    [
      [2009, 38000],
      [2010, 36500],
      [2011, 35000],
      [2012, 34000],
      [2013, 35500],
      [2014, 36500],
      [2015, 37000],
      [2016, 38500],
      [2017, 42000],
      [2018, 46000],
      [2019, 44000],
      [2020, 48000],
      [2021, 58000],
      [2022, 56000],
      [2023, 52000],
      [2024, 58000],
      [2025, 62000, "provisional"],
    ],
    { currency: "INR", pricedUnit: "builds" }
  ),

  /* --- the desktop build, line by line ------------------------------------
   *
   * Eight lines, 2009–2025, in the same order they appear on an invoice. They
   * sum exactly to `india-desktop-pc` in every year — a bill of materials that
   * did not reconcile with its own total would be worse than no bill at all.
   *
   * The 2025 figures are where this stops being a routine technology series.
   * Memory and storage are 19% of the build and 58% of everything the build
   * gained between 2023 and 2025.
   */

  "pc-cpu": pcLine("pc-cpu", "Processor", [
    7500, 7300, 7050, 6750, 7050, 7400, 7350, 7650, 7950, 8700, 9150, 9900,
    11000, 11450, 10850, 11750, 11550,
  ]),
  "pc-motherboard": pcLine("pc-motherboard", "Motherboard", [
    3600, 3500, 3350, 3200, 3400, 3550, 3600, 3800, 4050, 4500, 4750, 5250,
    6150, 6500, 6700, 7950, 8100,
  ]),
  "pc-memory": pcLine("pc-memory", "Memory", [
    2100, 1950, 2000, 1700, 1900, 2000, 2550, 2650, 3900, 4700, 3100, 2800,
    4600, 4050, 2950, 3800, 6650,
  ]),
  "pc-graphics": pcLine("pc-graphics", "Graphics", [
    4500, 4350, 4250, 4050, 4350, 4450, 4500, 4800, 6300, 7400, 6050, 7150,
    12300, 10100, 8000, 8850, 9000,
  ]),
  "pc-storage": pcLine("pc-storage", "Storage", [
    2800, 2600, 2400, 3200, 2900, 2700, 2650, 2800, 3050, 3350, 3200, 3500,
    3800, 3600, 3200, 3900, 5300,
  ]),
  "pc-power-case": pcLine("pc-power-case", "Power supply and cabinet", [
    3000, 2950, 2900, 2850, 3000, 3100, 3100, 3250, 3250, 3350, 3500, 3750,
    4150, 4300, 4450, 4800, 4700,
  ]),
  "pc-display": pcLine("pc-display", "Display", [
    8000, 7400, 6750, 6250, 6550, 6750, 6750, 6950, 6900, 7150, 7250, 7900,
    8100, 7900, 7650, 8300, 8100,
  ]),
  "pc-os-peripherals": pcLine("pc-os-peripherals", "Operating system and peripherals", [
    6500, 6450, 6300, 6000, 6350, 6550, 6500, 6600, 6600, 6850, 7000, 7750,
    7900, 8100, 8200, 8650, 8600,
  ]),

  /* Installed capacity. Price per gigabyte is derived from these and the line
   * price above, never stored — the module price and the price of a gigabyte
   * are the whole argument here and they must not be able to disagree. */

  "pc-memory-gb": pcLine(
    "pc-memory-gb",
    "Memory installed",
    [2, 2, 4, 4, 4, 4, 8, 8, 8, 8, 8, 8, 16, 16, 16, 16, 16],
    "GB",
    "What a mid-range build shipped with: 2 GB in 2009, 4 GB from 2011, 8 GB from 2015, 16 GB from 2021. Capacity moves in steps, so price per gigabyte drops sharply in a step year for reasons that have nothing to do with the memory market."
  ),
  "pc-storage-gb": pcLine(
    "pc-storage-gb",
    "Storage installed",
    [500, 500, 500, 500, 500, 1000, 1000, 1000, 1000, 1000, 1000, 512, 512, 1000, 1000, 1000, 1000],
    "GB",
    "The 2020 drop is a technology substitution, not a shortage: the build moved from a 1 TB spinning disk to a 512 GB solid-state drive, giving up half the capacity for roughly a hundredfold improvement in seek time. Price per gigabyte rises when that happens and the machine still got better."
  ),

  /* Global contract prices, rebased. Context for the retail lines above. */

  "dram-contract-index": annual(
    "dram-contract-index",
    "dram-nand-contract",
    "DRAM contract price",
    "Index, 2009 = 100",
    [
      [2009, 100],
      [2010, 96],
      [2011, 62],
      [2012, 48],
      [2013, 66],
      [2014, 74],
      [2015, 58],
      [2016, 47],
      [2017, 82],
      [2018, 104],
      [2019, 61],
      [2020, 54],
      [2021, 66],
      [2022, 52],
      [2023, 34],
      [2024, 52],
      [2025, 118, "provisional"],
    ]
  ),
  "nand-contract-index": annual(
    "nand-contract-index",
    "dram-nand-contract",
    "NAND flash contract price",
    "Index, 2009 = 100",
    [
      [2009, 100],
      [2010, 82],
      [2011, 64],
      [2012, 47],
      [2013, 40],
      [2014, 33],
      [2015, 27],
      [2016, 24],
      [2017, 29],
      [2018, 24],
      [2019, 16],
      [2020, 15],
      [2021, 17],
      [2022, 13],
      [2023, 9],
      [2024, 13],
      [2025, 21, "provisional"],
    ]
  ),

  "delhi-plot-sqyd": annual(
    "delhi-plot-sqyd",
    "delhi-ncr-plot-rates",
    "Residential plot rate, Delhi NCR",
    "\u20b9 per sq yard",
    [
      [2006, 12000],
      [2007, 15500],
      [2008, 17000],
      [2009, 16000],
      [2010, 21000],
      [2011, 27000],
      [2012, 33000],
      [2013, 38000],
      [2014, 42000],
      [2015, 44000],
      [2016, 45000],
      [2017, 46000],
      [2018, 48000],
      [2019, 50000],
      [2020, 49000],
      [2021, 54000],
      [2022, 62000],
      [2023, 72000],
      [2024, 84000],
      [2025, 95000, "provisional"],
    ],
    { currency: "INR", pricedUnit: "sq yards" }
  ),

  "apple-1000": annual(
    "apple-1000",
    "apple-total-return",
    "Apple, $1,000 invested in 1994",
    "$ value of the position",
    [
      [1994, 1000],
      [1995, 900],
      [1996, 600],
      [1997, 500],
      [1998, 1100],
      [1999, 2900],
      [2000, 800],
      [2001, 900],
      [2002, 700],
      [2003, 1000],
      [2004, 3000],
      [2005, 6000],
      [2006, 7500],
      [2007, 17000],
      [2008, 8000],
      [2009, 18000],
      [2010, 30000],
      [2011, 37000],
      [2012, 50000],
      [2013, 52000],
      [2014, 88000],
      [2015, 90000],
      [2016, 105000],
      [2017, 155000],
      [2018, 145000],
      [2019, 275000],
      [2020, 470000],
      [2021, 640000],
      [2022, 500000],
      [2023, 700000],
      [2024, 880000],
      [2025, 1020000, "provisional"],
    ],
    { currency: "USD", pricedUnit: "positions" }
  ),

  "sp500-1000": annual(
    "sp500-1000",
    "sp500-total-return",
    "S&P 500, $1,000 invested in 1994",
    "$ value of the position",
    [
      [1994, 1000],
      [1995, 1370],
      [1996, 1680],
      [1997, 2240],
      [1998, 2880],
      [1999, 3480],
      [2000, 3160],
      [2001, 2790],
      [2002, 2170],
      [2003, 2790],
      [2004, 3090],
      [2005, 3240],
      [2006, 3760],
      [2007, 3960],
      [2008, 2500],
      [2009, 3160],
      [2010, 3640],
      [2011, 3710],
      [2012, 4310],
      [2013, 5700],
      [2014, 6480],
      [2015, 6570],
      [2016, 7350],
      [2017, 8960],
      [2018, 8560],
      [2019, 11260],
      [2020, 13330],
      [2021, 17150],
      [2022, 14040],
      [2023, 17720],
      [2024, 22150],
      [2025, 24800, "provisional"],
    ],
    { currency: "USD", pricedUnit: "positions" }
  ),

  "us-fafh-cpi": annual(
    "us-fafh-cpi",
    "bls-fafh-cpi",
    "US restaurant CPI (food away from home)",
    "Index, 1982\u201384 = 100",
    [
      [1994, 145.3],
      [1995, 149.0],
      [1996, 152.7],
      [1997, 157.0],
      [1998, 161.1],
      [1999, 165.1],
      [2000, 169.0],
      [2001, 173.9],
      [2002, 178.3],
      [2003, 182.1],
      [2004, 187.5],
      [2005, 193.4],
      [2006, 199.4],
      [2007, 206.7],
      [2008, 215.8],
      [2009, 223.3],
      [2010, 226.1],
      [2011, 231.3],
      [2012, 237.9],
      [2013, 243.1],
      [2014, 248.4],
      [2015, 254.9],
      [2016, 261.6],
      [2017, 267.4],
      [2018, 273.1],
      [2019, 281.8],
      [2020, 291.4],
      [2021, 303.5],
      [2022, 328.6],
      [2023, 354.1],
      [2024, 369.6],
      [2025, 383.0, "provisional"],
    ],
    { currency: "USD" }
  ),

  "us-median-monthly-earnings": annual(
    "us-median-monthly-earnings",
    "bls-median-weekly-earnings",
    "US median earnings, full-time workers",
    "$ per month",
    [
      [1994, 2024],
      [1995, 2068],
      [1996, 2113],
      [1997, 2187],
      [1998, 2261],
      [1999, 2330],
      [2000, 2400],
      [2001, 2473],
      [2002, 2547],
      [2003, 2597],
      [2004, 2647],
      [2005, 2705],
      [2006, 2764],
      [2007, 2835],
      [2008, 2907],
      [2009, 2983],
      [2010, 3060],
      [2011, 3096],
      [2012, 3133],
      [2013, 3183],
      [2014, 3234],
      [2015, 3318],
      [2016, 3403],
      [2017, 3485],
      [2018, 3567],
      [2019, 3763],
      [2020, 3960],
      [2021, 4092],
      [2022, 4225],
      [2023, 4433],
      [2024, 4642],
      [2025, 4810, "provisional"],
    ],
    { currency: "USD" }
  ),

  "us-premium-shake": annual(
    "us-premium-shake",
    "us-premium-shake-menus",
    "Premium restaurant milkshake, US",
    "$ per shake",
    [
      [1994, 5.0],
      [1995, 5.13, "imputed"],
      [1996, 5.25],
      [1997, 5.38, "imputed"],
      [1998, 5.5],
      [1999, 5.63, "imputed"],
      [2000, 5.75],
      [2001, 5.88, "imputed"],
      [2002, 6.0],
      [2003, 6.13, "imputed"],
      [2004, 6.25],
      [2005, 6.5, "imputed"],
      [2006, 6.75],
      [2007, 7.0, "imputed"],
      [2008, 7.25],
      [2009, 7.38, "imputed"],
      [2010, 7.5],
      [2011, 7.73, "imputed"],
      [2012, 7.95],
      [2013, 8.23, "imputed"],
      [2014, 8.5],
      [2015, 8.75, "imputed"],
      [2016, 9.0],
      [2017, 9.25, "imputed"],
      [2018, 9.5],
      [2019, 9.75, "imputed"],
      [2020, 10.0],
      [2021, 10.75, "imputed"],
      [2022, 11.5],
      [2023, 12.13, "imputed"],
      [2024, 12.75],
      [2025, 13.25, "provisional"],
    ],
    { currency: "USD", pricedUnit: "shakes" }
  ),

  "us-qpc-price": annual(
    "us-qpc-price",
    "mcdonalds-qpc-us",
    "Quarter Pounder with Cheese, US",
    "$ per burger",
    [
      [1994, 2.15],
      [1995, 2.22, "imputed"],
      [1996, 2.29],
      [1997, 2.37, "imputed"],
      [1998, 2.45],
      [1999, 2.52, "imputed"],
      [2000, 2.59],
      [2001, 2.64, "imputed"],
      [2002, 2.69],
      [2003, 2.79, "imputed"],
      [2004, 2.89],
      [2005, 2.99, "imputed"],
      [2006, 3.09],
      [2007, 3.24, "imputed"],
      [2008, 3.39],
      [2009, 3.49, "imputed"],
      [2010, 3.59],
      [2011, 3.69, "imputed"],
      [2012, 3.79],
      [2013, 3.94, "imputed"],
      [2014, 4.09],
      [2015, 4.24, "imputed"],
      [2016, 4.39],
      [2017, 4.59, "imputed"],
      [2018, 4.79],
      [2019, 4.89, "imputed"],
      [2020, 4.99],
      [2021, 5.29, "imputed"],
      [2022, 5.59],
      [2023, 5.84, "imputed"],
      [2024, 6.09],
      [2025, 6.29, "provisional"],
    ],
    { currency: "USD", pricedUnit: "burgers" }
  ),

  "meth-price-per-pure-gram": annual(
    "meth-price-per-pure-gram",
    "dea-meth-price-purity",
    "Price per pure gram",
    "$ per pure gram",
    [
      [2007, 270],
      [2008, 190],
      [2009, 130],
      [2010, 105],
      [2011, 90],
      [2012, 75],
      [2013, 65],
      [2014, 60],
      [2015, 55],
      [2016, 55],
      [2017, 50],
      [2018, 45],
      [2019, 40],
      [2020, 45],
      [2021, 40],
      [2022, 35],
      [2023, 32],
      [2024, 30, "provisional"],
    ],
    {
      currency: "USD",
      pricedUnit: "pure grams",
      normalisation: "Reported price per gram divided by reported purity.",
    }
  ),

  "meth-price-per-gram": annual(
    "meth-price-per-gram",
    "dea-meth-price-purity",
    "Reported price per gram, unadjusted",
    "$ per gram",
    [
      [2007, 105],
      [2008, 105],
      [2009, 91],
      [2010, 82],
      [2011, 77],
      [2012, 68],
      [2013, 60],
      [2014, 56],
      [2015, 52],
      [2016, 52],
      [2017, 48],
      [2018, 43],
      [2019, 39],
      [2020, 43],
      [2021, 39],
      [2022, 34],
      [2023, 31],
      [2024, 29, "provisional"],
    ],
    { currency: "USD", pricedUnit: "grams" }
  ),

  "us-cpi": annual(
    "us-cpi",
    "us-cpi-all-items",
    "US CPI, all items",
    "Index, 1982–84 = 100",
    [
      [1994, 148.2],
      [1995, 152.4],
      [1996, 156.9],
      [1997, 160.5],
      [1998, 163.0],
      [1999, 166.6],
      [2000, 172.2],
      [2001, 177.1],
      [2002, 179.9],
      [2003, 184.0],
      [2004, 188.9],
      [2005, 195.3],
      [2006, 201.6],
      [2007, 207.3],
      [2008, 215.3],
      [2009, 214.5],
      [2010, 218.1],
      [2011, 224.9],
      [2012, 229.6],
      [2013, 233.0],
      [2014, 236.7],
      [2015, 237.0],
      [2016, 240.0],
      [2017, 245.1],
      [2018, 251.1],
      [2019, 255.7],
      [2021, 271.0],
      [2022, 292.7],
      [2023, 304.7],
      [2024, 313.7],
      [2025, 322.1, "provisional"],
    ],
    { currency: "USD" }
  ),
};

/* ==== indices ========================================================= */

/** Grams in one Indian tola — the conversion the whole gold index rests on. */
export const GRAMS_PER_TOLA = 11.6638;

export const INDICES: PopIndex[] = [
  {
    id: "sanju-baba-50-tola",
    slug: "sanju-baba-50-tola",
    name: "Sanju Baba 50 Tola Index",
    shortName: "Sanju Baba Index",
    subtitle: "The market value of the most famous gold chain in Hindi cinema.",
    status: "live",

    film: "Vaastav",
    releaseYear: 1999,
    character: "Raghunath “Raghu” Namdev Shivalkar",
    scene: "The chain is specified by weight, in three syllables, as a statement of arrival.",
    dialogue: "50 tola.",
    dialogueVerified: true,

    indexedUnit: "50 Indian tolas of 24-karat gold",
    quantity: 50,
    quantityUnit: "tola",
    reveal: "50 tolas = 583.19 grams of 24-karat gold.",

    baseYear: 1999,
    baseYearNote:
      "Theatrical release year of Vaastav. The chain is not dated in the film, so the release year is used as the anchor.",

    geography: "India",
    currency: "INR",
    currencySymbol: "₹",
    priceSeriesId: "gold-inr-10g",
    cpiSeriesId: "india-cpi",
    incomeSeriesId: "india-income-monthly",
    benchmarks: [
      {
        seriesId: "india-cpi",
        label: "India CPI, all groups",
        rationale:
          "Separates the part of the increase that is just money losing value from the part that is gold actually appreciating.",
      },
      {
        seriesId: "india-income-monthly",
        label: "Per-capita net national income",
        rationale:
          "Price alone does not answer whether the chain got harder to buy. Months of income does.",
      },
    ],
    unitFactor: (50 * GRAMS_PER_TOLA) / 10,
    unitFactorNote:
      "50 tolas × 11.6638 g = 583.19 g = 58.319 units of 10 g, the unit the gold series is quoted in.",
    equation: [
      {
        expression: "50 tola",
        result: "the quantity named in the scene",
        note: "The tola is a traditional Indian unit, standardised at 11.6638 grams.",
      },
      {
        expression: "50 × 11.6638 g",
        result: "583.19 g",
        note: "Conversion to grams. This constant is fixed, not estimated.",
      },
      {
        expression: "583.19 ÷ 10",
        result: "58.319 units of 10 g",
        note: "The Indian gold series is quoted per 10 grams, so the quantity is restated in that unit.",
      },
      {
        expression: "58.319 × ₹4,234",
        result: "value at release, 1999",
        note: "1999 annual average price of 24-karat gold per 10 g.",
        datasetId: "ibja-gold-inr",
      },
      {
        expression: "58.319 × ₹1,01,500",
        result: "value at last verified date",
        note: "2025 average price per 10 g. Provisional until the final calendar-year figure publishes.",
        datasetId: "ibja-gold-inr",
      },
    ],
    events: [
      { year: 2008, label: "Global financial crisis" },
      { year: 2011, label: "Post-crisis gold peak" },
      { year: 2013, label: "Import duty raised to 10%" },
      { year: 2020, label: "Pandemic safe-haven bid" },
      { year: 2025, label: "Record run" },
    ],

    category: "commodity",
    motif: "rings",
    confidence: "verified",
    accent: { light: "hsl(38 62% 38%)", dark: "hsl(41 74% 58%)" },
    remark:
      "The dialogue lasted four seconds. The asset outperformed most portfolios for the next twenty-six years.",
    interpretation: [
      "The nominal figure is the least interesting number on this page. Gold in rupees rose roughly twenty-four-fold, but the rupee itself lost about four-fifths of its purchasing power over the same period — so a large share of the increase is currency, not metal.",
      "Strip inflation out and the chain still appreciated substantially in real terms. That is the part that makes it an investment rather than a store of nostalgia.",
      "Affordability is where the chain genuinely ran away. Gold rose roughly twenty-four-fold; per-capita income rose about twelve-fold. Measured in months of average income, the chain costs close to twice what it cost in 1999 — the one reading in which it is unambiguously further out of reach than it was on screen.",
    ],
    drivers: [
      {
        title: "Rupee depreciation",
        detail:
          "Gold is priced globally in dollars. The rupee moved from roughly 43 to the dollar in 1999 to the high 80s, which raises the domestic price before world gold moves at all.",
      },
      {
        title: "World gold price",
        detail:
          "Two distinct global bull runs — 2005–2011 and 2019 onwards — account for most of the dollar-side appreciation.",
      },
      {
        title: "Import duty and GST",
        detail:
          "India imports nearly all of its gold. Duty rose to 10% in 2013 and has been cut and restored since; each change steps the domestic price relative to the world price.",
      },
      {
        title: "Investment demand",
        detail:
          "ETFs, sovereign gold bonds and digital gold turned a jewellery market into a portfolio allocation, adding a bid that did not exist in 1999.",
      },
    ],
    caveats: [
      "This is metal value only. A real 583-gram chain would bill 8–15% higher once making charges and GST are added, and would not resell at par.",
      "The film never states the purity. 24 karat is assumed because the weight is quoted in tolas, the convention for investment-grade gold.",
      "Per-capita NNI is a national average across the whole population. It is a direction of travel, not a Mumbai salary.",
    ],
    datasetIds: ["ibja-gold-inr", "india-cpi-spliced", "mospi-nni-percapita"],
  },

  {
    id: "raju-ki-mummy-bhindi",
    slug: "raju-ki-mummy-bhindi",
    name: "Raju Ki Mummy Bhindi Index",
    shortName: "Raju Ki Mummy Index",
    subtitle:
      "The price history of one kilogram of the vegetable that briefly summarised household economics.",
    status: "live",

    film: "3 Idiots",
    releaseYear: 2009,
    character: "Raju Rastogi's mother",
    scene:
      "A household budget delivered at volume, in a single line about the price of a vegetable.",
    dialogue: "Bhindi bara rupaye kilo ho gayi hai.",
    dialogueGloss: "“Bhindi has gone to twelve rupees a kilo.”",
    dialogueVerified: false,

    indexedUnit: "One kilogram of bhindi (okra), Delhi retail",
    quantity: 1,
    quantityUnit: "kg",
    reveal: "One kilogram of bhindi, quoted at Delhi retail.",

    baseYear: 2009,
    baseYearNote:
      "Theatrical release year of 3 Idiots. The film's ₹12 is treated as dialogue, not as an observation — the index is built on the recorded Delhi retail series.",

    geography: "Delhi",
    currency: "INR",
    currencySymbol: "₹",
    priceSeriesId: "bhindi-delhi-kg",
    comparisonSeriesId: "paneer-delhi-kg",
    cpiSeriesId: "india-cpi",
    incomeSeriesId: "india-income-monthly",
    benchmarks: [
      {
        seriesId: "india-food-cpi",
        label: "India food CPI",
        rationale:
          "The right question is not whether bhindi got dearer but whether it outran food inflation generally.",
      },
      {
        seriesId: "india-cpi",
        label: "India CPI, all groups",
        rationale: "Headline inflation, as the benchmark a household actually feels.",
      },
      {
        seriesId: "india-income-monthly",
        label: "Per-capita net national income",
        rationale: "Whether the weekly vegetable bill grew faster than the money paying it.",
      },
    ],
    unitFactor: 1,
    unitFactorNote: "The series is already quoted per kilogram. No conversion is applied.",
    equation: [
      {
        expression: "1 kg bhindi",
        result: "the unit named in the scene",
        note: "Quantity is not stated in the dialogue; one kilogram is the unit the retail series is quoted in.",
      },
      {
        expression: "1 × ₹22",
        result: "value in 2009",
        note: "Delhi retail annual average, the film's release year.",
        datasetId: "doca-bhindi-delhi",
      },
      {
        expression: "1 × ₹55",
        result: "value at last verified date",
        note: "2025 Delhi retail annual average. Provisional.",
        datasetId: "doca-bhindi-delhi",
      },
      {
        expression: "₹55 ÷ ₹22",
        result: "the multiple, compared against food CPI over the same years",
        note: "The comparison is the index. The price on its own says very little.",
        datasetId: "india-food-cpi",
      },
    ],
    events: [
      { year: 2013, label: "Vegetable price spike" },
      { year: 2020, label: "Pandemic supply disruption" },
      { year: 2023, label: "Erratic monsoon" },
    ],

    category: "food-inflation",
    motif: "columns",
    confidence: "reconstructed",
    accent: { light: "hsl(142 48% 32%)", dark: "hsl(142 52% 54%)" },
    remark:
      "She was presented as dramatic. On the direction of travel she was right — she simply picked the wrong vegetable to be right about.",
    interpretation: [
      "Bhindi roughly two-and-a-half-folded between 2009 and 2025. Food prices generally rose faster — the food CPI is up nearer to two-and-four-fifths — so the vegetable she named was not the outlier. It slightly underperformed the basket it belongs to.",
      "Deflate the series by headline CPI and bhindi is close to flat, marginally cheaper in real terms than it was when the film released. Against income it is clearly cheaper: per-capita income grew about four-and-a-half-fold over the same years, which is faster than either food line.",
      "So was she economically correct? On the direction, entirely. On the specific vegetable, less so — and the reason the complaint still lands is that an annual average erases the thing she was actually reacting to. Bhindi swings 40–60% inside a single year. Nobody experiences the annual mean; they experience the July print. That gap between a smooth series and a lived price is the most useful thing this index has to say.",
    ],
    drivers: [
      {
        title: "Seasonality, not trend",
        detail:
          "Bhindi swings 40–60% inside a single year. An annual average hides the months that actually generate the complaint at the vegetable cart.",
      },
      {
        title: "Weather shocks",
        detail:
          "Unseasonal rain compresses supply within days. The 2013 and 2023 steps in the series are monsoon events, not structural inflation.",
      },
      {
        title: "Mandi structure and freight",
        detail:
          "Retail price includes the APMC chain and transport. Diesel and mandi charges move the retail line without the farm-gate price moving at all.",
      },
      {
        title: "Household substitution",
        detail:
          "When one vegetable spikes, households switch. That substitution is why a single-vegetable index reads differently from a food basket.",
      },
    ],
    caveats: [
      "The exact wording of the line is not yet verified against the film or authorised subtitles. It is marked unverified on this page until it is.",
      "The film's ₹12 is a screenwriter's number. Recorded Delhi retail bhindi in 2009 averaged higher, which is itself a finding rather than a problem.",
      "One city, retail only. Mumbai wholesale and all-India CPI quotations are deliberately not spliced into this series.",
      "Bhindi is seasonal enough that any annual figure is a summary of a wide range. The seasonal band is shown on the chart rather than smoothed away.",
    ],
    datasetIds: [
      "doca-bhindi-delhi",
      "doca-paneer-delhi",
      "india-food-cpi",
      "india-cpi-spliced",
      "mospi-nni-percapita",
    ],
  },

  {
    id: "moneyball-player-value",
    slug: "moneyball-player-value",
    name: "Moneyball Player Price Index",
    shortName: "Moneyball Index",
    subtitle: "What baseball pays for measurable performance.",
    status: "live",

    film: "Moneyball",
    releaseYear: 2011,
    character: "Billy Beane",
    scene:
      "A front office stops buying players and starts buying runs, on the grounds that runs are cheaper.",
    dialogue: "We're not buying players. We're buying wins.",
    dialogueVerified: false,

    indexedUnit: "One win above replacement, at free-agent market price",
    quantity: 1,
    quantityUnit: "WAR",
    reveal: "One win above replacement, at the free-agent market price of the day.",

    baseYear: 2002,
    baseYearNote:
      "The 2002 Oakland Athletics season the film depicts — not the 2011 release year. The economics being measured are the 2002 market's.",

    geography: "United States (Major League Baseball)",
    currency: "USD",
    currencySymbol: "$",
    priceSeriesId: "mlb-dollars-per-war",
    comparisonSeriesId: "mlb-payroll-per-win",
    cpiSeriesId: "us-cpi",
    benchmarks: [
      {
        seriesId: "us-cpi",
        label: "US CPI, all items",
        rationale:
          "Baseball salaries have outrun general inflation by a wide margin. Without CPI the chart flatters the sport's spending.",
      },
    ],
    unitFactor: 1,
    unitFactorNote:
      "The series is already the price of one win. No conversion is applied; the currency unit is $ millions.",
    equation: [
      {
        expression: "1 WAR",
        result: "one win above a replacement-level player",
        note: "WAR is the film's thesis reduced to a single tradeable unit.",
      },
      {
        expression: "$1.4M per WAR",
        result: "free-agent price, 2002",
        note: "Estimated marginal cost of a win in the 2002 free-agent market.",
        datasetId: "fangraphs-dollars-per-war",
      },
      {
        expression: "$41.9M ÷ 103 wins",
        result: "$407K per win — Oakland, 2002",
        note: "What the inefficiency was actually worth: Oakland bought wins for roughly a third of the market rate.",
        datasetId: "mlb-payroll-per-win",
      },
      {
        expression: "$8.6M per WAR",
        result: "free-agent price, 2024",
        note: "The same unit, twenty-two years later.",
        datasetId: "fangraphs-dollars-per-war",
      },
    ],
    events: [
      { year: 2002, label: "Oakland's 103-win season" },
      { year: 2011, label: "Every front office now has analysts" },
      { year: 2020, label: "Season shortened — excluded" },
      { year: 2024, label: "Latest complete season" },
    ],

    category: "sports-economics",
    motif: "lattice",
    confidence: "reconstructed",
    accent: { light: "hsl(158 40% 30%)", dark: "hsl(152 44% 52%)" },
    remark:
      "Moneyball identified an inefficiency. Baseball responded by increasing its price.",
    interpretation: [
      "The price of a win rose roughly six-fold in nominal terms while US consumer prices rose about 75%. Almost the entire increase is real, which is unusual — most things that look like they are getting expensive are mostly just currency.",
      "This is what an arbitraged inefficiency looks like after the fact. Oakland's advantage in 2002 was not that on-base percentage created wins; it was that nobody else was bidding for it. Once every front office ran the same regression, the discount closed and the market repriced the input.",
      "The uncomfortable reading for the film's thesis: analytics did not make baseball cheaper to win. It made the cost of winning legible, and legible things get bid up to their value.",
    ],
    drivers: [
      {
        title: "Universal adoption",
        detail:
          "Thirty analytics departments competing for the same undervalued skill removes the discount that made the strategy work.",
      },
      {
        title: "Revenue growth",
        detail:
          "National and regional media rights multiplied league revenue. More money chasing the same fixed supply of wins raises the price per win.",
      },
      {
        title: "Fixed supply",
        detail:
          "There are exactly 2,430 games and roughly 2,430 wins a season, however much anyone spends. The supply curve is vertical, which is the whole story.",
      },
      {
        title: "Contract structure",
        detail:
          "Long deals, deferrals and pre-arbitration control mean posted payroll and true cost per win diverge — the cheapest wins in modern baseball are bought from the minor leagues, not the market.",
      },
    ],
    caveats: [
      "$/WAR is an analyst estimate of a marginal free-agent price, not a figure any club publishes. Levels vary between sources; the trend does not.",
      "The film's line is paraphrased and not yet checked against the shooting script or authorised subtitles.",
      "2020 is excluded rather than pro-rated. A 60-game season does not have a comparable full-season price of a win.",
      "Team payroll per win is a blunter instrument than $/WAR: it charges a club for wins it would have got from replacement-level players anyway.",
    ],
    datasetIds: [
      "fangraphs-dollars-per-war",
      "mlb-payroll-per-win",
      "us-cpi-all-items",
    ],
  },

  {
    id: "royale-with-cheese",
    slug: "royale-with-cheese",
    name: "Royale With Cheese Index",
    shortName: "Royale Index",
    subtitle: "What one identical burger costs when the economy around it changes.",
    status: "live",

    film: "Pulp Fiction",
    releaseYear: 1994,
    character: "Vincent Vega",
    scene:
      "A conversation about the metric system establishes, accidentally, the cleanest purchasing-power-parity unit in cinema.",
    dialogue: "They got the metric system, they wouldn't know what the hell a Quarter Pounder is.",
    dialogueVerified: false,

    indexedUnit: "One McDonald's Quarter Pounder with Cheese",
    quantity: 1,
    quantityUnit: "burger",
    reveal: "One Quarter Pounder with Cheese \u2014 the same burger, priced by eight different economies.",

    baseYear: 1994,
    baseYearNote:
      "Theatrical release year of Pulp Fiction. The burger is not priced in the film, so the base value comes from the 1994 US menu survey.",

    geography: "United States (with cross-country panel)",
    currency: "USD",
    currencySymbol: "$",
    priceSeriesId: "us-qpc-price",
    cpiSeriesId: "us-cpi",
    incomeSeriesId: "us-median-monthly-earnings",
    benchmarks: [
      {
        seriesId: "us-cpi",
        label: "US CPI, all items",
        rationale:
          "Fast food has outrun headline inflation for three decades. Without CPI the burger just looks like money getting smaller.",
      },
      {
        seriesId: "us-fafh-cpi",
        label: "US restaurant CPI",
        rationale:
          "The fair comparison: did this burger beat restaurant prices generally, or merely keep up with them?",
      },
      {
        seriesId: "us-median-monthly-earnings",
        label: "US median earnings",
        rationale:
          "The only reading a customer feels \u2014 whether a shift buys more burgers than it used to.",
      },
    ],
    unitFactor: 1,
    unitFactorNote:
      "One burger, one price. The whole point of the unit is that no conversion is needed \u2014 the product is held physically identical while currencies, taxes, wages and menu names change around it.",
    equation: [
      {
        expression: "1 Quarter Pounder with Cheese",
        result: "the fixed physical unit",
        note: "Same patty weight, same cheese, same bun, in every country on the panel.",
      },
      {
        expression: "1 \u00d7 $2.15",
        result: "US menu price, 1994",
        note: "National mean of franchise menu boards, excluding sales tax.",
        datasetId: "mcdonalds-qpc-us",
      },
      {
        expression: "1 \u00d7 $6.29",
        result: "US menu price at last verified date",
        note: "2025 national mean. Provisional.",
        datasetId: "mcdonalds-qpc-us",
      },
      {
        expression: "price \u00f7 median hourly wage \u00d7 60",
        result: "minutes of work per burger",
        note: "The affordability unit. It is the only figure on the panel that is comparable across countries without an exchange rate.",
        datasetId: "oecd-hourly-wages",
      },
      {
        expression: "local price \u00f7 US price",
        result: "implied purchasing-power exchange rate",
        note: "Compared against the market rate, this is the Big Mac Index method applied to a burger the film actually names.",
        datasetId: "oecd-hourly-wages",
      },
    ],
    events: [
      { year: 2008, label: "Financial crisis \u2014 value menu era" },
      { year: 2020, label: "Pandemic: menu repricing" },
      { year: 2022, label: "Beef and labour cost spike" },
    ],

    category: "purchasing-power-parity",
    motif: "grid",
    confidence: "reconstructed",
    accent: { light: "hsl(3 62% 42%)", dark: "hsl(6 76% 60%)" },
    remark:
      "The metric system changed the name. Taxes, wages and purchasing power changed everything else.",
    interpretation: [
      "The US price nearly tripled while headline CPI roughly doubled, so about a third of the increase is real. Fast food has been one of the more reliably above-inflation categories in the American basket, driven by beef, labour and rent rather than by anything about the burger.",
      "Against restaurant prices specifically the burger looks far more ordinary. It has broadly tracked food-away-from-home CPI, which is the honest reading: McDonald's did not get unusually expensive, eating out did.",
      "The cross-country panel is where the index earns its name. Switzerland has the most expensive burger in dollars and one of the cheapest in working minutes, because Swiss wages outrun Swiss prices. Japan has the opposite profile. That gap between a price and a wage is the entire content of purchasing-power parity, and a burger is a better teacher of it than an exchange-rate chart.",
    ],
    drivers: [
      {
        title: "Beef and dairy input costs",
        detail:
          "Two commodity cycles \u2014 2014 and 2021\u201323 \u2014 account for much of the step change. Beef is the single largest input in the unit.",
      },
      {
        title: "Restaurant labour",
        detail:
          "Minimum-wage increases in large states feed franchise menu boards directly, which is why the US mean hides a wide urban/rural spread.",
      },
      {
        title: "Tax treatment",
        detail:
          "European menu prices include VAT; US prices exclude sales tax. A naive currency comparison silently compares tax-inclusive with tax-exclusive prices.",
      },
      {
        title: "Local wage levels",
        detail:
          "The same burger costs 13 minutes of work in Australia and 20 in France. Neither figure has anything to do with the burger.",
      },
    ],
    caveats: [
      "The line is paraphrased from memory of the scene and is not yet checked against the shooting script or authorised subtitles.",
      "Franchisees set their own prices. A single national mean is a convenience, not an observation.",
      "European prices are VAT-inclusive and US prices are not. The panel labels this, but it makes the raw currency column less comparable than it looks.",
      "Wages are gross. Take-home affordability would reorder several countries on the panel.",
      "The Quarter Pounder is not sold in India at all \u2014 McDonald's India sells no beef. That is shown on the panel rather than substituted with a different product.",
    ],
    datasetIds: [
      "mcdonalds-qpc-us",
      "oecd-hourly-wages",
      "us-cpi-all-items",
      "bls-fafh-cpi",
      "bls-median-weekly-earnings",
    ],
  },

  {
    id: "vincent-vega-five-dollar-shake",
    slug: "vincent-vega-five-dollar-shake",
    name: "Vincent Vega Five-Dollar Shake Index",
    shortName: "Five-Dollar Shake",
    subtitle: "Whether the most famously overpriced milkshake in cinema is still overpriced.",
    status: "live",

    film: "Pulp Fiction",
    releaseYear: 1994,
    character: "Vincent Vega",
    scene:
      "A diner menu prices a milkshake at five dollars, and a man who is otherwise unshockable is shocked.",
    dialogue: "Did you just order a five-dollar shake?",
    dialogueVerified: false,

    indexedUnit: "One premium restaurant milkshake",
    quantity: 1,
    quantityUnit: "shake",
    reveal: "One premium restaurant milkshake \u2014 base value stated on screen, not inferred.",

    baseYear: 1994,
    baseYearNote:
      "Theatrical release year of Pulp Fiction. Unusually, the base value is not estimated: the film states the price. Five dollars is an observation.",

    geography: "United States",
    currency: "USD",
    currencySymbol: "$",
    priceSeriesId: "us-premium-shake",
    cpiSeriesId: "us-fafh-cpi",
    incomeSeriesId: "us-median-monthly-earnings",
    benchmarks: [
      {
        seriesId: "us-fafh-cpi",
        label: "US restaurant CPI",
        rationale:
          "A menu price should be deflated by menu inflation, not by headline CPI. This is the benchmark that decides the question.",
      },
      {
        seriesId: "us-cpi",
        label: "US CPI, all items",
        rationale:
          "Shown for contrast: restaurant prices have run consistently hotter than the general basket.",
      },
      {
        seriesId: "us-median-monthly-earnings",
        label: "US median earnings",
        rationale: "Whether the shake costs more working time than it used to.",
      },
    ],
    unitFactor: 1,
    unitFactorNote: "One shake, one price. No conversion is applied.",
    equation: [
      {
        expression: "$5.00, 1994",
        result: "the price stated in the scene",
        note: "The rare index whose base value is dialogue rather than a reconstruction.",
      },
      {
        expression: "$5.00 \u00d7 (383.0 \u00f7 145.3)",
        result: "$13.18 \u2014 the 1994 shake in 2025 restaurant money",
        note: "Restaurant CPI, not headline CPI. Deflating a menu price by the general basket would understate it.",
        datasetId: "bls-fafh-cpi",
      },
      {
        expression: "1 \u00d7 $13.25",
        result: "observed premium shake price, last verified",
        note: "2025 menu survey mean. Provisional.",
        datasetId: "us-premium-shake-menus",
      },
      {
        expression: "$13.25 \u2212 $13.18",
        result: "the real premium, thirty-one years later",
        note: "Close to nothing. That result is the index.",
      },
    ],
    events: [
      { year: 2008, label: "Financial crisis" },
      { year: 2020, label: "Pandemic menu repricing" },
      { year: 2022, label: "Restaurant inflation peak" },
    ],

    category: "restaurant-inflation",
    motif: "vessel",
    confidence: "reconstructed",
    accent: { light: "hsl(348 55% 45%)", dark: "hsl(350 70% 64%)" },
    remark:
      "No bourbon. No gold leaf. Just thirty-one years of restaurant inflation doing exactly what it says.",
    interpretation: [
      "The shake is up about 165% in nominal terms, which sounds like the answer until it is set against restaurant inflation over the same period. Food away from home rose by almost exactly the same multiple. In real terms the premium shake is within a rounding error of its 1994 price.",
      "That is the finding, and it is a more interesting one than a big percentage would have been: Vincent's outrage was correctly calibrated and remains correctly calibrated. A five-dollar shake in 1994 was a thirteen-dollar shake in the way that a thirteen-dollar shake is today \u2014 conspicuous, not insane.",
      "The affordability reading is where it turns. At median full-time earnings the shake costs slightly more working minutes than it did, but at the federal minimum wage \u2014 $4.25 in 1994, $7.25 and unchanged since 2009 \u2014 it has gone from roughly seventy minutes of work to well over ninety. The same menu price is a different object depending on which wage is buying it.",
    ],
    drivers: [
      {
        title: "Restaurant inflation, not food inflation",
        detail:
          "Menu prices carry rent, labour and table service. They have run persistently above grocery inflation, which is why the deflator choice decides the answer.",
      },
      {
        title: "Labour cost",
        detail:
          "Front-of-house wages are the fastest-moving line in a restaurant's cost base, and the least compressible.",
      },
      {
        title: "The premium segment pulled away",
        detail:
          "The category the film is pricing \u2014 a deliberately expensive shake in a themed restaurant \u2014 inflated faster than a fast-food shake. Positioning, not dairy.",
      },
      {
        title: "A frozen minimum wage",
        detail:
          "The federal floor has not moved since 2009. Any affordability reading against it diverges from one against median earnings.",
      },
    ],
    caveats: [
      "The quote is paraphrased and not yet verified against the film or authorised subtitles. The $5 price itself is on screen.",
      "\u201cPremium restaurant milkshake\u201d is a category, not a product. The menu survey behind it is a mean of archived prices with a wide spread.",
      "Odd years are interpolated between surveyed years and render dashed.",
      "Tax and tip are excluded, both of which have grown as a share of a US restaurant bill.",
    ],
    datasetIds: [
      "us-premium-shake-menus",
      "bls-fafh-cpi",
      "us-cpi-all-items",
      "bls-median-weekly-earnings",
    ],
  },

  {
    id: "walter-white-purity-premium",
    slug: "walter-white-purity-premium",
    name: "Walter White Purity Premium Index",
    shortName: "Purity Premium",
    subtitle:
      "What happened to the price of purity once an industrial supply chain arrived. Crime economics, from published enforcement data.",
    status: "live",

    film: "Breaking Bad",
    releaseYear: 2008,
    character: "Walter White",
    scene:
      "A chemistry teacher builds a premium brand in a market with no consumer protection, and prices it on purity.",
    dialogue: "This is glass-grade. You will not find any better than 99 percent.",
    dialogueVerified: false,

    indexedUnit: "One pure gram of methamphetamine, US wholesale-to-retail reporting",
    quantity: 1,
    quantityUnit: "pure gram",
    reveal:
      "One pure gram \u2014 reported price divided by reported purity, the standard way to make illicit prices comparable across years.",

    baseYear: 2008,
    baseYearNote:
      "First broadcast year of Breaking Bad, and the year the show's premium-purity premise was most nearly true of the real market.",

    geography: "United States",
    currency: "USD",
    currencySymbol: "$",
    priceSeriesId: "meth-price-per-pure-gram",
    comparisonSeriesId: "meth-price-per-gram",
    cpiSeriesId: "us-cpi",
    benchmarks: [
      {
        seriesId: "us-cpi",
        label: "US CPI, all items",
        rationale:
          "A falling nominal price falls further in real terms. Without CPI the collapse is understated.",
      },
    ],
    unitFactor: 1,
    unitFactorNote:
      "The series is already purity-adjusted. Dividing a reported price by reported purity is what makes a 2008 observation comparable with a 2024 one \u2014 without it, a purity change reads as a price change.",
    equation: [
      {
        expression: "reported price \u00f7 purity",
        result: "price per pure gram",
        note: "The adjustment the whole index rests on. Purity roughly doubled over the period, so unadjusted prices are not comparable across it.",
        datasetId: "dea-meth-price-purity",
      },
      {
        expression: "$105 \u00f7 0.55",
        result: "$190 per pure gram, 2008",
        note: "Reported price around 55% purity in the show's first broadcast year.",
        datasetId: "dea-meth-price-purity",
      },
      {
        expression: "$29 \u00f7 0.97",
        result: "$30 per pure gram, last verified",
        note: "By 2024 purity is high enough that the adjustment barely moves the number \u2014 which is itself the result.",
        datasetId: "dea-meth-price-purity",
      },
      {
        expression: "$190 \u2192 $30",
        result: "the purity premium, competed away",
        note: "Walter's product thesis was sound in 2008 and worthless by the mid-2010s.",
      },
    ],
    events: [
      { year: 2008, label: "Series premiere \u2014 purity ~55%" },
      { year: 2012, label: "Purity passes 90%" },
      { year: 2019, label: "Price per pure gram at a historic low" },
    ],

    category: "illicit-markets",
    motif: "spread",
    confidence: "estimated",
    accent: { light: "hsl(190 60% 34%)", dark: "hsl(187 72% 55%)" },
    remark:
      "The colour was fictional. The purity premium was real economics \u2014 and real economics is what removed it.",
    interpretation: [
      "Walter White's business model was a purity premium: a scarce high-quality product in a market with no way to verify quality. In 2008 that premium genuinely existed. Reported purity averaged around half, and a pure gram cost several times what an ordinary gram of powder did.",
      "It then disappeared almost completely. Purity rose past 90% and stayed there, while the price per pure gram fell by roughly five-sixths in nominal terms and close to nine-tenths in real terms. Industrial-scale production did to the purity premium exactly what analytics did to on-base percentage in the Moneyball index: made it universal, and therefore worthless as an edge.",
      "The public-policy reading is the uncomfortable one. Two decades of supply-side enforcement coincided with a product that became more potent and dramatically cheaper per unit of active substance. Whatever the enforcement achieved, it did not price this market upward.",
    ],
    drivers: [
      {
        title: "Industrial substitution",
        detail:
          "Small-scale production gave way to large synthesis routes with consistent output. Consistency is what destroys a quality premium.",
      },
      {
        title: "Precursor control cycles",
        detail:
          "Restrictions produce sharp, short price spikes \u2014 the 2007 peak is one \u2014 followed by adaptation and a resumed decline.",
      },
      {
        title: "Purity as the hidden variable",
        detail:
          "Unadjusted street prices fell by about two-thirds. Adjusted for purity they fell by far more. Most of the real decline is invisible without the adjustment.",
      },
      {
        title: "No brand mechanism",
        detail:
          "Illicit markets have no way to certify quality, so a reputation premium cannot be defended once supply is uniformly good.",
      },
    ],
    caveats: [
      "Confidence is Estimated, and deliberately so. These figures come from law-enforcement purchase and seizure records \u2014 a sample of an unobservable market, not a price index. Read the direction, not the level.",
      "The quote is paraphrased and not verified against the series or authorised subtitles.",
      "This index carries no affordability or income comparison. Framing an illicit drug as a household purchase would be both analytically wrong and editorially indefensible.",
      "Purity figures are averages across seizures of very different sizes and market levels. Wholesale and retail purity differ substantially.",
      "Nothing here describes production, procurement or distribution, and no such detail will be added. The index exists to explain a pricing mechanism, not a market.",
    ],
    datasetIds: ["dea-meth-price-purity", "us-cpi-all-items"],
  },

  {
    id: "rocket-singh-pc",
    slug: "rocket-singh-pc",
    name: "Rocket Singh PC Index",
    shortName: "Rocket Singh PC",
    subtitle: "What it costs to build an honest computer business.",
    status: "live",

    film: "Rocket Singh: Salesman of the Year",
    releaseYear: 2009,
    character: "Harpreet Singh Bedi",
    scene:
      "A salesman with no capital builds a computer company out of components and other people's trust.",
    dialogue: "Assembled. Component by component.",
    dialogueVerified: false,

    indexedUnit: "One mid-range desktop PC, assembled from parts",
    quantity: 1,
    quantityUnit: "build",
    reveal: "Eight lines on one invoice. Priced every year since the film.",

    baseYear: 2009,
    baseYearNote:
      "Release year of Rocket Singh. The film never prices a machine, so the base value is the 2009 mid-range build from the component survey.",

    geography: "India",
    currency: "INR",
    currencySymbol: "\u20b9",
    priceSeriesId: "india-desktop-pc",
    cpiSeriesId: "india-cpi",
    incomeSeriesId: "india-income-monthly",
    benchmarks: [
      {
        seriesId: "india-cpi",
        label: "India CPI, all groups",
        rationale:
          "The only benchmark that shows what actually happened. The price barely moved. Everything around it got more expensive.",
      },
      {
        seriesId: "india-income-monthly",
        label: "Per-capita net national income",
        rationale: "How many weeks of earnings a machine costs now against then.",
      },
    ],
    unitFactor: 1,
    unitFactorNote:
      "One build, one price. \u201cMid-range\u201d is held to a constant market position rather than a constant specification — pricing a 2009 machine in 2025 parts is not a comparison anyone would make.",
    equation: [
      {
        expression: "processor + motherboard + memory + graphics + storage",
        result: "the compute half",
        note: "Five lines that carry most of the price and almost all of the performance.",
        datasetId: "india-desktop-components",
      },
      {
        expression: "+ power and cabinet + display + operating system and peripherals",
        result: "the rest of the machine",
        note: "Three lines a first-time buyer forgets to budget for. In 2009 they were 46% of the bill.",
        datasetId: "india-desktop-components",
      },
      {
        expression: "= \u20b938,000",
        result: "a mid-range build in 2009",
        note: "Indian retail, assembled rather than branded.",
        datasetId: "india-desktop-components",
      },
      {
        expression: "= \u20b962,000",
        result: "a mid-range build at the last verified date",
        note: "2025. Provisional.",
        datasetId: "india-desktop-components",
      },
    ],
    events: [
      { year: 2013, label: "Rupee slides, imports dearer" },
      { year: 2018, label: "DRAM supercycle peaks" },
      { year: 2021, label: "Shortage: the worst year to build" },
      { year: 2023, label: "Memory bottoms out" },
      { year: 2025, label: "AI takes the memory" },
    ],

    bom: {
      lead: "The total is the least interesting number here. Eight lines, priced separately, moving in different directions — and for fifteen years they cancelled each other out.",
      components: [
        {
          id: "cpu",
          label: "Processor",
          baseSpec: "Dual core, 2.8 GHz",
          latestSpec: "Six cores, integrated graphics",
          seriesId: "pc-cpu",
          note: "The most expensive part in 2009 and still the most expensive part now, which is the only thing about this build that did not change.",
        },
        {
          id: "motherboard",
          label: "Motherboard",
          baseSpec: "Entry chipset, micro-ATX",
          latestSpec: "Current-socket B-series, micro-ATX",
          seriesId: "pc-motherboard",
          note: "Quietly the second-fastest riser. Power delivery, storage lanes and a memory generation the 2009 board could not have addressed.",
        },
        {
          id: "memory",
          label: "Memory",
          baseSpec: "2 GB DDR2",
          latestSpec: "16 GB DDR5",
          seriesId: "pc-memory",
          capacitySeriesId: "pc-memory-gb",
          note: "Eight times the capacity for three times the money — and then two years put the gigabyte back above where it sat in 2019.",
        },
        {
          id: "graphics",
          label: "Graphics",
          baseSpec: "Entry discrete card",
          latestSpec: "Entry discrete card",
          seriesId: "pc-graphics",
          note: "Two mining cycles and a shortage. The 2021 peak is the single largest one-year move in any line of this build.",
        },
        {
          id: "storage",
          label: "Storage",
          baseSpec: "500 GB spinning disk",
          latestSpec: "1 TB NVMe solid state",
          seriesId: "pc-storage",
          capacitySeriesId: "pc-storage-gb",
          note: "A different technology wearing the same line item. Per gigabyte it is 5% cheaper than in 2009 — sixteen years of storage progress spent almost entirely on speed rather than price.",
        },
        {
          id: "power-case",
          label: "Power supply and cabinet",
          baseSpec: "450 W, steel case",
          latestSpec: "550 W 80+, steel case",
          seriesId: "pc-power-case",
          note: "The dullest line on the invoice and the closest thing here to ordinary inflation.",
        },
        {
          id: "display",
          label: "Display",
          baseSpec: "18.5-inch TN, 1366 × 768",
          latestSpec: "24-inch IPS, 1920 × 1080",
          seriesId: "pc-display",
          note: "Flat in rupees across sixteen years while the panel got larger, sharper and better in every measurable way. The deflation everybody assumes happened to computers actually happened here.",
        },
        {
          id: "os-peripherals",
          label: "Operating system and peripherals",
          baseSpec: "OEM licence, keyboard, mouse",
          latestSpec: "OEM licence, keyboard, mouse",
          seriesId: "pc-os-peripherals",
          note: "Software is the one line with no supply chain, and it still went up by a third.",
        },
      ],
      shockWindow: [2023, 2025],
      shockNote:
        "Memory and storage are 19% of the build. Between 2023 and 2025 they were 58% of everything it gained.",
    },

    category: "consumer-goods",
    motif: "steps",
    confidence: "reconstructed",
    accent: { light: "hsl(215 68% 42%)", dark: "hsl(212 85% 64%)" },
    remark: "Harpreet sold computers. Moore's Law did the discounting.",
    interpretation: [
      "The price of a machine rose about two thirds in sixteen years. Indian prices rose about two and a half times over the same period. Deflate the build and it costs roughly a third less than it did — the only index here that gets cheaper in real terms while staying visibly more expensive on the shelf.",
      "Nothing about that figure captures what actually changed. A 2009 mid-range build had two cores, two gigabytes of memory and a spinning disk. The 2025 machine at the same market position has six cores, sixteen gigabytes and a solid-state drive that is roughly a hundred times faster to seek. The price held. The product did not.",
      "Take the total apart and it stops holding still. The display is flat in rupees across sixteen years while the panel got larger and sharper \u2014 that is the deflation everyone assumes happened to computers, and it happened to the monitor. The processor rose about half. The motherboard more than doubled. Memory tripled. Eight lines, eight directions, and for fifteen years they cancelled each other out.",
      "Then they stopped cancelling. Memory fell 82% per gigabyte between 2009 and 2023 and rose 125% in the two years after it. Storage did a smaller version of the same thing. Together they are 19% of this build and 58% of everything it gained since 2023. The part that spent a decade as the cheap decision is now the reason the machine costs more.",
      "The cause is not in the PC market at all. High-bandwidth memory for AI accelerators is made on the same wafers as the memory in a desktop and earns far more per wafer, so the manufacturers allocated accordingly. Nearline drives went the same way as data centres built out storage for training data. Harpreet's business was exposed to a market it had no visibility into and no way to hedge. That has not changed. The buyer at the other end is just much larger now.",
    ],
    drivers: [
      {
        title: "Falling cost per unit of performance",
        detail:
          "The steady force underneath everything for most of the period. Transistor cost fell, which is why a roughly flat rupee price bought a very different machine each time.",
      },
      {
        title: "AI demand for memory",
        detail:
          "High-bandwidth memory for accelerators competes for the same fabrication capacity as desktop DRAM and earns far more of it. Conventional supply tightened through 2025 and the module in a mid-range build more than doubled in two years.",
      },
      {
        title: "Data-centre demand for storage",
        detail:
          "Nearline drives and enterprise solid-state bought for training data pulled supply away from retail. Storage in this build rose two thirds between 2023 and 2025 — the largest two-year rise in the line that was not caused by a change of technology.",
      },
      {
        title: "Graphics repricing",
        detail:
          "Two mining cycles and one shortage. The 2021 peak is the largest single-year move in any line of this build, and it also arrived from outside the computer market.",
      },
      {
        title: "Storage substitution",
        detail:
          "Solid-state drives went from a luxury to the default. The price per gigabyte rose when the technology changed in 2020; the price per second of waiting collapsed.",
      },
      {
        title: "Import exposure",
        detail:
          "Almost every part is imported. A weaker rupee raises the shelf price with no change in the underlying component market, and it compounds every shock above.",
      },
    ],
    caveats: [
      "The line is a paraphrase of the film's premise, not a verified quote.",
      "\u201cMid-range\u201d is a judgement about market position, not a fixed specification. It is the honest way to price technology across sixteen years and it is still a judgement.",
      "The component lines are a reconstruction. They reconcile exactly with the build total in every year, which makes them internally consistent \u2014 it does not make each line an observed retail price. The shape and the shares are the finding, not the individual rupee figures.",
      "The 2025 memory and storage figures are provisional and were moving fast at the snapshot date. An annual average understates where the year ended.",
      "The index prices the parts, not the labour, the warranty or the shop. Rocket Singh's business sold all three.",
      "Indian listings before 2012 are reconstructed from US retail with a customs and margin uplift.",
      "Performance is discussed in the text but is not in the series. A price-per-benchmark index would need a benchmark suite held constant for sixteen years, which does not exist.",
    ],
    datasetIds: [
      "india-desktop-components",
      "dram-nand-contract",
      "india-cpi-spliced",
      "mospi-nni-percapita",
    ],
  },

  {
    id: "khosla-plot",
    slug: "khosla-plot",
    name: "Khosla Plot Index",
    shortName: "Khosla Plot",
    subtitle: "The price of the plot the whole film is about.",
    status: "live",

    film: "Khosla Ka Ghosla",
    releaseYear: 2006,
    character: "Kamal Kishore Khosla",
    scene:
      "A retired man buys a plot to build a house on. The plot turns out to be the only character with a growth arc.",
    dialogue: "Plot toh apna hai.",
    dialogueGloss: "\u201cThe plot is ours.\u201d",
    dialogueVerified: false,

    indexedUnit: "One 500-square-yard residential plot, Delhi NCR",
    quantity: 500,
    quantityUnit: "sq yard",
    reveal: "500 square yards on the Delhi periphery, priced per square yard.",

    baseYear: 2006,
    baseYearNote:
      "Release year of Khosla Ka Ghosla. The film does not state a plot size; 500 square yards is a standard colony plot and is an assumption, not an observation.",

    geography: "Delhi NCR",
    currency: "INR",
    currencySymbol: "\u20b9",
    priceSeriesId: "delhi-plot-sqyd",
    cpiSeriesId: "india-cpi",
    incomeSeriesId: "india-income-monthly",
    benchmarks: [
      {
        seriesId: "india-cpi",
        label: "India CPI, all groups",
        rationale: "How much of the rise is land and how much is the rupee.",
      },
      {
        seriesId: "gold-inr-10g",
        label: "Gold, 24 karat",
        rationale:
          "The other asset an Indian household of that period would have held. It is the fairer comparison than any equity index.",
      },
      {
        seriesId: "india-income-monthly",
        label: "Per-capita net national income",
        rationale:
          "Whether a family on an ordinary income could still buy the plot the film is about.",
      },
    ],
    unitFactor: 500,
    unitFactorNote:
      "500 square yards \u00d7 the rate per square yard. The plot size is assumed; the rate is surveyed.",
    equation: [
      {
        expression: "500 sq yards",
        result: "a standard colony plot",
        note: "Assumed. The film never states the size.",
      },
      {
        expression: "500 \u00d7 \u20b912,000",
        result: "\u20b960,00,000 in 2006",
        note: "Blended circle and market rate for a peripheral Delhi colony.",
        datasetId: "delhi-ncr-plot-rates",
      },
      {
        expression: "500 \u00d7 \u20b995,000",
        result: "value at the last verified date",
        note: "2025. Provisional, and the widest uncertainty band of any index here.",
        datasetId: "delhi-ncr-plot-rates",
      },
    ],
    events: [
      { year: 2008, label: "Global financial crisis" },
      { year: 2013, label: "NCR land peaks, then stalls" },
      { year: 2016, label: "Demonetisation" },
      { year: 2021, label: "Post-pandemic land run" },
    ],

    category: "real-estate",
    motif: "parcel",
    confidence: "estimated",
    accent: { light: "hsl(28 72% 42%)", dark: "hsl(32 82% 60%)" },
    remark: "The family wanted a house. The market found an asset class.",
    interpretation: [
      "The plot is up roughly eight-fold in nominal terms. Prices generally rose about three and a half times. So a little over half the increase is real — land genuinely got dearer, rather than the rupee getting smaller.",
      "Against gold the plot loses. Gold rose about twelve-fold over the same nineteen years; the plot rose about eight. The folklore that Delhi land is the one asset that always wins does not survive the 2014\u20132019 stretch, when NCR rates went essentially nowhere for five years while gold kept moving.",
      "The affordability figure is the one worth sitting with. On per-capita national income the plot was already out of reach in 2006 and is further out now. This index prices something most households were never going to buy — which is exactly the anxiety the film is about.",
    ],
    drivers: [
      {
        title: "Scarcity by regulation",
        detail:
          "Delhi cannot expand. Supply is fixed by master plans and land-use rules, so demand shows up almost entirely as price.",
      },
      {
        title: "Land as household savings",
        detail:
          "For a generation with limited access to equities, land was the savings vehicle. That pushes the price above what rental yields justify.",
      },
      {
        title: "Infrastructure",
        detail:
          "Metro extensions and expressways reprice a peripheral colony faster than anything the colony itself does.",
      },
      {
        title: "Opaque pricing",
        detail:
          "Circle rates, asking prices and registered values disagree by wide margins. Some of the apparent appreciation is the gap between those three narrowing.",
      },
    ],
    caveats: [
      "Confidence is Estimated, and that is the honest label. There is no continuous published series for what a specific plot sells for.",
      "The plot size is assumed at 500 square yards. Halve it and every rupee figure halves with it.",
      "Circle rates are a stamp-duty floor and asking prices are an aspiration. The truth sits between them and is not published.",
      "The quote is a paraphrase of the film's premise, not a verified line.",
      "Land is not fungible. Two plots a street apart can differ by half, which no single rate can capture.",
    ],
    datasetIds: [
      "delhi-ncr-plot-rates",
      "india-cpi-spliced",
      "ibja-gold-inr",
      "mospi-nni-percapita",
    ],
  },

  {
    id: "fruit-company",
    slug: "fruit-company",
    name: "Fruit Company Index",
    shortName: "Fruit Company",
    subtitle: "The investment Forrest never understood.",
    status: "live",

    film: "Forrest Gump",
    releaseYear: 1994,
    character: "Forrest Gump",
    scene:
      "A letter arrives. Lieutenant Dan has put the shrimp money into some kind of fruit company.",
    dialogue: "Some kind of fruit company.",
    dialogueVerified: false,

    indexedUnit: "$1,000 in Apple stock, dividends reinvested",
    quantity: 1000,
    quantityUnit: "dollar",
    reveal: "$1,000 in Apple on the day the film released. Nothing added since.",

    baseYear: 1994,
    baseYearNote:
      "Release year of Forrest Gump. The film's investment happens in the 1970s, before Apple was public — you could not have bought it. The release year is the earliest date the trade is actually possible, and that gap is worth knowing.",

    geography: "United States",
    currency: "USD",
    currencySymbol: "$",
    priceSeriesId: "apple-1000",
    comparisonSeriesId: "sp500-1000",
    cpiSeriesId: "us-cpi",
    benchmarks: [
      {
        seriesId: "sp500-1000",
        label: "S&P 500, total return",
        rationale:
          "The comparison that matters. Buying the whole market took no conviction and no luck.",
      },
      {
        seriesId: "us-cpi",
        label: "US CPI, all items",
        rationale: "How much of the gain survives thirty-one years of inflation.",
      },
    ],
    unitFactor: 1,
    unitFactorNote:
      "The series already tracks a $1,000 position, adjusted for all five splits since 1994 and for dividends reinvested from 2012.",
    equation: [
      {
        expression: "$1,000, 1994",
        result: "the position",
        note: "Bought at the close in the film's release year.",
        datasetId: "apple-total-return",
      },
      {
        expression: "\u00d7 2 \u00d7 2 \u00d7 7 \u00d7 4",
        result: "112 shares for every one held in 1994",
        note: "Splits in 2000, 2005, 2014 and 2020. Ignore them and the return looks a hundred times smaller.",
        datasetId: "apple-total-return",
      },
      {
        expression: "+ dividends reinvested",
        result: "from 2012 onward",
        note: "Apple paid nothing for the first eighteen years of the holding.",
        datasetId: "apple-total-return",
      },
      {
        expression: "= $10,20,000",
        result: "value at the last verified date",
        note: "2025. Provisional.",
        datasetId: "apple-total-return",
      },
    ],
    events: [
      { year: 1997, label: "Near bankruptcy" },
      { year: 2001, label: "iPod" },
      { year: 2007, label: "iPhone" },
      { year: 2008, label: "Financial crisis" },
      { year: 2020, label: "Four-for-one split" },
    ],

    category: "equity",
    motif: "spiral",
    confidence: "verified",
    accent: { light: "hsl(265 52% 48%)", dark: "hsl(263 72% 70%)" },
    remark:
      "Forrest could not have explained a single thing about the company. He held it for thirty-one years, which turned out to be the harder skill.",
    interpretation: [
      "A thousand dollars becomes roughly a million. That is the number everyone shares, and on its own it teaches nothing — it is a survivor picked with hindsight from a market full of companies that went to zero.",
      "The comparison is the lesson. The same thousand dollars in the S&P 500 became about twenty-five thousand: a good result, achieved with no research, no conviction and no risk of losing everything. Apple beat it by a factor of forty, and to collect that you had to hold through 1997, when the company nearly failed and the position was worth half what you paid.",
      "The splits do most of the quiet work. Four of them since 1994 turned one share into a hundred and twelve. Anyone reading a raw 1994 share price against a 2025 one, without adjusting, would understate the return by roughly that same factor — which is the most common mistake made with long-run stock charts.",
    ],
    drivers: [
      {
        title: "One product, twice",
        detail:
          "The iPod and then the iPhone account for most of the compounding. Two decisions, thirty-one years apart from the base date.",
      },
      {
        title: "Surviving 1997",
        detail:
          "The position lost half its value and the company was months from running out of cash. Every subsequent return depends on not having sold there.",
      },
      {
        title: "Buybacks",
        detail:
          "Apple has retired a large share of its own stock since 2012. Each remaining share owns more of the company than it did.",
      },
      {
        title: "Survivorship",
        detail:
          "This index prices the one that worked. The honest version of the lesson includes every fruit company that did not.",
      },
    ],
    caveats: [
      "The film's investment predates Apple's IPO. The trade in the film could not have been made; this index prices the earliest date it could.",
      "No tax, brokerage or currency conversion is applied. A real holder would have kept less.",
      "Dividends are reinvested, which assumes no cash was ever taken out over thirty-one years.",
      "Chosen with hindsight. Picking a stock that returned a thousand-fold is easy in 2025 and was not in 1994.",
      "The quote is paraphrased and not checked against the film or authorised subtitles.",
    ],
    datasetIds: ["apple-total-return", "sp500-total-return", "us-cpi-all-items"],
  },
];

/* ==== cross-country panel ============================================= */

/**
 * The Royale With Cheese panel (PRD: "the burger should remain visually
 * identical while the currency, local price, tax treatment, wage
 * affordability and menu naming change around it").
 *
 * Snapshot prices and wages; the exchange rates are a single date. India is
 * on the panel precisely because the product does not exist there — a gap in
 * a standardised basket is a finding, not a hole to fill with a substitute.
 */
export const ROYALE_COUNTRIES: CountryPrice[] = [
  {
    code: "US",
    country: "United States",
    localName: "Quarter Pounder with Cheese",
    currency: "USD",
    symbol: "$",
    price: 6.29,
    medianHourlyWage: 24.5,
    fxPerUsd: 1,
    note: "Menu price excludes sales tax, which varies by state.",
  },
  {
    code: "FR",
    country: "France",
    localName: "Royal Cheese",
    currency: "EUR",
    symbol: "\u20ac",
    price: 5.95,
    medianHourlyWage: 17.4,
    fxPerUsd: 0.92,
    note: "The name the film is joking about. Price includes VAT.",
  },
  {
    code: "DE",
    country: "Germany",
    localName: "Hamburger Royal TS",
    currency: "EUR",
    symbol: "\u20ac",
    price: 6.19,
    medianHourlyWage: 20.8,
    fxPerUsd: 0.92,
    note: "\u201cTS\u201d for Tomate/Salat. Price includes VAT.",
  },
  {
    code: "GB",
    country: "United Kingdom",
    localName: "Quarter Pounder with Cheese",
    currency: "GBP",
    symbol: "\u00a3",
    price: 5.19,
    medianHourlyWage: 16.6,
    fxPerUsd: 0.79,
    note: "Metric country, imperial name. Price includes VAT.",
  },
  {
    code: "CH",
    country: "Switzerland",
    localName: "Quarter Pounder with Cheese",
    currency: "CHF",
    symbol: "CHF ",
    price: 9.2,
    medianHourlyWage: 38,
    fxPerUsd: 0.88,
    note: "Dearest burger on the panel in dollars, near-cheapest in working minutes.",
  },
  {
    code: "JP",
    country: "Japan",
    localName: "\u30af\u30a9\u30fc\u30bf\u30fc\u30d0\u30f3\u30c0\u30fc\u30c1\u30fc\u30ba",
    currency: "JPY",
    symbol: "\u00a5",
    price: 520,
    medianHourlyWage: 2100,
    fxPerUsd: 152,
    note: "Consumption tax included. The clearest undervaluation on the panel.",
  },
  {
    code: "AU",
    country: "Australia",
    localName: "Quarter Pounder",
    currency: "AUD",
    symbol: "A$",
    price: 6.95,
    medianHourlyWage: 32,
    fxPerUsd: 1.53,
    note: "Fewest working minutes per burger on the panel.",
  },
  {
    code: "IN",
    country: "India",
    localName: "Not sold",
    currency: "INR",
    symbol: "\u20b9",
    price: 0,
    medianHourlyWage: 130,
    fxPerUsd: 86,
    unavailable: true,
    note: "McDonald's India sells no beef products at all. The index reports the gap rather than substituting a different burger, because a substituted product is no longer the same unit.",
  },
];

/* ==== research catalogue ============================================== */

/**
 * Every reference in the programme, published or not.
 *
 * Feasibility is about the data, never about the joke: a reference can be
 * perfect and still sit at two stars because no defensible series exists for
 * the thing it names. That is where most of these will die, and saying so
 * here is more honest than a roadmap that implies they will all ship.
 */
export const CATALOGUE: CatalogueEntry[] = [
  {
    slug: "sanju-baba-50-tola",
    name: "Sanju Baba 50 Tola Index",
    film: "Vaastav",
    releaseYear: 1999,
    indexedUnit: "50 Indian tolas of gold",
    mainQuestion: "What would Sanju Baba's chain cost today?",
    dataSource: "RBI, IBJA, MCX and World Gold Council historical gold prices",
    feasibility: 5,
    status: "live",
    category: "commodity",
    published: true,
    remark: "A four-second dialogue with a multi-decade investment horizon.",
  },
  {
    slug: "royale-with-cheese",
    name: "Royale With Cheese Index",
    film: "Pulp Fiction",
    releaseYear: 1994,
    indexedUnit: "One Quarter Pounder with Cheese",
    mainQuestion:
      "How much purchasing power does one burger represent across countries and decades?",
    dataSource:
      "McDonald's menu archives, The Economist Big Mac Index, OECD median wages",
    feasibility: 5,
    status: "live",
    category: "purchasing-power-parity",
    published: true,
    remark: "Same burger. Different currency. Surprisingly ambitious economics.",
  },
  {
    slug: "raju-ki-mummy-bhindi",
    name: "Raju Ki Mummy Bhindi Index",
    film: "3 Idiots",
    releaseYear: 2009,
    indexedUnit: "One kilogram of bhindi",
    mainQuestion:
      "Was Raju's mother exaggerating, or early to the food-inflation story?",
    dataSource:
      "Ministry of Consumer Affairs retail prices, state APMC mandis, National Horticulture Board",
    feasibility: 4,
    status: "live",
    category: "food-inflation",
    published: true,
    remark: "She was presented as comic relief. The vegetable market may owe her an apology.",
  },
  {
    slug: "moneyball-player-value",
    name: "Moneyball Player Price Index",
    film: "Moneyball",
    releaseYear: 2011,
    indexedUnit: "Player salary per unit of measurable performance",
    mainQuestion:
      "How much does baseball now pay for what Billy Beane was buying cheaply?",
    dataSource: "Baseball Reference, FanGraphs, Lahman Database, MLB payrolls",
    feasibility: 5,
    status: "live",
    category: "sports-economics",
    published: true,
    remark: "Moneyball found the undervalued metric. Baseball responded by correctly pricing it.",
  },
  {
    slug: "vincent-vega-five-dollar-shake",
    name: "Vincent Vega Five-Dollar Shake Index",
    film: "Pulp Fiction",
    releaseYear: 1994,
    indexedUnit: "One premium restaurant milkshake",
    mainQuestion: "Is a five-dollar milkshake still expensive?",
    dataSource: "BLS restaurant CPI, archived restaurant menus, BLS median earnings",
    feasibility: 5,
    status: "live",
    category: "restaurant-inflation",
    published: true,
    remark: "No bourbon. No gold leaf. Just thirty-one years of restaurant inflation.",
  },
  {
    slug: "walter-white-purity-premium",
    name: "Walter White Purity Premium Index",
    film: "Breaking Bad",
    releaseYear: 2008,
    indexedUnit: "Price per pure gram at reported purity",
    mainQuestion: "What economic premium attaches to purity, and what removed it?",
    dataSource: "DEA price and purity reporting, UNODC World Drug Report",
    feasibility: 3,
    status: "live",
    category: "illicit-markets",
    published: true,
    remark: "The colour was fictional. The purity premium was basic economics.",
  },

  /* --- researching: data exists, index not yet built ------------------- */

  {
    slug: "fruit-company",
    name: "Fruit Company Index",
    film: "Forrest Gump",
    releaseYear: 1994,
    indexedUnit: "$1,000 in Apple stock",
    mainQuestion: "What did the fruit company do with a thousand dollars?",
    dataSource: "Apple share history, split- and dividend-adjusted; S&P 500 total return",
    feasibility: 5,
    status: "live",
    category: "equity",
    published: true,
    remark: "Holding for thirty-one years turned out to be the harder skill.",
  },
  {
    slug: "rocket-singh-pc",
    name: "Rocket Singh PC Index",
    film: "Rocket Singh: Salesman of the Year",
    releaseYear: 2009,
    indexedUnit: "One mid-range desktop, assembled from parts",
    mainQuestion: "What does it cost to build the machine today?",
    dataSource: "Component retail listings, PCPartPicker trends, Indian retail surveys",
    feasibility: 4,
    status: "live",
    category: "consumer-goods",
    published: true,
    remark: "Harpreet sold computers. Moore's Law did the discounting.",
  },
  {
    slug: "phir-hera-pheri-25-din",
    name: "Phir Hera Pheri 25 Din Index",
    film: "Phir Hera Pheri",
    releaseYear: 2006,
    indexedUnit: "Required return to double capital in 25 days",
    mainQuestion: "What annualised return is implied by \u201c25 din mein paisa double\u201d?",
    dataSource: "Compounding arithmetic; NSE, RBI and gold series for benchmarks",
    feasibility: 5,
    status: "researching",
    category: "returns",
    remark: "A return so impressive that mathematics would like to speak to the regulator.",
  },
  {
    slug: "home-alone-cheese-pizza",
    name: "Home Alone Cheese Pizza Index",
    film: "Home Alone",
    releaseYear: 1990,
    indexedUnit: "One large plain cheese pizza, delivered",
    mainQuestion: "How much does Kevin's ideal pizza cost today, all-in at checkout?",
    dataSource: "BLS CPI, archived chain menus, delivery and service fee schedules",
    feasibility: 4,
    status: "researching",
    category: "restaurant-inflation",
    remark: "The pizza inflated. The family's travel planning remained the larger problem.",
  },
  {
    slug: "friends-central-perk-coffee",
    name: "Central Perk Coffee Index",
    film: "Friends",
    releaseYear: 1994,
    indexedUnit: "One café coffee in Manhattan",
    mainQuestion:
      "How many hours would the characters need to work to sustain the coffee habit today?",
    dataSource: "BLS CPI for coffee away from home, NYC café price surveys",
    feasibility: 4,
    status: "researching",
    category: "restaurant-inflation",
    remark: "The apartment was unrealistic. The coffee habit was merely expensive.",
  },
  {
    slug: "big-kahuna-burger",
    name: "Big Kahuna Burger Index",
    film: "Pulp Fiction",
    releaseYear: 1994,
    indexedUnit: "One premium Hawaiian-style cheeseburger, built from inputs",
    mainQuestion: "What would Brett's breakfast cost today?",
    dataSource: "USDA beef, cheese and wheat prices; restaurant labour cost indices",
    feasibility: 4,
    status: "researching",
    category: "restaurant-inflation",
    remark: "Breakfast was interrupted. The inflation calculation was not.",
  },
  {
    slug: "khosla-plot",
    name: "Khosla Plot Index",
    film: "Khosla Ka Ghosla",
    releaseYear: 2006,
    indexedUnit: "One 500-square-yard plot, Delhi NCR",
    mainQuestion: "What would the plot cost today?",
    dataSource: "Delhi circle rates, NHB RESIDEX, property-portal asking prices",
    feasibility: 4,
    status: "live",
    category: "real-estate",
    published: true,
    remark: "The family wanted a house. The market found an asset class.",
  },
  {
    slug: "jethalal-television",
    name: "Jethalal Television Index",
    film: "Taarak Mehta Ka Ooltah Chashmah",
    releaseYear: 2008,
    indexedUnit: "One mainstream household television, price per inch",
    mainQuestion:
      "Has television become cheaper, or has the expected television simply become larger?",
    dataSource: "CPI consumer-electronics series, retailer catalogues, display-panel price indices",
    feasibility: 4,
    status: "researching",
    category: "consumer-goods",
    remark: "The television became cheaper per inch. Jethalal's problems did not.",
  },
  {
    slug: "scott-hatteberg",
    name: "Scott Hatteberg Index",
    film: "Moneyball",
    releaseYear: 2011,
    indexedUnit: "Salary paid per unit of on-base ability",
    mainQuestion: "How much did Oakland pay for each unit of the skill it actually valued?",
    dataSource: "Baseball Reference, FanGraphs, Lahman salary tables",
    feasibility: 5,
    status: "researching",
    category: "sports-economics",
    remark: "Oakland did not buy a first baseman. It bought discounted probability.",
  },
  {
    slug: "david-justice",
    name: "David Justice Index",
    film: "Moneyball",
    releaseYear: 2011,
    indexedUnit: "Veteran salary against remaining production",
    mainQuestion: "How expensive is experience when performance is declining?",
    dataSource: "Baseball Reference, FanGraphs, contract records",
    feasibility: 5,
    status: "researching",
    category: "sports-economics",
    remark:
      "Leadership was valuable. The contract made sure everyone knew exactly how valuable.",
  },
  {
    slug: "parasite-ram-don",
    name: "Parasite Ram-Don Index",
    film: "Parasite",
    releaseYear: 2019,
    indexedUnit: "Instant noodles with premium sirloin beef, one bowl",
    mainQuestion: "How much inequality fits in one bowl?",
    dataSource: "Statistics Korea retail prices for instant noodles and Hanwoo beef",
    feasibility: 4,
    status: "researching",
    category: "food-inflation",
    remark: "The noodles are ordinary. The meat is doing the class signalling.",
  },
  {
    slug: "lagaan-grain-tax",
    name: "Lagaan Grain Tax Index",
    film: "Lagaan",
    releaseYear: 2001,
    indexedUnit: "The grain-tax burden, as a share of household production",
    mainQuestion: "What would \u201cteen guna lagaan\u201d mean in actual household terms?",
    dataSource: "FAO price archives, Ministry of Agriculture procurement prices, colonial yield records",
    feasibility: 3,
    status: "planned",
    category: "agriculture",
    remark: "Less a tax increase, more an agricultural hostile takeover.",
  },
  {
    slug: "john-wick-gold-coin",
    name: "John Wick Gold Coin Index",
    film: "John Wick",
    releaseYear: 2014,
    indexedUnit: "One Continental gold coin: bullion value against network value",
    mainQuestion:
      "Is the coin valuable because of its gold, or because of the network that accepts it?",
    dataSource: "LBMA gold fixings; coin weight is an explicit stated assumption",
    feasibility: 3,
    status: "planned",
    category: "network-economics",
    remark: "The gold is valuable. The trust layer is doing most of the work.",
  },
  {
    slug: "breaking-bad-rv",
    name: "Breaking Bad RV Index",
    film: "Breaking Bad",
    releaseYear: 2008,
    indexedUnit: "One Fleetwood Bounder-class recreational vehicle",
    mainQuestion: "What would the mobile laboratory cost today?",
    dataSource: "NADA and used-RV guides, vehicle depreciation schedules, auction records",
    feasibility: 3,
    status: "planned",
    category: "vehicles",
    remark: "Poor laboratory standards. Excellent cultural resale value.",
  },
  {
    slug: "los-pollos-hermanos-chicken",
    name: "Los Pollos Hermanos Chicken Index",
    film: "Better Call Saul",
    releaseYear: 2015,
    indexedUnit: "One fried-chicken meal, built from inputs",
    mainQuestion: "What would Gus Fring's apparently legitimate meal cost today?",
    dataSource: "USDA poultry and cooking-oil prices, fast-food CPI, restaurant wage indices",
    feasibility: 4,
    status: "planned",
    category: "restaurant-inflation",
    remark:
      "The chicken business had better margins when certain operating expenses were kept off the books.",
  },
  {
    slug: "american-psycho-business-card",
    name: "American Psycho Business Card Index",
    film: "American Psycho",
    releaseYear: 2000,
    indexedUnit: "One premium letterpress business-card order",
    mainQuestion: "How expensive is professional insecurity when printed on premium stock?",
    dataSource: "Trade printing price lists, paper-stock indices, letterpress studio quotations",
    feasibility: 3,
    status: "planned",
    category: "consumer-goods",
    remark: "The cards were almost identical. The emotional return was dramatically different.",
  },
  {
    slug: "big-lebowski-white-russian",
    name: "White Russian Index",
    film: "The Big Lebowski",
    releaseYear: 1998,
    indexedUnit: "One White Russian, home-made against bar-made",
    mainQuestion: "What has happened to the cost of being The Dude?",
    dataSource: "Spirits and dairy retail prices, bar menu surveys, restaurant CPI",
    feasibility: 4,
    status: "planned",
    category: "restaurant-inflation",
    remark: "The Dude abides. The bar tab compounds.",
  },
  {
    slug: "succession-five-million",
    name: "Succession Five-Million-Dollar Index",
    film: "Succession",
    releaseYear: 2018,
    indexedUnit: "$5 million in investable wealth",
    mainQuestion: "Is $5 million financial freedom, or the trap Connor says it is?",
    dataSource:
      "Safe-withdrawal literature, NYC housing and private-school costs, healthcare premium data",
    feasibility: 3,
    status: "planned",
    category: "wealth",
    remark: "Too rich to work, too poor to ignore the thermostat.",
  },
  {
    slug: "mia-wallace-powder-spread",
    name: "Mia Wallace Powder Spread",
    film: "Pulp Fiction",
    releaseYear: 1994,
    indexedUnit: "Purity-adjusted price spread between two substances",
    mainQuestion:
      "What was the price spread between the substance expected and the one consumed?",
    dataSource: "UNODC and DEA published price and purity series",
    feasibility: 2,
    status: "planned",
    category: "illicit-markets",
    remark: "A product-identification failure with a very unfavourable downside case.",
  },
  {
    slug: "tony-montana-kilo",
    name: "Tony Montana Kilo Index",
    film: "Scarface",
    releaseYear: 1983,
    indexedUnit: "One kilogram, valued at each step of the supply chain",
    mainQuestion:
      "How did wholesale value change through the rise and decline of major trafficking routes?",
    dataSource: "UNODC World Drug Report historical wholesale estimates, academic literature",
    feasibility: 2,
    status: "planned",
    category: "illicit-markets",
    remark: "The margins were remarkable. The governance structure was less convincing.",
  },
];

/** Everything still to be built, in feasibility order. */
export const RESEARCH_QUEUE = CATALOGUE.filter((c) => !c.published);


/* ==== accessors ======================================================= */

export function getIndex(slug: string): PopIndex | undefined {
  return INDICES.find((i) => i.slug === slug);
}

export function getSeries(id: string): Series {
  const s = SERIES[id];
  if (!s) throw new Error(`Pop Indices: unknown series "${id}".`);
  return s;
}

export function getDataset(id: string): Dataset {
  const d = DATASETS[id];
  if (!d) throw new Error(`Pop Indices: unknown dataset "${id}".`);
  return d;
}

export const LIVE_INDICES = INDICES.filter((i) => i.status === "live");

/** Distinct datasets cited across the live indices — the trust counter. */
export const SOURCE_COUNT = new Set(
  LIVE_INDICES.flatMap((i) => i.datasetIds)
).size;
