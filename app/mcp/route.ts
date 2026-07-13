import { NextRequest, NextResponse } from "next/server";
import fileContents from "@/registry/generated/file-contents.json";
import {
  LIBRARY_VERSION,
  MCP_URL,
  QUALITY_STANDARD,
  SITE_URL,
  getComponentDetail,
  installCommand,
  listComponents,
  searchComponents,
  tokensResource,
  type Tier,
} from "@/lib/agent-manifest";

/**
 * DUKU Labs MCP server (read-only beta).
 *
 * A stateless MCP server over streamable HTTP: every request is a single
 * JSON-RPC POST answered with application/json. No sessions, no SSE — that
 * keeps it deployable on edge/Workers runtimes and is sufficient for the
 * discovery tools it exposes. Connect with:
 *
 *   claude mcp add duku-labs --transport http https://labs.duku.design/mcp
 *
 * Anonymous callers get metadata for the whole catalog and source for
 * free-tier components; a `Authorization: Bearer <license-key>` header
 * (validated against DUKU_LICENSE_KEYS) unlocks pro source.
 */

const PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26"];
const CONTENTS: Record<string, string> = fileContents;

interface JsonRpcRequest {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
}

function isAuthorized(req: NextRequest): boolean {
  const keys = process.env.DUKU_LICENSE_KEYS;
  // Dev mode: serve openly when no keys are configured.
  if (!keys) return true;
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return false;
  return keys
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .includes(token);
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version",
};

function rpcResult(id: string | number | null, result: unknown) {
  return { jsonrpc: "2.0" as const, id, result };
}

function rpcError(
  id: string | number | null,
  code: number,
  message: string
) {
  return { jsonrpc: "2.0" as const, id, error: { code, message } };
}

function text(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: typeof value === "string" ? value : JSON.stringify(value, null, 2),
      },
    ],
  };
}

function toolError(message: string) {
  return { ...text(message), isError: true };
}

// ---------------------------------------------------------------------------
// Tools

const TOOLS = [
  {
    name: "search_components",
    description:
      "Search the DUKU Labs component registry by natural-language requirement. Returns matching components with confidence scores, category, tier and docs links.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            'What you are building, e.g. "OTP verification with error shake" or "streaming AI chat".',
        },
        tier: {
          type: "string",
          enum: ["free", "pro"],
          description: "Restrict results to a license tier.",
        },
        limit: {
          type: "number",
          description: "Maximum results (default 8).",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_component",
    description:
      "Retrieve the full agent-readable schema for one component: props, interaction/motion behavior, dependencies, install command, quality guarantees and (when licensed or free-tier) the TypeScript source files.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: 'Component name, e.g. "amount-input".',
        },
        include_source: {
          type: "boolean",
          description: "Include full source file contents (default true).",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "get_install_command",
    description:
      "Get the shadcn CLI command that installs a component's source files (plus its registry dependencies) into the current project.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Component name." },
        packageManager: {
          type: "string",
          enum: ["npm", "pnpm", "yarn", "bun"],
          description: "Package manager of the target project (default npm).",
        },
      },
      required: ["name"],
    },
  },
] as const;

function callTool(
  name: string,
  args: Record<string, unknown>,
  authorized: boolean
) {
  switch (name) {
    case "search_components": {
      const query = typeof args.query === "string" ? args.query : "";
      if (!query) return toolError("`query` is required.");
      const results = searchComponents(query, {
        tier: args.tier as Tier | undefined,
        limit: typeof args.limit === "number" ? args.limit : undefined,
      });
      if (results.length === 0) {
        return text({
          results: [],
          note: "No components matched. DUKU Labs currently covers primitives, feedback, overlays/navigation, fintech data, AI/agent interfaces, motion showpieces, auth/marketing blocks and signature workflows (KYC, option chain, Greeks, crypto swap, agent canvas, portfolio risk, biomarker trends). Report unsupported requirements to the user instead of forcing a poor match.",
        });
      }
      return text({ results });
    }
    case "get_component": {
      const name = typeof args.name === "string" ? args.name : "";
      const detail = getComponentDetail(name);
      if (!detail) return toolError(`Unknown component: ${name}`);
      const includeSource = args.include_source !== false;
      const canReadSource = detail.tier === "free" || authorized;
      const source =
        includeSource && canReadSource
          ? detail.files.map((f) => ({
              path: f.path,
              content: CONTENTS[f.path] ?? "",
            }))
          : undefined;
      return text({
        ...detail,
        ...(source ? { source } : {}),
        ...(includeSource && !canReadSource
          ? {
              sourceUnavailable: `"${name}" is a Pro component. Source requires a DUKU Labs license key sent as an Authorization: Bearer header. Purchase: ${SITE_URL}/pricing`,
            }
          : {}),
      });
    }
    case "get_install_command": {
      const name = typeof args.name === "string" ? args.name : "";
      const detail = getComponentDetail(name);
      if (!detail) return toolError(`Unknown component: ${name}`);
      const pm = (args.packageManager ?? "npm") as
        | "npm"
        | "pnpm"
        | "yarn"
        | "bun";
      return text({
        command: installCommand(name, pm),
        registryItemUrl: detail.registryItemUrl,
        registryDependencies: detail.registryDependencies,
        npmDependencies: detail.dependencies,
        notes: [
          "Run the command from the target project root; it writes the component source into the project so the user owns and can edit it.",
          detail.tier === "pro"
            ? "Pro component: the registry endpoint requires an Authorization: Bearer <license-key> header when DUKU_LICENSE_KEYS is configured."
            : "Free-tier component: no license key required.",
          "Ask the user before running installation commands that modify their codebase.",
        ],
      });
    }
    default:
      return toolError(`Unknown tool: ${name}`);
  }
}

