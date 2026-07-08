"use client";

import * as React from "react";
import { DEMOS } from "@/components/site/demos";

export function PreviewPanel({ slug }: { slug: string }) {
  const [key, setKey] = React.useState(0);
  const Demo = DEMOS[slug];

  return (
    <div className="relative flex min-h-[360px] w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-background p-8">
      <button
        type="button"
        aria-label="Replay demo"
        onClick={() => setKey((k) => k + 1)}
        className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
          aria-hidden="true"
        >
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </button>
      <div key={key} className="flex w-full items-center justify-center">
        {Demo ? <Demo /> : <p className="text-sm text-muted-foreground">No demo yet.</p>}
      </div>
    </div>
  );
}
