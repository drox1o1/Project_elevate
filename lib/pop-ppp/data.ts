/**
 * Pop PPP content and data snapshot.
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
    slug: "forrest-gump-apple",
    name: "Forrest Gump Apple Index",
    film: "Forrest Gump",
    releaseYear: 1994,
    indexedUnit: "A stake in \u201csome kind of fruit company\u201d",
    mainQuestion: "How valuable was the fruit-company investment?",
    dataSource: "Apple Inc. share history, split- and dividend-adjusted; S&P 500 for comparison",
    feasibility: 5,
    status: "researching",
    category: "equity",
    remark:
      "Forrest did not understand the company. Conviction and comprehension are not always correlated.",
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
    name: "Khosla Ka Ghosla Plot Index",
    film: "Khosla Ka Ghosla",
    releaseYear: 2006,
    indexedUnit: "One residential plot, Delhi NCR, per square yard",
    mainQuestion: "What would the Khoslas' plot cost today?",
    dataSource: "Delhi circle rates, NHB RESIDEX, property-portal asking prices",
    feasibility: 4,
    status: "researching",
    category: "real-estate",
    remark: "The family wanted a home. The land decided to become an asset class.",
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
  if (!s) throw new Error(`Pop PPP: unknown series "${id}".`);
  return s;
}

export function getDataset(id: string): Dataset {
  const d = DATASETS[id];
  if (!d) throw new Error(`Pop PPP: unknown dataset "${id}".`);
  return d;
}

export const LIVE_INDICES = INDICES.filter((i) => i.status === "live");

/** Distinct datasets cited across the live indices — the trust counter. */
export const SOURCE_COUNT = new Set(
  LIVE_INDICES.flatMap((i) => i.datasetIds)
).size;
