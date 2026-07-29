# PixelRevealText

Text that resolves out of a dithered bitmap signal — a controlled system
animation, not a glitch effect.

Glyphs are reconstructed from a seeded ordered-dither field on an
`aria-hidden` canvas, then handed off to the real DOM text underneath, which
was present, selectable and announced to screen readers the entire time.

```bash
npx shadcn@latest add https://labs.duku.design/r/pixel-reveal-text.json
```

- Live demos and playground: `/labs/pixel-reveal-text`
- Prop table and source: `/components/pixel-reveal-text`

## Files

| File | What it is |
| --- | --- |
| `registry/default/motion/pixel-reveal-text.tsx` | The component: layers, triggers, phase choreography, text-change transition |
| `registry/default/lib/use-pixel-text-renderer.ts` | Measurement, glyph mask, canvas painting, the rAF loop |
| `registry/default/lib/pixel-dither.ts` | Bayer matrix, seeded hashing, phase timeline, reveal-order field. No DOM |
| `registry/default/motion/pixel-reveal-text.css` | Plain-CSS equivalent of the Tailwind layout classes (only needed without Tailwind) |

## Quick start

```tsx
import { PixelRevealText } from "@/components/duku/pixel-reveal-text";

<PixelRevealText
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
</PixelRevealText>
```

`geist` must be installed, and the component imports `geist/font/pixel`
directly — no font wiring required in your layout.

## Architecture

Two layers, and only two.

**Layer 1 — real DOM text.** Rendered as the semantic tag you asked for, at
`opacity: 1` in the server markup. It establishes the box, so the canvas can
never cause layout shift, and if JS never runs this layer is the whole
component and it is correct. During the reveal it is visually transparent but
never removed from the document.

**Layer 2 — one canvas**, absolutely positioned over the text, `aria-hidden`,
`pointer-events: none`. It draws a grid-aligned dither reconstruction of the
same glyphs, then fades out and stops.

There is no per-pixel DOM. A 6xl headline is a few thousand grid cells painted
as at most 48 filled paths per frame.

### How the canvas stays locked to the text

The renderer never re-implements text layout. It reads the *actual* laid-out
DOM text:

1. Computed typography (`font-style`, `font-weight`, `font-size`,
   `font-family`, `text-transform`) comes from `getComputedStyle` on the text
   element, so the canvas font is by definition the font the browser used.
2. Every character's position comes from a `Range` client rect over the text
   node. Wrapping, `text-align`, `letter-spacing`, responsive sizes and
   multi-line headings are therefore matched exactly, because they are read
   back rather than recomputed.
3. `document.fonts.load()` is awaited before measuring, so the mask is never
   built against a fallback face.

The mask is cached and rebuilt only when the text, typography or box changes —
a `ResizeObserver` on the wrapper covers responsive re-layout.

### The dither

`pixel-dither.ts` turns per-cell glyph coverage into a **reveal order**: one
rank-normalised value per cell.

```
score = w_dir·direction + w_dither·bayer4 + w_cover·(1 − coverage) + w_rand·noise
order = rank(score) normalised to [0,1)
```

- A 4×4 **Bayer** matrix supplies the ordered-dither backbone.
- A **directional** term (with ±0.24 seeded jitter, so 10–20% of cells resolve
  ahead of or behind the front) drives the reveal front.
- A **coverage** term pulls glyph cores in ahead of anti-aliased edge cells.
- Seeded **noise** breaks up the Bayer periodicity.

Because the score is rank-normalised, `order < density` reveals *exactly*
`density` of the eligible cells — which is what lets the phase timeline hit its
documented dither densities rather than approximating them.

Cells that are empty but sit one grid step outside the silhouette form a
**halo** set: these are the pixels that occasionally appear just outside the
glyph early on, and they are gone before the lock.

Every random value is `hash3(cell, tick, seed)` — an integer hash. `Math.random()`
appears nowhere. Same seed, same pattern, every replay, every machine.

