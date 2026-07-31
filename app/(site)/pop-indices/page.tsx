import type { Metadata } from "next";
import Link from "next/link";
import { ScrollFade } from "@/components/site/scroll-fade";
import { ScrollRevealGrid } from "@/registry/default/motion/scroll-reveal-grid";
import { Grain, NoirBand, SectionHeading } from "@/components/pop-indices/editorial";
import { IndexArtwork } from "@/components/pop-indices/index-artwork";
import { IndexCard } from "@/components/pop-indices/index-card";
import { PipelineStrip } from "@/components/pop-indices/pipeline-strip";
import { ValueTicker } from "@/components/pop-indices/value-ticker";
import {
  LIVE_INDICES,
  SNAPSHOT_LABEL,
  SOURCE_COUNT,
  getIndex,
} from "@/lib/pop-indices/data";
import {
  cardFor,
  presentIndex,
  seriesValues,
  tickerItemFor,
} from "@/lib/pop-indices/present";
import { imageFor } from "@/lib/pop-indices/images";

export const metadata: Metadata = {
  title: "Pop Indices | DUKU",
  description:
    "One object from one scene, priced every year since the film. Real series, the full equation, and the sources on the page.",
};

const PIPELINE = [
  {
    label: "Scene",
    detail: "A moment with something countable in it.",
    example: "“50 tola.”",
  },
  {
    label: "Unit",
    detail: "The object, stated exactly.",
    example: "50 tolas of 24-karat gold",
  },
  {
    label: "Dataset",
    detail: "A published series that covers it.",
    example: "IBJA / RBI gold price per 10 g",
  },
  {
    label: "Equation",
    detail: "Every step, its source, its rounding rule.",
    example: "58.319 × price per 10 g",
  },
  {
    label: "Index",
    detail: "The value, what inflation took, what it costs to buy.",
    example: "₹59,19,379 · +2,297%",
  },
];

const NOT_THIS = [
  "An inflation calculator",
  "A meme archive",
  "Film trivia",
  "Investment advice",
  "Numbers without sources",
];

