"use client";

import { SlideTabs } from "@/registry/default/ui/slide-tabs";
import { CopyButton } from "@/registry/default/ui/kbd";

function CommandBlock({ command }: { command: string }) {
  return (
    <div className="flex items-center justify-between gap-2 overflow-x-auto rounded-lg border border-border bg-muted/50 py-1.5 pl-4 pr-1.5">
      <code className="whitespace-nowrap font-mono type-label text-foreground">
        {command}
      </code>
      <CopyButton value={command} />
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

export function InstallTabs() {
  return (
    <SlideTabs
      defaultValue="mcp"
      items={[
        {
          value: "mcp",
          label: "MCP",
          content: (
            <div className="flex flex-col gap-3 pt-4">
              <p className="text-sm text-muted-foreground">
                Connect once, then ask your coding agent to discover and
                implement components inside your product.
              </p>
              <CommandBlock command="claude mcp add duku-labs --transport http https://labs.duku.design/mcp" />
              <CommandBlock command="codex mcp add duku-labs --url https://labs.duku.design/mcp" />
            </div>
          ),
        },
        {
          value: "cli",
          label: "shadcn CLI",
          content: (
            <div className="flex flex-col gap-3 pt-4">
              <p className="text-sm text-muted-foreground">
                Install any component as source you own — with its registry
                dependencies resolved automatically.
              </p>
              <CommandBlock command="npx shadcn@latest add https://labs.duku.design/r/signup-card.json" />
            </div>
          ),
        },
        {
          value: "manual",
          label: "Manual JSON",
          content: (
            <div className="flex flex-col gap-3 pt-4">
              <p className="text-sm text-muted-foreground">
                For Claude Desktop, Cursor, VS Code or any other MCP client,
                add the server to your MCP configuration:
              </p>
              <div className="relative rounded-lg border border-border bg-muted/50 p-4">
                <div className="absolute right-1.5 top-1.5">
                  <CopyButton value={MCP_JSON} />
                </div>
                <pre className="overflow-x-auto font-mono type-label leading-6 text-foreground">
                  <code>{MCP_JSON}</code>
                </pre>
              </div>
            </div>
          ),
        },
      ]}
    />
  );
}
