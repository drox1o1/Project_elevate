"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

/**
 * The whole product, drawn in pixels.
 *
 * A character-grid canvas that plays five ASCII scenes — option chain,
 * KYC journey, live vitals, swap route, agent run — with an ordered-dither
 * dissolve between them. Colors come from the live CSS tokens so it
 * re-paints for light/dark; reduced motion gets a single settled frame.
 */

/* ---------------- char-grid model ---------------- */

type Ink =
  | "fg" // foreground
  | "mut" // muted-foreground
  | "up" // market-up
  | "down" // market-down
  | "bid"
  | "ask"
  | "warn"
  | "info"
  | "success";

interface Cell {
  ch: string;
  ink: Ink;
}

class Grid {
  cells: Cell[];
  constructor(
    public cols: number,
    public rows: number
  ) {
    this.cells = Array.from({ length: cols * rows }, () => ({ ch: " ", ink: "fg" }));
  }
  put(x: number, y: number, ch: string, ink: Ink = "fg") {
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return;
    const c = this.cells[(y | 0) * this.cols + (x | 0)];
    if (!c) return;
    c.ch = ch;
    c.ink = ink;
  }
  text(x: number, y: number, s: string, ink: Ink = "fg") {
    for (let i = 0; i < s.length; i++) this.put(x + i, y, s[i], ink);
  }
  /** Horizontal bar of block glyphs with a dithered tip. */
  bar(x: number, y: number, len: number, max: number, ink: Ink) {
    const full = Math.floor(len);
    for (let i = 0; i < Math.min(full, max); i++) this.put(x + i, y, "█", ink);
    const frac = len - full;
    if (full < max && frac > 0.2) this.put(x + full, y, frac > 0.66 ? "▓" : "▒", ink);
  }
  clear() {
    for (const c of this.cells) {
      c.ch = " ";
      c.ink = "fg";
    }
  }
}

/* ---------------- scenes ---------------- */

type Scene = { name: string; draw: (g: Grid, t: number) => void };

const wob = (t: number, seed: number, amp = 1) =>
  Math.sin(t * 1.7 + seed * 12.9898) * amp;