### Timeline

Times are stored as fractions of the 1100ms reference sequence, so a 700ms or
1400ms run keeps the same proportions.

| Phase | Window | Dither density | Opacity band | Behaviour |
| --- | --- | --- | --- | --- |
| 1 · Signal detection | 0–140ms | 0 → 8% | 0.08–0.35 | Sparse blinking, a little of it outside the mask |
| 2 · Pixel formation | 140–430ms | 8 → 35% | 0.18–0.75 | Clusters form, the front moves, cells drop for a tick and return |
| 3 · Glyph resolution | 430–820ms | 35 → 88% | 0.55–1 | Readable; peripheral noise dies; flicker decays |
| 4 · Signal lock | 820–980ms | 88 → 100% | 1 | Remainder snaps in; one 120ms `1 → 1.008 → 1` pulse |
| 5 · Handoff | 980–1100ms | — | — | Canvas 1 → 0, DOM text 0 → 1 |

Measured on the shipped build (canvas ink, normalised to peak):

```
t≈142ms  0.092     t≈426ms  0.357     t≈826ms  0.884     t≈976ms  0.999
```

Density is **linear** between phase anchors. Only the phase progression —
opacity band, flicker envelope, peripheral noise — is eased, and only 35% of
the way toward `cubic-bezier(0.22, 1, 0.36, 1)`; a full ease front-loads the
effect and it stops reading as computational. The lock pulse uses
`cubic-bezier(0.16, 1, 0.3, 1)`. No springs touch individual pixels.

### Flicker

The flicker pattern advances on a 24Hz clock, not per animation frame —
per-frame randomness is cheap visual static. Amplitude decays as
`exp(−resolvedness · 2.4)`, so the leading edge stays noisy while resolved
areas hold perfectly still, and the whole envelope reaches zero by the lock.

## Triggers

| `trigger` | Behaviour |
| --- | --- |
| `mount` | Plays once the font and mask are ready |
| `in-view` | Motion's `useInView` at `threshold` (default 35%). `once` gates replays |
| `hover` | First hover plays the full reveal; every hover after that is a ~220ms micro-flicker across ~8% of glyph cells, dimming only — never a replay, never unreadable, with a 420ms cooldown so a stationary pointer cannot re-fire it |
| `manual` | Parent drives `playing`; `replayKey` resets and replays |

## Text changes

Changing `children` on a resolved instance runs a dissolve-and-reveal rather
than a fade:

1. The canvas takes the frame over a 60ms crossfade while the old text is still
   visible.
2. The old glyphs dither apart over 280ms using a direction-free scatter order,
   so isolated cells go first and holes spread inward.
3. `AnimatePresence` (`mode="wait"`) swaps the text node — only one value is
   ever in layout. The wrapper's box is pinned across the swap so surrounding
   content cannot jump.
4. The new value reveals on a shortened sequence, `clamp(duration × 0.72, 700, 850)`.

Measured gap between dissolve end and reveal start: **39ms** (budget: 40ms).

## Colour

Pixels inherit `currentColor`. Unresolved pixels ride the low end of the phase
opacity band, so they read dimmer than the final text without a separate
colour. `signalColor` recolours unresolved pixels and `noiseColor` the
peripheral halo — both optional, both default to the text colour.

No RGB splitting, no chromatic aberration, no gradients, no permanent glow.
The lock "pulse" is a 0.8% scale and a brief lift of half-formed pixels toward
the top of the band; it is deliberately not a bloom.

## Props

See the generated prop table at `/components/pixel-reveal-text`. Defaults:

```ts
{
  as: "span",
  variant: "square",
  trigger: "in-view",
  direction: "left",
  duration: 1100,
  delay: 0,
  pixelSize: 3,
  intensity: 0.75,
  flicker: 0.32,
  seed: 24,
  once: true,
  threshold: 0.35,
}
```

