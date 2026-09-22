"use client";
import Link from "next/link";
import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Avatar, cn, Dropdown, DropdownItem, DropdownLabel } from "@pai/ui";
import { switchStore } from "@/lib/shell-actions";
import { useStore } from "../store-context";

export type SwitcherStore = { id: string; name: string; slug: string; logoUrl: string | null; role: string };

export function StoreSwitcher({ stores, collapsed }: { stores: SwitcherStore[]; collapsed: boolean }) {
  const { store } = useStore();
  const [pending, start] = React.useTransition();
  const logo = (s: { name: string; logoUrl: string | null }, size = 30) =>
    s.logoUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={s.logoUrl} alt="" className="shrink-0 rounded-lg border border-border object-contain" style={{ width: size, height: size }} />
    ) : (
      <Avatar name={s.name} size={size} className="rounded-lg" />
    );
  return (
    <Dropdown
      align="start"
      className="w-64"
      trigger={
        <button className={cn("flex w-full min-w-0 items-center gap-2.5 rounded-lg p-1 text-left hover:bg-muted", pending && "opacity-60")} aria-label="Switch store">
          {logo(store)}
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{store.name}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{store.slug}.paicommerce.com</span>
              </span>
              <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
            </>
          )}
        </button>
      }
    >
      <DropdownLabel>Your stores</DropdownLabel>
      {stores.map((s) => (
        <DropdownItem key={s.id} onClick={() => s.id !== store.id && start(() => switchStore(s.id).then(() => undefined))}>
          {logo(s, 22)}
          <span className="min-w-0 flex-1 truncate">{s.name}</span>
          {s.id === store.id && <Check className="text-primary" />}
        </DropdownItem>
      ))}
      <div className="my-1 h-px bg-border" />
      <Link href="/onboarding?new=1" className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm hover:bg-muted">
        <Plus className="size-4" /> Create another store
      </Link>
    </Dropdown>
  );
}
