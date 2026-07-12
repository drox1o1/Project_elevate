import { NextRequest, NextResponse } from "next/server";
import registry from "@/registry.json";
import fileContents from "@/registry/generated/file-contents.json";

const PURCHASE_URL = "https://labs.duku.design/pricing";

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

const CONTENTS: Record<string, string> = fileContents;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name: rawName } = await params;
  const name = rawName.replace(/\.json$/, "");

  const item = (registry.items as RegistryItem[]).find(
    (i) => i.name === name
  );
  if (!item) {
    return NextResponse.json(
      { error: `Unknown component: ${name}` },
      { status: 404 }
    );
  }

  if (item.meta?.tier !== "free" && !isAuthorized(req)) {
    return NextResponse.json(
      {
        error: "A DUKU license key is required for this component.",
        purchase: PURCHASE_URL,
      },
      { status: 401 }
    );
  }

  // File contents are inlined at build time (registry/generated/file-contents.json)
  // so this handler never touches the filesystem — required for edge/Workers
  // runtimes (e.g. Cloudflare) that have no disk access at request time.
  const files = item.files.map((file) => ({
    path: file.path,
    type: file.type,
    content: CONTENTS[file.path] ?? "",
  }));

  return NextResponse.json(
    {
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: item.name,
      type: item.type,
      title: item.title,
      description: item.description,
      dependencies: item.dependencies,
      registryDependencies: item.registryDependencies,
      files,
      ...(item.css ? { css: item.css } : {}),
      ...(item.meta ? { meta: item.meta } : {}),
    },
    {
      headers: { "Cache-Control": "public, max-age=300" },
    }
  );
}