Beyond the core API: `autoPixelSize` applies the documented responsive cell
size `clamp(2, fontSize / 18, 5)`; `exit` / `exitDuration` run the reversed
exit dissolve (clamped 400–550ms, faster than the entrance) and fire
`onExitComplete`.

## Accessibility notes

- **The text is never hidden from assistive technology.** It is real text in a
  real semantic element from the first byte of HTML. Only `opacity` changes,
  and only for sighted users.
- **Heading levels are preserved.** `as="h2"` renders an `<h2>`; the canvas is
  a child, not a replacement. Verified: the accessible name of the heading node
  is the complete string, present before the animation begins.
- **The canvas is `aria-hidden="true"`** and carries no text, so no animation
  frame is ever announced. Nothing about the reveal is exposed as a live region.
- **`prefers-reduced-motion: reduce` removes the effect entirely.** The canvas
  element is not rendered at all — not hidden, not idle, not created. The text
  is simply present at full opacity. `onStart` and `onComplete` still fire so
  parent sequencing keeps working. Verified: 6 instances, 0 canvas elements.
- **No rapid high-contrast flashing.** Per-cell flicker is bounded to a
  15–65% opacity band on a 24Hz clock and decays to zero; the affected area is
  glyph-sized, never full-screen, and the animation stops permanently after
  ~1.1s. Nothing flashes at or near 3Hz across a large area.
- **The result is selectable text.** The canvas is `pointer-events: none`
  throughout and cleared after the handoff. Verified: selecting the element
  yields the complete string.
- **Without JavaScript the text is readable.** Server markup ships
  `style="opacity:1"`; hiding happens in a layout effect, before paint, so
  there is no flash either way.
- **If the renderer never becomes ready** — no 2D context, a zero-size box —
  a 1.5s fallback reveals the text plainly rather than stranding it at
  `opacity: 0`.

## Performance notes

- **No React state on animation frames.** The loop lives entirely in refs and
  writes to the canvas. React re-renders three times per sequence, on status
  transitions only.
- **The glyph mask is cached.** Measuring, rasterising and ranking happen once
  per layout, not once per frame. A `ResizeObserver` invalidates it; nothing
  else does.
- **Rank normalisation is O(n)** — a 4096-bin histogram CDF with sub-bin
  tie-breaking, no sort.
- **Painting is bucketed.** Cells are quantised into 16 alpha buckets × 3
  colour groups, counting-sorted, and drawn as at most 48 `beginPath`/`fill`
  pairs. Not one fill per pixel, and not one DOM node per pixel.
- **Only active cells are walked.** Glyph and halo cells are packed into flat
  typed arrays at mask time, so the loop never touches the empty majority of
  the grid.
- **Redundant frames are skipped.** A repaint happens only when the 24Hz
  flicker tick advances or density moves more than 0.4%.
- **The loop stops.** `cancelAnimationFrame` on completion, on unmount, and
  while `document.hidden` — with elapsed time credited back on resume, so a
  backgrounded tab does not skip the sequence. Verified: an idle resolved
  instance schedules 66 rAF callbacks/second against a 64/second baseline with
  zero instances — it contributes nothing.
- **Retina-sharp by construction.** The backing store is sized in device
  pixels; cell *edges* (not origins plus widths) are rounded to whole device
  pixels, so cells tile with no seams and no half-pixel blur.
  `imageSmoothingEnabled = false` and `image-rendering: pixelated`.
- **Grid size is capped** at 260k cells; the cell size grows if a very large
  block would exceed it.
- **Measured CLS: 0.00000** over the first 5 seconds of the demo page with six
  instances.

### One caveat worth knowing

The component imports all five faces from `geist/font/pixel` so `variant` can
be switched at runtime. `next/font/local` preloads by default, so all five
`woff2` files are preloaded on any route that renders the component. If you
only ever use one variant, import just that face and drop the others from
`PIXEL_FONTS` — the rest of the component is unchanged.
