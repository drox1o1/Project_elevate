import type { Metadata } from "next";
import Link from "next/link";
import { CopyButton } from "@/registry/default/ui/kbd";
import { Badge } from "@/registry/default/ui/badge";
import {
  DefaultResolveDemo,
  QuietResolveDemo,
  DenseDitherDemo,
  CentreSignalDemo,
  DynamicTextDemo,
  PixelRevealPlayground,
} from "@/components/site/pixel-reveal-demos";

export const metadata: Metadata = {
  title: "Pixel Reveal Text",
  description:
    "Text that resolves out of a dithered bitmap signal: ordered dithering on a canvas grid over real, selectable DOM text.",
};

const INSTALL =
  "npx shadcn@latest add https://labs.duku.design/r/pixel-reveal-text.json";

function Section({
  title,
  meta,
  children,
  description,
}: {
  title: string;
  meta?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-pixel text-base uppercase tracking-wide text-foreground sm:text-lg">
          {title}
        </h2>
        {meta ? (
          <span className="font-mono type-caption text-muted-foreground">
            {meta}
          </span>
        ) : null}
      </div>
      {description ? (
        <p className="max-w-2xl type-body text-muted-foreground">{description}</p>
      ) : null}
      <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm sm:p-6">
        {children}
      </div>
    </section>
  );
}

function Code({ children }: { children: string }) {
  return (
    <div className="relative rounded-xl border border-border/70 bg-muted/50 p-4">
      <div className="absolute right-1.5 top-1.5">
        <CopyButton value={children} />
      </div>
      <pre className="overflow-x-auto font-mono type-label leading-6 text-foreground">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export default function PixelRevealTextPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-14 px-4 pb-24 pt-10 lg:px-6">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-[1.75rem] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground sm:text-[2rem]">
            Pixel Reveal Text
          </h1>
          <Badge variant="outline">Motion showpieces</Badge>
        </div>
        <p className="max-w-2xl type-body text-muted-foreground">
          A digital signal resolving into readable information. Glyphs are
          reconstructed from a seeded ordered-dither field on an{" "}
          <code className="font-mono">aria-hidden</code> canvas, then handed off
          to the real DOM text underneath — which was there, selectable and
          announced to screen readers, the whole time.
        </p>
        <div className="flex items-center justify-between gap-2 overflow-x-auto rounded-xl border border-border/70 bg-muted/50 py-1.5 pl-4 pr-1.5 shadow-xs">
          <code className="whitespace-nowrap font-mono type-label text-foreground">
            {INSTALL}
          </code>
          <CopyButton value={INSTALL} />
        </div>
        <p className="type-label text-muted-foreground">
          Full prop table and source on the{" "}
          <Link
            href="/components/pixel-reveal-text"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            component page
          </Link>
          .
        </p>
      </header>

      <Section
        title="1 · Default Resolve"
        meta="square · left · 1100ms · 3px"
        description="The reference sequence. Signal detection, pixel formation, glyph resolution, signal lock, handoff."
      >
        <DefaultResolveDemo />
      </Section>

      <Section
        title="2 · Quiet Resolve"
        meta="850ms · flicker 0.14 · 2px"
        description="Lower flicker and smaller cells. Sized for interface labels and status text, where the reveal must not compete with the content."
      >
        <QuietResolveDemo />
      </Section>

      <Section
        title="3 · Dense Dither"
        meta="grid · 1400ms · intensity 0.95"
        description="A heavier initial dither field resolving slowly. Built for hero typography where the reveal is the moment."
      >
        <DenseDitherDemo />
      </Section>

      <Section
        title="4 · Centre Signal"
        meta="center · lock pulse"
        description="Resolution expands outward from the centre and ends on the 1 → 1.008 → 1 lock pulse."
      >
        <CentreSignalDemo />
      </Section>

      <Section
        title="5 · Dynamic Text"
        meta="dissolve 280ms → reveal 792ms"
        description="Changing children dissolves the old value through the same dither field, then reveals the new one on a shortened sequence. Only one value is ever in layout."
      >
        <DynamicTextDemo />
      </Section>

      <Section
        title="6 · Playground"
        description="Every knob. Seed is the interesting one: the same seed always reproduces the same pixel pattern."
      >
        <PixelRevealPlayground />
      </Section>

      <section className="flex flex-col gap-3">
        <h2 className="font-pixel text-base uppercase tracking-wide text-foreground sm:text-lg">
          Usage
        </h2>
        <Code>{`<PixelRevealText
  as="h1"
  variant="square"
  trigger="in-view"
  direction="left"
  duration={1100}
  pixelSize={3}
  flicker={0.32}
  once
  className="text-6xl tracking-[-0.04em]"
>
  DESIGN ENGINEERING WITH AI
</PixelRevealText>`}</Code>
        <Code>{`<PixelRevealText
  as="span"
  variant="grid"
  trigger="manual"
  playing={playing}
  replayKey={activeMessage}
  direction="center"
  duration={850}
>
  {activeMessage}
</PixelRevealText>`}</Code>
      </section>
    </main>
  );
}
