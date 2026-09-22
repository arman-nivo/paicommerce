"use client";

/**
 * Customizer ↔ preview bridge (only mounted in preview mode, inside the dashboard iframe).
 * Implements @pai/theme-sdk/preview-protocol:
 *  - posts `ready` / `navigated` { path, template } to the parent
 *  - `refresh` → router.refresh() (re-renders with the latest draftConfig)
 *  - `select-section` / `hover-section` → outline + scroll to [data-pai-section=id]
 *  - `navigate` { path } → client navigation inside the preview base
 *  - clicking a section posts `section-click` { sectionId, group }
 */
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { isEditorMessage, type PreviewToEditor } from "@pai/theme-sdk/preview-protocol";

let readySent = false;

function post(msg: PreviewToEditor) {
  if (typeof window === "undefined" || window.parent === window) return;
  window.parent.postMessage(msg, "*");
}

export function PreviewBridge({ base, allowedOrigins }: { base: string; allowedOrigins: string[] }) {
  const router = useRouter();
  const selected = useRef<string | null>(null);
  const hovered = useRef<string | null>(null);

  useEffect(() => {
    const apply = () => {
      document.querySelectorAll(".pai-preview-selected, .pai-preview-hover").forEach((el) => el.classList.remove("pai-preview-selected", "pai-preview-hover"));
      if (selected.current) document.querySelector(`[data-pai-section="${CSS.escape(selected.current)}"]`)?.classList.add("pai-preview-selected");
      if (hovered.current && hovered.current !== selected.current) document.querySelector(`[data-pai-section="${CSS.escape(hovered.current)}"]`)?.classList.add("pai-preview-hover");
    };
    const scrollTo = (id: string) => {
      const wrap = document.querySelector(`[data-pai-section="${CSS.escape(id)}"]`);
      const target = (wrap?.firstElementChild as HTMLElement | null) ?? null;
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const onMessage = (e: MessageEvent) => {
      if (allowedOrigins.length && e.origin !== window.location.origin && !allowedOrigins.includes(e.origin)) return;
      const d = e.data;
      if (!isEditorMessage(d)) return;
      if (d.type === "refresh") router.refresh();
      else if (d.type === "select-section") {
        selected.current = d.sectionId;
        apply();
        if (d.sectionId) scrollTo(d.sectionId);
      } else if (d.type === "hover-section") {
        hovered.current = d.sectionId;
        apply();
      } else if (d.type === "navigate") {
        const p = d.path.startsWith("/") ? d.path : `/${d.path}`;
        router.push(p === "/" ? base || "/" : `${base}${p}`);
      }
    };
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-pai-section]");
      if (!el) return;
      const id = el.getAttribute("data-pai-section");
      if (!id) return;
      selected.current = id;
      apply();
      post({ source: "pai-preview", type: "section-click", sectionId: id, group: el.getAttribute("data-pai-group") ?? undefined });
    };
    let raf = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("message", onMessage);
    document.addEventListener("click", onClick, true);
    return () => {
      mo.disconnect();
      window.removeEventListener("message", onMessage);
      document.removeEventListener("click", onClick, true);
    };
  }, [router, base, allowedOrigins]);

  return (
    <div className="pointer-events-none fixed bottom-3 left-3 z-[95] rounded-full bg-neutral-900/85 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg">
      Preview · changes are not live yet
    </div>
  );
}

/** Rendered by every themed page in preview mode: tells the editor which template/path is showing. */
export function PreviewPing({ template, path }: { template: string; path: string }) {
  useEffect(() => {
    if (!readySent) {
      readySent = true;
      post({ source: "pai-preview", type: "ready", path, template });
    }
    post({ source: "pai-preview", type: "navigated", path, template });
  }, [template, path]);
  return <span hidden data-pai-template={template} data-pai-path={path} />;
}
