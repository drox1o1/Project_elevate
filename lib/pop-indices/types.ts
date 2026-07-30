/**
 * Pop Indices — data model.
 *
 * Mirrors the PRD's three-part schema: index metadata, dataset metadata and
 * observation data, with the calculation metadata carried on the series so a
 * figure can never be rendered without the transformation that produced it.
 *
 * The rule the whole section is built around: every number on screen must be
 * traceable to an observation, and every observation must be traceable to a
 * dataset with a publisher and a retrieval date.
 */

/**
 * How much the data behind an index can be trusted. Rendered next to the
 * headline result, never in the footer.
 *
 * verified      — authoritative series covers the whole period
 * reconstructed — assembled from credible archives, mandi records, menus
 * estimated     — relies on stated assumptions or incomplete market data
 */
export type Confidence = "verified" | "reconstructed" | "estimated";

export type EconomicCategory =
  | "commodity"
  | "food-inflation"
  | "restaurant-inflation"
  | "purchasing-power-parity"
  | "sports-economics"
  | "equity"
  | "real-estate"
  | "returns"
  | "illicit-markets"
  | "consumer-goods"
  | "vehicles"
  | "wealth"
  | "agriculture"
  | "network-economics";

/**
 * Which generative composition an index draws for its artwork.
 *
 * Deliberately separate from `category`: the taxonomy exists to group
 * economics, the motif exists to make a card look like a specific object.
 * Tying art to taxonomy would give every food index the same picture.
 */
export type Motif =
  | "rings"
  | "columns"
  | "lattice"
  | "vessel"
  | "steps"
  | "spiral"
  | "spread"
  | "grid"
  | "parcel";

export type Frequency = "daily" | "weekly" | "monthly" | "annual" | "seasonal";

export type IndexStatus = "live" | "researching" | "planned";

/** A published source. One dataset, one publisher, one retrieval date. */
export interface Dataset {
  id: string;
  publisher: string;
  /** Short form used in citations and share cards, e.g. "IBJA / RBI". */
  shortPublisher: string;
  title: string;
  /** Landing page for the series — not a deep link that will rot. */
  sourceUrl: string;
  /** ISO date the series was last pulled and checked by a human. */
  retrievedOn: string;
  startDate: string;
  endDate: string;
  frequency: Frequency;
  /** Unit as the publisher states it. */
  originalUnit: string;
  /** Unit after normalisation into the index. */
  normalisedUnit: string;
  currency: string;
  geography: string;
  licence: string;
  confidence: Confidence;
  /** Adjustments applied on the way from original to normalised unit. */
  adjustments?: string;
  /** How gaps in the series are handled. */
  missingData?: string;
}

/** One point in a normalised series. */
export interface Observation {
  year: number;
  /** Value in the series' normalised unit. */
  value: number;
  /** Interpolated between adjacent years rather than observed. */
  imputed?: boolean;
  /** Observed but not yet final (e.g. a part-year average). */
  provisional?: boolean;
}

/** A normalised, chart-ready price or metric series. */
export interface Series {
  id: string;
  datasetId: string;
  label: string;
  /** Unit the series is quoted in, e.g. "₹ per 10 g". */
  unit: string;
  /**
   * The physical thing one unit of price buys, e.g. "× 10 g of gold".
   * Needed because `unit` is a price unit and reads wrongly as a quantity.
   */
  pricedUnit?: string;
  currency?: string;
  /** Short note on how the raw series became this one. */
  normalisation?: string;
  observations: Observation[];
}

/** One line of the visible equation. */
export interface EquationStep {
  /** Left-hand expression, rendered in the data face. */
  expression: string;
  /** What this step produces. */
  result: string;
  /** Why this step exists, in plain language. */
  note?: string;
  /** Dataset backing the number introduced by this step, if any. */
  datasetId?: string;
}

/** An editorial driver card under "what drove the change?". */
export interface Driver {
  title: string;
  detail: string;
}

