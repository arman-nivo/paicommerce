"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Blocks,
  Building2,
  ChevronDown,
  ClipboardCheck,
  Code2,
  Crown,
  Gift,
  Globe,
  Handshake,
  HandCoins,
  History,
  LayoutGrid,
  Megaphone,
  Menu,
  MessageSquare,
  Newspaper,
  Palette,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  Users,
  Wallet,
  Webhook,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@pai/ui";
import { NAV, type NavGroup } from "@/lib/nav";
import { Logo } from "./logo";

const ICONS: Record<string, LucideIcon> = {
  Activity, BarChart3, BookOpen, Blocks, Building2, ClipboardCheck, Code2, Crown, Gift, Globe, Handshake, HandCoins, History,
  LayoutGrid, Megaphone, MessageSquare, Newspaper, Palette, RotateCcw, ShieldCheck, Sparkles, Store, Truck, Users, Wallet, Webhook,
};

export function SiteHeader({ signupHref, loginHref }: { signupHref: string; loginHref: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(null);
    setMobile(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobile]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setMobile(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const enter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(label);
  };
  const leave = () => {
    closeTimer.current = setTimeout(() => setOpen(null), 120);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled || open ? "border-b border-slate-200/80 bg-white/85 shadow-[0_1px_0_rgba(0,0,0,0.02)] backdrop-blur-xl" : "border-b border-transparent bg-white/0",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-brand-500" aria-label="PaiCommerce home">
          <Logo />
        </Link>

        <nav className="ml-6 hidden items-center gap-0.5 lg:flex" aria-label="Main">
          {NAV.map((g) =>
            g.href ? (
              <Link
                key={g.label}
                href={g.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-[0.92rem] font-medium text-slate-600 transition hover:bg-slate-100/80 hover:text-slate-900",
                  pathname.startsWith(g.href) && "text-slate-900",
                )}
              >
                {g.label}
              </Link>
            ) : (
              <div key={g.label} className="relative" onMouseEnter={() => enter(g.label)} onMouseLeave={leave}>
                <button
                  type="button"
                  aria-expanded={open === g.label}
                  aria-haspopup="true"
                  onClick={() => setOpen(open === g.label ? null : g.label)}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-3 py-2 text-[0.92rem] font-medium text-slate-600 transition hover:bg-slate-100/80 hover:text-slate-900",
                    open === g.label && "bg-slate-100/80 text-slate-900",
                  )}
                >
                  {g.label}
                  <ChevronDown className={cn("size-3.5 transition-transform", open === g.label && "rotate-180")} />
                </button>
                {open === g.label && <MegaPanel group={g} />}
              </div>
            ),
          )}
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <Link href="/docs" className="rounded-lg px-3 py-2 text-[0.92rem] font-medium text-slate-600 hover:text-slate-900">
            Docs
          </Link>
          <a href={loginHref} className="rounded-lg px-3 py-2 text-[0.92rem] font-medium text-slate-600 hover:text-slate-900">
            Log in
          </a>
          <a
            href={signupHref}
            className="group inline-flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Start free trial
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        <button
          type="button"
          className="ml-auto inline-flex size-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden"
          onClick={() => setMobile(true)}
          aria-label="Open menu"
          aria-expanded={mobile}
        >
          <Menu className="size-5" />
        </button>
      </div>

      {mobile && <MobileMenu onClose={() => setMobile(false)} signupHref={signupHref} loginHref={loginHref} />}
    </header>
  );
}

function MegaPanel({ group }: { group: NavGroup }) {
  const cols = group.columns ?? [];
  const wide = cols.length > 1;
  return (
    <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
      <div
        className={cn(
          "animate-slide-up overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-12px_rgba(15,23,42,0.25)]",
          wide ? "w-[680px]" : "w-[340px]",
        )}
      >
        <div className={cn("grid gap-2 p-3", wide && "grid-cols-2")}>
          {cols.map((c) => (
            <div key={c.title}>
              <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{c.title}</p>
              <ul>
                {c.links.map((l) => {
                  const Icon = l.icon ? ICONS[l.icon] : null;
                  return (
                    <li key={l.href + l.label}>
                      <Link href={l.href} className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50">
                        {Icon ? (
                          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-brand-600/10 transition group-hover:bg-brand-600 group-hover:text-white">
                            <Icon className="size-4" />
                          </span>
                        ) : (
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-300 group-hover:bg-brand-500" />
                        )}
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-slate-900">{l.label}</span>
                          {l.description && <span className="block text-xs text-slate-500">{l.description}</span>}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        {group.label === "Themes" && (
          <Link href="/themes" className="flex items-center justify-between border-t border-slate-100 bg-gradient-to-r from-brand-50 to-violet-50 px-6 py-3 text-sm font-medium text-brand-700 hover:text-brand-800">
            13 themes for 17 business categories — try any demo store live
            <ArrowRight className="size-4" />
          </Link>
        )}
        {group.label === "Developers" && (
          <Link href="/docs/themes/cli" className="flex items-center gap-3 border-t border-slate-100 bg-slate-950 px-6 py-3 font-mono text-xs text-slate-300 hover:text-white">
            <span className="text-emerald-400">$</span> pnpm theme:new my-theme
            <ArrowRight className="ml-auto size-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

function MobileMenu({ onClose, signupHref, loginHref }: { onClose: () => void; signupHref: string; loginHref: string }) {
  const [section, setSection] = useState<string | null>(null);
  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl animate-slide-up">
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
          <Logo />
          <button type="button" onClick={onClose} className="inline-flex size-10 items-center justify-center rounded-xl hover:bg-slate-100" aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Mobile">
          {NAV.map((g) =>
            g.href ? (
              <Link key={g.label} href={g.href} className="block rounded-xl px-3 py-3 text-base font-semibold text-slate-900 hover:bg-slate-50">
                {g.label}
              </Link>
            ) : (
              <div key={g.label}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-base font-semibold text-slate-900 hover:bg-slate-50"
                  onClick={() => setSection(section === g.label ? null : g.label)}
                  aria-expanded={section === g.label}
                >
                  {g.label}
                  <ChevronDown className={cn("size-4 text-slate-400 transition-transform", section === g.label && "rotate-180")} />
                </button>
                {section === g.label && (
                  <div className="mb-2 ml-3 border-l border-slate-100 pl-3">
                    {g.columns?.flatMap((c) => c.links).map((l) => (
                      <Link key={l.href + l.label} href={l.href} className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ),
          )}
          <Link href="/docs" className="block rounded-xl px-3 py-3 text-base font-semibold text-slate-900 hover:bg-slate-50">
            Docs
          </Link>
        </nav>
        <div className="grid gap-2 border-t border-slate-100 p-4">
          <a href={signupHref} className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 text-sm font-semibold text-white">
            Start free trial
          </a>
          <a href={loginHref} className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-900">
            Log in
          </a>
        </div>
      </div>
    </div>
  );
}
