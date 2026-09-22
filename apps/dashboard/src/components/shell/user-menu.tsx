"use client";
import Link from "next/link";
import { CreditCard, ExternalLink, Keyboard, LifeBuoy, LogOut, Settings, Store } from "lucide-react";
import { Avatar, Dropdown, DropdownItem } from "@pai/ui";
import { useStore } from "../store-context";

export function UserMenu() {
  const { user, store, member } = useStore();
  return (
    <Dropdown
      className="w-60"
      trigger={
        <button className="ml-1 rounded-full ring-offset-2 ring-offset-card hover:ring-2 hover:ring-border" aria-label="Account menu">
          <Avatar name={user.name} src={user.avatarUrl} size={32} />
        </button>
      }
    >
      <div className="px-2.5 py-2">
        <div className="truncate text-sm font-semibold">{user.name}</div>
        <div className="truncate text-xs text-muted-foreground">{user.email}</div>
        <div className="mt-1 text-[11px] capitalize text-muted-foreground">{member.role} · {store.name}</div>
      </div>
      <div className="my-1 h-px bg-border" />
      <a href={store.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm hover:bg-muted md:hidden">
        <ExternalLink className="size-4" /> View store
      </a>
      <Link href="/settings/general" className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm hover:bg-muted">
        <Store className="size-4" /> Store settings
      </Link>
      <Link href="/settings/billing" className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm hover:bg-muted">
        <CreditCard className="size-4" /> Plan & billing
      </Link>
      <Link href="/settings" className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm hover:bg-muted">
        <Settings className="size-4" /> All settings
      </Link>
      <Link href="/support" className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm hover:bg-muted">
        <LifeBuoy className="size-4" /> Help & support
      </Link>
      <DropdownItem icon={<Keyboard />} onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}>
        Command palette <span className="ml-auto text-xs text-muted-foreground">⌘K</span>
      </DropdownItem>
      <div className="my-1 h-px bg-border" />
      <a href="/logout" className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-red-600 hover:bg-muted">
        <LogOut className="size-4" /> Log out
      </a>
    </Dropdown>
  );
}
