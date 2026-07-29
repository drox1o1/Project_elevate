"use client";

/**
 * use-pixel-text-renderer — everything PixelRevealText knows about the DOM,
 * the glyph mask and the canvas.
 *
 * The hook owns three things React never sees:
 *
 * 1. Measurement. It reads the real DOM text's computed typography and the
 *    per-character client rects, so the canvas is a redraw of the *actual*
 *    laid-out text: wrapping, alignment, letter-spacing and text-transform
 *    included. Nothing is re-implemented, so nothing can drift.
 * 2. The mask. Text is drawn once to an offscreen canvas and reduced to a
 *    per-cell coverage map, then handed to `buildField` for its reveal order.
 *    Cached until the text, typography or box changes.
 * 3. The loop. A single requestAnimationFrame driver that writes pixels and
 *    never touches React state, stops the moment a pass completes, and pauses
 *    while the document is hidden.
 */

import * as React from "react";
import {
  buildField,
  clamp,
  clamp01,
  densityAt,
  FLICKER_HZ,
  flickerEnvelopeAt,
  haloChanceAt,
  hash3,
  lerp,
  opacityMaxAt,
  opacityMinAt,
  PHASE,
  phaseEase,
  RESOLVE_BAND,
  type PixelField,
  type RevealDirection,
} from "./pixel-dither";

export type PixelVariant = "square" | "grid" | "circle" | "triangle" | "line";

export interface UsePixelTextRendererOptions {
  /** The exact string currently rendered in the DOM text layer. */
  text: string;
  variant: PixelVariant;
  direction: RevealDirection;
  /** Cell size in CSS pixels. */
  pixelSize: number;
  /** Derive pixelSize from the measured font size instead: clamp(2, fs/18, 5). */
  autoPixelSize?: boolean;
  intensity: number;
  flicker: number;
  seed: number;
  signalColor?: string;
  noiseColor?: string;
  /** When false the hook does no measuring, no masking and no drawing at all. */
  enabled: boolean;
  onReady?: (ready: boolean) => void;
  onStart?: () => void;
  /** Fires at the phase-4 boundary so the caller can run the lock pulse. */
  onLock?: () => void;
  /** Fires at the phase-5 boundary so the caller can crossfade to DOM text. */
  onHandoff?: () => void;
  onComplete?: () => void;
  onDissolved?: () => void;
  onMicroEnd?: () => void;
}

type Pass = "in" | "out" | "micro";

export interface PixelTextRenderer {
  wrapperRef: React.RefObject<HTMLElement | null>;
  textRef: React.RefObject<HTMLElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** True once the glyph mask has been measured and is safe to animate. */
  ready: boolean;
  /** Play the full reveal. `delay` is in milliseconds. */
  play: (duration: number, delay?: number) => void;
  /** Reverse-dither the resolved text away. Used for text swaps and exits. */
  dissolve: (duration: number) => void;
  /** Short restrained flicker across a few percent of the resolved glyph. */
  microFlicker: (duration?: number) => void;
  /** Draw nothing. */
  clear: () => void;
  /** Stop the loop and drop any pending delayed start. */
  stop: () => void;
  /** True while a pass is running. Read from a ref — never triggers a render. */
  isRunning: () => boolean;
}

interface Geometry {
  left: number;
  top: number;
  /** CSS-pixel size of the canvas box. */
  width: number;
  height: number;
  /** Device-pixel size of the canvas backing store. */
  deviceWidth: number;
  deviceHeight: number;
  cell: number;
  cols: number;
  rows: number;
  dpr: number;
  /** Device-pixel column/row edges. Integers, so cells tile without seams. */
  xs: Int32Array;
  ys: Int32Array;
}

interface RunState {
  pass: Pass;
  start: number;
  duration: number;
  pausedTotal: number;
  hiddenAt: number;
  lastTick: number;
  lastDensity: number;
  lockFired: boolean;
  handoffFired: boolean;
}

const ALPHA_BUCKETS = 16;
const COLOR_GROUPS = 3; // 0 resolved, 1 forming/signal, 2 peripheral noise
const TOTAL_BUCKETS = ALPHA_BUCKETS * COLOR_GROUPS;
const HIDDEN = 255;

/** Hard ceiling on grid cells. Guards a huge paragraph from a huge mask. */
const MAX_CELLS = 260_000;