/** A named point on the chart: a crisis, a peak, a rule change. */
export interface ChartEvent {
  year: number;
  label: string;
}

/** Colour accent for an index. Scene-inspired, never the film's branding. */
export interface Accent {
  light: string;
  dark: string;
}

/** The comparison an index makes against a broader benchmark. */
export interface Benchmark {
  seriesId: string;
  label: string;
  /** Why this is the fair thing to compare against. */
  rationale: string;
}

export interface PopIndex {
  id: string;
  slug: string;
  /** Full editorial name, e.g. "Sanju Baba 50 Tola Index". */
  name: string;
  /** Grid-card name, e.g. "Sanju Baba Index". */
  shortName: string;
  subtitle: string;
  status: IndexStatus;

  /* --- Layer 1: cultural hook --- */
  film: string;
  releaseYear: number;
  character: string;
  scene: string;
  /** The line, as spoken. */
  dialogue: string;
  /** Roman transliteration or translation where the line is not in English. */
  dialogueGloss?: string;
  /** Whether the quote has been checked against the film or authorised subs. */
  dialogueVerified: boolean;

  /* --- Layer 2: indexed unit --- */
  indexedUnit: string;
  quantity: number;
  quantityUnit: string;
  /** The one-line "what the scene gives us" restatement shown above the result. */
  reveal: string;

  /* --- Layer 3: historical anchor --- */
  baseYear: number;
  baseYearNote: string;

  /* --- Layers 4 & 5: data and calculation --- */
  geography: string;
  currency: string;
  currencySymbol: string;
  /** The series the index is built on. */
  priceSeriesId: string;
  /** Optional second series shown as a comparative line. */
  comparisonSeriesId?: string;
  /** Series used for inflation adjustment. Without it, real values are absent. */
  cpiSeriesId?: string;
  /** Monthly income series used for affordability. Absent means no income rows. */
  incomeSeriesId?: string;
  /** Benchmarks the index is measured against (CPI, food CPI, income). */
  benchmarks: Benchmark[];
  /** Multiplier from series unit to indexed quantity. */
  unitFactor: number;
  unitFactorNote: string;
  equation: EquationStep[];
  events?: ChartEvent[];

  /* --- Layer 6: interpretation --- */
  category: EconomicCategory;
  motif: Motif;
  confidence: Confidence;
  accent: Accent;
  /** The one dry remark. One per major section is enough. */
  remark: string;
  /** Two or three paragraphs of economic reading. */
  interpretation: string[];
  drivers: Driver[];
  /** Caveats the interface must not bury. */
  caveats?: string[];
  /** Datasets cited on the page, in ledger order. */
  datasetIds: string[];
}

/**
 * One country's reading of a standardised product (PRD: Royale with Cheese).
 *
 * The product is held fixed and the economy moves around it, which is the
 * entire point — so everything here except `localName` describes the country,
 * not the burger.
 */
export interface CountryPrice {
  code: string;
  country: string;
  /** What the identical product is called on the local menu. */
  localName: string;
  currency: string;
  symbol: string;
  /** Menu price in local currency, including local tax treatment. */
  price: number;
  /** Median gross hourly wage in local currency. */
  medianHourlyWage: number;
  /** Market exchange rate, local currency per US dollar. */
  fxPerUsd: number;
  /** Set where the product is not sold at all — itself a finding. */
  unavailable?: boolean;
  note?: string;
}

/** A reference in the research catalogue. */
export interface CatalogueEntry {
  slug: string;
  name: string;
  film: string;
  releaseYear: number;
  indexedUnit: string;
  /** The question the index would answer. */
  mainQuestion: string;
  /** Where the data would come from. */
  dataSource: string;
  /** 1–5: how tractable the data is. */
  feasibility: number;
  status: IndexStatus;
  category: EconomicCategory;
  /** The dry line, once the index exists. */
  remark?: string;
  /** Present when the index has published — links to its page. */
  published?: boolean;
}
