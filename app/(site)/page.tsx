import Link from "next/link";
import { Marquee } from "@/registry/default/motion/marquee";
import { ScrollRevealGrid } from "@/registry/default/motion/scroll-reveal-grid";
import { Badge } from "@/registry/default/ui/badge";
import { AgentDemo } from "@/components/site/agent-demo";
import { HeroIntro } from "@/components/site/hero-intro";
import { InstallTabs } from "@/components/site/install-tabs";
import { PreviewPanel } from "@/components/site/preview";
import { ScrollFade } from "@/components/site/scroll-fade";
import { DOCS, PHASES, getDoc } from "@/lib/docs-data";

const AGENT_ACCESS = [
  ["Component metadata", `Name, category, tier and use cases for all ${DOCS.length} components`],
  ["Component source", "The actual TypeScript, not a screenshot of it"],
  ["Props & variants", "Typed API contracts with defaults and descriptions"],
  ["Dependencies", "npm packages and registry dependencies, resolved"],
  ["Design tokens", "Foundation, semantic, domain and motion layers"],
  ["Interaction states", "What happens on click, focus, error and success"],
  ["Motion specification", "Durations, easings and the standard spring"],
  ["Accessibility requirements", "Keyboard, focus and screen-reader behavior"],
  ["Install commands", "shadcn CLI commands scoped to your package manager"],
  ["Reusable prompts", "Pre-structured workflows like build_auth_flow"],
] as const;

const CATEGORIES = [
  { title: "Identity & compliance", detail: "Adaptive KYC journey: PAN verification, document quality checks, liveness, manual review.", status: "available" },
  { title: "Markets & investing", detail: "NIFTY option chain with live Greeks, a Greeks panel and a portfolio risk cockpit.", status: "available" },
  { title: "Crypto & payments", detail: "USDT→ETH swap with routes, slippage, approval flow and on-chain confirmation.", status: "available" },
  { title: "AI & agent interfaces", detail: "Agent execution canvas with approval gates, streaming responses, chat, prompt composers.", status: "available" },
  { title: "Healthcare", detail: "Biomarker trends, medication adherence timelines, clinical risk gauges, live vitals.", status: "available" },
  { title: "Fintech & data", detail: "Market depth ladders, SIP simulation, payment timelines, amount inputs, odometer values.", status: "available" },
  { title: "Motion systems", detail: "Kinetic headings, magnetic CTAs, marquees, scroll reveals — engineered, not decorated.", status: "available" },
  { title: "Onboarding & activation", detail: "Signup, login, pricing and capture blocks with complete submit choreography.", status: "available" },
  { title: "Data-heavy enterprise", detail: "Investigation timelines, reconciliation, audit-log explorers.", status: "roadmap" },
] as const;

const STATES = [
  "Empty",
  "Loading",
  "Success",
  "Error",
  "Warning",
  "Disabled",
  "Partial completion",
  "Keyboard focus",
  "Mobile layout",
  "Dark mode",
  "Reduced motion",
] as const;

const SHOWCASE = [
  "kyc-flow",
  "option-chain",
  "crypto-swap",
  "agent-canvas",
  "portfolio-risk",
  "biomarker-trend",
] as const;

