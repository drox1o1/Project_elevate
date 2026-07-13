/**
 * Agent-readable component schema for DUKU Labs.
 *
 * Merges the shadcn registry manifest (registry.json) with the docs data
 * (lib/docs-data.ts) into one structured description per component: what it
 * is, what it depends on, its props, its interaction/motion behavior, how to
 * install it and what quality guarantees it ships with. This is the single
 * source the MCP endpoint (app/mcp/route.ts) serves to coding agents.
 */

import registry from "@/registry.json";
import { DOCS, type DocEntry } from "@/lib/docs-data";
import { TOKEN_LAYERS } from "@/lib/tokens";

export const SITE_URL = "https://labs.duku.design";
export const MCP_URL = `${SITE_URL}/mcp`;
export const LIBRARY_VERSION = "1.0.0";

export type Tier = "free" | "pro";

interface RegistryFile {
  path: string;
  type: string;
}

interface RegistryItem {
  name: string;
  type: string;
  title: string;
  description: string;
  dependencies: string[];
  registryDependencies: string[];
  files: RegistryFile[];
  css?: Record<string, unknown>;
  meta?: { tier?: string };
}

const ITEMS = registry.items as RegistryItem[];

const CATEGORY_BY_PHASE: Record<string, string> = {
  "Primitives": "primitives",
  "Feedback": "feedback",
  "Overlays & navigation": "overlays-navigation",
  "Fintech & data": "fintech-data",
  "AI / agent": "ai-agent",
  "Motion showpieces": "motion",
  "Blocks": "blocks",
  "Signature workflows": "signature-workflows",
  "Healthcare": "healthcare",
};

/** PRD component levels: 1 primitives, 2 advanced components, 3 product blocks. */
const LEVEL_BY_CATEGORY: Record<string, 1 | 2 | 3> = {
  "primitives": 1,
  "feedback": 1,
  "overlays-navigation": 1,
  "fintech-data": 2,
  "ai-agent": 2,
  "motion": 2,
  "blocks": 3,
  "signature-workflows": 3,
  "healthcare": 2,
};

/** Guarantees every published DUKU Labs component ships with. */
export const QUALITY_STANDARD = [
  "TypeScript with exported prop interfaces",
  "Keyboard navigation and visible focus management",
  "Screen-reader semantics (Radix primitives where a11y demands it)",
  "Responsive layout",
  "Full interaction state matrix: loading, error, success and disabled where applicable",
  "prefers-reduced-motion support via the use-reduced-motion hook",
  "Dark and light themes through shadcn CSS variables",
  "Framework-portable React (Next.js used for docs only)",
];

export interface ComponentSummary {
  name: string;
  title: string;
  description: string;
  category: string;
  level: 1 | 2 | 3;
  tier: Tier;
  docsUrl: string;
}

export interface ComponentDetail extends ComponentSummary {
  framework: string;
  registryItemUrl: string;
  installCommand: string;
  dependencies: string[];
  registryDependencies: string[];
  files: RegistryFile[];
  props: { prop: string; type: string; default?: string; description: string }[];
  interactions: { action: string; result: string }[];
  qualityStandard: string[];
  version: string;
}

function tierOf(item: RegistryItem): Tier {
  return item.meta?.tier === "free" ? "free" : "pro";
}

function toSummary(item: RegistryItem, doc: DocEntry | undefined): ComponentSummary {
  const category = doc ? CATEGORY_BY_PHASE[doc.phase] ?? "other" : "other";
  return {
    name: item.name,
    title: item.title,
    description: doc?.description ?? item.description,
    category,
    level: LEVEL_BY_CATEGORY[category] ?? 1,
    tier: tierOf(item),
    docsUrl: `${SITE_URL}/components/${item.name}`,
  };
}

export function installCommand(
  name: string,
  packageManager: "npm" | "pnpm" | "yarn" | "bun" = "npm"
): string {
  const runners: Record<string, string> = {
    npm: "npx",
    pnpm: "pnpm dlx",
    yarn: "yarn dlx",
    bun: "bunx",
  };
  return `${runners[packageManager]} shadcn@latest add ${SITE_URL}/r/${name}.json`;
}

export function listComponents(): ComponentSummary[] {
  return ITEMS.map((item) =>
    toSummary(item, DOCS.find((d) => d.slug === item.name))
  );
}

export function getComponentDetail(name: string): ComponentDetail | undefined {
  const item = ITEMS.find((i) => i.name === name);
  if (!item) return undefined;
  const doc = DOCS.find((d) => d.slug === name);
  return {
    ...toSummary(item, doc),
    framework: "react",
    registryItemUrl: `${SITE_URL}/r/${item.name}.json`,
    installCommand: installCommand(item.name),
    dependencies: item.dependencies,
    registryDependencies: item.registryDependencies,
    files: item.files,
    props: (doc?.props ?? []).map((p) => ({
      prop: p.prop,
      type: p.type,
      ...(p.defaultValue ? { default: p.defaultValue } : {}),
      description: p.description,
    })),
    interactions: doc?.interactions ?? [],
    qualityStandard: QUALITY_STANDARD,
    version: LIBRARY_VERSION,
  };
}

export interface SearchResult extends ComponentSummary {
  confidence: number;
}

/**
 * Keyword search over the manifest. Deliberately simple and dependency-free:
 * tokenize the query, score each component on title/name/description/
 * category/interaction text, normalize to 0–1.
 */
export function searchComponents(
  query: string,
  opts: { tier?: Tier; limit?: number } = {}
): SearchResult[] {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1);
  if (terms.length === 0) return [];

  const scored = ITEMS.map((item) => {
    const doc = DOCS.find((d) => d.slug === item.name);
    const summary = toSummary(item, doc);
    const haystacks: [string, number][] = [
      [item.name.replace(/-/g, " "), 4],
      [item.title.toLowerCase(), 4],
      [summary.description.toLowerCase(), 2],
      [summary.category.replace(/-/g, " "), 2],
      [
        (doc?.interactions ?? [])
          .map((i) => `${i.action} ${i.result}`)
          .join(" ")
          .toLowerCase(),
        1,
      ],
      [(doc?.props ?? []).map((p) => p.prop).join(" ").toLowerCase(), 1],
    ];
    let score = 0;
    for (const term of terms) {
      for (const [text, weight] of haystacks) {
        if (text.includes(term)) score += weight;
      }
    }
    return { summary, score };
  })
    .filter((s) => s.score > 0)
    .filter((s) => (opts.tier ? s.summary.tier === opts.tier : true))
    .sort((a, b) => b.score - a.score)
    .slice(0, opts.limit ?? 8);

  const max = scored[0]?.score ?? 1;
  return scored.map((s) => ({
    ...s.summary,
    confidence: Math.round((s.score / max) * 100) / 100,
  }));
}

export function tokensResource() {
  return {
    version: LIBRARY_VERSION,
    source: "app/globals.css",
    layers: TOKEN_LAYERS,
  };
}