const SCENES: Scene[] = [
  {
    name: "OPTION CHAIN",
    draw(g, t) {
      const spot = 24812 + Math.round(wob(t, 1, 14));
      g.text(1, 0, "NIFTY", "fg");
      g.text(7, 0, String(spot), wob(t, 1) >= 0 ? "up" : "down");
      g.text(g.cols - 10, 0, "17 JUL ▾", "mut");
      g.text(1, 1, "CALLS", "bid");
      g.text(g.cols - 5, 1, "PUTS", "ask");
      const mid = Math.floor(g.cols / 2);
      const strikes = [24700, 24750, 24800, 24850, 24900];
      strikes.forEach((k, i) => {
        const y = 2 + i;
        const atm = k === 24800;
        const cw = 6 + wob(t, i, 3.2) + (atm ? 3 : 0);
        const pw = 5 + wob(t, i + 9, 3.2) + (atm ? 3 : 0);
        g.bar(mid - 4 - Math.min(9, Math.max(1, cw)), y, Math.min(9, Math.max(1, cw)), 9, "bid");
        g.text(mid - 2, y, String(k), atm ? "fg" : "mut");
        g.bar(mid + 4, y, Math.min(9, Math.max(1, pw)), 9, "ask");
        if (atm) g.text(mid - 2, y + 0, String(k), "fg");
        if (atm) g.text(1, y, "ATM▸", "warn");
      });
      g.text(1, g.rows - 1, "Δ 0.53  Θ -19.1  OI 24.1L", "mut");
    },
  },
  {
    name: "KYC JOURNEY",
    draw(g, t) {
      const steps = ["DETAILS", "PAN", "DOCS", "LIVENESS", "REVIEW"];
      const phase = Math.min(steps.length, 1 + Math.floor((t % 6) * 1.1));
      g.text(1, 0, "IDENTITY VERIFICATION", "fg");
      steps.forEach((s, i) => {
        const y = 2 + i;
        const done = i < phase;
        const active = i === phase;
        g.put(2, y, done ? "█" : active ? "▓" : "░", done ? "success" : active ? "info" : "mut");
        g.text(4, y, s, done || active ? "fg" : "mut");
        if (done) g.text(4 + s.length + 1, y, "✓", "success");
        if (active) g.text(4 + s.length + 1, y, ["|", "/", "-", "\\"][Math.floor(t * 8) % 4], "info");
      });
      const total = Math.round(((phase) / steps.length) * (g.cols - 4));
      g.bar(2, g.rows - 2, total, g.cols - 4, "success");
      g.text(1, g.rows - 1, phase >= 5 ? "MANUAL REVIEW · a specialist is looking" : "every state designed — even the retakes", phase >= 5 ? "warn" : "mut");
    },
  },
  {
    name: "LIVE VITALS",
    draw(g, t) {
      g.text(1, 0, "BED 12", "fg");
      const hr = 72 + Math.round(wob(t, 3, 2));
      g.text(g.cols - 8, 0, `${hr} BPM`, "success");
      // ECG: one beat scrolling across the mid rows
      const midY = Math.floor(g.rows / 2);
      for (let x = 1; x < g.cols - 1; x++) {
        const ph = ((x + t * 14) % 24) / 24; // beat period
        let dy = 0;
        if (ph > 0.32 && ph < 0.37) dy = -1;
        else if (ph >= 0.37 && ph < 0.42) dy = -3;
        else if (ph >= 0.42 && ph < 0.47) dy = 1;
        else if (ph > 0.6 && ph < 0.7) dy = -1;
        const y = midY + dy;
        g.put(x, y, dy === -3 ? "█" : dy !== 0 ? "▓" : "░", "success");
      }
      g.text(1, g.rows - 2, "SPO₂ 98%   BP 122/78   36.8°C", "mut");
      g.text(1, g.rows - 1, "all vitals in range", "success");
    },
  },
  {
    name: "CRYPTO SWAP",
    draw(g, t) {
      g.text(1, 0, "SWAP 1,000 USDT → ETH", "fg");
      const hops = ["USDT", "USDC", "WETH", "ETH"];
      const y = Math.floor(g.rows / 2) - 1;
      const seg = Math.floor((g.cols - 8) / (hops.length - 1));
      hops.forEach((h, i) => {
        const x = 3 + i * seg;
        g.text(x, y, `[${h}]`, i === hops.length - 1 ? "up" : "fg");
        if (i < hops.length - 1)
          for (let d = h.length + 2; d < seg; d++) g.put(x + d, y, "·", "mut");
      });
      // packet travelling the route
      const total = seg * (hops.length - 1);
      const p = Math.floor((t * 10) % total);
      g.put(3 + p, y, "█", "info");
      g.text(1, y + 2, "rate 1 ETH = 3,412.60   impact 0.05%", "mut");
      g.text(1, g.rows - 1, "approve → swap → confirmed on-chain", "mut");
    },
  },
  {
    name: "AGENT RUN",
    draw(g, t) {
      g.text(1, 0, "GOAL: refund order #8412", "fg");
      const lines: [string, Ink][] = [
        ["▸ search_components", "info"],
        ["✓ orders.get         312ms", "success"],
        ["✓ payments.refund    1.2s", "success"],
        ["⧗ approval gate — waiting", "warn"],
        ["✓ email.send         queued", "success"],
      ];
      const shown = Math.min(lines.length, 1 + Math.floor((t % 6) * 1.2));
      for (let i = 0; i < shown; i++) {
        const [s, ink] = lines[i];
        const isLast = i === shown - 1 && shown < lines.length;
        g.text(2, 2 + i, isLast ? s.slice(0, 1 + Math.floor((t * 20) % s.length)) : s, ink);
      }
      if (shown >= lines.length) g.text(2, g.rows - 1, "ARTIFACT: refund_51ab complete ✓", "up");
      else g.text(2, g.rows - 1, "12.4k tokens · $0.08", "mut");
    },
  },
];

/* 4×4 Bayer matrix for the dither dissolve between scenes. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/* ---------------- component ---------------- */

export interface AsciiShowcaseProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Seconds per scene. Default 6. */
  sceneSeconds?: number;
}

