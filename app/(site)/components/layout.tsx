import Link from "next/link";
import { DOCS, PHASES } from "@/lib/docs-data";

export default function ComponentsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-4 py-10">
      <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-52 shrink-0 overflow-y-auto md:block">
        <nav className="flex flex-col gap-6 pb-10">
          {PHASES.map((phase) => (
            <div key={phase}>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {phase}
              </p>
              <ul className="flex flex-col">
                {DOCS.filter((d) => d.phase === phase).map((d) => (
                  <li key={d.slug}>
                    <Link
                      href={`/components/${d.slug}`}
                      className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {d.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