// ---------------------------------------------------------------------------
// Resources

function resourceList() {
  return [
    {
      uri: "duku://components",
      name: "Component index",
      description:
        "Every DUKU Labs component with category, level, tier and docs URL.",
      mimeType: "application/json",
    },
    {
      uri: "duku://tokens/default",
      name: "Design tokens",
      description:
        "Foundation, semantic, domain and motion token layers with light/dark values.",
      mimeType: "application/json",
    },
    {
      uri: "duku://docs/quality-standard",
      name: "Component quality standard",
      description:
        "The guarantees every published DUKU Labs component ships with.",
      mimeType: "application/json",
    },
    ...listComponents().map((c) => ({
      uri: `duku://components/${c.name}`,
      name: c.title,
      description: c.description,
      mimeType: "application/json",
    })),
  ];
}

function readResource(uri: string, authorized: boolean) {
  const json = (value: unknown) => ({
    contents: [
      {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(value, null, 2),
      },
    ],
  });

  if (uri === "duku://components") return json(listComponents());
  if (uri === "duku://tokens/default") return json(tokensResource());
  if (uri === "duku://docs/quality-standard")
    return json({ qualityStandard: QUALITY_STANDARD });

  const match = uri.match(/^duku:\/\/components\/([a-z0-9-]+)$/);
  if (match) {
    const detail = getComponentDetail(match[1]);
    if (!detail) return null;
    const canReadSource = detail.tier === "free" || authorized;
    return json({
      ...detail,
      ...(canReadSource
        ? {
            source: detail.files.map((f) => ({
              path: f.path,
              content: CONTENTS[f.path] ?? "",
            })),
          }
        : {
            sourceUnavailable: `Pro component; license key required. ${SITE_URL}/pricing`,
          }),
    });
  }
  return null;
}

// ---------------------------------------------------------------------------
// Prompts

const PROMPTS = [
  {
    name: "adapt_component_to_brand",
    description:
      "Install a DUKU Labs component and remap its design tokens to the current project's brand.",
    arguments: [
      { name: "component", description: "Component name, e.g. amount-input", required: true },
      { name: "brand_notes", description: "Brand color, radius, typography or density requirements", required: false },
    ],
  },
  {
    name: "build_auth_flow",
    description:
      "Compose the DUKU Labs signup, login and OTP components into a complete authentication flow.",
    arguments: [
      { name: "requirements", description: "Project-specific requirements (OAuth providers, routing, backend)", required: false },
    ],
  },
  {
    name: "audit_duku_implementation",
    description:
      "Audit DUKU Labs components already installed in this project for token compliance, accessibility and reduced-motion support.",
    arguments: [],
  },
] as const;

