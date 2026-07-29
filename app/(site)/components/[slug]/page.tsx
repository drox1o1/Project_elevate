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
    <article className="flex flex-col gap-10 pb-24 sm:gap-12">
      <header>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-[1.75rem] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground sm:text-[2rem]">
            {doc.title}
          </h1>
          <Badge variant="outline">{doc.phase}</Badge>
          {doc.free ? <Badge variant="success">Free</Badge> : null}
        </div>
        <p className="mt-3 max-w-2xl type-body text-muted-foreground">
          {doc.description}
        </p>
        {doc.demoHref ? (
          <p className="mt-3 type-label text-muted-foreground">
            <Link
              href={doc.demoHref}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Full variant set and playground →
            </Link>
          </p>
        ) : null}
      </header>

      <PreviewPanel slug={doc.slug} />

      <section>
        <h2 className="type-overline text-muted-foreground">Install</h2>
        <div className="mt-2.5 flex items-center justify-between gap-2 overflow-x-auto rounded-xl border border-border/70 bg-muted/50 py-1.5 pl-4 pr-1.5 shadow-xs">
          <code className="whitespace-nowrap font-mono type-label text-foreground">
            {install}
          </code>
          <CopyButton value={install} />
        </div>
      </section>

      <section>
        <h2 className="type-overline text-muted-foreground">
          Ask your agent to use this
        </h2>
        <p className="mt-1 type-label text-muted-foreground">
          <Link
            href="/connect"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Connect DUKU Labs to MCP
          </Link>
          , then hand your coding agent this prompt:
        </p>
        <div className="mt-2.5 flex items-start justify-between gap-2 rounded-xl border border-border/70 bg-muted/50 py-2.5 pl-4 pr-1.5 shadow-xs">
          <p className="type-label leading-6 text-foreground">
            {agentPrompt}
          </p>
          <CopyButton value={agentPrompt} />
        </div>
      </section>

      <section>
        <h2 className="type-overline text-muted-foreground">Interaction</h2>
        <div className="mt-2.5 overflow-x-auto rounded-xl border border-border/70 shadow-xs">
          <table className="w-full min-w-[34rem] text-left type-label">
            <thead>
              <tr className="border-b border-border/70 bg-muted/50">
                <th className="px-4 py-2.5 type-overline text-muted-foreground">Try</th>
                <th className="px-4 py-2.5 type-overline text-muted-foreground">What happens</th>
              </tr>
            </thead>
            <tbody>
              {doc.interactions.map((row) => (
                <tr
                  key={row.action}
                  className="border-b border-border/60 last:border-0"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-foreground">
                    {row.action}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.result}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="type-overline text-muted-foreground">Props</h2>
        <div className="mt-2.5 overflow-x-auto rounded-xl border border-border/70 shadow-xs">
          <table className="w-full min-w-[34rem] text-left type-label">
            <thead>
              <tr className="border-b border-border/70 bg-muted/50">
                <th className="px-4 py-2.5 type-overline text-muted-foreground">Prop</th>
                <th className="px-4 py-2.5 type-overline text-muted-foreground">Type</th>
                <th className="px-4 py-2.5 type-overline text-muted-foreground">Default</th>
                <th className="px-4 py-2.5 type-overline text-muted-foreground">Description</th>
              </tr>
            </thead>
            <tbody>
              {doc.props.map((row) => (
                <tr
                  key={row.prop}
                  className="border-b border-border/60 align-top last:border-0"
                >
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono type-label text-foreground">
                    {row.prop}
                  </td>
                  <td className="px-4 py-2.5 font-mono type-meta text-muted-foreground">
                    {row.type}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono type-meta text-muted-foreground">
                    {row.defaultValue ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <details className="group rounded-xl border border-border/70 shadow-xs">
          <summary className="cursor-pointer select-none px-4 py-3 type-label font-medium text-foreground transition-colors duration-200 hover:bg-muted/50">
            Source — {doc.sourceFile}
          </summary>
          <div className="overflow-x-auto border-t border-border/70 bg-muted/30 p-4">
            <pre className="type-meta leading-5 text-muted-foreground">
              <code>{source}</code>
            </pre>
          </div>
        </details>
      </section>
    </article>
  );
}
