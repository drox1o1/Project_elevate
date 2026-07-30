"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/default/ui/button";

/**
 * The shareable summary.
 *
 * A minimal editorial card rather than a poster: a light ground, one hairline
 * rule, one accent and generous space. What fills that space is data — the
 * index's actual series drawn between its two endpoints, and three figures
 * that say something the headline number cannot (how fast, how much of the
 * move was real, how hard it is to afford).
 *
 * Key art is used when the index has it; the composition reflows without it,
 * so a missing file never leaves a hole.
 *
 * The source note is not decoration. A figure that travels without its
 * provenance is the failure mode this whole section exists to avoid.
 */

const RATIOS = {
  "1:1": { w: 1080, h: 1080, label: "1:1" },
  "4:5": { w: 1080, h: 1350, label: "4:5" },
  "16:9": { w: 1920, h: 1080, label: "16:9" },
} as const;

type RatioKey = keyof typeof RATIOS;

const INK = "#0f0f10";
const MUTED = "#8a8a8f";
const FAINT = "#e2e1dd";
const GROUND = "#faf9f7";
const UP = "#127a52";
const DOWN = "#b4291f";

export interface ShareStat {
  label: string;
  value: string;
}

export interface ShareCardProps {
  indexName: string;
  reference: string;
  dialogue: string;
  baseLabel: string;
  baseValue: string;
  currentLabel: string;
  currentValue: string;
  change: string;
  changePositive: boolean;
  remark: string;
  /** Up to three supporting figures. */
  stats: ShareStat[];
  /** Normalised 0–1 series — the shape of the answer. */
  spark: number[];
  baseYear: number;
  latestYear: number;
  sourceNote: string;
  accent: string;
  /** Key art, when the index has it. */
  imageSrc?: string | null;
  className?: string;
}

function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Cover-fit a source image into a rounded destination box. */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.clip();
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
}

