"use client";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@pai/ui";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10">
        <TriangleAlert className="size-6" />
      </span>
      <h2 className="mt-4 text-lg font-semibold">Something went wrong</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">We couldn't load this page. Please try again — if it keeps happening, contact support{error.digest ? ` (ref ${error.digest})` : ""}.</p>
      <Button className="mt-5" onClick={reset}>
        <RotateCcw /> Try again
      </Button>
    </div>
  );
}
