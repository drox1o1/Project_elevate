import type { Metadata } from "next";
import Link from "next/link";
import { ScrollFade } from "@/components/site/scroll-fade";
import { ScrollRevealGrid } from "@/registry/default/motion/scroll-reveal-grid";
import { Grain, NoirBand, SectionHeading } from "@/components/pop-indices/editorial";
import { HeroEquation } from "@/components/pop-indices/hero-equation";
import { IndexArtwork } from "@/components/pop-indices/index-artwork";
import { IndexCard } from "@/components/pop-indices/index-card";
import { PipelineStrip } from "@/components/pop-indices/pipeline-strip";
import { ReferenceSubmit } from "@/components/pop-indices/reference-submit";
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

const HERO_STAGES = [
  { text: "“50 tola.”", caption: "Vaastav, 1999" },
  { text: "50 × 11.6638 g", caption: "The unit" },
  { text: "58.319 × ₹4,234", caption: "Gold, 1999" },
  { text: "₹59,19,379", caption: "Gold, last verified" },
  { text: "“$5 shake?”", caption: "Pulp Fiction, 1994" },
  { text: "$5.00 × restaurant CPI", caption: "The deflator that decides it" },
  { text: "$13.25", caption: "Still, precisely, a lot for a milkshake" },
  { text: "“Some kind of fruit company.”", caption: "Forrest Gump, 1994" },
  { text: "$1,000 → 112 shares", caption: "Four splits later" },
  { text: "$10,20,000", caption: "Held, not traded" },
];

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
  const gold = presentIndex(getIndex("sanju-baba-50-tola")!);
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

        <div className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <HeroEquation stages={HERO_STAGES} invert />
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

      {/* ── Sources ────────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
          <SectionHeading
            ordinal="03"
            eyebrow="Sources"
            title="Every number shows its working"
            lead="Each figure traces to an observation. Each observation traces to a dataset with a publisher and a date someone last checked it. An estimate is labelled an estimate."
          />

          <dl className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Datasets cited", value: String(SOURCE_COUNT) },
              { label: "Indices published", value: String(LIVE_INDICES.length) },
              { label: "Last verified", value: SNAPSHOT_LABEL },
              { label: "Default view", value: "Nominal. Real on demand." },
              { label: "Confidence", value: "Verified · Reconstructed · Estimated" },
              { label: "Currency", value: "Priced where the scene is set" },
            ].map((row) => (
              <div key={row.label} className="bg-card p-5 sm:p-6">
                <dt className="font-mono type-caption uppercase tracking-[0.1em] text-muted-foreground">
                  {row.label}
                </dt>
                <dd className="mt-2 type-title text-foreground numeric">{row.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 rounded-2xl border border-warning/35 bg-warning/5 p-5 sm:p-6">
            <p className="type-title text-warning">
              These figures are a snapshot, not a feed
            </p>
            <p className="mt-2 max-w-3xl type-meta leading-6 text-muted-foreground">
              The series are compiled from the publications named in each source
              ledger. The scheduled retrieval and validation pipeline is not
              running yet, so every figure needs checking against its primary
              source before this goes public. Anything not yet final is labelled
              provisional where it appears.
            </p>
          </div>

          <div className="mt-8">
            <Link
              href="/pop-indices/methodology"
              className="inline-flex h-11 items-center rounded-full border border-input bg-background px-5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
            >
              Read the methodology
            </Link>
          </div>
        </div>
      </section>

      {/* ── Submissions ───────────────────────────────────────────── */}
      <section id="submit" className="scroll-mt-20 border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
            <SectionHeading
              ordinal="04"
              eyebrow="Submissions"
              title="Suggest a scene"
              lead="The scene is never the problem. Name the thing in it that can be counted, and whether a series exists for it. That is where most ideas stop."
            />
            <ReferenceSubmit />
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
              Research, data modelling and interface in one artefact. This is the
              work Duku does, on a subject nobody asked us to take seriously.
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
