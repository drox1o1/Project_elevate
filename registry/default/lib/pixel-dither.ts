/**
 * pixel-dither — the deterministic maths behind PixelRevealText.
 *
 * Nothing in here touches the DOM. It turns a coverage map (how much glyph ink
 * falls inside each grid cell) into a *reveal order*: a rank-normalised value
 * per cell that says when that cell earns the right to be drawn.
 *
 * Two properties matter and both are load-bearing:
 *
 * 1. Determinism. Every random number comes from an integer hash of
 *    (cell, channel, seed) — never Math.random() — so the same seed always
 *    produces the same pixel pattern, on every replay and every machine.
 * 2. Rank normalisation. Cell order is spread evenly across [0,1), so
 *    "reveal 35% of the pixels" means exactly 35% of the pixels, which is what
 *    lets the phase timeline hit its documented dither densities.
 */

export type RevealDirection =
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "center"
  | "random";

/* -------------------------------------------------------------------------
 * Scalar helpers
 * ---------------------------------------------------------------------- */

export function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0 || 1));
  return t * t * (3 - 2 * t);
}

/**
 * Cubic-bezier easing solver (Newton with a bisection fallback), so the
 * component can use the same curves in JS that Motion uses in CSS.
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const ax = 3 * x1 - 3 * x2 + 1;
  const bx = 3 * x2 - 6 * x1;
  const cx = 3 * x1;
  const ay = 3 * y1 - 3 * y2 + 1;
  const by = 3 * y2 - 6 * y1;
  const cy = 3 * y1;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) {
      const d = slopeX(t);
      if (Math.abs(d) < 1e-6) break;
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-6) return sampleY(t);
      t -= err / d;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    for (let i = 0; i < 12; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-6) break;
      if (err > 0) hi = t;
      else lo = t;
      t = (lo + hi) / 2;
    }
    return sampleY(t);
  };
}

/** The house phase curve. Deliberately subtle — see `phaseEase` below. */
export const EASE_PHASE = cubicBezier(0.22, 1, 0.36, 1);
/** The signal-lock pulse curve. */
export const EASE_LOCK: readonly [number, number, number, number] = [
  0.16, 1, 0.3, 1,
];
export const EASE_PHASE_BEZIER: readonly [number, number, number, number] = [
  0.22, 1, 0.36, 1,
];

/**
 * Dither *density* stays linear (see `densityAt`). Only the phase progression —
 * opacity band, flicker envelope, peripheral noise — is eased, and only by 35%
 * of the way toward the curve, or the whole effect front-loads and stops
 * feeling computational.
 */
export function phaseEase(t: number) {
  return lerp(t, EASE_PHASE(t), 0.35);
}

/* -------------------------------------------------------------------------
 * Deterministic hashing
 * ---------------------------------------------------------------------- */

/**
 * Integer hash → [0,1). Stable for a given (a, b, seed), which is what makes a
 * replay with the same seed produce the same pixel pattern.
 */
