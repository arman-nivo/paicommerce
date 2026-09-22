"use client";
import * as React from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@pai/ui";

export function PrintToolbar({ title, backHref, autoprint }: { title: string; backHref: string; autoprint?: boolean }) {
  React.useEffect(() => {
    // Documents always print light.
    document.documentElement.classList.remove("dark");
    if (autoprint) {
      const t = setTimeout(() => window.print(), 600);
      return () => clearTimeout(t);
    }
  }, [autoprint]);
  return (
    <div className="no-print sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-[210mm] items-center gap-3 px-4 py-3">
        <a href={backHref} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back
        </a>
        <span className="flex-1 truncate text-sm font-semibold">{title}</span>
        <Button size="sm" onClick={() => window.print()}>
          <Printer /> Print
        </Button>
      </div>
    </div>
  );
}
