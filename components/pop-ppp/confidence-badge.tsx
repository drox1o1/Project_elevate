import { cn } from "@/lib/utils";
import type { Confidence } from "@/lib/pop-ppp/types";

const COPY: Record<Confidence, { label: string; blurb: string }> = {
  verified: {
    label: "Verified",
    blurb: "Authoritative historical data covers the whole period.",
  },
  reconstructed: {
    label: "Reconstructed",
    blurb: "Assembled from credible archives, market records or regional sources.",
  },
  estimated: {
    label: "Estimated",
    blurb: "Relies on stated assumptions or incomplete market data.",
  },
};

const TONE: Record<Confidence, string> = {
  verified: "border-success/35 bg-success/10 text-success",
  reconstructed: "border-info/35 bg-info/10 text-info",
  estimated: "border-warning/40 bg-warning/10 text-warning",
};

/**
 * The confidence label. It sits beside the headline result, never in the
 * footer — an estimate has to look like an estimate.
 *
 * The mark before the word is not decoration: it carries the same
 * distinction as the colour, so the level survives greyscale printing and
 * colour-blind readers (PRD §24 — no information through colour alone).
 */
const MARK: Record<Confidence, string> = {
  verified: "●",
  reconstructed: "◐",
  estimated: "○",
};

export function ConfidenceBadge({
  level,
  className,
  showBlurb = false,
}: {
  level: Confidence;
  className?: string;
  showBlurb?: boolean;
}) {
  const { label, blurb } = COPY[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono type-caption uppercase tracking-[0.08em]",
        TONE[level],
        className
      )}
      title={blurb}
    >
      <span aria-hidden="true">{MARK[level]}</span>
      <span>
        <span className="sr-only">Data confidence: </span>
        {label}
      </span>
      {showBlurb ? (
        <span className="ml-1 normal-case tracking-normal opacity-80">
          — {blurb}
        </span>
      ) : null}
    </span>
  );
}

export { COPY as CONFIDENCE_COPY };
