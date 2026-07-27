"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGroup, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { DOCS, PHASES } from "@/lib/docs-data";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

const spring = { type: "spring", stiffness: 500, damping: 40 } as const;

/** The grouped index, shared by the desktop rail and the mobile sheet. */
function Index({
  pathname,
  reduced,
  layoutId,
  onNavigate,
}: {
  pathname: string;
  reduced: boolean;
  layoutId: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-7 pb-10">
      {PHASES.map((phase) => {
        const entries = DOCS.filter((d) => d.phase === phase);
        return (
          <div key={phase}>
            <p className="mb-2 flex items-baseline justify-between px-2 type-overline text-muted-foreground">
              {phase}
              <span className="font-mono type-caption numeric text-muted-foreground/60">
                {entries.length}
              </span>
            </p>
            <ul className="flex flex-col">
              {entries.map((d) => {
                const href = `/components/${d.slug}`;
                const active = pathname === href;
                return (
                  <li key={d.slug} className="relative">
                    {active ? (
                      <motion.span
                        layoutId={layoutId}
                        transition={reduced ? { duration: 0 } : spring}
                        className="absolute inset-0 rounded-md bg-muted"
                        aria-hidden="true"
                      />
                    ) : null}
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center justify-between rounded-md px-2 py-1.5 type-label",
                        "transition-[color,translate] duration-200 ease-out-expo",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "font-medium text-foreground"
                          : "text-muted-foreground hover:translate-x-0.5 hover:text-foreground motion-reduce:hover:translate-x-0"
                      )}
                    >
                      {d.title}
                      {d.free ? (
                        <span
                          className={cn(
                            "size-1.5 rounded-full bg-success/70 transition-opacity duration-200",
                            active ? "opacity-100" : "opacity-40 group-hover:opacity-100"
                          )}
                          title="Free component"
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

export function ComponentsSidebar() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [open, setOpen] = React.useState(false);

  const current = DOCS.find((d) => pathname === `/components/${d.slug}`);
  const index = DOCS.findIndex((d) => d.slug === current?.slug);
  const prev = index > 0 ? DOCS[index - 1] : null;
  const next = index >= 0 && index < DOCS.length - 1 ? DOCS[index + 1] : null;

  // Close the sheet whenever the route changes.
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock the page behind the open sheet.
  React.useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      {/* ---- Mobile: a browse bar that opens the full index ---------- */}
      <div className="sticky top-16 z-30 -mx-4 mb-6 border-b border-border/60 bg-background/85 px-4 py-2.5 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-haspopup="dialog"
            className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2 text-left shadow-xs transition-colors duration-200 hover:border-ring/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0 text-muted-foreground" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h10" />
            </svg>
            <span className="min-w-0 flex-1">
              <span className="block type-caption text-muted-foreground">
                {current?.phase ?? "Browse"}
              </span>
              <span className="block truncate type-label font-medium text-foreground">
                {current?.title ?? "All components"}
              </span>
            </span>
            <span className="shrink-0 font-mono type-caption numeric text-muted-foreground/70">
              {DOCS.length}
            </span>
          </button>

          {/* Prev / next keeps sequential reading possible without opening the sheet */}
          <div className="flex shrink-0 items-center gap-1">
            {[prev, next].map((target, i) => (
              <Link
                key={i}
                href={target ? `/components/${target.slug}` : "#"}
                aria-disabled={!target}
                aria-label={i === 0 ? "Previous component" : "Next component"}
                tabIndex={target ? undefined : -1}
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl border border-border/70 bg-card shadow-xs transition-colors duration-200",
                  target
                    ? "text-foreground hover:border-ring/30"
                    : "pointer-events-none text-muted-foreground/40"
                )}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={cn("size-4", i === 0 && "rotate-180")} aria-hidden="true">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile sheet */}
      {open ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Component index">
          <button
            type="button"
            aria-label="Close index"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm [animation:duku-fade-in_0.2s_ease-out]"
          />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-xs flex-col border-r border-border/70 bg-background shadow-overlay [animation:duku-sheet-in_0.3s_var(--motion-ease-out-expo)_both] motion-reduce:animate-none">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <span className="type-title text-foreground">Components</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="size-4" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 pt-4">
              <LayoutGroup id="components-sidebar-mobile">
                <Index pathname={pathname} reduced={reduced} layoutId="sidebar-active-mobile" onNavigate={() => setOpen(false)} />
              </LayoutGroup>
            </div>
          </div>
        </div>
      ) : null}

      {/* ---- Desktop: the sticky rail -------------------------------- */}
      <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-56 shrink-0 overflow-y-auto pr-3 md:block">
        <LayoutGroup id="components-sidebar">
          <Index pathname={pathname} reduced={reduced} layoutId="sidebar-active" />
        </LayoutGroup>
      </aside>
    </>
  );
}
