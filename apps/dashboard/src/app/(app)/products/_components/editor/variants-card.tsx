"use client";
import * as React from "react";
import { ImageOff, ImagePlus, Plus, Trash2 } from "lucide-react";
import { Button, Card, CardBody, CardHeader, cn, Dialog, Field, Input, Table, TBody, TD, TH, THead, TR } from "@pai/ui";
import { MoneyInput } from "@/components/money-input";
import { TagInput } from "@/components/tag-input";
import { MAX_OPTIONS, MAX_VARIANTS } from "../../_lib/shared";
import { regenerateVariants, type FieldErrors, type OptionRow, type ProductFormValue, type VariantRow } from "./types";

const OPTION_SUGGESTIONS = ["Size", "Color", "Material", "Style", "Weight"];
const VALUE_SUGGESTIONS: Record<string, string[]> = {
  size: ["XS", "S", "M", "L", "XL", "XXL", "Free size"],
  color: ["Black", "White", "Red", "Blue", "Green", "Navy", "Maroon", "Pink"],
  material: ["Cotton", "Silk", "Linen", "Leather", "Jute"],
  weight: ["250g", "500g", "1kg", "2kg"],
};

type Props = {
  value: ProductFormValue;
  setValue: React.Dispatch<React.SetStateAction<ProductFormValue>>;
  errors: FieldErrors;
};

