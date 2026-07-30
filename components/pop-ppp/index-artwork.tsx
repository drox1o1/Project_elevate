import { cn } from "@/lib/utils";
import type { Motif } from "@/lib/pop-ppp/types";

/**
 * Generative artwork per index, drawn from the index's own price series.
 *
 * This replaces the icon that used to sit on each card. An icon of a chain
 * tells you the index is about a chain, which you already knew from the
 * title; a composition whose geometry *is* the series tells you the shape of
 * the answer before you read a number. It also means no two indices can look
 * the same, because no two series are the same — the art is a function of the
 * data rather than of the category.
 *
 * Pure SVG and no hooks, so it renders on the server and costs nothing to
 * hydrate. Colour comes from `--pop-accent` on an ancestor, so the caller
 * controls theming in one place.
 */

export interface IndexArtworkProps
  extends Omit<React.SVGProps<SVGSVGElement>, "values" | "children"> {
  /** The series, in observation order. Any scale — it is normalised here. */
  values: number[];
  motif: Motif;
  /** Draw filled rather than hairline, for large hero placements. */
  weight?: "hairline" | "bold";
  className?: string;
}

const VB = 200;

/** Normalise to 0–1, guarding a flat series. */
function norm(values: number[]): number[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  if (range === 0) return values.map(() => 0.5);
  return values.map((v) => (v - min) / range);
}

/** Evenly resample to `n` points so a 17-year and a 31-year series compose alike. */
function resample(values: number[], n: number): number[] {
  if (values.length === 0) return new Array(n).fill(0.5);
  if (values.length === n) return values;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * (values.length - 1);
    const lo = Math.floor(t);
    const hi = Math.min(values.length - 1, lo + 1);
    out.push(values[lo] + (values[hi] - values[lo]) * (t - lo));
  }
  return out;
}

function Rings({ v, sw }: { v: number[]; sw: number }) {
  // Concentric rings, radius tracking the series — a chain seen end-on.
  const rings = resample(v, 11);
  return (
    <>
      {rings.map((n, i) => (
        <circle
          key={i}
          cx={VB / 2}
          cy={VB / 2}
          r={10 + n * 78}
          strokeWidth={sw}
          opacity={0.25 + (i / rings.length) * 0.75}
        />
      ))}
      <circle cx={VB / 2} cy={VB / 2} r={4} fill="var(--pop-accent)" stroke="none" />
    </>
  );
}

function Columns({ v, sw }: { v: number[]; sw: number }) {
  const cols = resample(v, 17);
  const gap = (VB - 24) / cols.length;
  return (
    <>
      {cols.map((n, i) => {
        const h = 14 + n * 150;
        const x = 12 + gap * i + gap / 2;
        return (
          <line
            key={i}
            x1={x}
            x2={x}
            y1={VB - 14}
            y2={VB - 14 - h}
            strokeWidth={Math.max(sw, gap * 0.42)}
            strokeLinecap="round"
            opacity={0.35 + n * 0.65}
          />
        );
      })}
    </>
  );
}

function Lattice({ v, sw }: { v: number[]; sw: number }) {
  // A diamond field: the infield, and a scatter of priced outcomes.
  const pts = resample(v, 36);
  const cells = 6;
  const step = 150 / (cells - 1);
  return (
    <>
      <path
        d={`M ${VB / 2} 18 L 182 ${VB / 2} L ${VB / 2} 182 L 18 ${VB / 2} Z`}
        strokeWidth={sw}
        opacity={0.4}
      />
      {pts.map((n, i) => {
        const gx = i % cells;
        const gy = Math.floor(i / cells);
        const x = 25 + gx * step;
        const y = 25 + gy * step;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={1.4 + n * 5}
            fill="var(--pop-accent)"
            stroke="none"
            opacity={0.25 + n * 0.7}
          />
        );
      })}
    </>
  );
}

function Vessel({ v, sw }: { v: number[]; sw: number }) {
  // A tumbler, filled to the latest value, with a level line per observation.
  const levels = resample(v, 12);
  const last = levels[levels.length - 1];
  const top = 26;
  const bottom = 178;
  const fillY = bottom - last * (bottom - top - 12);
  return (
    <>
      <path
        d={`M 62 ${top} L 74 ${bottom} L 126 ${bottom} L 138 ${top}`}
        strokeWidth={sw * 1.4}
        strokeLinejoin="round"
      />
      <line x1={58} x2={142} y1={top} y2={top} strokeWidth={sw * 1.4} strokeLinecap="round" />
      {/* the straw */}
      <line x1={128} x2={148} y1={top + 4} y2={12} strokeWidth={sw * 1.2} strokeLinecap="round" />
      {levels.map((n, i) => {
        const y = bottom - n * (bottom - top - 12);
        const inset = 8 + (1 - (y - top) / (bottom - top)) * 4;
        return (
          <line
            key={i}
            x1={68 + inset}
            x2={132 - inset}
            y1={y}
            y2={y}
            strokeWidth={sw}
            opacity={0.2 + (i / levels.length) * 0.6}
          />
        );
      })}
      <line
        x1={70}
        x2={130}
        y1={fillY}
        y2={fillY}
        strokeWidth={sw * 2.2}
        strokeLinecap="round"
      />
    </>
  );
}

