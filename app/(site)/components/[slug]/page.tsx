import { readFile } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { DOCS, getDoc } from "@/lib/docs-data";
import { installCommand } from "@/lib/agent-manifest";
import { PreviewPanel } from "@/components/site/preview";
import { CopyButton } from "@/registry/default/ui/kbd";
import { Badge } from "@/registry/default/ui/badge";

export function generateStaticParams() {
  return DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  return { title: doc?.title ?? "Components" };
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();

  const install = installCommand(doc.slug);
  const agentPrompt = `Use the DUKU Labs MCP server to install the ${doc.title} component (get_component "${doc.slug}", then its install command). Adapt it to my existing design tokens, preserve all accessibility and reduced-motion behavior, and keep every interaction state working.`;
  let source = "";
  try {
    source = await readFile(path.join(process.cwd(), doc.sourceFile), "utf8");
  } catch {
    source = "// source unavailable";
  }

  return (
    <article className="flex flex-col gap-10 pb-24">
      <header>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {doc.title}
          </h1>
          <Badge variant="outline">{doc.phase}</Badge>
          {doc.free ? <Badge variant="success">Free</Badge> : null}
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {doc.description}
        </p>
      </header>

      <PreviewPanel slug={doc.slug} />

      <section>
        <h2 className="text-sm font-medium text-foreground">Install</h2>
        <div className="mt-2 flex items-center justify-between gap-2 overflow-x-auto rounded-lg border border-border bg-muted/50 py-1.5 pl-4 pr-1.5">
          <code className="whitespace-nowrap font-mono text-[13px] text-foreground">
            {install}
          </code>
          <CopyButton value={install} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-foreground">
          Ask your agent to use this
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          <Link
            href="/connect"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Connect DUKU Labs to MCP
          </Link>
          , then hand your coding agent this prompt:
        </p>
        <div className="mt-2 flex items-start justify-between gap-2 rounded-lg border border-border bg-muted/50 py-2.5 pl-4 pr-1.5">
          <p className="text-[13px] leading-6 text-foreground">
            {agentPrompt}
          </p>
          <CopyButton value={agentPrompt} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-foreground">Interaction</h2>
        <div className="mt-2 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2.5 font-medium">Try</th>
                <th className="px-4 py-2.5 font-medium">What happens</th>
              </tr>
            </thead>
            <tbody>
              {doc.interactions.map((row) => (
                <tr
                  key={row.action}
                  className="border-b border-border last:border-0"
                >
                  <td className="whitespace-nowrap px-4 py-2.5 text-foreground">
                    {row.action}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {row.result}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-foreground">Props</h2>
        <div className="mt-2 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2.5 font-medium">Prop</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Default</th>
                <th className="px-4 py-2.5 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {doc.props.map((row) => (
                <tr
                  key={row.prop}
                  className="border-b border-border last:border-0 align-top"
                >
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[13px] text-foreground">
                    {row.prop}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-muted-foreground">
                    {row.type}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[12px] text-muted-foreground">
                    {row.defaultValue ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <details className="group rounded-lg border border-border">
          <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted/50">
            Source — {doc.sourceFile}
          </summary>
          <div className="overflow-x-auto border-t border-border bg-muted/30 p-4">
            <pre className="text-[12px] leading-5 text-muted-foreground">
              <code>{source}</code>
            </pre>
          </div>
        </details>
      </section>
    </article>
  );
}
