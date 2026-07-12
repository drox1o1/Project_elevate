import Link from "next/link";
import { KineticHeading } from "@/registry/default/motion/kinetic-heading";
import { MagneticButton } from "@/registry/default/motion/magnetic-button";
import { Marquee } from "@/registry/default/motion/marquee";
import { ScrollRevealGrid } from "@/registry/default/motion/scroll-reveal-grid";
import { Badge } from "@/registry/default/ui/badge";
import { DOCS, PHASES } from "@/lib/docs-data";

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-16 pt-24 text-center">
        <Badge variant="outline" pulse className="mb-6">
          43 components · 7 phases
        </Badge>
        <KineticHeading text="Every state. Every motion. Yours." />
        <p className="mt-6 max-w-xl text-base text-muted-foreground">
          DUKU UI is a motion-forward React library with daisyUI-level visual
          restraint. Quiet surfaces, production-grade animation, the full
          interaction state matrix — installed as source you own via the shadcn
          CLI.
        </p>
        <div className="mt-8">
          <Link href="/components/button">
            <MagneticButton>Browse components</MagneticButton>
          </Link>
        </div>
      </section>

      <section className="border-y border-border py-10">
        <Marquee speed={26} className="mx-auto max-w-4xl">
          {DOCS.slice(0, 14).map((d) => (
            <span
              key={d.slug}
              className="text-sm font-medium text-muted-foreground"
            >
              {d.title}
            </span>
          ))}
        </Marquee>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-20">
        <h2 className="text-2xl font-semibold tracking-tight">
          The catalog
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Built phase by phase — primitives first, blocks last.
        </p>
        <div className="mt-10 flex flex-col gap-12">
          {PHASES.map((phase) => (
            <div key={phase}>
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">
                {phase}
              </h3>
              <ScrollRevealGrid>
                {DOCS.filter((d) => d.phase === phase).map((d) => (
                  <Link
                    key={d.slug}
                    href={`/components/${d.slug}`}
                    className="group rounded-xl border border-border bg-card p-5 transition-colors duration-200 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {d.title}
                      </span>
                      {d.free ? <Badge variant="success">Free</Badge> : null}
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-muted-foreground">
                      {d.description}
                    </p>
                  </Link>
                ))}
              </ScrollRevealGrid>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
