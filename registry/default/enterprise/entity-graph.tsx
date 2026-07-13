"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/registry/default/lib/use-reduced-motion";

/* ------------------------------------------------------------------ */
/* Model                                                                */
/* ------------------------------------------------------------------ */

export type EntityType = "person" | "org" | "account" | "transaction";

export interface GraphNode {
  id: string;
  label: string;
  type: EntityType;
  /** Position in the 600×340 viewBox. */
  x: number;
  y: number;
  detail?: string;
  risk?: boolean;
}

export interface GraphEdge {
  from: string;
  to: string;
  label: string;
  /** Risk links render dashed destructive. */
  risk?: boolean;
}

export interface EntityGraphProps
  extends React.HTMLAttributes<HTMLDivElement> {
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  ref?: React.Ref<HTMLDivElement>;
}

export const DEMO_GRAPH: { nodes: GraphNode[]; edges: GraphEdge[] } = {
  nodes: [
    { id: "rk", label: "R. Kapoor", type: "person", x: 300, y: 60, detail: "AP clerk · vendor-master access since Jan", risk: true },
    { id: "meridian", label: "Meridian Supplies", type: "org", x: 130, y: 150, detail: "Vendor v-2291 · created 3 Jun", risk: true },
    { id: "acct1", label: "HDFC ••4471", type: "account", x: 130, y: 265, detail: "Payee account · holder name mismatch", risk: true },
    { id: "spouse", label: "P. Kapoor", type: "person", x: 300, y: 300, detail: "Account holder of HDFC ••4471" },
    { id: "inv", label: "4 invoices · ₹1.98L", type: "transaction", x: 460, y: 150, detail: "All within ₹1,500 of the dual-control threshold", risk: true },
    { id: "acme", label: "Acme Corp", type: "org", x: 470, y: 60, detail: "Employer · AP system owner" },
    { id: "acct2", label: "Acme escrow", type: "account", x: 470, y: 265, detail: "Source of the four payments" },
  ],
  edges: [
    { from: "rk", to: "meridian", label: "created" },
    { from: "rk", to: "inv", label: "approved" },
    { from: "meridian", to: "acct1", label: "payee" },
    { from: "acct1", to: "spouse", label: "held by" },
    { from: "rk", to: "spouse", label: "married to", risk: true },
    { from: "acme", to: "rk", label: "employs" },
    { from: "acct2", to: "inv", label: "paid" },
    { from: "inv", to: "acct1", label: "credited", risk: true },
  ],
};

const TYPE_META: Record<EntityType, { fill: string; label: string }> = {
  person: { fill: "fill-info", label: "Person" },
  org: { fill: "fill-primary", label: "Organisation" },
  account: { fill: "fill-warning", label: "Account" },
  transaction: { fill: "fill-success", label: "Transactions" },
};

const W = 600;
const H = 340;
const R = 17;

/* ------------------------------------------------------------------ */
/* Graph                                                                */
/* ------------------------------------------------------------------ */

/**
 * An entity-relationship graph for investigations: typed nodes, labelled
 * edges (risk links dashed in destructive), edges draw themselves in, and
 * selecting a node isolates its neighbourhood while a panel explains it.
 */