export function hash3(a: number, b: number, seed: number) {
  let h = Math.imul(a ^ 0x9e3779b9, 0x27d4eb2d);
  h = (h ^ Math.imul(b + 0x165667b1, 0x85ebca6b)) | 0;
  h = (h ^ Math.imul(seed + 0x1b873593, 0xc2b2ae35)) | 0;
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h = Math.imul(h ^ (h >>> 13), 0x297a2d39);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** 4×4 Bayer ordered-dither matrix, the backbone of the reveal pattern. */
export const BAYER_4 = [
  0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5,
] as const;

export function bayer4(x: number, y: number) {
  return BAYER_4[(y & 3) * 4 + (x & 3)] / 16;
}

/* -------------------------------------------------------------------------
 * The phase timeline
 *
 * Times are expressed against the 1100ms reference sequence and stored as
 * fractions, so a 700ms or 1400ms run keeps the same proportions.
 * ---------------------------------------------------------------------- */

export const REFERENCE_DURATION = 1100;

export const PHASE = {
  /** Phase 1 → 2: signal detection ends. */
  detect: 140 / REFERENCE_DURATION,
  /** Phase 2 → 3: pixel formation ends. */
  form: 430 / REFERENCE_DURATION,
  /** Phase 3 → 4: glyph resolution ends, signal lock begins. */
  resolve: 820 / REFERENCE_DURATION,
  /** Phase 4 → 5: canvas-to-DOM handoff begins. */
  lock: 980 / REFERENCE_DURATION,
  /** End of sequence. */
  end: 1,
} as const;

type Stop = readonly [number, number];

function piecewise(stops: readonly Stop[], t: number) {
  if (t <= stops[0][0]) return stops[0][1];
  const last = stops[stops.length - 1];
  if (t >= last[0]) return last[1];
  for (let i = 1; i < stops.length; i++) {
    const [x1, y1] = stops[i];
    const [x0, y0] = stops[i - 1];
    if (t <= x1) return lerp(y0, y1, (t - x0) / (x1 - x0 || 1));
  }
  return last[1];
}

/**
 * Fraction of eligible glyph cells that should be revealed at normalised time
 * `t`. Piecewise-linear by design: phase 1 lands at 8%, phase 2 at 35%,
 * phase 3 at 88%, and phase 4 snaps the remainder into place.
 */
const DENSITY_STOPS: readonly Stop[] = [
  [0, 0],
  [PHASE.detect, 0.08],
  [PHASE.form, 0.35],
  [PHASE.resolve, 0.88],
  [PHASE.lock, 1],
  [1, 1],
];

export function densityAt(t: number) {
  return piecewise(DENSITY_STOPS, t);
}

/**
 * The opacity window open at time `t`, straight from the spec's phase table.
 * Unresolved pixels ride the low end, resolved pixels the high end.
 */
const OPACITY_MIN_STOPS: readonly Stop[] = [
  [0, 0.08],
  [PHASE.detect, 0.08],
  [PHASE.form, 0.18],
  [PHASE.resolve, 0.55],
  [1, 0.55],
];
const OPACITY_MAX_STOPS: readonly Stop[] = [
  [0, 0.35],
  [PHASE.detect, 0.35],
  [PHASE.form, 0.75],
  [PHASE.resolve, 1],
  [1, 1],
];

export function opacityMinAt(t: number) {
  return piecewise(OPACITY_MIN_STOPS, t);
}

export function opacityMaxAt(t: number) {
  return piecewise(OPACITY_MAX_STOPS, t);
}

/**
 * Flicker amplitude envelope. Full strength while the signal is unresolved,
 * gone by the time the glyphs lock — "flicker frequency and amplitude
 * gradually decrease".
 */
export function flickerEnvelopeAt(t: number) {
  return 1 - smoothstep(0.42, PHASE.resolve, t);
}

/**
 * Probability that a peripheral (one-cell-outside) pixel shows up. Peaks during
 * signal detection, gone well before the lock so no stray noise survives.
 */
const HALO_STOPS: readonly Stop[] = [
  [0, 0.02],
  [0.07, 0.17],
  [0.3, 0.14],
  [0.5, 0.07],
  [0.72, 0],
  [1, 0],
];

export function haloChanceAt(t: number) {
  return piecewise(HALO_STOPS, t);
}

/** Flicker pattern updates per second. Decoupled from the rAF frame rate. */
export const FLICKER_HZ = 24;

/** How far past its threshold a cell must travel before it counts as resolved. */
export const RESOLVE_BAND = 0.22;

/* -------------------------------------------------------------------------
 * The field
 * ---------------------------------------------------------------------- */

/** Coverage at or above this counts as glyph ink. */
const INK_MIN = 0.12;

export interface PixelField {
  cols: number;
  rows: number;
  /** Active cells: glyph ink plus the one-cell halo around it. */
  count: number;
  x: Int32Array;
  y: Int32Array;
  /** 0 = glyph ink, 1 = peripheral halo. */
  kind: Uint8Array;
  /** 0 = horizontal, 1 = vertical. Used by the `line` variant only. */
  stroke: Uint8Array;
  /** Rank-normalised reveal order in [0,1). Halo cells are 2. */
  order: Float32Array;
  /** Direction-free order, used by dissolve and exit passes. */
  scatter: Float32Array;
  glyphCount: number;
}

export interface BuildFieldOptions {
  cols: number;
  rows: number;
  /** Per-cell glyph coverage in [0,1], row-major. */
  coverage: Float32Array;
  direction: RevealDirection;
  seed: number;
}

function directionTerm(
  direction: RevealDirection,
  x: number,
  y: number,
  cols: number,
  rows: number
) {
  const u = cols > 1 ? x / (cols - 1) : 0;
  const v = rows > 1 ? y / (rows - 1) : 0;
  switch (direction) {
    case "left":
      return u;
    case "right":
      return 1 - u;
    case "top":
      return v;
    case "bottom":
      return 1 - v;
    case "center": {
      // Headlines are wide and short; weighting y down keeps the front reading
      // as an outward expansion rather than a vertical band.
      const dx = (u - 0.5) * 2;
      const dy = (v - 0.5) * 2 * 0.55;
      return clamp01(Math.hypot(dx, dy) / 1.1414);
    }
    default:
      return 0;
  }
}

const RANK_BINS = 4096;

/**
 * Histogram rank-normalisation: O(n), no sort. Scores land uniformly in [0,1)
 * so `order < density` reveals exactly `density` of the eligible cells. Cells
 * inside a bin are separated by their sub-bin position, so ties don't pop
 * together in visible clumps.
 */
function rankNormalise(
  score: Float32Array,
  eligible: Uint8Array,
  n: number,
  out: Float32Array
) {
  const bins = new Uint32Array(RANK_BINS);
  for (let i = 0; i < n; i++) {
    if (!eligible[i]) continue;
    const b = Math.min(RANK_BINS - 1, (score[i] * RANK_BINS) | 0);
    bins[b]++;
  }
  const start = new Uint32Array(RANK_BINS);
  let acc = 0;
  for (let b = 0; b < RANK_BINS; b++) {
    start[b] = acc;
    acc += bins[b];
  }
  const total = acc || 1;
  for (let i = 0; i < n; i++) {
    if (!eligible[i]) {
      out[i] = 2;
      continue;
    }
    const s = score[i] * RANK_BINS;
    const b = Math.min(RANK_BINS - 1, s | 0);
    out[i] = (start[b] + (s - b) * bins[b]) / total;
  }
}

export function buildField({
  cols,
  rows,
  coverage,
  direction,
  seed,
}: BuildFieldOptions): PixelField {
  const n = cols * rows;
  const ink = new Uint8Array(n);
  let glyphCount = 0;
  for (let i = 0; i < n; i++) {
    if (coverage[i] >= INK_MIN) {
      ink[i] = 1;
      glyphCount++;
    }
  }

  // A halo cell is empty but sits one grid step outside the silhouette. These
  // are the pixels that "occasionally appear outside the glyph" early on.
  const halo = new Uint8Array(n);
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      const i = cy * cols + cx;
      if (ink[i]) continue;
      let touching = false;
      for (let dy = -1; dy <= 1 && !touching; dy++) {
        const ny = cy + dy;
        if (ny < 0 || ny >= rows) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const nx = cx + dx;
          if (nx < 0 || nx >= cols) continue;
          if (ink[ny * cols + nx]) {
            touching = true;
            break;
          }
        }
      }
      if (touching) halo[i] = 1;
    }
  }

  // Weights. The directional term dominates so the front reads clearly; the
  // Bayer matrix and the seeded noise are what make its edge irregular, and the
  // coverage term pulls glyph cores in ahead of anti-aliased boundary cells.
  const W =
    direction === "random"
      ? { dir: 0, dither: 0.42, cover: 0.14, rand: 0.44, jitter: 0 }
      : { dir: 1, dither: 0.4, cover: 0.16, rand: 0.12, jitter: 0.24 };
  const wSum = W.dir + W.dither + W.cover + W.rand;

  const scoreOrder = new Float32Array(n);
  const scoreScatter = new Float32Array(n);
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      const i = cy * cols + cx;
      if (!ink[i]) continue;
      const r1 = hash3(cx, cy, seed);
      const r2 = hash3(cx, cy, seed + 101);
      const r3 = hash3(cx, cy, seed + 977);
      const bayer = bayer4(cx, cy);
      const cov = coverage[i];
      // 10–20% of cells resolve ahead of or behind the front.
      const dj = clamp01(
        directionTerm(direction, cx, cy, cols, rows) + (r1 - 0.5) * W.jitter
      );
      scoreOrder[i] = clamp01(
        (W.dir * dj + W.dither * bayer + W.cover * (1 - cov) + W.rand * r2) /
          wSum
      );
      // Dissolve order: direction-free, biased so isolated / low-coverage
      // cells are the first to drop out.
      scoreScatter[i] = clamp01(
        0.34 * bayer + 0.46 * r3 + 0.2 * (1 - cov)
      );
    }
  }

  const order = new Float32Array(n);
  const scatter = new Float32Array(n);
  rankNormalise(scoreOrder, ink, n, order);
  rankNormalise(scoreScatter, ink, n, scatter);

  // Pack the active cells into flat arrays so the render loop never walks the
  // empty majority of the grid.
  let count = 0;
  for (let i = 0; i < n; i++) if (ink[i] || halo[i]) count++;

  const xs = new Int32Array(count);
  const ys = new Int32Array(count);
  const kind = new Uint8Array(count);
  const stroke = new Uint8Array(count);
  const aOrder = new Float32Array(count);
  const aScatter = new Float32Array(count);

  let k = 0;
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      const i = cy * cols + cx;
      if (!ink[i] && !halo[i]) continue;
      xs[k] = cx;
      ys[k] = cy;
      kind[k] = ink[i] ? 0 : 1;
      aOrder[k] = ink[i] ? order[i] : 2;
      aScatter[k] = ink[i] ? scatter[i] : 2;
      // Rectilinear stroke orientation for the `line` variant: follow the run
      // the cell belongs to.
      const up = cy > 0 && ink[i - cols];
      const down = cy < rows - 1 && ink[i + cols];
      const left = cx > 0 && ink[i - 1];
      const right = cx < cols - 1 && ink[i + 1];
      stroke[k] = up && down && !(left && right) ? 1 : 0;
      k++;
    }
  }

  return {
    cols,
    rows,
    count,
    x: xs,
    y: ys,
    kind,
    stroke,
    order: aOrder,
    scatter: aScatter,
    glyphCount,
  };
}
