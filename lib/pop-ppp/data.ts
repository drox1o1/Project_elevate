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

import type { Dataset, PopIndex, Series, UpcomingIndex } from "./types";

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

  "us-cpi-all-items": {
    id: "us-cpi-all-items",
    shortPublisher: "US BLS",
    publisher: "U.S. Bureau of Labor Statistics",
    title: "CPI for all urban consumers, all items — annual average, 1982–84 = 100",
    sourceUrl: "https://www.bls.gov/cpi/",
    retrievedOn: SNAPSHOT_DATE,
    startDate: "2002-01-01",
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

  "us-cpi": annual(
    "us-cpi",
    "us-cpi-all-items",
    "US CPI, all items",
    "Index, 1982–84 = 100",
    [
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
];

/* ==== research queue ================================================== */

export const UPCOMING: UpcomingIndex[] = [
  {
    slug: "vincent-vega-five-dollar-shake",
    name: "Vincent Vega Five-Dollar Shake Index",
    film: "Pulp Fiction",
    indexedUnit: "One premium restaurant milkshake",
    dataSource: "BLS CPI food-away-from-home, plus archived diner and restaurant menus",
    feasibility: 5,
    status: "researching",
    note: "No bourbon. No gold leaf. Just thirty years of restaurant inflation.",
  },
  {
    slug: "forrest-gump-apple",
    name: "Forrest Gump Apple Index",
    film: "Forrest Gump",
    indexedUnit: "A stake in “some kind of fruit company”",
    dataSource: "Apple Inc. historical share prices, split- and dividend-adjusted",
    feasibility: 5,
    status: "researching",
    note: "The only index where the joke is that the character was right.",
  },
  {
    slug: "sholay-reward",
    name: "Sholay Reward Index",
    film: "Sholay",
    indexedUnit: "The ₹50,000 bounty on Gabbar Singh",
    dataSource: "RBI inflation calculator and CPI-IW back series",
    feasibility: 5,
    status: "researching",
    note: "A bounty is a price. Prices can be indexed.",
  },
  {
    slug: "phir-hera-pheri-25-din",
    name: "Phir Hera Pheri 25 Din Index",
    film: "Phir Hera Pheri",
    indexedUnit: "Required return to double capital in 25 days",
    dataSource: "Compounding arithmetic; benchmark returns from NSE and RBI series",
    feasibility: 5,
    status: "researching",
    note: "A return so impressive that mathematics would like to file a complaint.",
  },
  {
    slug: "home-alone-pizza",
    name: "Home Alone Pizza Index",
    film: "Home Alone",
    indexedUnit: "One large cheese pizza, delivered",
    dataSource: "BLS CPI, plus archived Little Caesars and national chain menus",
    feasibility: 4,
    status: "planned",
  },
  {
    slug: "khosla-plot",
    name: "Khosla Plot Index",
    film: "Khosla Ka Ghosla",
    indexedUnit: "One residential plot, Delhi periphery",
    dataSource: "Delhi circle rates, NHB RESIDEX, listed property-portal asking prices",
    feasibility: 4,
    status: "planned",
    note: "The hardest of the queue: no two sources agree on what a plot is worth.",
  },
  {
    slug: "lagaan-grain",
    name: "Lagaan Grain Index",
    film: "Lagaan",
    indexedUnit: "The grain equivalent of the disputed tax",
    dataSource: "FAO price archives, Ministry of Agriculture wheat procurement prices",
    feasibility: 3,
    status: "planned",
    note: "Colonial-era units are the research problem, not the arithmetic.",
  },
  {
    slug: "john-wick-gold-coin",
    name: "John Wick Gold Coin Index",
    film: "John Wick",
    indexedUnit: "One Continental gold coin, by assumed bullion weight",
    dataSource: "LBMA gold fixings; coin weight is an explicit assumption",
    feasibility: 3,
    status: "planned",
    note: "Will publish as Estimated. The coin's weight is a fictional quantity.",
  },
];

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
