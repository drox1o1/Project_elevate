import { NextResponse } from "next/server";
import registry from "@/registry.json";
import fileContents from "@/registry/generated/file-contents.json";

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

const CONTENTS: Record<string, string> = fileContents;

// DUKU Labs is MIT-licensed and fully open source: every registry item is
// served openly, with no license key or paywall. The `tier` field on an item
// is kept only as an informational label.
export async function GET(
  _req: Request,
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
