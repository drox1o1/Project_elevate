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

50 components across 8 phases:

| Phase | Components |
| --- | --- |
| 8 · Signature workflows | kyc-flow, option-chain, greeks-panel, crypto-swap, agent-canvas, portfolio-risk, biomarker-trend |
| 1 · Primitives | button, input, textarea, field, checkbox, switch, select, radio-group, badge, avatar, spinner, skeleton |
| 2 · Feedback | field-message, alert, toast, progress, kbd + copy-button |
| 3 · Overlays & nav | dialog, drawer, dropdown-menu, slide-tabs, navbar, reveal-accordion |
| 4 · Fintech & data | stat-counter, number-flow, amount-input, sparkline-card, otp-input, transaction-list |
| 5 · AI / agent | stream-text, thinking-indicator, chat-message, ai-prompt-input, skills-card |
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
and motion behavior, dependencies, install command, quality guarantees).
Anonymous callers get full metadata plus free-tier source; a license key sent
as `Authorization: Bearer` unlocks Pro source when `DUKU_LICENSE_KEYS` is set.

## Development

```bash
npm install
npm run dev            # docs/showcase site on :3000
npm run build          # production build (all 50 doc pages)
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
lib/agent-manifest.ts   # agent-readable component schema (drives /mcp)
lib/tokens.ts           # token layer documentation
registry/default/
  ui/                   # phases 1–3
  fintech/  ai/  motion/  blocks/
  lib/                  # use-reduced-motion, use-controllable-state, format-number
registry.json           # shadcn registry manifest (generated)
```
