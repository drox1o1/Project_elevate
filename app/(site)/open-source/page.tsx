import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/registry/default/ui/badge";
import { ScrollFade } from "@/components/site/scroll-fade";
import { DOCS } from "@/lib/docs-data";

export const metadata: Metadata = {
  title: "Open source",
  description:
    "DUKU Labs is MIT-licensed and fully open source — the whole component catalog and the MCP server, free with no key or paywall.",
};

const REPO_URL = "https://github.com/drox1o1/project_elevate";

const RIGHTS = [
  ["Use", "In personal and commercial products, closed or open source."],
  ["Copy & modify", "Install the source into your project and change anything."],
  ["Redistribute", "Ship it inside your own product or fork the whole system."],
  ["No key, no paywall", "Every component and the MCP server are free, always."],
] as const;

// Shown on the site so visitors can see what changed. Keep newest first.
const CHANGELOG = [
  {
    version: "Open source",
    date: "2026-07",
    points: [
      "DUKU Labs is now MIT-licensed and fully open source.",
      "Removed the Pro/Team paywall: every component's source is served openly over the registry endpoint and the MCP server — no license key.",
      "New identify step: connecting over MCP or grabbing an install command asks for your email, company and role so we know who's building.",
      "Replaced the pricing page with this open-source page.",
    ],
  },
] as const;

export default function OpenSourcePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20">
      <ScrollFade className="flex flex-col gap-14" y={20}>
        <header>
          <Badge variant="success" className="mb-4 font-pixel text-[10px] uppercase tracking-widest">
            MIT · open source · free forever
          </Badge>
          <h1 className="font-pixel text-2xl uppercase tracking-wide sm:text-3xl">
            DUKU Labs is open source
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            The whole catalog — all {DOCS.length} components, the signature
            workflows, the design tokens and the MCP server — is released under
            the{" "}
            <a
              href={`${REPO_URL}/blob/master/LICENSE`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              MIT License
            </a>
            . No tiers, no license keys, no subscription. Install a component and
            the source lands in your project as yours to keep and change.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-none border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              View on GitHub ↗
            </a>
            <Link
              href="/connect"
              className="inline-flex items-center gap-2 rounded-none border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Connect to MCP
            </Link>
          </div>
        </header>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            What the MIT license lets you do
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {RIGHTS.map(([title, detail]) => (
              <li
                key={title}
                className="rounded-none border border-border bg-card p-4"
              >
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
                  {detail}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            Who&apos;s building?
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The one thing we ask: before you connect over MCP or copy an install
            command, tell us your email, company and role — owner, designer,
            developer and so on. It&apos;s not a gate on the code (that&apos;s
            all public on GitHub); it just helps us understand who&apos;s
            building on DUKU Labs and decide what to ship next. Do it once from
            the{" "}
            <Link
              href="/#access"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              access form
            </Link>{" "}
            or the{" "}
            <Link
              href="/connect"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              connect page
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight">Changelog</h2>
          <div className="mt-4 flex flex-col gap-6">
            {CHANGELOG.map((entry) => (
              <div
                key={entry.version}
                className="rounded-none border border-border bg-card p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-pixel text-sm uppercase tracking-widest text-foreground">
                    {entry.version}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {entry.date}
                  </p>
                </div>
                <ul className="mt-3 flex flex-col gap-2">
                  {entry.points.map((p) => (
                    <li
                      key={p}
                      className="flex gap-2 text-[13px] leading-snug text-muted-foreground"
                    >
                      <span aria-hidden className="text-success">
                        ▚
                      </span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Full history lives in{" "}
            <a
              href={`${REPO_URL}/blob/master/CHANGELOG.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              CHANGELOG.md
            </a>
            .
          </p>
        </section>
      </ScrollFade>
    </main>
  );
}
