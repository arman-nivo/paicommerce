"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import {
  Code2,
  CreditCard,
  Inbox,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Megaphone,
  Menu,
  Moon,
  Palette,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  Store,
  Sun,
  Users,
  X,
} from "lucide-react";
import { Avatar, cn, Dropdown, DropdownItem, DropdownLabel, Kbd } from "@pai/ui";
import { can, ROLE_LABEL } from "@/lib/roles";
import { NAV } from "./nav";
import { CommandPalette } from "./command-palette";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Store,
  Users,
  CreditCard,
  Layers,
  Palette,
  Code2,
  LifeBuoy,
  Megaphone,
  Inbox,
  ScrollText,
  Settings,
};

export type ShellUser = { name: string; email: string; role: string; avatarUrl: string | null };

export function Shell({ user, counts, logoutAction, children }: { user: ShellUser; counts: { tickets: number; review: number }; logoutAction: () => Promise<void>; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [dark, setDark] = React.useState(false);

  React.useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  React.useEffect(() => setMobileOpen(false), [pathname]);

  const toggleTheme = React.useCallback(() => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("pai-admin-theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  }, []);

  const items = NAV.map((g) => ({ ...g, items: g.items.filter((i) => can(user.role, i.cap)) })).filter((g) => g.items.length);

  // Global keyboard shortcuts: ⌘K palette, "g <key>" navigation, shift+D dark mode.
  React.useEffect(() => {
    let gPressed = 0;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      const t = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) || t.isContentEditable || e.metaKey || e.ctrlKey || e.altKey) return;
      if (gPressed && Date.now() - gPressed < 1200) {
        gPressed = 0;
        const hit = items.flatMap((g) => g.items).find((i) => i.shortcut === e.key);
        if (hit) {
          e.preventDefault();
          router.push(hit.href);
        }
        return;
      }
      if (e.key === "g") {
        gPressed = Date.now();
        return;
      }
      if (e.key === "D" && e.shiftKey) toggleTheme();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, toggleTheme, user.role]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));

  const sidebar = (
    <nav className="flex h-full flex-col" aria-label="Main">
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="size-4" />
        </div>
        <div className="leading-tight">
          <div className="font-display text-sm font-bold">PaiCommerce</div>
          <div className="text-[11px] text-muted-foreground">Platform admin</div>
        </div>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto px-3 py-4 scrollbar-thin">
        {items.map((g) => (
          <div key={g.group}>
            <div className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">{g.group}</div>
            <ul className="space-y-0.5">
              {g.items.map((i) => {
                const Icon = ICONS[i.icon] ?? LayoutDashboard;
                const count = i.badge ? counts[i.badge] : 0;
                const active = isActive(i.href);
                return (
                  <li key={i.href}>
                    <Link
                      href={i.href}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium transition",
                        active ? "bg-accent text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="flex-1 truncate">{i.label}</span>
                      {count > 0 && <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>{count}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border p-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Kbd>G</Kbd> then <Kbd>S</Kbd> to jump · <Kbd>⌘K</Kbd> search
        </span>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r border-border bg-sidebar lg:block">{sidebar}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 animate-fade-in border-r border-border bg-sidebar shadow-2xl">
            <button className="absolute right-2 top-3 rounded-md p-1.5 text-muted-foreground hover:bg-muted" onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <X className="size-4" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur lg:px-6">
          <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground shadow-xs transition hover:border-input"
          >
            <Search className="size-4" />
            <span className="flex-1 truncate text-left">Search stores, users, orders…</span>
            <Kbd>⌘K</Kbd>
          </button>
          <div className="ml-auto flex items-center gap-1">
            <button onClick={toggleTheme} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Toggle dark mode" title="Toggle dark mode (Shift+D)">
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <Dropdown
              trigger={
                <button className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-muted" aria-label="Account menu">
                  <Avatar name={user.name} src={user.avatarUrl} size={28} />
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block text-sm font-medium">{user.name}</span>
                    <span className="block text-[11px] text-muted-foreground">{ROLE_LABEL[user.role] ?? user.role}</span>
                  </span>
                </button>
              }
            >
              <DropdownLabel>{user.email}</DropdownLabel>
              <DropdownItem icon={dark ? <Sun /> : <Moon />} onClick={toggleTheme}>
                {dark ? "Light mode" : "Dark mode"}
              </DropdownItem>
              <DropdownItem icon={<LogOut />} danger onClick={() => React.startTransition(() => logoutAction())}>
                Sign out
              </DropdownItem>
            </Dropdown>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 lg:px-6">{children}</main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} nav={items.flatMap((g) => g.items)} onToggleTheme={toggleTheme} />
    </div>
  );
}
