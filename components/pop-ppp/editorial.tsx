import { cn } from "@/lib/utils";

/**
 * Editorial primitives for Pop PPP.
 *
 * The section deliberately does not use the site's pixel display face for its
 * headings. That face is right for a component library; here it fights the
 * data-journalism register the content needs. What replaces it: a mono
 * ordinal, a hairline rule, and a large tightly-tracked display heading —
 * newspaper furniture rather than UI furniture.
 */

/** Near-black ground used by every "scene" band, in both themes. */
export const NOIR = "#08080a";

export function SectionHeading({
  ordinal,
  eyebrow,
  title,
  lead,
  invert = false,
  className,
}: {
  /** Two-digit section number, rendered as graphic furniture. */
  ordinal?: string;
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  /** Set on dark "scene" bands. */
  invert?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      {(ordinal || eyebrow) && (
        <div className="flex items-center gap-3">
          {ordinal ? (
            <span
              className={cn(
                "font-mono type-caption numeric",
                invert ? "text-white/40" : "text-muted-foreground"
              )}
            >
              {ordinal}
            </span>
          ) : null}
          <span
            aria-hidden="true"
            className={cn(
              "h-px w-8 shrink-0",
              invert ? "bg-white/25" : "bg-border"
            )}
          />
          {eyebrow ? (
            <span
              className={cn(
                "font-mono type-caption uppercase tracking-[0.14em]",
                invert ? "text-white/55" : "text-muted-foreground"
              )}
            >
              {eyebrow}
            </span>
          ) : null}
        </div>
      )}
      <h2
        className={cn(
          "mt-4 text-balance text-[1.75rem] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-4xl",
          invert ? "text-white" : "text-foreground"
        )}
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={cn(
            "mt-4 max-w-2xl text-balance text-[0.9375rem] leading-7",
            invert ? "text-white/60" : "text-muted-foreground"
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Fine film grain. Only ever used on the dark scene bands — grain over a
 * chart is noise over data, which is the opposite of the point.
 */
export function Grain({ opacity = 0.055 }: { opacity?: number }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='140' height='140' filter='url(%23n)'/></svg>\")",
        backgroundSize: "140px 140px",
      }}
    />
  );
}

/**
 * A dark full-bleed band. Scene moments live here regardless of theme, so the
 * page alternates between cinema and analysis rather than being uniformly one
 * or the other.
 */
export function NoirBand({
  accent,
  scopeId,
  children,
  className,
  glow = true,
}: {
  accent: { light: string; dark: string };
  /** Stable scope for the accent variable — an index slug or section name. */
  scopeId: string;
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      data-pop-noir={scopeId}
      className={cn("relative isolate overflow-hidden", className)}
      style={
        {
          background: NOIR,
          // The band is dark in both themes, so it always uses the dark accent.
          "--pop-accent": accent.dark,
        } as React.CSSProperties
      }
    >
      <Grain />
      {glow ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[28rem]"
          style={{
            background:
              "radial-gradient(58% 100% at 50% 0%, color-mix(in oklab, var(--pop-accent) 20%, transparent) 0%, transparent 100%)",
          }}
        />
      ) : null}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/** Oversized outlined numeral, used as graphic furniture on scene bands. */
export function GhostNumeral({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none select-none font-mono text-[8rem] font-semibold leading-none tracking-tighter numeric sm:text-[12rem]",
        className
      )}
      style={{
        color: "transparent",
        WebkitTextStroke: "1px color-mix(in oklab, var(--pop-accent) 40%, transparent)",
      }}
    >
      {children}
    </span>
  );
}
