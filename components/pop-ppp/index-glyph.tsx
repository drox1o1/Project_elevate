import type { EconomicCategory } from "@/lib/pop-ppp/types";

/**
 * Abstract marks per economic category (PRD §3 grid rules).
 *
 * Deliberately not film posters and not literal props: the section has to
 * look like Duku's own intellectual property rather than a streaming
 * catalogue, so each index gets a geometric silhouette tinted by its accent.
 * Purely decorative — always aria-hidden, never carrying information.
 */

const PATHS: Record<EconomicCategory, React.ReactNode> = {
  // Interlocking links — a chain, reduced to two rings.
  commodity: (
    <>
      <circle cx="16" cy="24" r="8" />
      <circle cx="30" cy="24" r="8" />
      <circle cx="44" cy="24" r="8" />
    </>
  ),
  // A pod: five seeds in a row inside an arc.
  "food-inflation": (
    <>
      <path d="M10 24c0-8 8-14 20-14s20 6 20 14-8 14-20 14-20-6-20-14z" />
      <circle cx="21" cy="24" r="2.5" />
      <circle cx="30" cy="24" r="2.5" />
      <circle cx="39" cy="24" r="2.5" />
    </>
  ),
  // A diamond, as in a baseball infield.
  "sports-economics": (
    <>
      <path d="M30 8 46 24 30 40 14 24z" />
      <circle cx="30" cy="24" r="3" />
    </>
  ),
  // A tumbler with a straw.
  "restaurant-inflation": (
    <>
      <path d="M20 12h20l-3 28H23z" />
      <path d="M34 12 40 4" />
    </>
  ),
  // A rising step function.
  equity: (
    <>
      <path d="M10 36h10V26h10V18h10V10h10" />
    </>
  ),
  // A plot boundary with a corner stone.
  "real-estate": (
    <>
      <path d="M10 14h40v20H10z" />
      <path d="M10 24h40" />
      <circle cx="30" cy="24" r="2.5" />
    </>
  ),
  // A compounding spiral, abstracted to nested arcs.
  returns: (
    <>
      <path d="M30 40a16 16 0 1 0-16-16" />
      <path d="M30 32a8 8 0 1 0-8-8" />
    </>
  ),
  // Two divergent lines — a price spread.
  "illicit-markets": (
    <>
      <path d="M10 30h40" />
      <path d="M10 18h40" />
      <path d="M30 18v12" />
    </>
  ),
};

export function IndexGlyph({
  category,
  className,
}: {
  category: EconomicCategory;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 60 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[category]}
    </svg>
  );
}
