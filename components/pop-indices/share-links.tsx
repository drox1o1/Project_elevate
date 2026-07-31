"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

/**
 * Share targets for an index page.
 *
 * Plain intent URLs, no third-party SDKs: every network below accepts a GET
 * with the URL and some text, which means no tracking script loads on a page
 * whose entire argument is that you can see where its numbers came from.
 *
 * The canonical URL is built from `window.location` at click time rather than
 * hardcoded, so a preview deployment shares its own address instead of
 * pointing everyone at production.
 */

const ICONS = {
  x: (
    <path d="M12.6 1.5h2.45L9.7 7.62 16 15.9h-4.93l-3.86-5.05-4.42 5.05H.34l5.72-6.54L0 1.5h5.06l3.49 4.61ZM11.74 14.4h1.36L4.32 2.92H2.87Z" />
  ),
  linkedin: (
    <path d="M14.82 0H1.18C.53 0 0 .52 0 1.15v13.7C0 15.48.53 16 1.18 16h13.64c.65 0 1.18-.52 1.18-1.15V1.15C16 .52 15.47 0 14.82 0ZM4.75 13.64H2.37V5.99h2.38ZM3.56 4.94a1.38 1.38 0 1 1 0-2.76 1.38 1.38 0 0 1 0 2.76Zm10.08 8.7h-2.37V9.92c0-.89-.02-2.03-1.24-2.03-1.24 0-1.43.97-1.43 1.97v3.78H6.23V5.99H8.5v1.04h.04c.32-.6 1.09-1.23 2.25-1.23 2.4 0 2.85 1.58 2.85 3.64Z" />
  ),
  whatsapp: (
    <path d="M13.6 2.32A7.86 7.86 0 0 0 8 0C3.6 0 .03 3.58.03 7.98c0 1.4.37 2.78 1.07 3.99L0 16l4.13-1.08a7.94 7.94 0 0 0 3.86.98h.01c4.4 0 7.97-3.58 7.97-7.98a7.9 7.9 0 0 0-2.37-5.6ZM8 14.55h-.01a6.6 6.6 0 0 1-3.37-.92l-.24-.15-2.5.65.67-2.44-.16-.25a6.58 6.58 0 0 1-1.01-3.51 6.63 6.63 0 0 1 11.32-4.69 6.6 6.6 0 0 1 1.95 4.7 6.63 6.63 0 0 1-6.63 6.61Zm3.63-4.95c-.2-.1-1.18-.58-1.36-.65-.18-.06-.31-.1-.45.1-.13.2-.51.65-.63.79-.11.13-.23.15-.43.05a5.42 5.42 0 0 1-2.71-2.37c-.2-.35.2-.32.58-1.08.06-.13.03-.25-.02-.35-.05-.1-.45-1.08-.62-1.48-.16-.39-.33-.33-.45-.34l-.38-.01c-.13 0-.35.05-.53.25-.18.2-.7.68-.7 1.66s.71 1.92.81 2.05c.1.14 1.4 2.14 3.4 3 1.26.55 1.76.6 2.39.5.38-.05 1.18-.48 1.34-.94.17-.47.17-.87.12-.95-.05-.09-.18-.14-.38-.24Z" />
  ),
  link: (
    <path d="M6.35 9.65a3.5 3.5 0 0 0 5.28.38l2.12-2.12a3.5 3.5 0 0 0-4.95-4.95L7.58 4.18a.75.75 0 0 0 1.06 1.06l1.22-1.22a2 2 0 0 1 2.83 2.83L10.57 8.97a2 2 0 0 1-3.02-.22.75.75 0 1 0-1.2.9Zm3.3-3.3a3.5 3.5 0 0 0-5.28-.38L2.25 8.09a3.5 3.5 0 0 0 4.95 4.95l1.22-1.22a.75.75 0 0 0-1.06-1.06l-1.22 1.22a2 2 0 0 1-2.83-2.83L5.43 7.03a2 2 0 0 1 3.02.22.75.75 0 1 0 1.2-.9Z" />
  ),
  check: <path d="M13.5 3.5 6 11l-3.5-3.5 1-1L6 9l6.5-6.5Z" />,
} as const;

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="size-4 shrink-0 fill-current"
    >
      {ICONS[name]}
    </svg>
  );
}

export function ShareLinks({
  indexName,
  headline,
  path,
  className,
  invert = false,
}: {
  /** e.g. "Sanju Baba Index". */
  indexName: string;
  /** The one-line result, e.g. "₹2,46,923 → ₹59,19,379, +2,297% since 1999." */
  headline: string;
  /** Absolute path of the index page, e.g. "/pop-indices/sanju-baba". */
  path: string;
  className?: string;
  /** Set on dark bands. */
  invert?: boolean;
}) {
  const [copied, setCopied] = React.useState(false);
  const reduced = useReducedMotion();

  const url = React.useCallback(
    () =>
      typeof window === "undefined"
        ? path
        : `${window.location.origin}${path}`,
    [path]
  );

  const text = `${indexName}: ${headline}`;

  const open = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const targets = [
    {
      id: "x",
      label: "X",
      icon: "x" as const,
      onClick: () =>
        open(
          `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url())}`
        ),
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      icon: "linkedin" as const,
      onClick: () =>
        open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url())}`
        ),
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: "whatsapp" as const,
      onClick: () =>
        open(
          `https://wa.me/?text=${encodeURIComponent(`${text} ${url()}`)}`
        ),
    },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url());
    } catch {
      // Clipboard is blocked in some embedded browsers. Falling back to a
      // prompt is worse than doing nothing, so the label just stays put.
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  const base = invert
    ? "border-white/25 text-white hover:bg-white/10 focus-visible:ring-white/70"
    : "border-input text-foreground hover:bg-muted/60 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span
        className={cn(
          "mr-1 font-mono type-caption uppercase tracking-[0.1em]",
          invert ? "text-white/45" : "text-muted-foreground"
        )}
      >
        Share
      </span>

      {targets.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={t.onClick}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2",
            base
          )}
        >
          <Icon name={t.icon} />
          {t.label}
        </button>
      ))}

      <button
        type="button"
        onClick={copy}
        aria-live="polite"
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2",
          base
        )}
      >
        <motion.span
          key={copied ? "done" : "idle"}
          initial={reduced ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={
            reduced ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 28 }
          }
          className="flex"
        >
          <Icon name={copied ? "check" : "link"} />
        </motion.span>
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