export function AsciiShowcase({
  className,
  sceneSeconds = 6,
  ...rest
}: AsciiShowcaseProps) {
  const reduced = useReducedMotion();
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [label, setLabel] = React.useState(SCENES[0].name);

  React.useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let stopped = false;

    const readInks = (): Record<Ink, string> => {
      const s = getComputedStyle(wrap);
      const v = (name: string) => s.getPropertyValue(name).trim();
      return {
        fg: v("--foreground"),
        mut: v("--muted-foreground"),
        up: v("--market-up"),
        down: v("--market-down"),
        bid: v("--bid"),
        ask: v("--ask"),
        warn: v("--warning"),
        info: v("--info"),
        success: v("--success"),
      };
    };

    let inks = readInks();
    const font = getComputedStyle(wrap).fontFamily;

    const CW = 11; // cell width px
    const CH = 20; // cell height px
    let grid: Grid;
    let next: Grid;

    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.max(24, Math.floor(w / CW));
      const rows = Math.max(9, Math.floor(h / CH));
      grid = new Grid(cols, rows);
      next = new Grid(cols, rows);
    };
    size();

    const paint = (g: Grid) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `15px ${font}`;
      ctx.textBaseline = "top";
      for (let y = 0; y < g.rows; y++) {
        for (let x = 0; x < g.cols; x++) {
          const c = g.cells[y * g.cols + x];
          if (c.ch === " ") continue;
          ctx.fillStyle = inks[c.ink];
          ctx.fillText(c.ch, x * CW, y * CH + 2);
        }
      }
    };

    if (reduced) {
      // One settled frame of the first scene; still theme-aware.
      const drawStill = () => {
        inks = readInks();
        grid.clear();
        SCENES[0].draw(grid, 2.5);
        paint(grid);
      };
      drawStill();
      const mo = new MutationObserver(drawStill);
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      const ro = new ResizeObserver(() => {
        size();
        drawStill();
      });
      ro.observe(wrap);
      return () => {
        mo.disconnect();
        ro.disconnect();
      };
    }

    const start = performance.now();
    let last = 0;
    const FPS = 14; // deliberately chunky
    const tick = (now: number) => {
      if (stopped) return;
      raf = requestAnimationFrame(tick);
      if (now - last < 1000 / FPS) return;
      last = now;
      // rAF's first timestamp can predate our start capture — clamp.
      const elapsed = Math.max(0, (now - start) / 1000);
      const per = sceneSeconds;
      const n = SCENES.length;
      const idx = ((Math.floor(elapsed / per) % n) + n) % n;
      const t = elapsed % per;
      const scene = SCENES[idx];
      if (!scene) return;
      setLabel(scene.name);

      grid.clear();
      scene.draw(grid, t);

      // Dither dissolve during the last 0.7s: mix in the next scene.
      const tail = per - t;
      if (tail < 0.7) {
        const nextScene = SCENES[(idx + 1) % SCENES.length];
        next.clear();
        nextScene.draw(next, 0);
        const threshold = (1 - tail / 0.7) * 16;
        for (let y = 0; y < grid.rows; y++) {
          for (let x = 0; x < grid.cols; x++) {
            if (BAYER[(y % 4) * 4 + (x % 4)] < threshold) {
              grid.cells[y * grid.cols + x] = next.cells[y * next.cols + x];
            }
          }
        }
      }
      paint(grid);
    };
    raf = requestAnimationFrame(tick);

    const mo = new MutationObserver(() => {
      inks = readInks();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const ro = new ResizeObserver(size);
    ro.observe(wrap);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      mo.disconnect();
      ro.disconnect();
    };
  }, [reduced, sceneSeconds]);

  return (
    <div
      data-slot="ascii-showcase"
      className={cn(
        "pixel-frame scanlines relative overflow-hidden bg-card",
        className
      )}
      {...rest}
    >
      <div ref={wrapRef} className="h-72 w-full font-pixel sm:h-80" aria-hidden="true">
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
      <div className="pointer-events-none absolute bottom-2 right-3 font-pixel text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <p className="sr-only">
        Animated pixel-art tour of DUKU Labs components: an option chain, a
        KYC journey, live patient vitals, a crypto swap route and an agent
        run.
      </p>
    </div>
  );
}