export function VariantsCard({ value, setValue, errors }: Props) {
  const [bulkPrice, setBulkPrice] = React.useState<number | null>(null);
  const [imgFor, setImgFor] = React.useState<number | null>(null);
  const options = value.options;
  const usable = options.filter((o) => o.name.trim() && o.values.length);

  const updateOptions = (next: OptionRow[]) =>
    setValue((s) => {
      const usableNext = next.filter((o) => o.name.trim() && o.values.length);
      return { ...s, options: next, variants: regenerateVariants(usableNext, s.variants, { price: s.price, compareAtPrice: s.compareAtPrice, sku: s.sku }) };
    });

  const updateVariant = (i: number, patch: Partial<VariantRow>) => setValue((s) => ({ ...s, variants: s.variants.map((v, j) => (j === i ? { ...v, ...patch } : v)) }));

  const addOption = () => {
    const name = OPTION_SUGGESTIONS.find((n) => !options.some((o) => o.name.toLowerCase() === n.toLowerCase())) ?? "";
    updateOptions([...options, { name, values: [] }]);
  };

  const total = value.variants.reduce((s, v) => s + v.inventory, 0);
  const tooMany = value.variants.length > MAX_VARIANTS;

  return (
    <Card>
      <CardHeader
        title="Options & variants"
        description={options.length ? "Each combination of option values becomes a variant with its own price and stock." : "Does this product come in different sizes, colors or materials?"}
      />
      <CardBody className="space-y-4">
        {options.map((o, i) => (
          <div key={i} className="rounded-lg border border-border p-3">
            <div className="grid gap-3 sm:grid-cols-[180px_1fr_auto] sm:items-start">
              <Field label="Option name" error={errors[`options.${i}.name`]}>
                <Input
                  value={o.name}
                  list="pai-option-names"
                  maxLength={40}
                  onChange={(e) => updateOptions(options.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                  placeholder="e.g. Size"
                />
              </Field>
              <Field label="Values" hint="Type a value and press Enter or comma." error={errors[`options.${i}.values`]}>
                <TagInput
                  value={o.values}
                  onChange={(vals) => updateOptions(options.map((x, j) => (j === i ? { ...x, values: vals.slice(0, 50) } : x)))}
                  placeholder="e.g. S, M, L"
                  suggestions={(VALUE_SUGGESTIONS[o.name.trim().toLowerCase()] ?? []).filter((s) => !o.values.includes(s))}
                />
              </Field>
              <Button type="button" variant="ghost" size="icon-sm" className="sm:mt-6" onClick={() => updateOptions(options.filter((_, j) => j !== i))} aria-label={`Remove option ${o.name}`}>
                <Trash2 className="text-muted-foreground" />
              </Button>
            </div>
          </div>
        ))}
        <datalist id="pai-option-names">
          {OPTION_SUGGESTIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        {errors.options && <p className="text-xs text-red-600">{errors.options}</p>}
        {options.length < MAX_OPTIONS && (
          <Button type="button" variant="outline" size="sm" onClick={addOption}>
            <Plus /> {options.length ? "Add another option" : "Add options like size or color"}
          </Button>
        )}

        {value.variants.length > 0 && (
          <div className="space-y-3 pt-1">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <p className="text-sm">
                <span className="font-medium">{value.variants.length} variants</span>
                <span className="text-muted-foreground"> · {total.toLocaleString()} total in stock</span>
              </p>
              <div className="flex items-center gap-2">
                <MoneyInput value={bulkPrice} onChange={setBulkPrice} allowEmpty placeholder="Price" className="w-32" aria-label="Price for all variants" />
                <Button type="button" size="sm" variant="secondary" disabled={bulkPrice == null} onClick={() => bulkPrice != null && setValue((s) => ({ ...s, variants: s.variants.map((v) => ({ ...v, price: bulkPrice })) }))}>
                  Apply price to all
                </Button>
              </div>
            </div>
            {tooMany && <p className="text-sm text-red-600">That&apos;s {value.variants.length} variants — the maximum is {MAX_VARIANTS}. Remove some option values.</p>}
            {errors.variants && <p className="text-xs text-red-600">{errors.variants}</p>}
            <div className="overflow-hidden rounded-lg border border-border">
              <Table>
                <THead>
                  <TR className="hover:bg-transparent">
                    <TH className="w-14 px-3">Image</TH>
                    <TH className="px-3">Variant</TH>
                    <TH className="min-w-32 px-3">Price</TH>
                    <TH className="min-w-32 px-3">Compare-at</TH>
                    <TH className="min-w-32 px-3">SKU</TH>
                    <TH className="w-28 px-3">Stock</TH>
                  </TR>
                </THead>
                <TBody>
                  {value.variants.map((v, i) => (
                    <TR key={v.values.join("\u0000")}>
                      <TD className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => setImgFor(i)}
                          className="flex size-10 items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted text-muted-foreground hover:border-primary"
                          aria-label="Choose variant image"
                        >
                          {v.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={v.imageUrl} alt="" className="size-full object-cover" />
                          ) : (
                            <ImagePlus className="size-4" />
                          )}
                        </button>
                      </TD>
                      <TD className="whitespace-nowrap px-3 py-2 font-medium">{v.values.join(" / ")}</TD>
                      <TD className="px-3 py-2">
                        <MoneyInput value={v.price} onChange={(p) => updateVariant(i, { price: p ?? 0 })} aria-label={`Price for ${v.values.join(" / ")}`} />
                        {errors[`variants.${i}.price`] && <p className="mt-1 text-xs text-red-600">{errors[`variants.${i}.price`]}</p>}
                      </TD>
                      <TD className="px-3 py-2">
                        <MoneyInput value={v.compareAtPrice} onChange={(p) => updateVariant(i, { compareAtPrice: p || null })} allowEmpty placeholder="—" aria-label="Compare-at price" />
                      </TD>
                      <TD className="px-3 py-2">
                        <Input value={v.sku} maxLength={100} onChange={(e) => updateVariant(i, { sku: e.target.value })} aria-label="SKU" />
                      </TD>
                      <TD className="px-3 py-2">
                        <Input
                          type="number"
                          inputMode="numeric"
                          value={v.inventory}
                          onChange={(e) => updateVariant(i, { inventory: e.target.value === "" ? 0 : Math.trunc(Number(e.target.value)) })}
                          className={cn(value.trackInventory && v.inventory <= 0 && "border-red-300 text-red-600")}
                          aria-label="Stock"
                        />
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
            {!usable.length && <p className="text-xs text-muted-foreground">Add values to your options to create variants.</p>}
          </div>
        )}
      </CardBody>

      <Dialog open={imgFor !== null} onClose={() => setImgFor(null)} size="md" title="Variant image" description={value.images.length ? "Choose one of this product's photos." : "Add photos in the Media section first."}>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          <button
            type="button"
            onClick={() => {
              if (imgFor !== null) updateVariant(imgFor, { imageUrl: null });
              setImgFor(null);
            }}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-primary"
          >
            <ImageOff className="size-4" /> None
          </button>
          {value.images.map((im) => (
            <button
              type="button"
              key={im.url}
              onClick={() => {
                if (imgFor !== null) updateVariant(imgFor, { imageUrl: im.url });
                setImgFor(null);
              }}
              className={cn("aspect-square overflow-hidden rounded-lg border-2", imgFor !== null && value.variants[imgFor]?.imageUrl === im.url ? "border-primary" : "border-transparent hover:border-border")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.url} alt={im.alt ?? ""} className="size-full object-cover" />
            </button>
          ))}
        </div>
      </Dialog>
    </Card>
  );
}
