"use client";

import * as React from "react";

export function MetaCell({ meta }: { meta: Record<string, unknown> | null }) {
  const [open, setOpen] = React.useState(false);
  if (!meta || !Object.keys(meta).length) return <span className="text-xs text-muted-foreground">—</span>;
  const text = JSON.stringify(meta);
  if (text.length <= 90) return <code className="break-all text-[11px] text-muted-foreground">{text}</code>;
  return (
    <div>
      {open ? (
        <pre className="max-h-64 overflow-auto rounded-md bg-muted p-2 text-[11px] scrollbar-thin">{JSON.stringify(meta, null, 2)}</pre>
      ) : (
        <code className="break-all text-[11px] text-muted-foreground">{text.slice(0, 90)}…</code>
      )}
      <button type="button" onClick={() => setOpen((o) => !o)} className="text-[11px] text-primary hover:underline">
        {open ? "Collapse" : "Expand"}
      </button>
    </div>
  );
}
