# DUKU Labs

An agent-ready design engineering system for building sophisticated digital
products. Production React components with the full interaction state matrix,
engineered motion and design tokens — browsable by humans at
[labs.duku.design](https://labs.duku.design) and discoverable by Claude Code,
Codex and other MCP-compatible coding agents. Formerly DUKU UI.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript strict
- Tailwind CSS v4 with shadcn CSS variables (foundation / semantic / domain /
  motion token layers in `app/globals.css`, documented in `lib/tokens.ts`)
- GSAP 3 (`@gsap/react` `useGSAP`) for entrances, scroll, counters, timelines
- `motion` (motion.dev) for springs: switch, drawer, accordion, toast stack
- Radix UI only where a11y demands it
- Zero icon dependencies — inline SVG everywhere

## Catalog

69 components across 10 phases:

| Phase | Components |
| --- | --- |
| 8 · Signature workflows | kyc-flow, option-chain, greeks-panel, crypto-swap, agent-canvas, portfolio-risk, biomarker-trend |
| 9 · Healthcare | medication-timeline, clinical-risk, vitals-monitor |
| 10 · Enterprise & data | reconciliation, audit-log, investigation-timeline, entity-graph |
| 1 · Primitives | button, input, textarea, field, checkbox, switch, select, radio-group, badge, avatar, spinner, skeleton |
| 2 · Feedback | field-message, alert, toast, progress, kbd + copy-button |
| 3 · Overlays & nav | dialog, drawer, dropdown-menu, slide-tabs, navbar, reveal-accordion |
| 4 · Fintech & data | stat-counter, number-flow, amount-input, sparkline-card, otp-input, transaction-list, market-depth, sip-simulator, payment-status, order-ticket, strategy-builder, bank-linking, expense-feed, fund-compare, loan-eligibility |
| 5 · AI / agent | stream-text, thinking-indicator, chat-message, ai-prompt-input, skills-card, tool-call-inspector, approval-gate, grounded-answer |
| 6 · Motion showpieces | kinetic-heading, magnetic-button, marquee, text-roll-link, scroll-reveal-grid |
| 7 · Blocks | signup-card, login-card, pricing-card, newsletter-input |

Phase 8 is the PRD's Phase 2 signature set: the adaptive KYC journey, NIFTY
option chain (Black-Scholes Greeks via `registry/default/lib/black-scholes.ts`),
Greeks panel, USDT→ETH swap, agent execution canvas, portfolio risk cockpit
and biomarker trend explorer. Data in demos is simulated and labelled as such.

## Pop Indices

`/pop-indices` is an editorial data section that converts specific objects,
dialogues and transactions from film into real economic indices. Nine ship,
chosen so the same system has to hold across nine different kinds of data:

| Index | Unit | Economics |
| --- | --- | --- |
| Sanju Baba 50 Tola | 50 tolas of gold | Commodity appreciation |
| Royale With Cheese | One Quarter Pounder | Purchasing-power parity |
| Raju Ki Mummy Bhindi | 1 kg of okra, Delhi retail | Food inflation |
| Moneyball Player Price | $ per win above replacement | Labour-market inefficiency |
| Vincent Vega Five-Dollar Shake | One premium milkshake | Restaurant inflation |
| Walter White Purity Premium | $ per pure gram | Illicit-market pricing |
| Rocket Singh PC | One mid-range desktop, eight priced lines | Technology deflation, then the AI memory shock |
| Khosla Plot | 500 sq yd, Delhi periphery | Land and asset inflation |
| Fruit Company | $1,000 of Apple, held | Equity compounding |

Each index page carries the full stack: cold open, headline result, multi-mode
time-series chart (nominal / inflation-adjusted / earning time / quantity /
percentage), the complete equation with per-step source citations and raw
unrounded values, purchasing-power comparisons, editorial drivers, a visible
source ledger and an exportable share card. A persistent index rail — sticky
sidebar on desktop, scrolling strip on mobile — carries a value and sparkline
per index so it doubles as navigation and comparison.

**Assembled units.** Where the indexed unit is a build rather than a single
object, the index carries a `bom` — every part priced separately in every year,
reconciled to sum exactly to the headline total. Rocket Singh PC is the first:
eight lines that spent fifteen years cancelling each other out, until AI demand
for high-bandwidth memory and data-centre storage made memory and storage 58%
of everything the build gained between 2023 and 2025. Price per gigabyte is
derived from installed capacity at render time rather than stored, so the module
price and the per-gigabyte price cannot drift apart.

**Art direction.** The section alternates two registers: dark full-bleed
"scene" bands (hero, cold open, cross-country panel, share) that stay dark in
both themes, and theme-following "analysis" sections for charts, equations and
ledgers. Each index gets generative artwork drawn from its own series — nine
motifs in `index-artwork.tsx` — rather than an icon, so no two indices can look
alike.

```
lib/pop-indices/types.ts     # index, dataset, observation and series schema
lib/pop-indices/calc.ts      # calculation framework (base/real/CAGR/affordability)
lib/pop-indices/data.ts      # datasets, series snapshot, indices, catalogue
lib/pop-indices/present.ts   # one presentation layer shared by every page
```

**Key art.** Index images live in `public/pop-indices/`, named by index slug or by
one of the aliases in `lib/pop-indices/images.ts` (case, spaces and dashes ignored).
`npm run pop-indices:images [dir]` copies images in from anywhere and renames them
to their slugs. Any index without a file falls back to generative artwork drawn
from its own series, so the section renders complete either way.

**Data status:** the series are a committed snapshot (see `SNAPSHOT_DATE`)
compiled from the publications named in each dataset record, not a live feed.
The scheduled retrieval and validation pipeline is not implemented, so every
figure needs re-verification against its primary source before the section is
published publicly. Provisional and interpolated observations are marked as
hollow points, real gaps in a series render dashed, and pages show "last
verified" rather than "today".
Reference submissions POST to `/api/pop-indices/submissions`, forwarded to
`DUKU_POP_INDICES_WEBHOOK` when set.

## MCP server

`app/mcp/route.ts` is a stateless read-only MCP server (streamable HTTP,
plain JSON responses — works on edge/Workers runtimes). Connect with:

```bash
claude mcp add duku-labs --transport http https://labs.duku.design/mcp
codex mcp add duku-labs --url https://labs.duku.design/mcp
```

It exposes:

- **Tools** — `search_components`, `get_component`, `get_install_command`
- **Resources** — `duku://components`, `duku://components/{name}`,
  `duku://tokens/default`, `duku://docs/quality-standard`
- **Prompts** — `adapt_component_to_brand`, `build_auth_flow`,
  `audit_duku_implementation`

The agent-readable schema behind it lives in `lib/agent-manifest.ts`
(registry.json + `lib/docs-data.ts` merged per component: props, interaction
and motion behavior, dependencies, install command, quality guarantees).
Anonymous callers get full metadata plus free-tier source; a license key sent
as `Authorization: Bearer` unlocks Pro source when `DUKU_LICENSE_KEYS` is set.

## Development

```bash
npm install
npm run dev            # docs/showcase site on :3000
npm run build          # production build (one doc page per component)
npm run registry:gen   # regenerate registry.json, file contents + public/r
```

## Install model

```bash
npx shadcn@latest add https://labs.duku.design/r/<name>.json
```

`app/r/[name]/route.ts` serves every registry item with file contents inlined.
The free tier (core primitives + kinetic-heading and magnetic-button, tagged
`meta.tier: "free"` in registry.json) is committed statically under
`public/r/`. When `DUKU_LICENSE_KEYS` (comma-separated) is set, all other
items require `Authorization: Bearer <key>`; unset means open dev mode.

## Layout

```
app/                    # docs site, /mcp MCP server, /r registry endpoint
app/(site)/connect/     # MCP setup instructions
app/(site)/pop-indices/     # Pop Indices editorial section (landing, indices, methodology)
components/pop-indices/     # chart, equation, ledger, cold open, share card
lib/pop-indices/            # data model, calculation framework, data snapshot
lib/agent-manifest.ts   # agent-readable component schema (drives /mcp)
lib/tokens.ts           # token layer documentation
registry/default/
  ui/                   # phases 1–3
  fintech/  ai/  motion/  blocks/
  lib/                  # use-reduced-motion, use-controllable-state, format-number
registry.json           # shadcn registry manifest (generated)
```
