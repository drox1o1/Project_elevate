/**
 * Compact Black-Scholes pricing and Greeks for index options.
 * Powers OptionChain and GreeksPanel so displayed values stay coherent
 * (premium, delta, gamma, theta and vega always agree with each other).
 * Rates are annualized; time is in years.
 */

/** Abramowitz–Stegun error-function approximation (max error ~1.5e-7). */
export function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t -
      0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-ax * ax);
  return sign * y;
}

/** Standard normal CDF. */
export const cnd = (x: number): number => 0.5 * (1 + erf(x / Math.SQRT2));

/** Standard normal PDF. */
export const pdf = (x: number): number =>
  Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);

export interface Greeks {
  /** Option premium. */
  price: number;
  /** Per ₹1 move in the underlying. */
  delta: number;
  /** Delta change per ₹1 move. */
  gamma: number;
  /** Per calendar day (already divided by 365). */
  theta: number;
  /** Per 1 percentage-point change in IV. */
  vega: number;
}

export interface BsInput {
  /** Spot price. */
  s: number;
  /** Strike price. */
  k: number;
  /** Time to expiry in years. */
  t: number;
  /** Implied volatility, e.g. 0.14 for 14%. */
  iv: number;
  /** Risk-free rate. Default 0.065. */
  r?: number;
  side: "call" | "put";
}

export function blackScholes({ s, k, t, iv, r = 0.065, side }: BsInput): Greeks {
  const T = Math.max(t, 1 / 365 / 24); // clamp: expiry day still prices
  const sig = Math.max(iv, 0.001);
  const sqT = Math.sqrt(T);
  const d1 = (Math.log(s / k) + (r + (sig * sig) / 2) * T) / (sig * sqT);
  const d2 = d1 - sig * sqT;
  const disc = Math.exp(-r * T);

  const callPrice = s * cnd(d1) - k * disc * cnd(d2);
  const putPrice = k * disc * cnd(-d2) - s * cnd(-d1);
  const gamma = pdf(d1) / (s * sig * sqT);
  const vega = (s * pdf(d1) * sqT) / 100;

  if (side === "call") {
    const theta =
      (-(s * pdf(d1) * sig) / (2 * sqT) - r * k * disc * cnd(d2)) / 365;
    return { price: callPrice, delta: cnd(d1), gamma, theta, vega };
  }
  const theta =
    (-(s * pdf(d1) * sig) / (2 * sqT) + r * k * disc * cnd(-d2)) / 365;
  return { price: putPrice, delta: cnd(d1) - 1, gamma, theta, vega };
}

/** A gentle smile: IV rises away from ATM. `skew` tilts the put side up. */
export function smileIv(
  s: number,
  k: number,
  base = 0.13,
  skew = 0.015
): number {
  const m = (k - s) / s;
  return base + 6 * m * m - skew * m * 10 * 0.01;
}
