"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/default/ui/button";

/**
 * The shareable summary (PRD §H).
 *
 * One card, three ratios, drawn to a canvas so what downloads is exactly what
 * the preview shows. The export deliberately commits to a single dark look
 * rather than following the viewer's theme — a card that leaves the site
 * should not change appearance depending on who exported it.
 *
 * The source note is not optional decoration. A figure that travels without
 * its provenance is the failure mode this whole section exists to avoid.
 */

const RATIOS = {
  "1:1": { w: 1080, h: 1080, label: "1:1" },
  "4:5": { w: 1080, h: 1350, label: "4:5" },
  "16:9": { w: 1920, h: 1080, label: "16:9" },
} as const;

type RatioKey = keyof typeof RATIOS;

export interface ShareCardProps {
  indexName: string;
  reference: string;
  dialogue: string;
  baseLabel: string;
  baseValue: string;
  currentLabel: string;
  currentValue: string;
  change: string;
  remark: string;
  sourceNote: string;
  accent: string;
  className?: string;
}

/** Word-wrap `text` into lines that fit `maxWidth` at the current font. */
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

export function ShareCard({
  indexName,
  reference,
  dialogue,
  baseLabel,
  baseValue,
  currentLabel,
  currentValue,
  change,
  remark,
  sourceNote,
  accent,
  className,
}: ShareCardProps) {
  const [ratio, setRatio] = React.useState<RatioKey>("1:1");
  const [busy, setBusy] = React.useState(false);

  const draw = React.useCallback(
    (canvas: HTMLCanvasElement, key: RatioKey) => {
      const { w, h } = RATIOS[key];
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const pad = Math.round(w * 0.075);
      const inner = w - pad * 2;
      const wide = key === "16:9";

      // Every measurement below assumes a top baseline, so an advance is just
      // "add the line height" — mixing baselines is what makes hand-laid
      // canvas text overlap.
      ctx.textBaseline = "top";

      // Type scales off the *short* edge. Keying it to width blows the 16:9
      // card's header past the space its height actually leaves, which is how
      // a wide export ends up with the dialogue sitting on top of the value.
      const scale = Math.min(w, h);
      const px = (frac: number) => Math.round(scale * frac);
      const sans = "ui-sans-serif, system-ui, sans-serif";
      const mono = "ui-monospace, monospace";

      // Ground
      ctx.fillStyle = "#0a0a0b";
      ctx.fillRect(0, 0, w, h);

      // Accent bar, top-left — the only chrome the card carries.
      ctx.fillStyle = accent;
      ctx.fillRect(pad, pad, px(0.055), Math.max(4, px(0.005)));

      /* --- header block, laid out downward from the top --- */

      let y = pad + px(0.03);

      const nameSize = px(0.021);
      ctx.fillStyle = "#a1a1aa";
      ctx.font = `500 ${nameSize}px ${mono}`;
      ctx.fillText(indexName.toUpperCase(), pad, y);
      y += Math.round(nameSize * 1.6);

      const dialogueSize = px(wide ? 0.058 : 0.072);
      ctx.fillStyle = "#fafafa";
      ctx.font = `600 ${dialogueSize}px ${sans}`;
      const dialogueLines = wrap(ctx, `\u201c${dialogue}\u201d`, inner).slice(
        0,
        wide ? 2 : 3
      );
      for (const line of dialogueLines) {
        ctx.fillText(line, pad, y);
        y += Math.round(dialogueSize * 1.16);
      }

      y += px(0.012);
      const refSize = px(0.021);
      ctx.fillStyle = "#71717a";
      ctx.font = `400 ${refSize}px ${sans}`;
      for (const line of wrap(ctx, reference, inner).slice(0, 2)) {
        ctx.fillText(line, pad, y);
        y += Math.round(refSize * 1.45);
      }

      /* --- footer block: measured first, then placed against the bottom, so
             the two halves can never collide whatever the ratio --- */

      const valueSize = px(wide ? 0.07 : 0.088);
      const changeSize = px(0.027);
      const labelSize = px(0.02);
      const remarkSize = px(0.024);
      const attrSize = px(0.019);
      const noteSize = px(0.018);

      ctx.font = `italic 400 ${remarkSize}px ${sans}`;
      const remarkLines = wrap(ctx, remark, inner).slice(0, 3);
      ctx.font = `400 ${noteSize}px ${mono}`;
      const noteLines = wrap(ctx, sourceNote, inner).slice(0, 3);

      const gapLg = px(0.03);
      const gapSm = px(0.014);
      const footerHeight =
        Math.round(valueSize * 1.1) +
        gapSm +
        Math.round(labelSize * 1.5) +
        gapLg +
        remarkLines.length * Math.round(remarkSize * 1.45) +
        gapLg +
        Math.round(attrSize * 1.6) +
        gapSm +
        noteLines.length * Math.round(noteSize * 1.5);

      // Bottom-anchored, but never allowed to climb into the header. If a long
      // dialogue and a long remark cannot both have their preferred position,
      // the footer sits directly below the header instead of overlapping it.
      let fy = Math.max(h - pad - footerHeight, y + gapLg);

      // Value, with the change riding on its baseline
      ctx.fillStyle = accent;
      ctx.font = `600 ${valueSize}px ${mono}`;
      ctx.fillText(currentValue, pad, fy);
      const valueWidth = ctx.measureText(currentValue).width;
      ctx.fillStyle = "#fafafa";
      ctx.font = `500 ${changeSize}px ${mono}`;
      ctx.fillText(
        change,
        pad + valueWidth + px(0.025),
        fy + Math.round(valueSize - changeSize * 1.15)
      );
      fy += Math.round(valueSize * 1.1) + gapSm;

      // What the value is
      ctx.fillStyle = "#71717a";
      ctx.font = `400 ${labelSize}px ${mono}`;
      ctx.fillText(`${currentLabel} \u00b7 ${baseLabel} ${baseValue}`, pad, fy);
      fy += Math.round(labelSize * 1.5) + gapLg;

      // The remark
      ctx.fillStyle = "#a1a1aa";
      ctx.font = `italic 400 ${remarkSize}px ${sans}`;
      for (const line of remarkLines) {
        ctx.fillText(line, pad, fy);
        fy += Math.round(remarkSize * 1.45);
      }
      fy += gapLg;

      // Attribution
      ctx.fillStyle = "#a1a1aa";
      ctx.font = `500 ${attrSize}px ${mono}`;
      ctx.fillText("DUKU DESIGN \u00b7 POP PPP", pad, fy);
      fy += Math.round(attrSize * 1.6) + gapSm;

      // Source note — the card does not travel without it
      ctx.fillStyle = "#52525b";
      ctx.font = `400 ${noteSize}px ${mono}`;
      for (const line of noteLines) {
        ctx.fillText(line, pad, fy);
        fy += Math.round(noteSize * 1.5);
      }
    },
    [
      indexName,
      dialogue,
      reference,
      currentValue,
      change,
      currentLabel,
      baseLabel,
      baseValue,
      remark,
      sourceNote,
      accent,
    ]
  );

  const download = async () => {
    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      draw(canvas, ratio);
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

  return (
    <div className={cn("w-full", className)}>
      {/* HTML preview of the same content — no canvas needed to see it. */}
      <div
        className="overflow-hidden rounded-xl border border-border p-5 sm:p-6"
        style={{ background: "#0a0a0b" }}
      >
        <span
          aria-hidden="true"
          className="block h-1.5 w-10"
          style={{ background: accent }}
        />
        <p className="mt-4 font-mono type-caption uppercase tracking-[0.1em] text-zinc-400">
          {indexName}
        </p>
        <p className="mt-3 text-balance text-xl font-semibold leading-tight text-zinc-50 sm:text-2xl">
          &ldquo;{dialogue}&rdquo;
        </p>
        <p className="mt-1.5 type-meta text-zinc-500">{reference}</p>

        <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            className="font-mono text-2xl font-semibold numeric sm:text-3xl"
            style={{ color: accent }}
          >
            {currentValue}
          </span>
          <span className="font-mono type-label text-zinc-50 numeric">{change}</span>
        </div>
        <p className="mt-1 font-mono type-caption text-zinc-500 numeric">
          {currentLabel} · {baseLabel} {baseValue}
        </p>

        <p className="mt-5 max-w-md type-meta italic leading-6 text-zinc-400">
          {remark}
        </p>

        <p className="mt-5 font-mono type-caption uppercase tracking-[0.1em] text-zinc-400">
          Duku Design · Pop PPP
        </p>
        <p className="mt-1.5 max-w-lg font-mono type-caption leading-5 text-zinc-600">
          {sourceNote}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div
          role="radiogroup"
          aria-label="Export ratio"
          className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1"
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
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                k === ratio
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {RATIOS[k].label}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" loading={busy} onClick={download}>
          Download PNG
        </Button>
      </div>
    </div>
  );
}
