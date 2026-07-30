"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/default/ui/button";
import type { Confidence } from "@/lib/pop-indices/types";

/**
 * The shareable summary — one square poster.
 *
 * The still fills the frame and the index's own series is drawn across its
 * horizon, where the image gives way to the panel. That seam is the whole
 * composition: the scene above it, the economics below it, and the line that
 * connects them sitting exactly between.
 *
 * Six very different film stills have to end up looking like one product, so
 * every image is graded the same way — darkened, tinted toward the index
 * accent, then faded into the panel. Grain over the whole frame ties it to the
 * section's noir bands.
 *
 * The preview *is* the canvas that downloads, drawn once and scaled by CSS, so
 * there is no second layout implementation to drift out of sync.
 *
 * One ratio. A square posts everywhere, and three ratios meant three layouts
 * to keep honest for no real gain.
 */

const SIZE = 1080;

const PANEL = "#0b0b0d";
const WHITE = "#ffffff";
/**
 * Secondary and tertiary text.
 *
 * Both are far brighter than a screen UI would use. This artwork is read at
 * thumbnail size in a feed, where anything under ~0.5 alpha or ~20px at 1080
 * disappears — and the provenance line is the one thing on the card that must
 * survive being shrunk.
 */
const MUTED = "rgba(255,255,255,0.68)";
const FAINT = "rgba(255,255,255,0.55)";
const UP = "#4ade80";
const DOWN = "#fb7185";

export interface ShareStat {
  label: string;
  value: string;
}

export interface ShareCardProps {
  indexName: string;
  reference: string;
  dialogue: string;
  baseValue: string;
  currentValue: string;
  change: string;
  changePositive: boolean;
  remark: string;
  stats: ShareStat[];
  /** Normalised 0–1 series — drawn across the horizon. */
  spark: number[];
  baseYear: number;
  latestYear: number;
  /** Short publisher credit, e.g. "IBJA / RBI · MoSPI". */
  credit: string;
  /** Short snapshot stamp, e.g. "Dec 2025". */
  snapshot: string;
  accent: string;
  confidence: Confidence;
  imageSrc?: string | null;
  className?: string;
}

const CONFIDENCE_LABEL: Record<Confidence, string> = {
  verified: "VERIFIED",
  reconstructed: "RECONSTRUCTED",
  estimated: "ESTIMATED",
};

const px = (frac: number) => Math.round(SIZE * frac);

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

/** Letter-spacing is Chromium-only on canvas; set it where it exists. */
function withTracking(ctx: CanvasRenderingContext2D, value: string, draw: () => void) {
  const supported = "letterSpacing" in ctx;
  if (supported) ctx.letterSpacing = value;
  draw();
  if (supported) ctx.letterSpacing = "0px";
}

/** Fine film grain, generated once and tiled. */
let grainTile: HTMLCanvasElement | null = null;
function getGrain(): HTMLCanvasElement {
  if (grainTile) return grainTile;
  const c = document.createElement("canvas");
  c.width = 160;
  c.height = 160;
  const g = c.getContext("2d");
  if (g) {
    const img = g.createImageData(160, 160);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 120 + Math.random() * 135;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }
  grainTile = c;
  return c;
}

