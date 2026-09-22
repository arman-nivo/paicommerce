"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, LayoutGrid, Package, ShoppingBag, Users } from "lucide-react";
import { cn } from "@pai/ui";
import type { NavCounts } from "@/lib/shell-data";

export function MobileTabBar({ counts, onMore }: { counts: NavCounts; onMore: () => void }) {
  const pathname = usePathname();
  const tabs = [
    { href: "/", label: "Home", icon: House },
    { href: "/orders", label: "Orders", icon: ShoppingBag, n: counts.unfulfilled },
    { href: "/products", label: "Products", icon: Package },
    { href: "/customers", label: "Customers", icon: Users },
  ];
  if (pathname.includes("/customize") || pathname.includes("/invoice")) return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden no-print">
      {tabs.map((t) => {
        const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={cn("relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium", active ? "text-primary" : "text-muted-foreground")}>
            <t.icon className="size-5" />
            {t.label}
            {!!t.n && <span className="absolute left-1/2 top-1 ml-2 rounded-full bg-red-500 px-1 text-[9px] font-bold leading-4 text-white">{t.n > 99 ? "99+" : t.n}</span>}
          </Link>
        );
      })}
      <button onClick={onMore} className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-muted-foreground">
        <LayoutGrid className="size-5" />
        More
      </button>
    </nav>
  );
}