export default function PopIndicesPage() {
  const presented = LIVE_INDICES.map(presentIndex);
  const gold = presentIndex(getIndex("sanju-baba")!);
  const ticker = presented.map(tickerItemFor);

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <NoirBand
        accent={{ light: "hsl(41 74% 58%)", dark: "hsl(41 74% 58%)" }}
        scopeId="pop-hero"
      >
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:pt-28">
          <p className="font-mono type-caption uppercase tracking-[0.2em] text-white/45">
            Pop Indices
          </p>
          <h1 className="mt-6 max-w-4xl text-balance text-[2.5rem] font-semibold leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
            Popular culture remembers the line.
            <span className="mt-1 block text-white/45">
              Economics remembers the price.
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-[0.9375rem] leading-7 text-white/60">
            One object from one scene, priced every year since the film. Real
            series, the full equation, and the sources on the page.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="#indices"
              className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-medium text-black transition-transform duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              Open the indices
            </Link>
            <Link
              href="/pop-indices/methodology"
              className="inline-flex h-11 items-center rounded-full border border-white/25 px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              See the maths
            </Link>
          </div>
        </div>

        <ValueTicker items={ticker} />
      </NoirBand>

      {/* ── The indices ─────────────────────────────────────────────── */}
      <section id="indices" className="scroll-mt-20 border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
          <SectionHeading
            ordinal="01"
            eyebrow="The collection"
            title={`${LIVE_INDICES.length} indices, ${LIVE_INDICES.length} kinds of data`}
            lead="Gold, land, a burger, a vegetable, a desktop PC, a baseball win, a share of Apple. One method has to hold across all of it, or it holds across none of it."
          />

          <ScrollRevealGrid className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {presented.map((p, i) => (
              <IndexCard
                key={p.index.slug}
                data={{ ...cardFor(p), imageSrc: imageFor(p.index.slug) }}
                ordinal={i + 1}
              />
            ))}
          </ScrollRevealGrid>
        </div>
      </section>

      {/* ── Method ─────────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
          <SectionHeading
            ordinal="02"
            eyebrow="Method"
            title="What is being measured"
            lead="Not what a film lifestyle would cost. One object, one number, traced year by year."
          />
          <PipelineStrip stages={PIPELINE} className="mt-14" />

          <ScrollFade className="mt-16 max-w-2xl">
            <p className="font-mono type-caption uppercase tracking-[0.14em] text-muted-foreground">
              What this is not
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {NOT_THIS.map((n) => (
                <li
                  key={n}
                  className="rounded-full border border-border px-3 py-1.5 type-caption text-muted-foreground"
                >
                  {n}
                </li>
              ))}
            </ul>
          </ScrollFade>
        </div>
      </section>

      {/* ── The instruments ─────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
          <SectionHeading
            ordinal="03"
            eyebrow="The instruments"
            title="Two ideas do all the work"
            lead="Neither was invented for this. A consumer price index and a purchasing-power comparison are the standard tools for asking what a number meant at the time — which is the only question a line of dialogue ever poses."
          />

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-2">
            <article className="bg-card p-6 sm:p-8">
              <p className="font-mono type-caption uppercase tracking-[0.14em] text-muted-foreground">
                Consumer price index
              </p>
              <h3 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-foreground">
                What the money was worth
              </h3>
              <p className="mt-4 type-body leading-7 text-foreground">
                A CPI tracks what a fixed basket of goods costs over time. Divide
                any old price by the change in that basket and you get the figure
                in today&rsquo;s money — the number a person would actually feel.
              </p>
              <p className="mt-4 type-body leading-7 text-muted-foreground">
                It is what separates a price that rose from a price that got
                more expensive. Fifty tolas of gold went up 2,297% in rupees and
                432% after inflation. A computer got 124% dearer on the shelf and
                15% cheaper in real terms. Both are true, and only one of them is
                the story.
              </p>
              <p className="mt-6 border-t border-border pt-5 font-mono type-caption text-muted-foreground numeric">
                real = nominal &divide; (current CPI &divide; base-year CPI)
              </p>
            </article>

            <article className="bg-card p-6 sm:p-8">
              <p className="font-mono type-caption uppercase tracking-[0.14em] text-muted-foreground">
                Purchasing power parity
              </p>
              <h3 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-foreground">
                What the money could buy
              </h3>
              <p className="mt-4 type-body leading-7 text-foreground">
                Hold a product physically identical and let the country change
                around it. The price gap that remains is not really about the
                product. It is about wages, taxes, rent and the exchange rate,
                priced into one object anyone can picture.
              </p>
              <p className="mt-4 type-body leading-7 text-muted-foreground">
                Economists have run this on burgers for decades, half seriously.
                Vincent Vega does the same thing in a car in 1994 and gets a
                laugh. The method is identical. Only the framing changed.
              </p>
              <p className="mt-6 border-t border-border pt-5 font-mono type-caption text-muted-foreground numeric">
                local price &divide; median local wage = hours of work
              </p>
            </article>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
            <div>
              <p className="text-balance text-2xl font-semibold leading-[1.15] tracking-[-0.025em] text-foreground sm:text-3xl">
                Popular culture is full of dated price quotations.
                <span className="block text-muted-foreground">
                  Nobody wrote them down as data.
                </span>
              </p>
              <p className="mt-6 max-w-2xl type-body leading-7 text-muted-foreground">
                A screenwriter picks a number because it sounds right in the
                room. That makes it a rough record of what an audience thought
                something cost, in a year you can date exactly. Run it through
                the same instruments a statistical agency uses and the joke turns
                into a measurement — of gold, of land, of a vegetable, of a
                desktop computer, of a share nobody sold.
              </p>
            </div>
            <div className="flex flex-col justify-end gap-5">
              <p className="type-body leading-7 text-foreground">
                Everything here shows its working. Each figure traces to an
                observation, each observation to a dataset with a publisher and
                a date somebody last checked it. An estimate is labelled an
                estimate.
              </p>
              <p className="type-meta leading-6 text-muted-foreground">
                Figures are a committed snapshot, last verified {SNAPSHOT_LABEL},
                across {SOURCE_COUNT} datasets — not a live feed.
              </p>
              <div>
                <Link
                  href="/pop-indices/methodology"
                  className="inline-flex h-11 items-center rounded-full border border-input bg-background px-5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                >
                  Read the methodology
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Closing ───────────────────────────────────────────────── */}
      <NoirBand
        accent={{ light: "hsl(41 74% 58%)", dark: "hsl(41 74% 58%)" }}
        scopeId="pop-close"
        glow={false}
      >
        <div className="relative mx-auto max-w-6xl px-4 py-24">
          <Grain opacity={0.05} />
          <IndexArtwork
            values={seriesValues(gold)}
            motif="rings"
            weight="bold"
            className="pointer-events-none absolute -right-24 top-1/2 h-[26rem] w-[26rem] -translate-y-1/2 opacity-[0.14]"
          />
          <div className="relative max-w-3xl">
            <p className="text-balance text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl">
              Cinema exaggerates.
              <span className="block text-white/45">Markets keep receipts.</span>
            </p>
            <p className="mt-7 max-w-xl type-body leading-7 text-white/60">
              Research, data modelling and interface in one artefact — popular
              culture put through the instruments modern economics already uses.
              This is the work Duku does, on a subject nobody asked us to take
              seriously.
            </p>
            <p className="mt-6 font-mono type-caption uppercase tracking-[0.14em] text-white/40">
              Created by Duku Design Labs
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/#access"
                className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-medium text-black transition-transform duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                Work with Duku
              </Link>
              <Link
                href="/pop-indices/methodology"
                className="inline-flex h-11 items-center rounded-full border border-white/25 px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                Methodology
              </Link>
            </div>
          </div>
        </div>
      </NoirBand>
    </main>
  );
}
