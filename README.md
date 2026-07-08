# DUKU UI

A motion-forward React component library: quiet, daisyUI-restrained surfaces
with production-grade animation and the full interaction state matrix as the
product. 43 components across 7 phases, distributed as source via the shadcn
CLI registry.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript strict
- Tailwind CSS v4 with shadcn CSS variables
- GSAP 3 (`@gsap/react` `useGSAP`) for entrances, scroll, counters, timelines
- `motion` (motion.dev) for springs: switch, drawer, accordion, toast stack
- Radix UI only where a11y demands it
- Zero icon dependencies — inline SVG everywhere

## Catalog

| Phase | Components |
| --- | --- |
| 1 · Primitives | button, input, textarea, field, checkbox, switch, select, radio-group, badge, avatar, spinner, skeleton |
| 2 · Feedback | field-message, alert, toast, progress, kbd + copy-button |
| 3 · Overlays & nav | dialog, drawer, dropdown-menu, slide-tabs, navbar, reveal-accordion |
| 4 · Fintech & data | stat-counter, number-flow, amount-input, sparkline-card, otp-input, transaction-list |
| 5 · AI / agent | stream-text, thinking-indicator, chat-message, ai-prompt-input, skills-card |
| 6 · Motion showpieces | kinetic-heading, magnetic-button, marquee, text-roll-link, scroll-reveal-grid |
| 7 · Blocks | signup-card, login-card, pricing-card, newsletter-input |

## Development

```bash
npm install
npm run dev            # docs/showcase site on :3000
npm run build          # production build (all 43 doc pages)
npm run registry:build # npx shadcn build → public/r/*.json
node scripts/gen-registry.mjs  # regenerate registry.json from the table
```

## Install model

```bash
npx shadcn@latest add https://duku.design/r/<name>.json
```

`app/r/[name]/route.ts` serves every registry item with file contents inlined.
Free tier (`kinetic-heading`, `magnetic-button`, `button`) is committed
statically under `public/r/`. When `DUKU_LICENSE_KEYS` (comma-separated) is
set, all other items require `Authorization: Bearer <key>`; unset means open
dev mode.

## Layout

```
app/                    # docs site + /r registry endpoint
registry/default/
  ui/                   # phases 1–3
  fintech/  ai/  motion/  blocks/
  lib/                  # use-reduced-motion, use-controllable-state, format-number
registry.json           # shadcn registry manifest (generated)
```
