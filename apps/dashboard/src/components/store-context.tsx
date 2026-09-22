"use client";
import * as React from "react";
import { formatMoney, hasPermission, type Permission } from "@pai/core";

export type StoreCtx = {
  store: { id: string; name: string; slug: string; currency: string; url: string; logoUrl: string | null; status: string };
  member: { role: "owner" | "admin" | "staff"; permissions: string[] };
  user: { id: string; name: string; email: string; avatarUrl: string | null };
  storefrontUrl: string;
};

const Ctx = React.createContext<StoreCtx | null>(null);

export function StoreProvider({ value, children }: { value: StoreCtx; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreCtx {
  const v = React.useContext(Ctx);
  if (!v) throw new Error("useStore must be used inside <StoreProvider>");
  return v;
}

/** Money formatter bound to the store currency: money(125000) → "৳1,250". */
export function useMoney() {
  const { store } = useStore();
  return React.useCallback((minor: number | null | undefined) => formatMoney(minor ?? 0, store.currency), [store.currency]);
}

export function useCan() {
  const { member } = useStore();
  return React.useCallback((p: Permission) => hasPermission(member, p), [member]);
}
