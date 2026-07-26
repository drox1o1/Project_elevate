import Link from "next/link";

/* One place to retune the ecosystem links. */
const ECOSYSTEM = {
  parent: { href: "https://www.duku.design", label: "duku.design" },
  rubrik: { href: "https://rubrik.duku.design", label: "Duku Rubrik" },
};

function Ext({
  href,
  children,
  sub,
}: {
  href: string;
  children: React.ReactNode;
  sub?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="text-sm text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
        {children} <span aria-hidden="true">↗</span>
      </span>
      {sub ? (
        <span className="block text-[11px] leading-4 text-muted-foreground/70">
          {sub}
        </span>
      ) : null}
    </a>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-10">
      <div className="pixel-divider" aria-hidden="true" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/duku_labs_light.svg" alt="DUKU Labs" className="h-7 w-auto dark:hidden" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/duku_labs_dark.svg" alt="DUKU Labs" className="hidden h-7 w-auto dark:block" />
          </Link>
          <p className="mt-3 max-w-[26ch] font-pixel text-[11px] leading-5 tracking-wide text-muted-foreground">
            DESIGN ENGINEERING FOR AI-BUILT PRODUCTS
          </p>
        </div>

        {/* Product */}
        <div>
          <p className="font-pixel text-[11px] uppercase tracking-widest text-muted-foreground">
            Product
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {[
              ["/components/kyc-flow", "Components"],
              ["/connect", "Connect to MCP"],
              ["/open-source", "Open source"],
              ["/#access", "Get the components"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="rounded-md text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Ecosystem */}
        <div>
          <p className="font-pixel text-[11px] uppercase tracking-widest text-muted-foreground">
            Ecosystem
          </p>
          <ul className="mt-3 flex flex-col gap-3">
            <li>
              <Ext href={ECOSYSTEM.parent.href} sub="The studio behind DUKU Labs">
                {ECOSYSTEM.parent.label}
              </Ext>
            </li>
            <li>
              <Ext
                href={ECOSYSTEM.rubrik.href}
                sub="Audits your complete product — design, states, accessibility"
              >
                {ECOSYSTEM.rubrik.label}
              </Ext>
            </li>
          </ul>
        </div>

        {/* Agents */}
        <div>
          <p className="font-pixel text-[11px] uppercase tracking-widest text-muted-foreground">
            For agents
          </p>
          <p className="mt-3 font-mono text-[11px] leading-5 text-muted-foreground">
            claude mcp add duku-labs
            <br />
            --transport http
            <br />
            https://labs.duku.design/mcp
          </p>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4">
          <p className="font-pixel text-[10px] tracking-wider text-muted-foreground">
            © {new Date().getFullYear()} DUKU · MADE WITH HUMAN TASTE
          </p>
          <p className="font-pixel text-[10px] tracking-wider text-muted-foreground">
            OPEN SOURCE · MIT
          </p>
        </div>
      </div>
    </footer>
  );
}
