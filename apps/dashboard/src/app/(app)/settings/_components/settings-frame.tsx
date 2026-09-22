"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@pai/ui";
import { ICONS } from "@/components/shell/icons";

export type SettingsNavLink = { href: string; label: string; icon: string };

/** Settings chrome: left sub-nav on desktop; on mobile only the content + a back link to /settings. */
export function SettingsFrame({ items, children }: { items: SettingsNavLink[]; children: React.ReactNode }) {
  const pathname = usePathname();
  const isIndex = pathname === "/settings";
  if (isIndex) return <>{children}</>;
  return (
    <div className="lg:grid lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-8">
      <aside className="hidden lg:block">
        <nav className="sticky top-20 space-y-0.5" aria-label="Settings">
          <Link href="/settings" className="mb-2 block px-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground">
            Settings
          </Link>
          {items.map((i) => {
            const Icon = ICONS[i.icon] ?? ICONS.settings!;
            const active = pathname === i.href || pathname.startsWith(i.href + "/");
            return (
              <Link
                key={i.href}
                href={i.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition",
                  active ? "bg-accent font-medium text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  i.href === "/settings/danger" && !active && "text-red-600/80 hover:text-red-600 dark:text-red-400/80",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{i.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0">
        <Link href="/settings" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground lg:hidden">
          <ArrowLeft className="size-4" /> Settings
        </Link>
        {children}
      </div>
    </div>
  );
}