export function ShareCard({
  indexName,
  reference,
  dialogue,
  baseValue,
  currentValue,
  change,
  changePositive,
  remark,
  stats,
  spark,
  baseYear,
  latestYear,
  credit,
  snapshot,
  accent,
  confidence,
  imageSrc,
  className,
}: ShareCardProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [busy, setBusy] = React.useState(false);

  const draw = React.useCallback(
    (canvas: HTMLCanvasElement, art: HTMLImageElement | null) => {
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const pad = px(0.075);
      const inner = SIZE - pad * 2;
      const sans = "ui-sans-serif, system-ui, sans-serif";
      const mono = "ui-monospace, monospace";
      ctx.textBaseline = "top";

      /* ---- measure the panel before placing the horizon ---------------
         The seam is derived from how much the panel actually needs, so a
         three-line quote pushes the horizon up rather than overflowing. */

      const nameSize = px(0.021);
      const refSize = px(0.024);
      const valueSize = px(0.078);
      const labelSize = px(0.023);
      const statLabelSize = px(0.019);
      const statValueSize = px(0.032);
      const noteSize = px(0.0185);

      /* Provenance, rebuilt as two short lines rather than one long paragraph.
         The full sentence wrapped to two dense lines of tiny type that nobody
         could read once the card was scaled into a feed.

         An index can cite five datasets, and the full credit runs straight off
         the right margin. Publishers are dropped from the end with a count of
         what was left out — the complete ledger is on the index page, and a
         poster that silently overflows its own margin is worse than one that
         says "+2". */
      /* Measured with the same tracking it is drawn with. Measuring without
         it under-counts by ~0.8px a character, which is most of a publisher
         on a 74-character line — the first version of this trim looked
         correct and still overflowed. */
      const FOOTER_TRACK = "0.8px";
      const hasLetterSpacing = "letterSpacing" in ctx;
      ctx.font = `400 ${noteSize}px ${mono}`;
      if (hasLetterSpacing) ctx.letterSpacing = FOOTER_TRACK;

      const creditParts = credit.split(" · ");
      let creditShown = creditParts.slice();
      const creditLineFor = (parts: string[]) => {
        const omitted = creditParts.length - parts.length;
        return (
          `${CONFIDENCE_LABEL[confidence]} · ${parts.join(" · ")}` +
          (omitted > 0 ? ` +${omitted}` : "")
        );
      };
      while (
        creditShown.length > 1 &&
        ctx.measureText(creditLineFor(creditShown)).width > inner
      ) {
        creditShown = creditShown.slice(0, -1);
      }
      const footerLines = [
        creditLineFor(creditShown),
        `SNAPSHOT ${snapshot.toUpperCase()} · DUKU.DESIGN · NOT INVESTMENT ADVICE`,
      ];
      if (hasLetterSpacing) ctx.letterSpacing = "0px";
      const noteLines = footerLines;

      const panelTopPad = px(0.062);
      const panelBottomPad = px(0.062);
      const MAX_PANEL = Math.round(SIZE * 0.64);
      const MAX_LINES = 3;

      const blocks = (lines: number, lead: number) =>
        Math.round(nameSize * 2.4) +
        lines * lead +
        Math.round(refSize * 2.3) +
        Math.round(valueSize * 1.02) +
        Math.round(labelSize * 2.4) +
        Math.round(statLabelSize * 1.9 + statValueSize * 1.15) +
        px(0.034) +
        noteLines.length * Math.round(noteSize * 1.7);

      /* A long quote is set smaller, never cut short. Dropping trailing lines
         to make room leaves a sentence fragment with no ellipsis, which reads
         as a bug and, worse, misquotes the film. Type size is the elastic
         dimension; truncation is the last resort and is marked when it
         happens. */
      const baseDialogue = px(0.052);
      let dialogueSize = baseDialogue;
      let dialogueLead = Math.round(dialogueSize * 1.16);
      let dialogueLines: string[] = [];

      // Floor at 0.84: below that the quote stops being the loudest thing on
      // the card, which is the one job it has.
      for (const factor of [1, 0.94, 0.89, 0.84]) {
        dialogueSize = Math.round(baseDialogue * factor);
        dialogueLead = Math.round(dialogueSize * 1.16);
        ctx.font = `600 ${dialogueSize}px ${sans}`;
        dialogueLines = wrap(ctx, `“${dialogue}”`, inner);
        const fits =
          dialogueLines.length <= MAX_LINES &&
          blocks(dialogueLines.length, dialogueLead) +
            panelTopPad +
            panelBottomPad <=
            MAX_PANEL;
        if (fits) break;
      }

      if (dialogueLines.length > MAX_LINES) {
        ctx.font = `600 ${dialogueSize}px ${sans}`;
        dialogueLines = dialogueLines.slice(0, MAX_LINES);
        let last = dialogueLines[MAX_LINES - 1].replace(/”$/, "");
        while (last && ctx.measureText(`${last}…”`).width > inner) {
          last = last.slice(0, -1);
        }
        dialogueLines[MAX_LINES - 1] = `${last.trimEnd()}…”`;
      }

      const panelH = Math.min(
        MAX_PANEL,
        Math.max(
          Math.round(SIZE * 0.46),
          blocks(dialogueLines.length, dialogueLead) + panelTopPad + panelBottomPad
        )
      );
      const seam = SIZE - panelH;

      /* ---- the scene ------------------------------------------------- */

      ctx.fillStyle = PANEL;
      ctx.fillRect(0, 0, SIZE, SIZE);

      if (art) {
        // Everything in the scene half is clipped to it. A cover fit is by
        // definition larger than its box on one axis, so without this the
        // still spills straight over the panel and the type below it.
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, SIZE, seam);
        ctx.clip();

        // Cover-fit, biased slightly upward: faces sit high in most stills.
        const s = Math.max(SIZE / art.width, seam / art.height);
        const dw = art.width * s;
        const dh = art.height * s;
        ctx.drawImage(art, (SIZE - dw) / 2, (seam - dh) * 0.35, dw, dh);

        // One grade for every still, so six different films read as one product.
        ctx.fillStyle = "rgba(11,11,13,0.34)";
        ctx.fillRect(0, 0, SIZE, seam);
        ctx.globalCompositeOperation = "overlay";
        ctx.globalAlpha = 0.26;
        ctx.fillStyle = accent;
        ctx.fillRect(0, 0, SIZE, seam);
        ctx.restore();
      } else {
        // No key art: an accent field, so the poster still has an image half.
        const g = ctx.createLinearGradient(0, 0, SIZE, seam);
        g.addColorStop(0, accent);
        g.addColorStop(1, PANEL);
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, SIZE, seam);
        ctx.restore();
      }

      // Fade the still into the panel, and darken the top for the masthead.
      const fade = ctx.createLinearGradient(0, seam - px(0.28), 0, seam);
      fade.addColorStop(0, "rgba(11,11,13,0)");
      fade.addColorStop(1, PANEL);
      ctx.fillStyle = fade;
      ctx.fillRect(0, seam - px(0.28), SIZE, px(0.28));

      const topScrim = ctx.createLinearGradient(0, 0, 0, px(0.2));
      topScrim.addColorStop(0, "rgba(11,11,13,0.72)");
      topScrim.addColorStop(1, "rgba(11,11,13,0)");
      ctx.fillStyle = topScrim;
      ctx.fillRect(0, 0, SIZE, px(0.2));

      /* ---- masthead -------------------------------------------------- */

      const mark = px(0.0165);
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(pad + mark / 2, pad + mark * 0.62, mark / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = WHITE;
      ctx.font = `600 ${px(0.021)}px ${mono}`;
      withTracking(ctx, "2px", () => ctx.fillText("POP INDICES", pad + mark * 2, pad));

      /* ---- the series, drawn across the horizon ----------------------- */

      if (spark.length > 1) {
        const band = px(0.15);
        const top = seam - band - px(0.02);
        const pts = spark.map((n, i) => ({
          x: pad + (i / (spark.length - 1)) * inner,
          y: top + (1 - n) * band,
        }));

        // A soft fill under the line grounds it against a busy still.
        // Opacity comes from globalAlpha, not from an alpha suffix: accents
        // are authored as `hsl(...)` and canvas cannot parse `hsl(...)44`.
        const under = ctx.createLinearGradient(0, top, 0, seam);
        under.addColorStop(0, accent);
        under.addColorStop(1, "transparent");
        ctx.save();
        ctx.globalAlpha = 0.28;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, seam);
        for (const p of pts) ctx.lineTo(p.x, p.y);
        ctx.lineTo(pts[pts.length - 1].x, seam);
        ctx.closePath();
        ctx.fillStyle = under;
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.55)";
        ctx.shadowBlur = px(0.012);
        ctx.strokeStyle = accent;
        ctx.lineWidth = px(0.0042);
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.stroke();
        ctx.restore();

        const last = pts[pts.length - 1];
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(last.x, last.y, px(0.0075), 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.85)";
        ctx.lineWidth = px(0.0022);
        ctx.beginPath();
        ctx.arc(last.x, last.y, px(0.0135), 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = MUTED;
        ctx.font = `400 ${px(0.0195)}px ${mono}`;
        ctx.fillText(String(baseYear), pad, seam + px(0.016));
        const lastYear = String(latestYear);
        ctx.fillText(
          lastYear,
          SIZE - pad - ctx.measureText(lastYear).width,
          seam + px(0.016)
        );
      }

      /* ---- the panel --------------------------------------------------- */

      let y = seam + panelTopPad;

      ctx.fillStyle = accent;
      ctx.font = `600 ${nameSize}px ${mono}`;
      withTracking(ctx, "2px", () => ctx.fillText(indexName.toUpperCase(), pad, y));
      y += Math.round(nameSize * 2.4);

      ctx.fillStyle = WHITE;
      ctx.font = `600 ${dialogueSize}px ${sans}`;
      for (const line of dialogueLines) {
        ctx.fillText(line, pad, y);
        y += dialogueLead;
      }

      ctx.fillStyle = MUTED;
      ctx.font = `400 ${refSize}px ${sans}`;
      ctx.fillText(reference, pad, y);
      y += Math.round(refSize * 2.3);

      ctx.fillStyle = WHITE;
      ctx.font = `600 ${valueSize}px ${mono}`;
      ctx.fillText(currentValue, pad, y);
      const valueW = ctx.measureText(currentValue).width;

      const changeSize = px(0.026);
      ctx.fillStyle = changePositive ? UP : DOWN;
      ctx.font = `500 ${changeSize}px ${mono}`;
      ctx.fillText(
        change,
        pad + valueW + px(0.024),
        y + Math.round(valueSize - changeSize * 1.15)
      );
      y += Math.round(valueSize * 1.02);

      ctx.fillStyle = MUTED;
      ctx.font = `400 ${labelSize}px ${mono}`;
      ctx.fillText(`Was ${baseValue} in ${baseYear}`, pad, y);
      y += Math.round(labelSize * 2.4);

      const shown = stats.slice(0, 3);
      const colW = inner / Math.max(1, shown.length);
      shown.forEach((s, i) => {
        const x = pad + colW * i;
        ctx.fillStyle = FAINT;
        ctx.font = `400 ${statLabelSize}px ${mono}`;
        withTracking(ctx, "1.4px", () => ctx.fillText(s.label.toUpperCase(), x, y));
        ctx.fillStyle = WHITE;
        ctx.font = `600 ${statValueSize}px ${mono}`;
        ctx.fillText(s.value, x, y + Math.round(statLabelSize * 1.9));
      });
      y += Math.round(statLabelSize * 1.9 + statValueSize * 1.15) + px(0.034);

      ctx.fillStyle = FAINT;
      ctx.font = `400 ${noteSize}px ${mono}`;
      for (const line of footerLines) {
        withTracking(ctx, FOOTER_TRACK, () => ctx.fillText(line, pad, y));
        y += Math.round(noteSize * 1.7);
      }

      /* ---- grain over the whole frame ---------------------------------- */

      ctx.save();
      ctx.globalAlpha = 0.045;
      ctx.globalCompositeOperation = "overlay";
      const pattern = ctx.createPattern(getGrain(), "repeat");
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, SIZE, SIZE);
      }
      ctx.restore();
    },
    [
      indexName,
      dialogue,
      reference,
      currentValue,
      change,
      changePositive,
      baseValue,
      stats,
      spark,
      baseYear,
      latestYear,
      credit,
      snapshot,
      accent,
      confidence,
    ]
  );

  // Draw once into the visible canvas; the download exports the same pixels.
  React.useEffect(() => {
    let cancelled = false;
    const render = async () => {
      const art = imageSrc ? await loadImage(imageSrc) : null;
      if (cancelled || !canvasRef.current) return;
      draw(canvasRef.current, art);
    };
    void render();
    return () => {
      cancelled = true;
    };
  }, [draw, imageSrc]);

  const download = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pop-indices-${indexName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`${indexName}. ${dialogue} ${currentValue}, ${change} since ${baseYear}. ${remark}`}
        className="block aspect-square w-full rounded-2xl border border-white/10 shadow-overlay"
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          loading={busy}
          onClick={download}
          className="border-white/25 bg-transparent text-white hover:bg-white/10"
        >
          Download PNG
        </Button>
        <span className="font-mono type-caption text-white/40">
          1080 × 1080 · square posts everywhere
        </span>
      </div>
    </div>
  );
}
