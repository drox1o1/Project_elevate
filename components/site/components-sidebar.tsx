"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGroup, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { DOCS, PHASES } from "@/lib/docs-data";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

const spring = { type: "spring", stiffness: 500, damping: 40 } as const;

export function ComponentsSidebar() {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-56 shrink-0 overflow-y-auto md:block">
      <LayoutGroup id="components-sidebar">
        <nav className="flex flex-col gap-7 pb-10 pr-3">
          {PHASES.map((phase) => {
            const entries = DOCS.filter((d) => d.phase === phase);
            return (
              <div key={phase}>
                <p className="mb-2 flex items-baseline justify-between px-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  {phase}
                  <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
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
                            layoutId="sidebar-active"
                            transition={reduced ? { duration: 0 } : spring}
                            className="absolute inset-0 rounded-md bg-muted"
                            aria-hidden="true"
                          />
                        ) : null}
                        <Link
                          href={href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "group relative flex items-center justify-between rounded-md px-2 py-1.5 text-sm",
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
                                active
                                  ? "opacity-100"
                                  : "opacity-40 group-hover:opacity-100"
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
      </LayoutGroup>
    </aside>
  );
}
