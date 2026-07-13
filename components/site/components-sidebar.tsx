"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DOCS, PHASES } from "@/lib/docs-data";

export function ComponentsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-52 shrink-0 overflow-y-auto md:block">
      <nav className="flex flex-col gap-6 pb-10">
        {PHASES.map((phase) => (
          <div key={phase}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {phase}
            </p>
            <ul className="flex flex-col">
              {DOCS.filter((d) => d.phase === phase).map((d) => {
                const href = `/components/${d.slug}`;
                const active = pathname === href;
                return (
                  <li key={d.slug}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "block rounded-md px-2 py-1.5 text-sm transition-colors duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "bg-muted font-medium text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {d.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
