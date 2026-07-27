"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { DEMOS } from "@/components/site/demos";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

export function PreviewPanel({ slug }: { slug: string }) {
  const [key, setKey] = React.useState(0);
  const reduced = useReducedMotion();
  const Demo = DEMOS[slug];

  return (
    <div className="relative flex min-h-[320px] w-full min-w-0 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-background p-4 shadow-sm sm:min-h-[380px] sm:p-8">
      {/* Dot-grid canvas with a soft top glow: the stage reads as a surface,
          not a void. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,var(--border)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_45%,black_30%,transparent_100%)] opacity-70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[32rem] -translate-x-1/2 rounded-full bg-foreground/[0.03] blur-3xl dark:bg-foreground/[0.06]"
      />
      <button
        type="button"
        aria-label="Replay demo"
        onClick={() => setKey((k) => k + 1)}
        className="group absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-[color,background-color,border-color,box-shadow] duration-200 hover:border-border/70 hover:bg-background hover:text-foreground hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4 transition-transform duration-500 ease-out-expo group-active:-rotate-[360deg] motion-reduce:transition-none motion-reduce:group-active:rotate-0"
          aria-hidden="true"
        >
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </button>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={key}
          initial={reduced ? false : { opacity: 0, y: 10, scale: 0.98, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={
            reduced
              ? undefined
              : { opacity: 0, scale: 0.98, filter: "blur(4px)", transition: { duration: 0.12 } }
          }
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="relative flex w-full min-w-0 items-center justify-center overflow-x-auto [scrollbar-width:thin]"
        >
          {Demo ? (
            <Demo />
          ) : (
            <p className="text-sm text-muted-foreground">No demo yet.</p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
