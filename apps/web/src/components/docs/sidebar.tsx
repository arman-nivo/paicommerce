"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookOpen, Code2, Palette, Rocket, Server, ChevronRight } from "lucide-react";
import type { DocsNavGroup } from "@/lib/docs";

const GROUP_ICONS: Record<string, typeof BookOpen> = {
  "Getting started": Rocket,
  "Theme development": Palette,
  APIs: Code2,
  Operations: Server,
};

export function hrefFor(slug: string) {
  return slug ? `/docs/${slug}` : "/docs";
}

export function useActiveSlug(): string {
  const pathname = usePathname() ?? "/docs";
  return pathname.replace(/^\/docs\/?/, "").replace(/\/$/, "");
}

export function DocsNavTree({ nav, onNavigate }: { nav: DocsNavGroup[]; onNavigate?: () => void }) {
  const active = useActiveSlug();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <nav aria-label="Documentation" className="space-y-6">
      {nav.map((group) => {
        const Icon = GROUP_ICONS[group.title] ?? BookOpen;
        const isOpen = !collapsed[group.title];
        const listId = `docs-nav-${group.title.toLowerCase().replace(/\W+/g, "-")}`;
        return (
          <div key={group.title}>
            <button
              type="button"
              onClick={() => setCollapsed((c) => ({ ...c, [group.title]: isOpen }))}
              aria-expanded={isOpen}
              aria-controls={listId}
              className="group flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[13px] font-semibold text-foreground transition hover:text-brand-700"
            >
              <span className="grid size-6 place-items-center rounded-md bg-brand-50 text-brand-600 ring-1 ring-brand-600/10">
                <Icon className="size-3.5" aria-hidden />
              </span>
              <span className="flex-1">{group.title}</span>
              <ChevronRight className={`size-3.5 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} aria-hidden />
            </button>
            {isOpen && (
              <ul id={listId} className="mt-2 ml-[19px] space-y-px border-l border-border">
                {group.items.map((item) => {
                  const isActive = item.slug === active;
                  return (
                    <li key={item.slug}>
                      <Link
                        href={hrefFor(item.slug)}
                        onClick={onNavigate}
                        aria-current={isActive ? "page" : undefined}
                        className={`-ml-px block border-l py-1.5 pl-4 pr-2 text-[13.5px] leading-snug transition ${
                          isActive
                            ? "border-brand-600 font-medium text-brand-700"
                            : "border-transparent text-muted-foreground hover:border-slate-300 hover:text-foreground"
                        }`}
                      >
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}
