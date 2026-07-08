import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import registry from "@/registry.json";

/** Items served without a license key. */
const FREE_ITEMS = new Set(["kinetic-heading", "magnetic-button", "button"]);

const PURCHASE_URL = "https://duku.design/pricing";

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

  if (!FREE_ITEMS.has(name) && !isAuthorized(req)) {
    return NextResponse.json(
      {
        error: "A DUKU license key is required for this component.",
        purchase: PURCHASE_URL,
      },
      { status: 401 }
    );
  }

  // Inline file contents into the registry-item payload.
  const files = await Promise.all(
    item.files.map(async (file) => ({
      path: file.path,
      type: file.type,
      content: await readFile(path.join(process.cwd(), file.path), "utf8"),
    }))
  );

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
    },
    {
      headers: { "Cache-Control": "public, max-age=300" },
    }
  );
}