function applyTextTransform(raw: string, transform: string) {
  switch (transform) {
    case "uppercase":
      return raw.toUpperCase();
    case "lowercase":
      return raw.toLowerCase();
    case "capitalize":
      return raw.replace(/(^|\s)(\S)/g, (_m, a: string, b: string) => a + b.toUpperCase());
    default:
      return raw;
  }
}

export function usePixelTextRenderer(
  options: UsePixelTextRendererOptions
): PixelTextRenderer {
  const {
    text,
    variant,
    direction,
    pixelSize,
    autoPixelSize = false,
    intensity,
    flicker,
    seed,
    enabled,
  } = options;

  const wrapperRef = React.useRef<HTMLElement | null>(null);
  const textRef = React.useRef<HTMLElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const [ready, setReady] = React.useState(false);

  // Everything below lives in refs: the render loop must never cause a React
  // render, and changing a callback must never restart the loop.
  const cbRef = React.useRef(options);
  cbRef.current = options;

  const fieldRef = React.useRef<PixelField | null>(null);
  const geomRef = React.useRef<Geometry | null>(null);
  const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null);
  const colorsRef = React.useRef<[string, string, string]>([
    "#000",
    "#000",
    "#000",
  ]);
  const runRef = React.useRef<RunState | null>(null);
  const rafRef = React.useRef(0);
  const delayTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const measureTokenRef = React.useRef(0);

  // Scratch buffers for the per-frame counting sort. Grown only when the
  // active-cell count grows.
  const bucketOfRef = React.useRef<Uint8Array>(new Uint8Array(0));
  const sortedRef = React.useRef<Int32Array>(new Int32Array(0));
  const countsRef = React.useRef(new Int32Array(TOTAL_BUCKETS));
  const startsRef = React.useRef(new Int32Array(TOTAL_BUCKETS));
  const cursorRef = React.useRef(new Int32Array(TOTAL_BUCKETS));

  const readyRef = React.useRef(false);
  const setReadySafe = React.useCallback((v: boolean) => {
    if (readyRef.current === v) return;
    readyRef.current = v;
    setReady(v);
    cbRef.current.onReady?.(v);
  }, []);

  /* ---------------------------------------------------------------------
   * Painting
   * ------------------------------------------------------------------ */

  const addShape = React.useCallback(
    (
      ctx: CanvasRenderingContext2D,
      geom: Geometry,
      field: PixelField,
      k: number
    ) => {
      const cx = field.x[k];
      const cy = field.y[k];
      const x0 = geom.xs[cx];
      const y0 = geom.ys[cy];
      const w = geom.xs[cx + 1] - x0;
      const h = geom.ys[cy + 1] - y0;
      if (w <= 0 || h <= 0) return;

      switch (variant) {
        case "grid": {
          // Grid exposes a lattice gap, but never below one device pixel of ink.
          const gap = w >= 4 ? Math.max(1, Math.round(w * 0.22)) : 0;
          ctx.rect(x0, y0, Math.max(1, w - gap), Math.max(1, h - gap));
          break;
        }
        case "circle": {
          const r = Math.min(w, h) / 2;
          const mx = x0 + w / 2;
          const my = y0 + h / 2;
          ctx.moveTo(mx + r, my);
          ctx.arc(mx, my, r, 0, Math.PI * 2);
          break;
        }
        case "triangle": {
          // Alternating orientation tiles cleanly across the glyph.
          if (((cx + cy) & 1) === 1) {
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0 + w, y0);
            ctx.lineTo(x0 + w / 2, y0 + h);
          } else {
            ctx.moveTo(x0 + w / 2, y0);
            ctx.lineTo(x0 + w, y0 + h);
            ctx.lineTo(x0, y0 + h);
          }
          ctx.closePath();
          break;
        }
        case "line": {
          if (field.stroke[k]) {
            const sw = Math.max(1, Math.round(w * 0.5));
            ctx.rect(x0 + ((w - sw) >> 1), y0, sw, h);
          } else {
            const sh = Math.max(1, Math.round(h * 0.5));
            ctx.rect(x0, y0 + ((h - sh) >> 1), w, sh);
          }
          break;
        }
        default:
          ctx.rect(x0, y0, w, h);
      }
    },
    [variant]
  );

  /**
   * One frame. `t` is normalised sequence time, `tick` the quantised flicker
   * clock. Cells are bucketed by colour group and quantised alpha, counting-
   * sorted, then painted as at most 48 filled paths — never one fill per pixel.
   */
  const paint = React.useCallback(
    (pass: Pass, t: number, tick: number) => {
      const ctx = ctxRef.current;
      const geom = geomRef.current;
      const field = fieldRef.current;
      if (!ctx || !geom || !field) return;

      ctx.clearRect(0, 0, geom.deviceWidth, geom.deviceHeight);
      if (field.count === 0) return;

      const bucketOf = bucketOfRef.current;
      const sorted = sortedRef.current;
      const counts = countsRef.current;
      const starts = startsRef.current;
      const cursor = cursorRef.current;
      counts.fill(0);

      const tp = phaseEase(t);
      const lo = opacityMinAt(tp);
      const hi = opacityMaxAt(tp);
      const unresolvedGain = clamp(0.55 + 0.6 * intensity, 0, 1.25);

      let density: number;
      let ampBase: number;
      let haloChance: number;
      let lockPulse = 0;

      if (pass === "in") {
        density = densityAt(t);
        ampBase = flicker * 0.42 * flickerEnvelopeAt(t);
        haloChance = haloChanceAt(t) * (0.5 + 0.7 * intensity);
        // One extremely subtle brightness lift as the signal locks. Not a glow:
        // it only pulls half-formed pixels toward the top of the band.
        if (t >= PHASE.resolve && t < PHASE.lock) {
          const u = (t - PHASE.resolve) / (PHASE.lock - PHASE.resolve);
          lockPulse = Math.sin(u * Math.PI) * 0.5;
        }
      } else if (pass === "out") {
        density = 1 - t;
        // Remaining clusters get noisier as the signal dies.
        ampBase = flicker * 0.5 * (0.35 + 0.65 * t);
        haloChance = haloChanceAt(density) * 0.6 * (0.5 + 0.7 * intensity);
      } else {
        density = 2; // fully resolved; micro-flicker only dims
        ampBase = 0;
        haloChance = 0;
      }

      // Micro-flicker: at most 8% of glyph cells dim briefly, and only dim —
      // the word stays readable throughout.
      const microChance = pass === "micro" ? 0.08 * Math.sin(t * Math.PI) : 0;
      const order = pass === "out" ? field.scatter : field.order;

      for (let k = 0; k < field.count; k++) {
        bucketOf[k] = HIDDEN;

        if (field.kind[k] === 1) {
          // Peripheral noise. Gone entirely once the glyph resolves.
          if (haloChance <= 0) continue;
          if (hash3(k, tick, seed + 5) >= haloChance) continue;
          const q = 0.15 + 0.35 * hash3(k, tick, seed + 6);
          const a = clamp01(lerp(lo, hi, q) * unresolvedGain);
          if (a <= 0.01) continue;
          bucketOf[k] = 2 * ALPHA_BUCKETS + Math.min(15, (a * 16) | 0);
          counts[bucketOf[k]]++;
          continue;
        }

        if (pass === "micro") {
          const dim = hash3(k, tick, seed + 9) < microChance;
          bucketOf[k] = dim ? ALPHA_BUCKETS + 4 : 15;
          counts[bucketOf[k]]++;
          continue;
        }

        const o = order[k];
        const res = (density - o) / RESOLVE_BAND;

        // Perturbation decays fast past the front, so resolved regions hold
        // still while the leading edge keeps churning.
        const amp = res >= 1 ? 0 : ampBase * Math.exp(-Math.max(0, res) * 2.4);
        const n = hash3(k, tick, seed + 1);
        if (density + (n - 0.5) * 2 * amp <= o) continue;

        let q: number;
        let group: number;
        if (res >= 1) {
          q = 1;
          group = 0;
        } else if (res > 0) {
          q = 0.55 + 0.45 * res;
          group = 1;
        } else {
          // The 15–65% flicker band the unresolved field lives in.
          q = 0.15 + 0.5 * hash3(k, tick, seed + 3);
          group = 1;
        }

        let a = lerp(lo, hi, q);
        if (res < 1) {
          a *= unresolvedGain;
          if (lockPulse > 0) a += (hi - a) * lockPulse;
        }
        a = clamp01(a);
        if (a <= 0.01) continue;

        bucketOf[k] = group * ALPHA_BUCKETS + Math.min(15, (a * 16) | 0);
        counts[bucketOf[k]]++;
      }

      let acc = 0;
      for (let b = 0; b < TOTAL_BUCKETS; b++) {
        starts[b] = acc;
        cursor[b] = acc;
        acc += counts[b];
      }
      if (acc === 0) return;
      for (let k = 0; k < field.count; k++) {
        const b = bucketOf[k];
        if (b === HIDDEN) continue;
        sorted[cursor[b]++] = k;
      }

      const colors = colorsRef.current;
      for (let b = 0; b < TOTAL_BUCKETS; b++) {
        const c = counts[b];
        if (c === 0) continue;
        const bi = b % ALPHA_BUCKETS;
        ctx.fillStyle = colors[(b / ALPHA_BUCKETS) | 0];
        // The top bucket paints at exactly 1, so resolved text is never a few
        // percent transparent going into the handoff.
        ctx.globalAlpha =
          bi === ALPHA_BUCKETS - 1 ? 1 : (bi + 0.5) / ALPHA_BUCKETS;
        ctx.beginPath();
        const from = starts[b];
        for (let j = from; j < from + c; j++) addShape(ctx, geom, field, sorted[j]);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
    [addShape, flicker, intensity, seed]
  );

  /* ---------------------------------------------------------------------
   * Measurement
   * ------------------------------------------------------------------ */

  const measure = React.useCallback(async () => {
    const token = ++measureTokenRef.current;
    const wrapper = wrapperRef.current;
    const textEl = textRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !textEl || !canvas) return;

    const node = textEl.firstChild;
    if (!node || node.nodeType !== 3) return;
    const raw = node.nodeValue ?? "";
    if (!raw.trim()) {
      setReadySafe(false);
      return;
    }

    const cs = getComputedStyle(textEl);
    const fontSize = parseFloat(cs.fontSize) || 16;
    const shorthand = `${cs.fontStyle || "normal"} ${cs.fontWeight || "400"} ${fontSize}px ${cs.fontFamily}`;

    // Never measure against a fallback face — the mask would be wrong and the
    // handoff would visibly jump.
    try {
      if (document.fonts && !document.fonts.check(shorthand, raw)) {
        await document.fonts.load(shorthand, raw);
      }
    } catch {
      /* best-effort; measure whatever is available */
    }
    if (token !== measureTokenRef.current) return;
    if (!wrapperRef.current || !textRef.current || !canvasRef.current) return;

    const transformed = applyTextTransform(raw, cs.textTransform);
    const sameLength = transformed.length === raw.length;

    // Per-character client rects. This is what keeps the canvas locked to the
    // DOM through wrapping, alignment, letter-spacing and responsive sizes.
    const range = document.createRange();
    const wrapRect = wrapper.getBoundingClientRect();

    // Client rects are post-transform. If an ancestor is mid-animation (a
    // scaling preview panel, a card entrance), divide the scale back out so the
    // mask is built in layout pixels and stays valid once the transform lands.
    const ratioX = wrapper.offsetWidth ? wrapRect.width / wrapper.offsetWidth : 1;
    const ratioY = wrapper.offsetHeight ? wrapRect.height / wrapper.offsetHeight : 1;
    const sx = Math.abs(ratioX - 1) > 0.01 && ratioX > 0.01 ? ratioX : 1;
    const sy = Math.abs(ratioY - 1) > 0.01 && ratioY > 0.01 ? ratioY : 1;

    const chars: { ch: string; x: number; y: number; h: number }[] = [];
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < raw.length; i++) {
      const ch = sameLength ? transformed[i] : raw[i];
      if (!ch || !ch.trim()) continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const r = range.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      const x = (r.left - wrapRect.left) / sx;
      const y = (r.top - wrapRect.top) / sy;
      const w = r.width / sx;
      const h = r.height / sy;
      chars.push({ ch, x, y, h });
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x + w > maxX) maxX = x + w;
      if (y + h > maxY) maxY = y + h;
    }

    if (!chars.length || !isFinite(minX)) {
      setReadySafe(false);
      return;
    }

    // Pad the box so ascenders, descenders and the one-cell halo cannot clip.
    const pad = Math.ceil(fontSize * 0.4);
    const boxLeft = Math.floor(minX - pad);
    const boxTop = Math.floor(minY - pad);
    const rawW = Math.ceil(maxX + pad) - boxLeft;
    const rawH = Math.ceil(maxY + pad) - boxTop;
    if (rawW <= 0 || rawH <= 0) {
      setReadySafe(false);
      return;
    }

    let cell = autoPixelSize
      ? Math.round(clamp(fontSize / 18, 2, 5))
      : Math.max(1, Math.round(pixelSize));
    let cols = Math.ceil(rawW / cell);
    let rows = Math.ceil(rawH / cell);
    while (cols * rows > MAX_CELLS && cell < 24) {
      cell += 1;
      cols = Math.ceil(rawW / cell);
      rows = Math.ceil(rawH / cell);
    }
    // The grid defines the box, so every cell is whole.
    const width = cols * cell;
    const height = rows * cell;

    // --- offscreen glyph mask, sampled at CSS resolution ------------------
    const off = document.createElement("canvas");
    off.width = width;
    off.height = height;
    const octx = off.getContext("2d", { willReadFrequently: true });
    if (!octx) return;
    octx.font = shorthand;
    octx.textBaseline = "alphabetic";
    octx.textAlign = "left";
    octx.fillStyle = "#fff";
    if ("letterSpacing" in octx) {
      // Per-character positioning already carries letter-spacing; make sure the
      // context does not apply it a second time.
      (octx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
        "0px";
    }

    const metrics = octx.measureText("Hxg");
    const asc =
      metrics.fontBoundingBoxAscent ??
      metrics.actualBoundingBoxAscent ??
      fontSize * 0.8;
    const desc =
      metrics.fontBoundingBoxDescent ??
      metrics.actualBoundingBoxDescent ??
      fontSize * 0.2;
    const boxH = asc + desc;

    for (const c of chars) {
      // Centre the font box inside the box the browser reported for the
      // character, then sit on the alphabetic baseline.
      octx.fillText(c.ch, c.x - boxLeft, c.y + (c.h - boxH) / 2 + asc - boxTop);
    }

    // --- coverage per cell -------------------------------------------------
    const data = octx.getImageData(0, 0, width, height).data;
    const coverage = new Float32Array(cols * rows);
    const inv = 1 / (cell * cell * 255);
    for (let cy = 0; cy < rows; cy++) {
      const rowBase = cy * cols;
      for (let py = cy * cell; py < (cy + 1) * cell; py++) {
        const lineBase = py * width * 4;
        for (let cx = 0; cx < cols; cx++) {
          let sum = 0;
          const base = lineBase + cx * cell * 4 + 3;
          for (let s = 0; s < cell; s++) sum += data[base + s * 4];
          coverage[rowBase + cx] += sum;
        }
      }
    }
    for (let i = 0; i < coverage.length; i++) coverage[i] *= inv;

    if (token !== measureTokenRef.current) return;

    const field = buildField({ cols, rows, coverage, direction, seed });

    // --- device-pixel geometry --------------------------------------------
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const xs = new Int32Array(cols + 1);
    const ys = new Int32Array(rows + 1);
    // Rounding each *edge* (rather than an origin plus a width) keeps every
    // cell on whole device pixels and seamless: no half-pixel blur, no gaps.
    for (let i = 0; i <= cols; i++) xs[i] = Math.round(i * cell * dpr);
    for (let i = 0; i <= rows; i++) ys[i] = Math.round(i * cell * dpr);

    canvas.style.left = `${boxLeft}px`;
    canvas.style.top = `${boxTop}px`;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = xs[cols];
    canvas.height = ys[rows];

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctxRef.current = ctx;

    geomRef.current = {
      left: boxLeft,
      top: boxTop,
      width,
      height,
      deviceWidth: xs[cols],
      deviceHeight: ys[rows],
      cell,
      cols,
      rows,
      dpr,
      xs,
      ys,
    };
    fieldRef.current = field;

    if (bucketOfRef.current.length < field.count) {
      bucketOfRef.current = new Uint8Array(field.count);
      sortedRef.current = new Int32Array(field.count);
    }

    setReadySafe(field.glyphCount > 0);
  }, [autoPixelSize, direction, pixelSize, seed, setReadySafe]);

  const refreshColors = React.useCallback(() => {
    const textEl = textRef.current;
    if (!textEl) return;
    const base = getComputedStyle(textEl).color || "#000";
    const signal = cbRef.current.signalColor || base;
    colorsRef.current = [base, signal, cbRef.current.noiseColor || signal];
  }, []);

  /* ---------------------------------------------------------------------
   * The loop
   * ------------------------------------------------------------------ */

  const clear = React.useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const stopLoop = React.useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
    delayTimerRef.current = null;
  }, []);

  const frame = React.useCallback(
    (now: number) => {
      const run = runRef.current;
      if (!run) return;
      const elapsed = now - run.start - run.pausedTotal;
      const t = run.duration > 0 ? clamp01(elapsed / run.duration) : 1;
      const tick = Math.floor(Math.max(0, elapsed) / (1000 / FLICKER_HZ));

      if (run.pass === "in") {
        if (!run.lockFired && t >= PHASE.resolve) {
          run.lockFired = true;
          cbRef.current.onLock?.();
        }
        if (!run.handoffFired && t >= PHASE.lock) {
          run.handoffFired = true;
          cbRef.current.onHandoff?.();
        }
      }

      if (t >= 1) {
        const pass = run.pass;
        runRef.current = null;
        rafRef.current = 0;
        clear();
        if (pass === "in") cbRef.current.onComplete?.();
        else if (pass === "out") cbRef.current.onDissolved?.();
        else cbRef.current.onMicroEnd?.();
        return;
      }

      // Skip redundant repaints: the flicker pattern only moves at FLICKER_HZ,
      // and sub-percent density changes are invisible.
      const density = run.pass === "in" ? densityAt(t) : t;
      if (tick !== run.lastTick || Math.abs(density - run.lastDensity) > 0.004) {
        run.lastTick = tick;
        run.lastDensity = density;
        paint(run.pass, t, tick);
      }
      rafRef.current = requestAnimationFrame(frame);
    },
    [clear, paint]
  );

  const begin = React.useCallback(
    (pass: Pass, duration: number) => {
      if (!enabled) return;
      stopLoop();
      refreshColors();
      runRef.current = {
        pass,
        start: performance.now(),
        duration: Math.max(1, duration),
        pausedTotal: 0,
        hiddenAt: 0,
        lastTick: -1,
        lastDensity: -1,
        lockFired: false,
        handoffFired: false,
      };
      rafRef.current = requestAnimationFrame(frame);
    },
    [enabled, frame, refreshColors, stopLoop]
  );

  const play = React.useCallback(
    (duration: number, delay = 0) => {
      if (!enabled) return;
      stopLoop();
      runRef.current = null;
      clear();
      const start = () => {
        delayTimerRef.current = null;
        cbRef.current.onStart?.();
        begin("in", duration);
      };
      if (delay > 0) delayTimerRef.current = setTimeout(start, delay);
      else start();
    },
    [begin, clear, enabled, stopLoop]
  );

  const dissolve = React.useCallback(
    (duration: number) => begin("out", duration),
    [begin]
  );

  const microFlicker = React.useCallback(
    (duration = 220) => {
      if (!enabled || runRef.current) return;
      begin("micro", clamp(duration, 180, 260));
    },
    [begin, enabled]
  );

  const stop = React.useCallback(() => {
    stopLoop();
    runRef.current = null;
  }, [stopLoop]);

  const isRunning = React.useCallback(() => runRef.current !== null, []);

  /* ---------------------------------------------------------------------
   * Lifecycle
   * ------------------------------------------------------------------ */

  // Re-measure whenever the text, typography inputs or box change. The mask is
  // cached between these; a frame never re-measures anything.
  React.useEffect(() => {
    if (!enabled) {
      setReadySafe(false);
      fieldRef.current = null;
      geomRef.current = null;
      return;
    }
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => void measure());
    };
    schedule();

    const wrapper = wrapperRef.current;
    let ro: ResizeObserver | null = null;
    if (wrapper && typeof ResizeObserver !== "undefined") {
      let first = true;
      ro = new ResizeObserver(() => {
        // The observer fires once on observe(); the initial measure covers it.
        if (first) {
          first = false;
          return;
        }
        schedule();
      });
      ro.observe(wrapper);
    }

    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) schedule();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, [enabled, measure, text, variant, setReadySafe]);

  // Pause while the tab is hidden; resume without skipping the sequence.
  React.useEffect(() => {
    if (!enabled) return;
    const onVisibility = () => {
      const run = runRef.current;
      if (!run) return;
      if (document.hidden) {
        run.hiddenAt = performance.now();
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      } else if (run.hiddenAt) {
        run.pausedTotal += performance.now() - run.hiddenAt;
        run.hiddenAt = 0;
        if (!rafRef.current) rafRef.current = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [enabled, frame]);

  React.useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      runRef.current = null;
    },
    []
  );

  return {
    wrapperRef,
    textRef,
    canvasRef,
    ready,
    play,
    dissolve,
    microFlicker,
    clear,
    stop,
    isRunning,
  };
}

/** The documented responsive cell size: clamp(2, fontSize / 18, 5). */
export function responsivePixelSize(fontSize: number) {
  return Math.round(clamp(fontSize / 18, 2, 5));
}