function getPrompt(name: string, args: Record<string, unknown>) {
  const user = (t: string) => ({
    messages: [{ role: "user" as const, content: { type: "text" as const, text: t } }],
  });
  switch (name) {
    case "adapt_component_to_brand": {
      const component = String(args.component ?? "");
      const brand = String(args.brand_notes ?? "the project's existing theme");
      return user(
        `Use the DUKU Labs MCP server to fetch the "${component}" component (get_component) and its design tokens (resource duku://tokens/default). Install it into this project with the command from get_install_command, then remap the DUKU CSS variables onto ${brand}. Preserve all accessibility behavior and reduced-motion support, and keep the component's interaction states intact. Ask before running commands that modify the codebase.`
      );
    }
    case "build_auth_flow": {
      const req = String(args.requirements ?? "no additional requirements");
      return user(
        `Build a complete authentication flow using DUKU Labs. Use search_components and get_component to inspect "signup-card", "login-card" and "otp-input", install them via their shadcn commands, then compose them with this project's routing and backend. Requirements: ${req}. Wire real submit handlers, keep every error/loading/success state functional, and adapt tokens to the existing theme.`
      );
    }
    case "audit_duku_implementation":
      return user(
        `Audit this project's DUKU Labs usage. Compare installed component files against the registry versions (get_component), then check: design-token compliance (no hardcoded palette values where tokens exist), dark-mode rendering, keyboard navigation, focus management, and prefers-reduced-motion behavior. Report deviations with file references and suggested fixes; do not change code without approval.`
      );
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// JSON-RPC dispatch

function handleMessage(msg: JsonRpcRequest, authorized: boolean) {
  const id = msg.id ?? null;
  const params = msg.params ?? {};

  switch (msg.method) {
    case "initialize": {
      const requested = String(params.protocolVersion ?? "");
      return rpcResult(id, {
        protocolVersion: PROTOCOL_VERSIONS.includes(requested)
          ? requested
          : PROTOCOL_VERSIONS[0],
        capabilities: { tools: {}, resources: {}, prompts: {} },
        serverInfo: {
          name: "duku-labs",
          title: "DUKU Labs",
          version: LIBRARY_VERSION,
        },
        instructions: `DUKU Labs is an agent-ready design engineering library: production React components with full interaction states, engineered motion and design tokens, installed as source the user owns. Use search_components to discover components for a requirement, get_component for props/behavior/source, and get_install_command for the shadcn CLI command. Resources under duku:// expose the component index and token layers. Docs: ${SITE_URL} — MCP endpoint: ${MCP_URL}. If a requirement has no good match, say so rather than forcing one.`,
      });
    }
    case "ping":
      return rpcResult(id, {});
    case "tools/list":
      return rpcResult(id, { tools: TOOLS });
    case "tools/call": {
      const name = String(params.name ?? "");
      const args = (params.arguments ?? {}) as Record<string, unknown>;
      return rpcResult(id, callTool(name, args, authorized));
    }
    case "resources/list":
      return rpcResult(id, { resources: resourceList() });
    case "resources/templates/list":
      return rpcResult(id, { resourceTemplates: [] });
    case "resources/read": {
      const uri = String(params.uri ?? "");
      const resource = readResource(uri, authorized);
      if (!resource) return rpcError(id, -32002, `Resource not found: ${uri}`);
      return rpcResult(id, resource);
    }
    case "prompts/list":
      return rpcResult(id, { prompts: PROMPTS });
    case "prompts/get": {
      const name = String(params.name ?? "");
      const args = (params.arguments ?? {}) as Record<string, unknown>;
      const prompt = getPrompt(name, args);
      if (!prompt) return rpcError(id, -32602, `Unknown prompt: ${name}`);
      return rpcResult(id, prompt);
    }
    default:
      return rpcError(id, -32601, `Method not found: ${msg.method}`);
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(rpcError(null, -32700, "Parse error"), {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  const authorized = isAuthorized(req);
  const messages = Array.isArray(body) ? body : [body];
  const responses = [];
  for (const raw of messages) {
    const msg = raw as JsonRpcRequest;
    if (!msg || typeof msg.method !== "string") {
      responses.push(rpcError(msg?.id ?? null, -32600, "Invalid request"));
      continue;
    }
    // Notifications get no response body.
    if (msg.id === undefined) continue;
    responses.push(handleMessage(msg, authorized));
  }

  // Notification-only POST: acknowledge with 202 and no body.
  if (responses.length === 0) {
    return new NextResponse(null, { status: 202, headers: CORS_HEADERS });
  }

  return NextResponse.json(
    Array.isArray(body) ? responses : responses[0],
    { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
  );
}

// Stateless server: no SSE stream to open, no session to terminate.
export async function GET() {
  return NextResponse.json(
    {
      error:
        "This MCP endpoint is stateless and does not offer a server-initiated stream. Send JSON-RPC messages via POST.",
    },
    { status: 405, headers: { ...CORS_HEADERS, Allow: "POST, OPTIONS" } }
  );
}

export async function DELETE() {
  return new NextResponse(null, {
    status: 405,
    headers: { ...CORS_HEADERS, Allow: "POST, OPTIONS" },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
