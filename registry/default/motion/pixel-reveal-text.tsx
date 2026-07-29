"use client";

/**
 * PixelRevealText — text that resolves out of a dithered bitmap signal.
 *
 * Two coordinated layers, never more:
 *
 *   Layer 1  Real semantic DOM text. Present from the first byte, selectable,
 *            announced by screen readers immediately, and the thing that
 *            establishes the box. If JS never runs, this is all you get — and
 *            it is correct.
 *   Layer 2  One `aria-hidden` canvas pinned over that text, drawing an ordered-
 *            dither reconstruction of the same glyphs on a fixed pixel grid,
 *            then handing off and disappearing.
 *
 * There is no third layer and there are no per-pixel DOM nodes: a 6xl headline
 * is a few thousand grid cells painted as ~48 filled paths per frame.
 */

import * as React from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import {
  GeistPixelSquare,
  GeistPixelGrid,
  GeistPixelCircle,
  GeistPixelTriangle,
  GeistPixelLine,
} from "geist/font/pixel";
import { cn } from "@/lib/utils";
import {
  clamp,
  EASE_LOCK,
  EASE_PHASE_BEZIER,
  PHASE,
  type RevealDirection,
} from "@/registry/default/lib/pixel-dither";
import {
  usePixelTextRenderer,
  type PixelVariant,
} from "@/registry/default/lib/use-pixel-text-renderer";

export type { RevealDirection, PixelVariant };

export type PixelRevealStatus = "idle" | "revealing" | "resolved" | "dissolving";

export type PixelRevealTextProps = {
  children: string;
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3" | "h4";
  variant?: PixelVariant;
  trigger?: "mount" | "in-view" | "hover" | "manual";
  direction?: RevealDirection;

  /** Total sequence length in ms. Phases scale proportionally. */
  duration?: number;
  delay?: number;
  /** Grid cell size in CSS pixels. */
  pixelSize?: number;
  /** Ignore `pixelSize` and derive it from the font size: clamp(2, fs/18, 5). */
  autoPixelSize?: boolean;
  /** How present the unresolved dither field is, 0–1. */
  intensity?: number;
  /** Flicker amplitude, 0–1. */
  flicker?: number;
  /** Same seed ⇒ same pixel pattern, every replay, every machine. */
  seed?: number;

  once?: boolean;
  /** In-view trigger: fraction of the element that must be visible. */
  threshold?: number;
  /** Change to reset and replay. */
  replayKey?: string | number;

  className?: string;
  canvasClassName?: string;

  /** `trigger="manual"` only. */
  playing?: boolean;
  /** Run the reversed exit dissolve. */
  exit?: boolean;
  exitDuration?: number;

  /** Colour of pixels that have not resolved yet. Defaults to the text colour. */
  signalColor?: string;
  /** Colour of peripheral noise pixels. Defaults to `signalColor`. */
  noiseColor?: string;

  onStart?: () => void;
  onComplete?: () => void;
  onExitComplete?: () => void;
};

const PIXEL_FONTS = {
  square: GeistPixelSquare,
  grid: GeistPixelGrid,
  circle: GeistPixelCircle,
  triangle: GeistPixelTriangle,
  line: GeistPixelLine,
} as const;

const MOTION_TAGS = {
  span: motion.span,
  p: motion.p,
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
} as const;