const PILLARS = [
  {
    title: "Human taste",
    detail:
      "Interfaces are art-directed, not generated from generic patterns. Visual restraint on the surface, deliberate motion underneath.",
  },
  {
    title: "Engineering depth",
    detail:
      "Responsive states, accessibility, typed APIs and edge cases are designed and documented — a component is not finished when the happy path looks good.",
  },
  {
    title: "Agent accessibility",
    detail:
      "Claude Code, Codex and other MCP-compatible agents can search the registry, read the system and install components as source in your codebase.",
  },
] as const;

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-12 pt-24 text-center">
        <HeroIntro />
      </section>

      {/* Live implementation demo */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <AgentDemo />
      </section>

      <section className="border-y border-border py-10">
        <Marquee speed={26} className="mx-auto max-w-4xl">
          {DOCS.slice(0, 14).map((d) => (
            <span
              key={d.slug}
              className="text-sm font-medium text-muted-foreground"
            >
              {d.title}
            </span>
          ))}
        </Marquee>
      </section>

      {/* Built for agents */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <ScrollFade>
          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight">
            Your coding agent can see the system, not just the screenshot.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            The DUKU Labs MCP server gives compatible agents structured access
            to the whole design system — as resources, tools and reusable
            prompts. MCP provides the context and the tools; your agent still
            works inside your project, with your permission.
          </p>
        </ScrollFade>
        <ScrollRevealGrid className="mt-10">
          {AGENT_ACCESS.map(([title, detail]) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-5"
            >
              <span className="text-sm font-semibold text-foreground">
                {title}
              </span>
              <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground">
                {detail}
              </p>
            </div>
          ))}
        </ScrollRevealGrid>
      </section>

      {/* Beyond basic components */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <ScrollFade>
            <h2 className="text-2xl font-semibold tracking-tight">
              The difficult parts are already designed.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Most libraries provide primitives. DUKU Labs builds the layer
              above them: complexity already designed, states already
              considered, motion already engineered. Every category marked
              available ships real components today — nothing is listed before
              it exists.
            </p>
          </ScrollFade>
          <ScrollRevealGrid className="mt-10">
            {CATEGORIES.map((c) => (
              <div
                key={c.title}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {c.title}
                  </span>
                  {c.status === "available" ? (
                    <Badge variant="success">Available</Badge>
                  ) : (
                    <Badge variant="outline">Roadmap</Badge>
                  )}
                </div>
                <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground">
                  {c.detail}
                </p>
              </div>
            ))}
          </ScrollRevealGrid>
        </div>
      </section>

      {/* Showcase */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <ScrollFade>
            <h2 className="text-2xl font-semibold tracking-tight">
              Try it here, not in a screenshot.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Every demo below is the real component — type in it, break it,
              replay it.
            </p>
          </ScrollFade>
          <ScrollFade y={22} className="mt-10 grid gap-8 md:grid-cols-2">
            {SHOWCASE.map((slug) => {
              const doc = getDoc(slug);
              if (!doc) return null;
              return (
                <div key={slug} className="flex flex-col gap-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <Link
                      href={`/components/${slug}`}
                      className="text-sm font-semibold text-foreground underline-offset-4 transition-colors duration-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {doc.title}
                    </Link>
                    <span className="line-clamp-1 text-xs text-muted-foreground">
                      {doc.phase}
                    </span>
                  </div>
                  <PreviewPanel slug={slug} />
                </div>
              );
            })}
          </ScrollFade>
        </div>
      </section>

      {/* Every state included */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <ScrollFade>
            <h2 className="text-2xl font-semibold tracking-tight">
              Every state included.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              A component is not finished when the happy path looks good. DUKU
              Labs components ship with their full interaction state matrix
              designed, documented and readable by your agent.
            </p>
          </ScrollFade>
          <ScrollFade pop stagger={0.05} className="mt-8 flex max-w-2xl flex-wrap gap-2">
            {STATES.map((s) => (
              <Badge key={s} variant="secondary">
                {s}
              </Badge>
            ))}
          </ScrollFade>
        </div>
      </section>

      {/* Installation */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <ScrollFade>
            <h2 className="text-2xl font-semibold tracking-tight">
              Installation
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Connect your agent once, or install components directly — either
              way the source lands in your project and belongs to you.
            </p>
            <div className="mt-8">
              <InstallTabs />
            </div>
          </ScrollFade>
        </div>
      </section>

      {/* Why DUKU Labs */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <ScrollFade>
            <h2 className="text-2xl font-semibold tracking-tight">
              Why DUKU Labs
            </h2>
          </ScrollFade>
          <ScrollRevealGrid className="mt-10 gap-6 md:grid-cols-3 lg:grid-cols-3">
            {PILLARS.map((p) => (
              <div
                key={p.title}
                className="rounded-xl border border-border bg-card p-6"
              >
                <h3 className="text-sm font-semibold text-foreground">
                  {p.title}
                </h3>
                <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                  {p.detail}
                </p>
              </div>
            ))}
          </ScrollRevealGrid>
        </div>
      </section>

      {/* Catalog */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <ScrollFade>
            <h2 className="text-2xl font-semibold tracking-tight">
              The catalog
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {DOCS.length} components across {PHASES.length} phases —
              signature workflows first, primitives underneath.
            </p>
          </ScrollFade>
          <div className="mt-10 flex flex-col gap-12">
            {PHASES.map((phase) => (
              <div key={phase}>
                <h3 className="mb-4 text-sm font-medium text-muted-foreground">
                  {phase}
                </h3>
                <ScrollRevealGrid>
                  {DOCS.filter((d) => d.phase === phase).map((d) => (
                    <Link
                      key={d.slug}
                      href={`/components/${d.slug}`}
                      className="group rounded-xl border border-border bg-card p-5 transition-colors duration-200 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {d.title}
                        </span>
                        {d.free ? <Badge variant="success">Free</Badge> : null}
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-muted-foreground">
                        {d.description}
                      </p>
                    </Link>
                  ))}
                </ScrollRevealGrid>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
