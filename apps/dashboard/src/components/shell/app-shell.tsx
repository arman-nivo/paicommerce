"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { ChevronDown, ChevronsLeft, ChevronsRight, ExternalLink, LifeBuoy, Menu, Search, Settings, Sparkles, TriangleAlert, UserRoundCog } from "lucide-react";
import { cn, Kbd, Sheet } from "@pai/ui";
import { hasPermission } from "@pai/core";
import { NAV, type NavItem } from "@/lib/nav";
import type { NavCounts, Notification } from "@/lib/shell-data";
import { useStore } from "../store-context";
import { CommandPalette } from "./command-palette";
import { ICONS } from "./icons";
import { NotificationsMenu } from "./notifications";
import { StoreSwitcher, type SwitcherStore } from "./store-switcher";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { MobileTabBar } from "./mobile-tab-bar";

type Banner = { status: string; trialDaysLeft: number | null; planName: string; planCode: string };

export function AppShell({
  children,
  counts,
  notifications,
  stores,
  impersonating,
  banner,
}: {
  children: React.ReactNode;
  counts: NavCounts;
  notifications: Notification[];
  stores: SwitcherStore[];
  impersonating: boolean;
  banner: Banner;
}) {
  const { store, member } = useStore();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("pai-sidebar") === "collapsed");
    } catch {}
  }, []);
  React.useEffect(() => setMobileOpen(false), [pathname]);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem("pai-sidebar", c ? "open" : "collapsed");
      } catch {}
      return !c;
    });
  };

  // Global keyboard shortcuts: ⌘K palette, "g" then a key to jump.
  React.useEffect(() => {
    let gPressed = 0;
    const jumps: Record<string, string> = { h: "/", o: "/orders", p: "/products", c: "/customers", d: "/discounts", a: "/analytics", t: "/themes", s: "/settings" };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      const t = e.target as HTMLElement;
      if (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "/") {
        e.preventDefault();
        setPaletteOpen(true);
      } else if (e.key === "g") gPressed = Date.now();
      else if (Date.now() - gPressed < 800 && jumps[e.key]) {
        router.push(jumps[e.key]!);
        gPressed = 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  const nav = NAV.map((g) => ({ ...g, items: g.items.filter((i) => !i.permission || hasPermission(member, i.permission)) })).filter((g) => g.items.length);

  const sidebar = (mobile: boolean) => (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-14 shrink-0 items-center border-b border-border px-3", collapsed && !mobile ? "justify-center" : "justify-between")}>
        <StoreSwitcher stores={stores} collapsed={collapsed && !mobile} />
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-2.5 py-3 scrollbar-thin">
        {nav.map((g, gi) => (
          <div key={gi}>
            {g.label && !(collapsed && !mobile) && <div className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">{g.label}</div>}
            {g.label && collapsed && !mobile && <div className="mx-auto mb-2 h-px w-6 bg-border" />}
            <ul className="space-y-0.5">
              {g.items.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} counts={counts} collapsed={collapsed && !mobile} member={member} />
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="shrink-0 space-y-0.5 border-t border-border px-2.5 py-2.5">
        <SimpleLink href="/support" icon={<LifeBuoy />} label="Help & support" active={pathname.startsWith("/support")} collapsed={collapsed && !mobile} />
        <SimpleLink href="/settings" icon={<Settings />} label="Settings" active={pathname.startsWith("/settings")} collapsed={collapsed && !mobile} />
        {!mobile && (
          <button
            onClick={toggleCollapsed}
            className={cn("hidden w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground lg:flex", collapsed && "justify-center")}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
            {!collapsed && "Collapse"}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh">
      {impersonating && (
        <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-1.5 text-center text-xs font-semibold text-amber-950 no-print">
          <UserRoundCog className="size-4" /> You are impersonating this merchant. Actions are recorded in the audit log.
          <a href="/logout" className="underline underline-offset-2">End session</a>
        </div>
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden border-r border-border bg-sidebar transition-[width] duration-200 lg:block no-print",
          collapsed ? "w-[68px]" : "w-64",
          impersonating && "top-[30px]",
        )}
      >
        {sidebar(false)}
      </aside>
      <Sheet open={mobileOpen} onClose={() => setMobileOpen(false)} side="left" width={288} title={store.name}>
        <div className="-m-5 h-[calc(100dvh-57px)]">{sidebar(true)}</div>
      </Sheet>

      <div className={cn("flex min-h-dvh flex-col transition-[padding] duration-200", collapsed ? "lg:pl-[68px]" : "lg:pl-64")}>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-card/85 px-3 backdrop-blur-md sm:px-5 no-print">
          <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-input bg-muted/50 px-3 text-sm text-muted-foreground transition hover:bg-muted sm:max-w-md"
          >
            <Search className="size-4 shrink-0" />
            <span className="truncate">Search orders, products, customers…</span>
            <span className="ml-auto hidden sm:inline-flex">
              <Kbd>⌘K</Kbd>
            </span>
          </button>
          <div className="ml-auto flex items-center gap-1">
            <a
              href={store.url}
              target="_blank"
              rel="noreferrer"
              className="hidden h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground md:inline-flex"
            >
              <ExternalLink className="size-4" /> View store
            </a>
            <NotificationsMenu items={notifications} />
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        <PlanBanner banner={banner} />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-7">{children}</main>
      </div>
      <MobileTabBar counts={counts} onMore={() => setMobileOpen(true)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}

function PlanBanner({ banner }: { banner: Banner }) {
  const { member } = useStore();
  const [hidden, setHidden] = React.useState(false);
  if (hidden) return null;
  const canBill = hasPermission(member, "billing.manage");
  if (banner.status === "past_due" || banner.status === "suspended") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-red-200 bg-red-50 px-4 py-2 text-center text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 no-print">
        <TriangleAlert className="size-4" />
        {banner.status === "suspended" ? "Your store is suspended — customers can't place orders." : "Your last payment failed. Please update billing to avoid interruption."}
        {canBill && (
          <Link href="/settings/billing" className="font-semibold underline underline-offset-2">
            Resolve now
          </Link>
        )}
      </div>
    );
  }
  if (banner.trialDaysLeft != null) {
    const d = Math.max(0, banner.trialDaysLeft);
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-brand-200 bg-gradient-to-r from-brand-50 via-white to-brand-50 px-4 py-2 text-center text-sm text-brand-900 dark:border-brand-500/20 dark:from-brand-500/10 dark:via-transparent dark:to-brand-500/10 dark:text-brand-100 no-print">
        <Sparkles className="size-4 text-brand-600" />
        <span>
          {d > 0 ? (
            <>
              <b>{d} day{d === 1 ? "" : "s"}</b> left in your free trial of all {banner.planCode === "free" ? "Growth" : banner.planName} features.
            </>
          ) : (
            <>Your trial has ended — pick a plan to keep premium features.</>
          )}
        </span>
        {canBill && (
          <Link href="/settings/billing" className="font-semibold text-brand-700 underline underline-offset-2 dark:text-brand-300">
            Choose a plan
          </Link>
        )}
        <button onClick={() => setHidden(true)} className="text-xs text-brand-700/70 hover:underline dark:text-brand-300/70">
          Dismiss
        </button>
      </div>
    );
  }
  return null;
}

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

function CountPill({ n, active }: { n: number; active?: boolean }) {
  if (!n) return null;
  return (
    <span className={cn("ml-auto rounded-full px-1.5 py-px text-[11px] font-semibold tabular-nums", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
      {n > 999 ? "999+" : n}
    </span>
  );
}

function NavLink({ item, pathname, counts, collapsed, member }: { item: NavItem; pathname: string; counts: NavCounts; collapsed: boolean; member: { role: "owner" | "admin" | "staff"; permissions: string[] } }) {
  const Icon = ICONS[item.icon] ?? ICONS.home!;
  const active = isActive(pathname, item.href);
  const n = item.countKey ? counts[item.countKey] : 0;
  const children = item.children?.filter((c) => !c.permission || hasPermission(member, c.permission));
  const [open, setOpen] = React.useState(active);
  React.useEffect(() => {
    if (active) setOpen(true);
  }, [active]);
  return (
    <li>
      <div className="relative flex items-center">
        <Link
          href={item.href}
          title={collapsed ? item.label : undefined}
          className={cn(
            "group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition",
            active ? "bg-accent text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          <Icon className="size-[18px] shrink-0" />
          {!collapsed && <span className="truncate">{item.label}</span>}
          {!collapsed && !children?.length && <CountPill n={n} active={active} />}
          {collapsed && n > 0 && <span className="absolute right-2 top-1.5 size-2 rounded-full bg-primary" />}
        </Link>
        {!collapsed && !!children?.length && (
          <>
            {n > 0 && (
              <span className="pointer-events-none absolute right-8">
                <CountPill n={n} active={active} />
              </span>
            )}
            <button onClick={() => setOpen((o) => !o)} className="absolute right-1 rounded p-1 text-muted-foreground hover:bg-muted" aria-label={`Toggle ${item.label}`}>
              <ChevronDown className={cn("size-3.5 transition", open && "rotate-180")} />
            </button>
          </>
        )}
      </div>
      {!collapsed && open && !!children?.length && (
        <ul className="ml-[22px] mt-0.5 space-y-0.5 border-l border-border pl-2.5">
          {children.map((c) => {
            const a = c.href === item.href ? pathname === c.href || (pathname.startsWith(c.href + "/") && !children.some((o) => o.href !== c.href && isActive(pathname, o.href))) : isActive(pathname, c.href);
            const cn_ = c.countKey ? counts[c.countKey] : 0;
            return (
              <li key={c.href}>
                <Link href={c.href} className={cn("flex items-center rounded-md px-2 py-1.5 text-[13px] transition", a ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground")}>
                  {c.label}
                  <CountPill n={cn_} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

function SimpleLink({ href, icon, label, active, collapsed }: { href: string; icon: React.ReactNode; label: string; active: boolean; collapsed: boolean }) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition [&_svg]:size-[18px]",
        active ? "bg-accent text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
        collapsed && "justify-center px-0",
      )}
    >
      {icon}
      {!collapsed && label}
    </Link>
  );
}