export function ShareCard({
  indexName,
  reference,
  dialogue,
  baseLabel,
  baseValue,
  currentLabel,
  currentValue,
  change,
  changePositive,
  remark,
  stats,
  spark,
  baseYear,
  latestYear,
  sourceNote,
  accent,
  imageSrc,
  className,
}: ShareCardProps) {
  const [ratio, setRatio] = React.useState<RatioKey>("1:1");
  const [busy, setBusy] = React.useState(false);

  const draw = React.useCallback(
    (canvas: HTMLCanvasElement, key: RatioKey, art: HTMLImageElement | null) => {
      const { w, h } = RATIOS[key];
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.textBaseline = "top";
      // Type scales off the short edge so a 16:9 export is not a blown-up 1:1.
      const scale = Math.min(w, h);
      const px = (frac: number) => Math.round(scale * frac);
      const pad = px(0.072);
      const inner = w - pad * 2;
      const wide = key === "16:9";
      const sans = "ui-sans-serif, system-ui, sans-serif";
      const mono = "ui-monospace, monospace";

      ctx.fillStyle = GROUND;
      ctx.fillRect(0, 0, w, h);

      /* --- masthead --- */
      let y = pad;
      const mark = px(0.018);
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(pad + mark / 2, y + mark * 0.62, mark / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = INK;
      ctx.font = `600 ${px(0.018)}px ${mono}`;
      ctx.fillText("POP PPP", pad + mark * 2, y);

      ctx.fillStyle = MUTED;
      ctx.font = `400 ${px(0.018)}px ${mono}`;
      const site = "DUKU.DESIGN";
      ctx.fillText(site, w - pad - ctx.measureText(site).width, y);

      y += px(0.042);
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(w - pad, y);
      ctx.stroke();

      /* --- hook, with key art beside it when there is any --- */
      const hookTop = y + px(0.048);
      y = hookTop;

      const artSize = art ? px(wide ? 0.19 : 0.22) : 0;
      const textWidth = art ? inner - artSize - px(0.045) : inner;
      const artBottom = art ? y + artSize : 0;
      const artLeft = art ? w - pad - artSize - px(0.03) : Infinity;
      if (art) drawCover(ctx, art, w - pad - artSize, y, artSize, artSize, px(0.016));

      ctx.fillStyle = MUTED;
      ctx.font = `500 ${px(0.017)}px ${mono}`;
      ctx.fillText(indexName.toUpperCase(), pad, y);
      y += px(0.034);

      const dialogueSize = px(wide ? 0.042 : 0.05);
      ctx.fillStyle = INK;
      ctx.font = `600 ${dialogueSize}px ${sans}`;
      for (const line of wrap(ctx, `“${dialogue}”`, textWidth).slice(
        0,
        wide ? 2 : 3
      )) {
        ctx.fillText(line, pad, y);
        y += Math.round(dialogueSize * 1.2);
      }

      y += px(0.008);
      ctx.fillStyle = MUTED;
      ctx.font = `400 ${px(0.019)}px ${sans}`;
      ctx.fillText(reference, pad, y);
      // Deliberately not pushed below the art. The art occupies the right
      // column only, and the value line is usually far narrower than the space
      // left of it — blanket-clearing the art costs a whole text block of
      // vertical budget on the tall ratios, which is what squeezed the remark
      // off the 1:1 card. Overlap is checked for real, below.
      y += px(0.036);

      /* --- footer, measured from the bottom so the middle can breathe --- */
      const noteSize = px(0.015);
      ctx.font = `400 ${noteSize}px ${mono}`;
      const noteLines = wrap(ctx, sourceNote, inner).slice(0, 2);
      const noteBlock = noteLines.length * Math.round(noteSize * 1.55);
      let ny = h - pad - noteBlock;
      ctx.fillStyle = MUTED;
      for (const line of noteLines) {
        ctx.fillText(line, pad, ny);
        ny += Math.round(noteSize * 1.55);
      }

      /* --- supporting figures --- */
      const statLabel = px(0.015);
      const statValue = px(0.025);
      const statBlock = Math.round(statLabel * 1.75 + statValue * 1.1);
      const sy = h - pad - noteBlock - px(0.04) - statBlock;
      const shown = stats.slice(0, 3);
      const colW = inner / Math.max(1, shown.length);
      shown.forEach((s, i) => {
        const x = pad + colW * i;
        ctx.fillStyle = MUTED;
        ctx.font = `400 ${statLabel}px ${mono}`;
        ctx.fillText(s.label.toUpperCase(), x, sy);
        ctx.fillStyle = INK;
        ctx.font = `500 ${statValue}px ${mono}`;
        ctx.fillText(s.value, x, sy + Math.round(statLabel * 1.75));
      });

      /* --- the series, between its two endpoints --- */
      const yearSize = px(0.015);
      const axisY = sy - px(0.05) - Math.round(yearSize * 1.6);
      const sparkH = px(wide ? 0.095 : 0.11);

      if (spark.length > 1) {
        ctx.strokeStyle = FAINT;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad, axisY);
        ctx.lineTo(w - pad, axisY);
        ctx.stroke();

        ctx.strokeStyle = accent;
        ctx.lineWidth = Math.max(2, px(0.003));
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        spark.forEach((n, i) => {
          const x = pad + (i / (spark.length - 1)) * inner;
          const yy = axisY - px(0.012) - n * sparkH;
          if (i === 0) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        });
        ctx.stroke();

        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(
          w - pad,
          axisY - px(0.012) - spark[spark.length - 1] * sparkH,
          Math.max(3.5, px(0.006)),
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = MUTED;
        ctx.font = `400 ${yearSize}px ${mono}`;
        ctx.fillText(String(baseYear), pad, axisY + px(0.014));
        const last = String(latestYear);
        ctx.fillText(last, w - pad - ctx.measureText(last).width, axisY + px(0.014));
      }

      /* --- the result, filling what is left between hook and series ---
             The remark is the only elastic element here, so the number of
             lines is derived from the space actually left rather than fixed
             at two. A tall ratio with key art has materially less room than a
             wide one, and a hardcoded line count is what makes a canvas
             layout collide on exactly one aspect ratio. */
      const valueSize = px(wide ? 0.058 : 0.07);
      const remarkSize = px(0.02);
      const remarkLineH = Math.round(remarkSize * 1.45);
      const valueBlock = Math.round(valueSize * 1.05);
      const labelBlock = px(0.054);
      const gap = px(0.06);
      const sparkTop = axisY - px(0.012) - sparkH;

      ctx.font = `italic 400 ${remarkSize}px ${sans}`;
      const roomForRemark = sparkTop - gap - y - valueBlock - labelBlock;
      const maxRemarkLines = Math.max(
        0,
        Math.min(2, Math.floor(roomForRemark / remarkLineH))
      );
      const remarkLines = wrap(ctx, remark, inner).slice(0, maxRemarkLines);

      const resultBlock =
        valueBlock + labelBlock + remarkLines.length * remarkLineH;
      let ry = Math.max(y, sparkTop - gap - resultBlock);

      // Real collision check: only clear the art when the result block would
      // actually run under it.
      const changeSize = px(0.023);
      ctx.font = `600 ${valueSize}px ${mono}`;
      const valueWidth = ctx.measureText(currentValue).width;
      ctx.font = `500 ${changeSize}px ${mono}`;
      const changeWidth = ctx.measureText(change).width;
      const resultRight = pad + valueWidth + px(0.022) + changeWidth;
      if (art && ry < artBottom && resultRight > artLeft) {
        ry = artBottom + px(0.03);
      }

      ctx.fillStyle = INK;
      ctx.font = `600 ${valueSize}px ${mono}`;
      ctx.fillText(currentValue, pad, ry);

      ctx.fillStyle = changePositive ? UP : DOWN;
      ctx.font = `500 ${changeSize}px ${mono}`;
      ctx.fillText(
        change,
        pad + valueWidth + px(0.022),
        ry + Math.round(valueSize - changeSize * 1.1)
      );

      ry += valueBlock;
      ctx.fillStyle = MUTED;
      ctx.font = `400 ${px(0.017)}px ${mono}`;
      ctx.fillText(`${currentLabel}  ·  ${baseLabel} ${baseValue}`, pad, ry);

      ry += labelBlock;
      ctx.fillStyle = MUTED;
      ctx.font = `italic 400 ${remarkSize}px ${sans}`;
      for (const line of remarkLines) {
        ctx.fillText(line, pad, ry);
        ry += remarkLineH;
      }
    },
    [
      indexName,
      dialogue,
      reference,
      currentValue,
      change,
      changePositive,
      currentLabel,
      baseLabel,
      baseValue,
      remark,
      stats,
      spark,
      baseYear,
      latestYear,
      sourceNote,
      accent,
    ]
  );

  const download = async () => {
    setBusy(true);
    try {
      const art = imageSrc ? await loadImage(imageSrc) : null;
      const canvas = document.createElement("canvas");
      draw(canvas, ratio, art);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pop-ppp-${indexName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}-${ratio.replace(":", "x")}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  const sparkPath =
    spark.length > 1
      ? spark
          .map(
            (n, i) =>
              `${i === 0 ? "M" : "L"} ${((i / (spark.length - 1)) * 100).toFixed(2)} ${(
                28 -
                n * 26
              ).toFixed(2)}`
          )
          .join(" ")
      : "";

  return (
    <div className={cn("w-full", className)}>
      {/* Live preview of what downloads. */}
      <div
        className="overflow-hidden rounded-2xl border p-6 sm:p-8"
        style={{ background: GROUND, borderColor: FAINT }}
      >
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="block size-2 rounded-full"
              style={{ background: accent }}
            />
            <span
              className="font-mono type-caption font-semibold tracking-[0.08em]"
              style={{ color: INK }}
            >
              POP PPP
            </span>
          </span>
          <span
            className="font-mono type-caption tracking-[0.08em]"
            style={{ color: MUTED }}
          >
            DUKU.DESIGN
          </span>
        </div>

        <span
          aria-hidden="true"
          className="mt-4 block h-px w-full"
          style={{ background: FAINT }}
        />

        <div className="mt-6 flex items-start gap-5">
          <div className="min-w-0 flex-1">
            <p
              className="font-mono type-caption uppercase tracking-[0.1em]"
              style={{ color: MUTED }}
            >
              {indexName}
            </p>
            <p
              className="mt-3 text-balance text-xl font-semibold leading-snug tracking-[-0.02em] sm:text-2xl"
              style={{ color: INK }}
            >
              &ldquo;{dialogue}&rdquo;
            </p>
            <p className="mt-2 type-meta" style={{ color: MUTED }}>
              {reference}
            </p>
          </div>
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt=""
              className="size-24 shrink-0 rounded-xl object-cover sm:size-28"
            />
          ) : null}
        </div>

        <div className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            className="font-mono text-3xl font-semibold tracking-[-0.02em] numeric sm:text-4xl"
            style={{ color: INK }}
          >
            {currentValue}
          </span>
          <span
            className="font-mono type-label numeric"
            style={{ color: changePositive ? UP : DOWN }}
          >
            {change}
          </span>
        </div>
        <p className="mt-1.5 font-mono type-caption numeric" style={{ color: MUTED }}>
          {currentLabel} · {baseLabel} {baseValue}
        </p>

        <p
          className="mt-4 max-w-md type-meta italic leading-6"
          style={{ color: MUTED }}
        >
          {remark}
        </p>

        {sparkPath ? (
          <div className="mt-7">
            <svg
              viewBox="0 0 100 30"
              preserveAspectRatio="none"
              className="block h-14 w-full"
              aria-hidden="true"
            >
              <path
                d={sparkPath}
                fill="none"
                stroke={accent}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <div
              className="mt-1 flex items-center justify-between border-t pt-2 font-mono type-caption numeric"
              style={{ borderColor: FAINT, color: MUTED }}
            >
              <span>{baseYear}</span>
              <span>{latestYear}</span>
            </div>
          </div>
        ) : null}

        <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-4">
          {stats.slice(0, 3).map((s) => (
            <div key={s.label}>
              <dt
                className="font-mono type-caption uppercase tracking-[0.08em]"
                style={{ color: MUTED }}
              >
                {s.label}
              </dt>
              <dd className="mt-1 font-mono type-label numeric" style={{ color: INK }}>
                {s.value}
              </dd>
            </div>
          ))}
        </dl>

        <p
          className="mt-7 max-w-lg font-mono type-caption leading-5"
          style={{ color: MUTED }}
        >
          {sourceNote}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div
          role="radiogroup"
          aria-label="Export ratio"
          className="flex gap-1 rounded-lg border border-white/15 bg-white/[0.04] p-1"
        >
          {(Object.keys(RATIOS) as RatioKey[]).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={k === ratio}
              onClick={() => setRatio(k)}
              className={cn(
                "rounded-md px-2.5 py-1 font-mono type-caption transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                k === ratio ? "bg-white text-black" : "text-white/55 hover:text-white"
              )}
            >
              {RATIOS[k].label}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          loading={busy}
          onClick={download}
          className="border-white/25 bg-transparent text-white hover:bg-white/10"
        >
          Download PNG
        </Button>
      </div>
    </div>
  );
}