export function EntityGraph({
  nodes = DEMO_GRAPH.nodes,
  edges = DEMO_GRAPH.edges,
  className,
  ref,
  ...rest
}: EntityGraphProps) {
  const reduced = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const [selected, setSelected] = React.useState<string | null>(null);
  const byId = React.useMemo(
    () => Object.fromEntries(nodes.map((n) => [n.id, n])),
    [nodes]
  );
  const neighbours = React.useMemo(() => {
    if (!selected) return null;
    const set = new Set([selected]);
    for (const e of edges) {
      if (e.from === selected) set.add(e.to);
      if (e.to === selected) set.add(e.from);
    }
    return set;
  }, [selected, edges]);

  const sel = selected ? byId[selected] : null;

  /* Entrance: edges draw, nodes pop. */
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const lines = gsap.utils.toArray<SVGLineElement>(root.querySelectorAll("[data-edge]"));
      const dots = gsap.utils.toArray<SVGGElement>(root.querySelectorAll("[data-node]"));
      if (reduced) {
        gsap.set(lines, { strokeDashoffset: 0, opacity: 1 });
        gsap.set(dots, { scale: 1, opacity: 1 });
        return;
      }
      gsap.set(dots, { transformOrigin: "center center" });
      gsap.fromTo(
        dots,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.8)", stagger: 0.07 }
      );
      for (const line of lines) {
        const len = Math.hypot(
          Number(line.getAttribute("x2")) - Number(line.getAttribute("x1")),
          Number(line.getAttribute("y2")) - Number(line.getAttribute("y1"))
        );
        gsap.fromTo(
          line,
          { strokeDasharray: len, strokeDashoffset: len, opacity: 0 },
          {
            strokeDashoffset: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.inOut",
            delay: 0.35,
            onComplete: () => {
              // restore the designed dash pattern for risk edges
              if (line.dataset.risk === "true") line.style.strokeDasharray = "5 4";
              else line.style.strokeDasharray = "none";
            },
          }
        );
      }
    },
    { scope: rootRef }
  );

  const dimmed = (id: string) => (neighbours ? !neighbours.has(id) : false);

  return (
    <div
      ref={rootRef}
      data-slot="entity-graph"
      className={cn(
        "w-full max-w-xl rounded-2xl border border-border bg-card p-4",
        className
      )}
      {...rest}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">Entity graph</h3>
        <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
          {(Object.keys(TYPE_META) as EntityType[]).map((t) => (
            <span key={t} className="flex items-center gap-1">
              <svg viewBox="0 0 8 8" className="size-2" aria-hidden="true">
                <circle cx="4" cy="4" r="4" className={TYPE_META[t].fill} />
              </svg>
              {TYPE_META[t].label}
            </span>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Entity graph: ${nodes.length} entities, ${edges.length} relationships. Select a node to isolate its connections.`}
        className="mt-2 w-full"
      >
        {/* edges */}
        {edges.map((e) => {
          const a = byId[e.from];
          const b = byId[e.to];
          if (!a || !b) return null;
          const dim = neighbours
            ? !(neighbours.has(e.from) && neighbours.has(e.to)) ||
              (selected !== e.from && selected !== e.to)
            : false;
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          return (
            <g
              key={`${e.from}-${e.to}`}
              className="transition-opacity duration-300"
              style={{ opacity: dim ? 0.12 : 1 }}
            >
              <line
                data-edge
                data-risk={e.risk ? "true" : "false"}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                strokeWidth={e.risk ? 1.8 : 1.2}
                className={e.risk ? "stroke-destructive" : "stroke-border"}
              />
              <text
                x={mx}
                y={my - 4}
                textAnchor="middle"
                className={cn(
                  "text-[8.5px]",
                  e.risk ? "fill-destructive font-semibold" : "fill-muted-foreground"
                )}
              >
                {e.label}
              </text>
            </g>
          );
        })}

        {/* nodes */}
        {nodes.map((n) => (
          <g
            key={n.id}
            data-node
            role="button"
            tabIndex={0}
            aria-label={`${TYPE_META[n.type].label}: ${n.label}${n.risk ? ", flagged" : ""}`}
            aria-pressed={selected === n.id}
            onClick={() => setSelected((s) => (s === n.id ? null : n.id))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelected((s) => (s === n.id ? null : n.id));
              }
            }}
            className="cursor-pointer transition-opacity duration-300 focus-visible:outline-none"
            style={{ opacity: dimmed(n.id) ? 0.18 : 1 }}
          >
            {n.risk ? (
              <circle
                cx={n.x}
                cy={n.y}
                r={R + 4}
                className="fill-none stroke-destructive/50"
                strokeDasharray="3 3"
              />
            ) : null}
            <circle
              cx={n.x}
              cy={n.y}
              r={R}
              className={cn(
                TYPE_META[n.type].fill,
                selected === n.id ? "stroke-foreground" : "stroke-card"
              )}
              strokeWidth={selected === n.id ? 2.5 : 2}
              fillOpacity={0.9}
            />
            <text
              x={n.x}
              y={n.y + R + 12}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-medium"
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Detail panel */}
      <div
        className={cn(
          "mt-1 rounded-xl border p-3 text-sm transition-colors duration-300",
          sel?.risk ? "border-destructive/40 bg-destructive/5" : "border-border bg-background"
        )}
        aria-live="polite"
      >
        {sel ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-foreground">
                {sel.label}
                <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                  {TYPE_META[sel.type].label}
                </span>
              </p>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-[11px] text-muted-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Show all
              </button>
            </div>
            {sel.detail ? (
              <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground">{sel.detail}</p>
            ) : null}
            <p className="mt-1 text-[11px] text-muted-foreground">
              {edges
                .filter((e) => e.from === sel.id || e.to === sel.id)
                .map((e) =>
                  e.from === sel.id
                    ? `${e.label} → ${byId[e.to]?.label}`
                    : `${byId[e.from]?.label} → ${e.label}`
                )
                .join(" · ")}
            </p>
          </>
        ) : (
          <p className="text-[12px] text-muted-foreground">
            Select an entity to isolate its neighbourhood. Dashed red rings and
            edges mark risk links.
          </p>
        )}
      </div>
    </div>
  );
}
