# DUKU Labs

An **open-source** (MIT), agent-ready design engineering system for building
sophisticated digital products. Production React components with the full
interaction state matrix, engineered motion and design tokens — browsable by
humans at [labs.duku.design](https://labs.duku.design) and discoverable by
Claude Code, Codex and other MCP-compatible coding agents. Formerly DUKU UI.

Every component, the design tokens and the MCP server are free under the
[MIT License](LICENSE) — no tiers, no license keys, no paywall. The one thing
we ask: before you connect over MCP or copy an install command on the site,
tell us your email, company and role (owner, designer, developer, …) so we know
who's building. See [`CHANGELOG.md`](CHANGELOG.md) and the
[/open-source](https://labs.duku.design/open-source) page.

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
and motion behavior, dependencies, install command, quality guarantees). Every
caller — anonymous or not — gets full metadata and complete source: DUKU Labs
is open source, so there is no license key or `Authorization` header to send.

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

`app/r/[name]/route.ts` serves every registry item with file contents inlined —
openly, with no license key. The core primitives (plus kinetic-heading and
magnetic-button, tagged `meta.tier: "free"` in registry.json) are also committed
statically under `public/r/`. The `meta.tier` field is retained only as an
informational label; it no longer restricts access to source.

## License

DUKU Labs is released under the [MIT License](LICENSE). Use it in personal and
commercial products, modify it, redistribute it. Components install as source
into your project — they're yours to keep and change.

## Layout

```
app/                    # docs site, /mcp MCP server, /r registry endpoint
app/(site)/connect/     # MCP setup instructions
lib/agent-manifest.ts   # agent-readable component schema (drives /mcp)
lib/tokens.ts           # token layer documentation
registry/default/
  ui/                   # phases 1–3
  fintech/  ai/  motion/  blocks/
  lib/                  # use-reduced-motion, use-controllable-state, format-number
registry.json           # shadcn registry manifest (generated)
```
