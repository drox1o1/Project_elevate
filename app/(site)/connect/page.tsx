import type { Metadata } from "next";
import Link from "next/link";
import { CopyButton } from "@/registry/default/ui/kbd";
import { Badge } from "@/registry/default/ui/badge";
import { ScrollFade } from "@/components/site/scroll-fade";

export const metadata: Metadata = {
  title: "Connect to MCP",
  description:
    "Connect DUKU Labs to Claude Code, Codex or any MCP-compatible coding agent.",
};

function CommandBlock({ command }: { command: string }) {
  return (
    <div className="flex items-center justify-between gap-2 overflow-x-auto rounded-lg border border-border bg-muted/50 py-1.5 pl-4 pr-1.5">
      <code className="whitespace-nowrap font-mono text-[13px] text-foreground">
        {command}
      </code>
      <CopyButton value={command} />
    </div>
  );
}

function JsonBlock({ json }: { json: string }) {
  return (
    <div className="relative rounded-lg border border-border bg-muted/50 p-4">
      <div className="absolute right-1.5 top-1.5">
        <CopyButton value={json} />
      </div>
      <pre className="overflow-x-auto font-mono text-[13px] leading-6 text-foreground">
        <code>{json}</code>
      </pre>
    </div>
  );
}

const MCP_JSON = `{
  "mcpServers": {
    "duku-labs": {
      "type": "http",
      "url": "https://labs.duku.design/mcp"
    }
  }
}`;

const CURL_TEST = `curl -s https://labs.duku.design/mcp -X POST \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`;

const TOOLS = [
  {
    name: "search_components",
    detail:
      "Search the registry by natural-language requirement. Returns matches with confidence scores, category, tier and docs links.",
  },
  {
    name: "get_component",
    detail:
      "Full agent-readable schema for one component: props, interaction and motion behavior, dependencies, install command, quality guarantees and source.",
  },
  {
    name: "get_install_command",
    detail:
      "The shadcn CLI command that installs a component's source (plus registry dependencies) into the current project.",
  },
] as const;

const RESOURCES = [
  ["duku://components", "Index of every component in the catalog"],
  ["duku://components/{name}", "Per-component schema and source"],
  ["duku://tokens/default", "Foundation, semantic, domain and motion tokens"],
  ["duku://docs/quality-standard", "What every published component guarantees"],
] as const;

const PROMPTS = [
  ["adapt_component_to_brand", "Install a component and remap tokens to your brand"],
  ["build_auth_flow", "Compose signup, login and OTP into a full auth flow"],
  ["audit_duku_implementation", "Audit installed components for token and a11y compliance"],
] as const;

export default function ConnectPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20">
      <ScrollFade className="flex flex-col gap-14" y={20}>
      <header>
        <Badge variant="outline" className="mb-4">
          MCP beta · read-only registry
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">
          Connect DUKU Labs to your coding agent
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Connect DUKU Labs once, then ask your coding agent to discover and
          implement components inside your product. MCP gives the agent
          structured context and callable tools — the agent still needs access
          to your project and your permission to edit files, install
          dependencies and run commands.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Claude Code</h2>
        <CommandBlock command="claude mcp add duku-labs --transport http https://labs.duku.design/mcp" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Codex</h2>
        <CommandBlock command="codex mcp add duku-labs --url https://labs.duku.design/mcp" />
        <p className="text-xs text-muted-foreground">
          The Codex CLI and IDE extension share MCP configuration, so adding
          the server once covers both.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Claude Desktop, Cursor, VS Code and other clients
        </h2>
        <p className="text-sm text-muted-foreground">
          Add the server to your client&apos;s MCP configuration file:
        </p>
        <JsonBlock json={MCP_JSON} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Test the connection
        </h2>
        <p className="text-sm text-muted-foreground">
          The endpoint answers plain JSON-RPC, so you can verify it from a
          terminal before wiring up a client:
        </p>
        <JsonBlock json={CURL_TEST} />
      </section>

      <section>
        <h2 className="text-lg font-semibold tracking-tight">
          What the server exposes
        </h2>
        <div className="mt-4 flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Tools</h3>
            <ul className="mt-2 flex flex-col gap-2">
              {TOOLS.map((t) => (
                <li
                  key={t.name}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <code className="font-mono text-[13px] font-semibold text-foreground">
                    {t.name}
                  </code>
                  <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
                    {t.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Resources
            </h3>
            <ul className="mt-2 flex flex-col gap-1.5">
              {RESOURCES.map(([uri, detail]) => (
                <li key={uri} className="flex flex-wrap items-baseline gap-2 text-sm">
                  <code className="font-mono text-[13px] text-foreground">
                    {uri}
                  </code>
                  <span className="text-[13px] text-muted-foreground">
                    {detail}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Prompts
            </h3>
            <ul className="mt-2 flex flex-col gap-1.5">
              {PROMPTS.map(([name, detail]) => (
                <li key={name} className="flex flex-wrap items-baseline gap-2 text-sm">
                  <code className="font-mono text-[13px] text-foreground">
                    {name}
                  </code>
                  <span className="text-[13px] text-muted-foreground">
                    {detail}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold tracking-tight">Authentication</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Anonymous connections can search the full catalog, read every
          component&apos;s metadata and fetch source for free-tier components.
          A{" "}
          <Link
            href="/pricing"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Pro or Team license
          </Link>{" "}
          unlocks Pro component source: send your license key as an{" "}
          <code className="font-mono text-[13px]">
            Authorization: Bearer
          </code>{" "}
          header. Treat the key like a password — keep it out of screenshots,
          logs and committed config files (use an environment variable
          reference instead).
        </p>
      </section>
      </ScrollFade>
    </main>
  );
}