/** Old text dissolves over this before the new value is measured. */
const DISSOLVE_MS = 280;
/** Crossfade used to hand the frame between DOM text and canvas. */
const SWAP_S = 0.06;
/** Hover re-entry is ignored inside this window. */
const HOVER_COOLDOWN_MS = 420;

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export function PixelRevealText({
  children,
  as = "span",
  variant = "square",
  trigger = "in-view",
  direction = "left",
  duration = 1100,
  delay = 0,
  pixelSize = 3,
  autoPixelSize = false,
  intensity = 0.75,
  flicker = 0.32,
  seed = 24,
  once = true,
  threshold = 0.35,
  replayKey,
  className,
  canvasClassName,
  playing,
  exit = false,
  exitDuration = 460,
  signalColor,
  noiseColor,
  onStart,
  onComplete,
  onExitComplete,
}: PixelRevealTextProps) {
  const prefersReduced = useReducedMotion();
  const reduced = !!prefersReduced;

  const [rendered, setRendered] = React.useState(children);
  const [status, setStatus] = React.useState<PixelRevealStatus>("idle");
  const [pin, setPin] = React.useState<{ w: number; h: number } | null>(null);

  const canvasOpacity = useMotionValue(0);
  const textOpacity = useMotionValue(1);
  const pulse = useMotionValue(1);

  const statusRef = React.useRef<PixelRevealStatus>("idle");
  const playedRef = React.useRef(false);
  const wantsPlayRef = React.useRef(false);
  const pendingTextRef = React.useRef<string | null>(null);
  const pendingRevealRef = React.useRef<number | null>(null);
  const hoverCooldownRef = React.useRef(0);
  const handoffRef = React.useRef(0.12);
  const durationRef = React.useRef(duration);
  durationRef.current = duration;

  const cb = React.useRef({ onStart, onComplete, onExitComplete });
  cb.current = { onStart, onComplete, onExitComplete };

  const setStatusBoth = React.useCallback((next: PixelRevealStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const renderer = usePixelTextRenderer({
    text: rendered,
    variant,
    direction,
    pixelSize,
    autoPixelSize,
    intensity,
    flicker,
    seed,
    signalColor,
    noiseColor,
    enabled: !reduced,
    onStart: () => cb.current.onStart?.(),
    onLock: () => {
      // Phase 4. One extremely subtle scale pulse as the signal locks — no
      // glow, no overshoot, over in 120ms.
      animate(pulse, [1, 1.008, 1], { duration: 0.12, ease: EASE_LOCK });
    },
    onHandoff: () => {
      // Phase 5. Canvas out, DOM text in, both perfectly aligned.
      const d = handoffRef.current;
      animate(canvasOpacity, 0, { duration: d, ease: EASE_PHASE_BEZIER });
      animate(textOpacity, 1, { duration: d, ease: EASE_PHASE_BEZIER });
    },
    onComplete: () => {
      canvasOpacity.set(0);
      textOpacity.set(1);
      setPin(null);
      setStatusBoth("resolved");
      cb.current.onComplete?.();
    },
    onDissolved: () => {
      const next = pendingTextRef.current;
      pendingTextRef.current = null;
      canvasOpacity.set(0);
      if (next === null) {
        // A plain exit: leave the signal off.
        textOpacity.set(0);
        playedRef.current = false;
        setStatusBoth("idle");
        cb.current.onExitComplete?.();
        return;
      }
      // Text swap. The entrance is shortened, per the spec's 700–850ms window.
      pendingRevealRef.current = clamp(durationRef.current * 0.72, 700, 850);
      setRendered(next);
    },
    onMicroEnd: () => {
      animate(canvasOpacity, 0, { duration: 0.07 });
      animate(textOpacity, 1, { duration: 0.07 });
    },
  });

  const { wrapperRef, textRef, canvasRef, ready } = renderer;
  const apiRef = React.useRef(renderer);
  apiRef.current = renderer;

  const inView = useInView(wrapperRef as React.RefObject<Element>, {
    amount: clamp(threshold, 0, 1),
  });

  const shouldPlay =
    trigger === "mount"
      ? true
      : trigger === "in-view"
        ? inView
        : trigger === "manual"
          ? playing === true
          : false;
  const shouldPlayRef = React.useRef(shouldPlay);
  shouldPlayRef.current = shouldPlay;

  const runReveal = React.useCallback(
    (dur: number, delayMs: number) => {
      handoffRef.current = (dur * (1 - PHASE.lock)) / 1000;
      pulse.set(1);
      textOpacity.set(0);
      canvasOpacity.set(1);
      setPin(null);
      setStatusBoth("revealing");
      apiRef.current.play(dur, delayMs);
    },
    [canvasOpacity, pulse, setStatusBoth, textOpacity]
  );

  const tryStart = React.useCallback(() => {
    if (!wantsPlayRef.current) return;
    if (!apiRef.current.ready) return;
    wantsPlayRef.current = false;
    playedRef.current = true;
    runReveal(durationRef.current, delay);
  }, [delay, runReveal]);

  /* ---- pre-reveal state ------------------------------------------------ */

  // Server markup ships the text at full opacity so a JS failure still leaves
  // readable text. Hiding it happens before paint, so there is no flash.
  useIsomorphicLayoutEffect(() => {
    if (reduced) {
      textOpacity.set(1);
      canvasOpacity.set(0);
      return;
    }
    if (statusRef.current === "idle" && !playedRef.current) textOpacity.set(0);
  }, [reduced, canvasOpacity, textOpacity]);

  /* ---- triggers -------------------------------------------------------- */

  React.useEffect(() => {
    if (reduced) {
      // No canvas, no flicker: the text is simply there.
      if (shouldPlay && !(once && playedRef.current)) {
        playedRef.current = true;
        setStatusBoth("resolved");
        cb.current.onStart?.();
        cb.current.onComplete?.();
      }
      return;
    }
    if (!shouldPlay) return;
    if (once && playedRef.current) return;
    if (statusRef.current === "revealing" || statusRef.current === "dissolving")
      return;
    wantsPlayRef.current = true;
    tryStart();
  }, [shouldPlay, reduced, once, setStatusBoth, tryStart]);

  // The mask is measured asynchronously; start as soon as it lands.
  React.useEffect(() => {
    if (ready) tryStart();
  }, [ready, tryStart]);

  // If the renderer never becomes ready (no canvas, zero-size box), do not
  // strand the text at opacity 0.
  React.useEffect(() => {
    if (reduced || !wantsPlayRef.current) return;
    const id = setTimeout(() => {
      if (wantsPlayRef.current && !apiRef.current.ready) {
        wantsPlayRef.current = false;
        playedRef.current = true;
        textOpacity.set(1);
        setStatusBoth("resolved");
      }
    }, 1500);
    return () => clearTimeout(id);
  }, [reduced, shouldPlay, setStatusBoth, textOpacity]);

  /* ---- replay ---------------------------------------------------------- */

  const firstReplayRef = React.useRef(true);
  React.useEffect(() => {
    if (firstReplayRef.current) {
      firstReplayRef.current = false;
      return;
    }
    apiRef.current.stop();
    apiRef.current.clear();
    pendingTextRef.current = null;
    pendingRevealRef.current = null;
    playedRef.current = false;
    pulse.set(1);
    setStatusBoth("idle");
    if (reduced) {
      textOpacity.set(1);
      return;
    }
    textOpacity.set(0);
    canvasOpacity.set(0);
    wantsPlayRef.current =
      trigger === "hover" ? true : shouldPlayRef.current;
    tryStart();
    // Deliberately keyed on replayKey alone: this is an imperative reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayKey]);

  /* ---- text change ----------------------------------------------------- */

  const prevTextRef = React.useRef(children);
  React.useEffect(() => {
    if (children === prevTextRef.current) return;
    prevTextRef.current = children;

    if (reduced || !playedRef.current || !apiRef.current.ready) {
      setRendered(children);
      return;
    }

    // Hold the old box so the surrounding layout cannot jump during the swap.
    const w = wrapperRef.current;
    if (w) setPin({ w: w.offsetWidth, h: w.offsetHeight });

    pendingTextRef.current = children;
    setStatusBoth("dissolving");
    // Keep the old text visible while the canvas takes over the frame, then
    // dither it apart rather than fading it out.
    animate(textOpacity, 0, { duration: SWAP_S });
    animate(canvasOpacity, 1, { duration: SWAP_S });
    apiRef.current.dissolve(DISSOLVE_MS);
  }, [children, reduced, setStatusBoth, canvasOpacity, textOpacity, wrapperRef]);

  // After the swap the new mask needs one frame to measure; two rAFs keeps the
  // gap under the 40ms budget.
  React.useEffect(() => {
    const dur = pendingRevealRef.current;
    if (dur == null) return;
    pendingRevealRef.current = null;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => runReveal(dur, 0));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [rendered, runReveal]);

  /* ---- optional exit --------------------------------------------------- */

  const prevExitRef = React.useRef(exit);
  React.useEffect(() => {
    if (exit === prevExitRef.current) return;
    prevExitRef.current = exit;
    if (!exit) return;
    if (reduced) {
      textOpacity.set(0);
      playedRef.current = false;
      setStatusBoth("idle");
      cb.current.onExitComplete?.();
      return;
    }
    if (statusRef.current !== "resolved" || !apiRef.current.ready) return;
    pendingTextRef.current = null;
    setStatusBoth("dissolving");
    animate(textOpacity, 0, { duration: SWAP_S });
    animate(canvasOpacity, 1, { duration: SWAP_S });
    apiRef.current.dissolve(clamp(exitDuration, 400, 550));
  }, [exit, exitDuration, reduced, setStatusBoth, canvasOpacity, textOpacity]);

  /* ---- hover ----------------------------------------------------------- */

  const handlePointerEnter = React.useCallback(() => {
    if (reduced) return;
    const now = performance.now();
    if (now < hoverCooldownRef.current) return;

    if (!playedRef.current) {
      hoverCooldownRef.current = now + durationRef.current;
      wantsPlayRef.current = true;
      tryStart();
      return;
    }
    // Already resolved: a restrained micro-flicker, never a replay.
    if (statusRef.current !== "resolved" || apiRef.current.isRunning()) return;
    hoverCooldownRef.current = now + HOVER_COOLDOWN_MS;
    animate(textOpacity, 0, { duration: 0.05 });
    animate(canvasOpacity, 1, { duration: 0.05 });
    apiRef.current.microFlicker(220);
  }, [canvasOpacity, reduced, textOpacity, tryStart]);

  React.useEffect(
    () => () => {
      apiRef.current.stop();
    },
    []
  );

  const Tag = MOTION_TAGS[as];
  const fontClass = PIXEL_FONTS[variant].className;

  return (
    <Tag
      ref={wrapperRef as React.Ref<never>}
      data-slot="pixel-reveal-text"
      data-status={status}
      className={cn(
        "pixel-reveal-wrapper relative",
        as === "span" && "inline-block",
        fontClass,
        className
      )}
      style={{
        scale: pulse,
        ...(pin ? { minWidth: pin.w, minHeight: pin.h } : null),
      }}
      onPointerEnter={trigger === "hover" ? handlePointerEnter : undefined}
    >
      {/* Layer 1 — the real text. Always in the document, always announced. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={rendered}
          ref={textRef as React.Ref<never>}
          className="pixel-reveal-text"
          style={{ opacity: textOpacity }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0 }}
        >
          {rendered}
        </motion.span>
      </AnimatePresence>

      {/* Layer 2 — the pixel signal. Not rendered at all under reduced motion. */}
      {reduced ? null : (
        <motion.canvas
          ref={canvasRef as React.Ref<never>}
          aria-hidden="true"
          className={cn(
            "pixel-reveal-canvas pointer-events-none absolute left-0 top-0 select-none [image-rendering:pixelated]",
            canvasClassName
          )}
          style={{ opacity: canvasOpacity }}
        />
      )}
    </Tag>
  );
}