function Spread({ v, sw }: { v: number[]; sw: number }) {
  // Two lines whose gap is the story: the premium, opening then closing.
  const a = resample(v, 24);
  const gap = (VB - 32) / (a.length - 1);
  const upper = a.map((n, i) => `${i === 0 ? "M" : "L"} ${16 + gap * i} ${34 + (1 - n) * 60}`);
  const lower = a.map(
    (n, i) => `${i === 0 ? "M" : "L"} ${16 + gap * i} ${112 + (1 - n) * 26}`
  );
  return (
    <>
      <path d={upper.join(" ")} strokeWidth={sw * 1.6} strokeLinecap="round" />
      <path
        d={lower.join(" ")}
        strokeWidth={sw * 1.2}
        strokeDasharray="5 5"
        opacity={0.7}
        strokeLinecap="round"
      />
      {a.map((n, i) =>
        i % 3 === 0 ? (
          <line
            key={i}
            x1={16 + gap * i}
            x2={16 + gap * i}
            y1={34 + (1 - n) * 60}
            y2={112 + (1 - n) * 26}
            strokeWidth={sw * 0.7}
            opacity={0.28}
          />
        ) : null
      )}
    </>
  );
}

function Grid({ v, sw }: { v: number[]; sw: number }) {
  // A modular quilt — one cell per observation, weight by value. Reads as a
  // standardised unit measured repeatedly, which is what a PPP index is.
  const cells = resample(v, 36);
  const n = 6;
  const size = 150 / n;
  return (
    <>
      {cells.map((val, i) => {
        const gx = i % n;
        const gy = Math.floor(i / n);
        const inset = (1 - val) * (size * 0.34);
        return (
          <rect
            key={i}
            x={25 + gx * size + inset}
            y={25 + gy * size + inset}
            width={size - inset * 2}
            height={size - inset * 2}
            strokeWidth={sw}
            opacity={0.3 + val * 0.7}
          />
        );
      })}
    </>
  );
}

function Steps({ v, sw }: { v: number[]; sw: number }) {
  const pts = resample(v, 14);
  const gap = (VB - 32) / pts.length;
  let d = `M 16 ${178 - pts[0] * 148}`;
  pts.forEach((val, i) => {
    const x = 16 + gap * (i + 1);
    const y = 178 - val * 148;
    d += ` L ${x} ${178 - pts[Math.max(0, i - 1)] * 148} L ${x} ${y}`;
  });
  return <path d={d} strokeWidth={sw * 1.6} strokeLinejoin="miter" />;
}

function Spiral({ v, sw }: { v: number[]; sw: number }) {
  // Compounding, as a spiral whose step widens with the series.
  const pts = resample(v, 90);
  const d = pts
    .map((n, i) => {
      const t = (i / (pts.length - 1)) * Math.PI * 5;
      const r = 6 + (i / pts.length) * 78 * (0.6 + n * 0.6);
      const x = VB / 2 + Math.cos(t) * r;
      const y = VB / 2 + Math.sin(t) * r;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  return <path d={d} strokeWidth={sw * 1.3} strokeLinecap="round" />;
}

export function IndexArtwork({
  values,
  motif,
  weight = "hairline",
  className,
  ...rest
}: IndexArtworkProps) {
  const v = norm(values);
  const sw = weight === "bold" ? 2.4 : 1.4;

  const body = (() => {
    switch (motif) {
      case "rings":
        return <Rings v={v} sw={sw} />;
      case "columns":
        return <Columns v={v} sw={sw} />;
      case "lattice":
        return <Lattice v={v} sw={sw} />;
      case "vessel":
        return <Vessel v={v} sw={sw} />;
      case "spread":
        return <Spread v={v} sw={sw} />;
      case "grid":
        return <Grid v={v} sw={sw} />;
      case "steps":
        return <Steps v={v} sw={sw} />;
      case "spiral":
        return <Spiral v={v} sw={sw} />;
    }
  })();

  return (
    <svg
      viewBox={`0 0 ${VB} ${VB}`}
      fill="none"
      stroke="var(--pop-accent)"
      strokeLinecap="round"
      aria-hidden="true"
      className={cn("overflow-visible", className)}
      {...rest}
    >
      {body}
    </svg>
  );
}
