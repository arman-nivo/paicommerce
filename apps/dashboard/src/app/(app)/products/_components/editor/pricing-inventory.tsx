"use client";
import { Tag } from "lucide-react";
import { Card, CardBody, CardHeader, Field, Input, Switch } from "@pai/ui";
import { MoneyInput } from "@/components/money-input";
import { useMoney } from "@/components/store-context";
import type { FieldErrors, ProductFormValue } from "./types";

type Props = { value: ProductFormValue; set: <K extends keyof ProductFormValue>(k: K, v: ProductFormValue[K]) => void; errors: FieldErrors; hasVariants: boolean };

export function PricingCard({ value, set, errors, hasVariants }: Props) {
  const money = useMoney();
  const price = value.price;
  const cost = value.costPrice;
  const profit = cost != null && price > 0 ? price - cost : null;
  const margin = profit != null && price > 0 ? (profit / price) * 100 : null;
  const salePct = value.compareAtPrice && value.compareAtPrice > price && price > 0 ? Math.round(((value.compareAtPrice - price) / value.compareAtPrice) * 100) : null;
  return (
    <Card>
      <CardHeader title="Pricing" description={hasVariants ? "Used as the default for new variants. Each variant has its own price below." : undefined} />
      <CardBody className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price" error={errors.price} htmlFor="p-price">
            <MoneyInput id="p-price" value={price} onChange={(v) => set("price", v ?? 0)} />
          </Field>
          <Field label="Compare-at price" hint="The original price, shown crossed out." error={errors.compareAtPrice} htmlFor="p-compare">
            <MoneyInput id="p-compare" value={value.compareAtPrice} onChange={(v) => set("compareAtPrice", v || null)} allowEmpty placeholder="—" />
          </Field>
        </div>
        {salePct != null && (
          <p className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
            <Tag className="size-4" /> On sale — customers see <strong>{salePct}% off</strong> ({money(value.compareAtPrice)} → {money(price)})
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Cost per item" hint="Customers won't see this." error={errors.costPrice} htmlFor="p-cost">
            <MoneyInput id="p-cost" value={cost} onChange={(v) => set("costPrice", v)} allowEmpty placeholder="—" />
          </Field>
          <Field label="Profit">
            <div className="flex h-9 items-center rounded-lg bg-muted/60 px-3 text-sm tabular-nums">{profit != null ? <span className={profit < 0 ? "text-red-600" : ""}>{money(profit)}</span> : <span className="text-muted-foreground">—</span>}</div>
          </Field>
          <Field label="Margin">
            <div className="flex h-9 items-center rounded-lg bg-muted/60 px-3 text-sm tabular-nums">
              {margin != null ? <span className={margin < 0 ? "text-red-600" : margin >= 30 ? "text-emerald-600" : ""}>{margin.toFixed(1)}%</span> : <span className="text-muted-foreground">—</span>}
            </div>
          </Field>
        </div>
      </CardBody>
    </Card>
  );
}

export function InventoryCard({ value, set, errors, hasVariants }: Props) {
  const total = value.variants.reduce((s, v) => s + v.inventory, 0);
  return (
    <Card>
      <CardHeader title="Inventory & shipping" />
      <CardBody className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SKU (stock keeping unit)" error={errors.sku} htmlFor="p-sku">
            <Input id="p-sku" value={value.sku} onChange={(e) => set("sku", e.target.value)} placeholder="e.g. TSHIRT-BLK" maxLength={100} />
          </Field>
          <Field label="Barcode (ISBN, UPC, GTIN…)" error={errors.barcode} htmlFor="p-barcode">
            <Input id="p-barcode" value={value.barcode} onChange={(e) => set("barcode", e.target.value)} maxLength={100} />
          </Field>
        </div>
        <label className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
          <span>
            <span className="block text-sm font-medium">Track quantity</span>
            <span className="block text-xs text-muted-foreground">We&apos;ll reduce stock with every order and warn you when it runs low.</span>
          </span>
          <Switch checked={value.trackInventory} onChange={(e) => set("trackInventory", e.target.checked)} aria-label="Track quantity" />
        </label>
        {value.trackInventory && (
          <>
            {hasVariants ? (
              <p className="rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
                Stock is managed per variant below — <span className="font-medium text-foreground">{total.toLocaleString()} in total</span>.
              </p>
            ) : (
              <Field label="Quantity available" error={errors.inventory} htmlFor="p-qty" className="max-w-48">
                <Input id="p-qty" type="number" inputMode="numeric" value={Number.isFinite(value.inventory) ? value.inventory : ""} onChange={(e) => set("inventory", e.target.value === "" ? 0 : Math.trunc(Number(e.target.value)))} />
              </Field>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-[var(--primary)]" checked={value.allowBackorder} onChange={(e) => set("allowBackorder", e.target.checked)} />
              Continue selling when out of stock (pre-orders / backorders)
            </label>
          </>
        )}
        <Field label="Weight" hint="Used by couriers to calculate delivery charges." error={errors.weightGrams} htmlFor="p-weight" className="max-w-48">
          <div className="relative">
            <Input
              id="p-weight"
              type="number"
              inputMode="numeric"
              min={0}
              value={value.weightGrams ?? ""}
              onChange={(e) => set("weightGrams", e.target.value === "" ? null : Math.max(0, Math.trunc(Number(e.target.value))))}
              className="pr-8"
              placeholder="0"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">g</span>
          </div>
        </Field>
      </CardBody>
    </Card>
  );
}
