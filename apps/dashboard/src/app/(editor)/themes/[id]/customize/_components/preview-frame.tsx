"use client";
import * as React from "react";
import { MonitorX, RefreshCw } from "lucide-react";
import { Button, cn, Spinner } from "@pai/ui";
import type { Viewport } from "./types";

const WIDTHS: Record<Viewport, number | null> = { desktop: null, tablet: 768, mobile: 390 };
const UNREACHABLE_AFTER_MS = 15_000;

/**
 * The storefront preview iframe, constrained to the chosen device width (scaled down to fit when needed),
 * with a loading overlay and a friendly message when the storefront can't be reached.
 */
export function PreviewFrame({
  src,
  viewport,
  iframeRef,
  loaded,
  readyMsg,
  onLoaded,
  storefrontUrl,
  reloadKey,
  onReload,
}: {
  src: string;
  viewport: Viewport;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  /** The iframe fired `load` (also fires for browser error pages). */
  loaded: boolean;
  /** The preview posted a `ready` message (definitive). */
  readyMsg: boolean;
  onLoaded: () => void;
  storefrontUrl: string;
  reloadKey: number;
  onReload: () => void;
}) {
  const boxRef = React.useRef<HTMLDivElement>(null);
  const [box, setBox] = React.useState({ w: 0, h: 0 });
  const [probeFailed, setProbeFailed] = React.useState(false);
  const [timedOut, setTimedOut] = React.useState(false);

  React.useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => e && setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Probe the storefront so a down server shows a helpful message instead of a browser error page.
  React.useEffect(() => {
    let alive = true;
    setProbeFailed(false);
    fetch(storefrontUrl, { mode: "no-cors", cache: "no-store" }).catch(() => alive && setProbeFailed(true));
    return () => {
      alive = false;
    };
  }, [storefrontUrl, reloadKey]);

  React.useEffect(() => {
    setTimedOut(false);
    if (loaded || readyMsg) return;
    const t = setTimeout(() => setTimedOut(true), UNREACHABLE_AFTER_MS);
    return () => clearTimeout(t);
  }, [loaded, readyMsg, src, reloadKey]);

  const unreachable = !readyMsg && (probeFailed || (timedOut && !loaded));
  const loading = !readyMsg && !loaded && !unreachable;

  const device = WIDTHS[viewport];
  const pad = device ? 24 : 0;
  const scale = device && box.w ? Math.min(1, (box.w - pad * 2) / device) : 1;
  const frameW = device ?? box.w;
  const frameH = device ? (box.h - pad * 2) / scale : box.h;

  return (
    <div ref={boxRef} className={cn("relative h-full w-full overflow-hidden", device && "bg-[radial-gradient(circle_at_1px_1px,color-mix(in_srgb,var(--muted-fg)_18%,transparent)_1px,transparent_0)] bg-[length:18px_18px]")}>
      {box.w > 0 && (
        <div
          className={cn("absolute left-1/2 top-0 origin-top transition-[width] duration-300", device ? "mt-6" : "")}
          style={{ width: frameW, height: frameH, transform: `translateX(-50%) scale(${scale})` }}
        >
          <div
            className={cn(
              "relative h-full w-full overflow-hidden bg-white",
              device && "rounded-[28px] border-[10px] border-neutral-900 shadow-2xl ring-1 ring-black/10 dark:border-neutral-700",
              viewport === "tablet" && "rounded-[22px]",
            )}
          >
            {viewport === "mobile" && <div className="pointer-events-none absolute left-1/2 top-1.5 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-neutral-900" />}
            <iframe
              key={reloadKey}
              ref={iframeRef}
              src={src}
              title="Store preview"
              className="h-full w-full border-0 bg-white"
              onLoad={onLoaded}
              allow="clipboard-write"
            />
          </div>
        </div>
      )}
      {loading && (
        <div className="absolute inset-0 z-10 flex animate-fade-in flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-[1px]">
          <Spinner className="size-6 text-primary" />
          <p className="text-sm text-muted-foreground">Loading preview…</p>
        </div>
      )}
      {unreachable && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/90 p-6">
          <div className="max-w-sm text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <MonitorX className="size-6" />
            </div>
            <h3 className="text-sm font-semibold">Preview unavailable — is the storefront running?</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              We couldn&apos;t reach <span className="font-mono">{storefrontUrl}</span>. You can keep editing — your changes are still saved as a draft.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={onReload}>
              <RefreshCw /> Try again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
