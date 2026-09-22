"use client";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Copy, ExternalLink, MoreHorizontal, Trash2 } from "lucide-react";
import { slugify } from "@pai/core";
import { Button, Card, CardBody, Dropdown, DropdownItem, Field, Input, toast, useConfirm } from "@pai/ui";
import { EditLayout, Header } from "@/components/page";
import { RichTextEditor } from "@/components/rich-text-editor";
import { SaveBar, useDirtyState } from "@/components/save-bar";
import { ProductStatusBadge } from "@/components/status";
import { useCan } from "@/components/store-context";
import { run } from "@/lib/client";
import { deleteProducts, duplicateProduct, saveProduct } from "../../actions";
import { productInputSchema, type ProductInput } from "../../_lib/shared";
import { AiDescriptionButton } from "./ai-description";
import { MediaCard } from "./media-card";
import { OrganizationCard, StatusCard } from "./organization-card";
import { InventoryCard, PricingCard } from "./pricing-inventory";
import { SeoCard } from "./seo-card";
import { toOptionsRecord, variantTitle, type EditorMeta, type FieldErrors, type ProductFormValue } from "./types";
import { VariantsCard } from "./variants-card";

function toInput(v: ProductFormValue, id: string | null): ProductInput {
  const options = v.options.filter((o) => o.name.trim() && o.values.length).map((o) => ({ name: o.name.trim(), values: o.values }));
  return {
    id,
    title: v.title,
    description: v.description,
    status: v.status,
    vendor: v.vendor,
    productType: v.productType,
    tags: v.tags,
    images: v.images,
    price: v.price,
    compareAtPrice: v.compareAtPrice,
    costPrice: v.costPrice,
    sku: v.sku,
    barcode: v.barcode,
    trackInventory: v.trackInventory,
    inventory: v.inventory,
    allowBackorder: v.allowBackorder,
    weightGrams: v.weightGrams,
    options,
    variants: options.length
      ? v.variants.map((r) => ({
          id: r.id,
          title: variantTitle(r.values),
          options: toOptionsRecord(options, r.values),
          price: r.price,
          compareAtPrice: r.compareAtPrice,
          sku: r.sku,
          inventory: r.inventory,
          imageUrl: r.imageUrl,
        }))
      : [],
    seoTitle: v.seoTitle,
    seoDescription: v.seoDescription,
    slug: v.slug,
    featured: v.featured,
    collectionIds: v.collectionIds,
  };
}

export function ProductForm({
  productId,
  initial,
  meta,
  asideExtra,
  canCreateMore = true,
}: {
  productId: string | null;
  initial: ProductFormValue;
  meta: EditorMeta;
  asideExtra?: React.ReactNode;
  canCreateMore?: boolean;
}) {
  const router = useRouter();
  const can = useCan();
  const canManage = can("products.manage");
  const { value, setValue, set, dirty, reset, commit } = useDirtyState<ProductFormValue>(initial);
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [slugTouched, setSlugTouched] = React.useState(!!productId);
  const { confirm, dialog } = useConfirm();
  const isNew = !productId;
  const hasVariants = value.variants.length > 0;
  const storefront = `${meta.storeUrl}/products/${initial.slug}`;

  const setTitle = (t: string) => {
    setValue((s) => ({ ...s, title: t, ...(slugTouched ? {} : { slug: t.trim() ? slugify(t) : "" }) }));
  };

  const save = async () => {
    if (!canManage) return toast.error("You don't have permission to edit products.");
    const unnamed = value.options.findIndex((o) => !o.name.trim() && o.values.length);
    if (unnamed >= 0) {
      setErrors({ [`options.${unnamed}.name`]: "Name this option" });
      return toast.error("Give every option a name, e.g. Size.");
    }
    const input = toInput(value, productId);
    const parsed = productInputSchema.safeParse(input);
    if (!parsed.success) {
      const fe: FieldErrors = {};
      for (const i of parsed.error.issues) {
        const k = i.path.join(".") || "_";
        if (!fe[k]) fe[k] = i.message;
      }
      setErrors(fe);
      const first = parsed.error.issues[0];
      toast.error(first ? `${first.message}` : "Please fix the highlighted fields.");
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const res = await saveProduct(input);
      if (!res.ok) {
        if (res.fieldErrors) setErrors(res.fieldErrors);
        toast.error(res.error);
        return;
      }
      const { id, slug, variants } = res.data;
      const next: ProductFormValue = {
        ...value,
        slug,
        variants: value.variants.map((v) => ({ ...v, id: variants.find((s) => s.title === variantTitle(v.values))?.id ?? v.id })),
      };
      commit(next);
      setValue(next);
      toast.success(isNew ? "Product created" : "Product saved");
      if (isNew) router.replace(`/products/${id}`);
      else router.refresh();
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  };

  const onDuplicate = async () => {
    if (dirty && !(await confirm({ title: "Discard unsaved changes?", description: "The copy is made from the last saved version.", confirmLabel: "Duplicate anyway" }))) return;
    const r = await run(duplicateProduct({ id: productId! }), { success: "Duplicated as a draft", loading: "Duplicating…" });
    if (r) router.push(`/products/${r.id}`);
  };

  const onDelete = async () => {
    const ok = await confirm({
      title: `Delete “${initial.title}”?`,
      description: "This permanently removes the product, its variants and reviews. Past orders keep their line items.",
      confirmLabel: "Delete product",
      danger: true,
    });
    if (!ok) return;
    const r = await run(deleteProducts({ ids: [productId!] }), { success: "Product deleted" });
    if (r) {
      commit(value);
      router.push("/products");
      router.refresh();
    }
  };

  return (
    <>
      {dialog}
      <Header
        back={{ href: "/products", label: "Products" }}
        title={
          <span className="flex flex-wrap items-center gap-2">
            {isNew ? "Add product" : initial.title || "Untitled product"}
            {!isNew && <ProductStatusBadge status={initial.status} />}
          </span>
        }
        actions={
          !isNew ? (
            <>
              <a href={storefront} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm font-medium shadow-xs hover:bg-muted">
                <ExternalLink className="size-4" /> View on store
              </a>
              {canManage && (
                <Dropdown
                  trigger={
                    <Button variant="outline" size="icon" aria-label="More actions">
                      <MoreHorizontal />
                    </Button>
                  }
                >
                  <DropdownItem icon={<Copy />} onClick={onDuplicate} disabled={!canCreateMore} title={canCreateMore ? undefined : "Plan product limit reached"}>
                    Duplicate{!canCreateMore && " (limit reached)"}
                  </DropdownItem>
                  <DropdownItem icon={<Trash2 />} danger onClick={onDelete}>
                    Delete product
                  </DropdownItem>
                </Dropdown>
              )}
            </>
          ) : undefined
        }
      />
      <EditLayout
        main={
          <>
            <Card>
              <CardBody className="space-y-4">
                <Field label="Title" error={errors.title} htmlFor="p-title">
                  <Input id="p-title" value={value.title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Handloom Cotton Saree" maxLength={255} autoFocus={isNew} />
                </Field>
                <Field label="Description" error={errors.description}>
                  <RichTextEditor
                    value={value.description}
                    onChange={(html) => set("description", html)}
                    placeholder="Tell customers what makes this product special — material, size, how to use it…"
                    minHeight={200}
                    toolbarExtra={
                      canManage ? (
                        <AiDescriptionButton
                          title={value.title}
                          hasContent={!!value.description.replace(/<[^>]*>/g, "").trim()}
                          onApply={(html, mode) => set("description", mode === "replace" ? html : `${value.description}${html}`)}
                        />
                      ) : undefined
                    }
                  />
                </Field>
              </CardBody>
            </Card>
            <MediaCard images={value.images} onChange={(v) => set("images", v)} title={value.title} />
            <PricingCard value={value} set={set} errors={errors} hasVariants={hasVariants} />
            <InventoryCard value={value} set={set} errors={errors} hasVariants={hasVariants} />
            <VariantsCard value={value} setValue={setValue} errors={errors} />
            <SeoCard value={value} set={set} errors={errors} storeUrl={meta.storeUrl} onSlugTouched={() => setSlugTouched(true)} canAi={canManage} />
          </>
        }
        aside={
          <>
            <StatusCard value={value} set={set} errors={errors} meta={meta} />
            <OrganizationCard value={value} set={set} errors={errors} meta={meta} />
            {asideExtra}
          </>
        }
      />
      {isNew && (
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.push("/products")}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving} disabled={!canManage}>
            Save product
          </Button>
        </div>
      )}
      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={save}
        onDiscard={() => {
          reset();
          setErrors({});
        }}
        saveLabel={isNew ? "Save product" : "Save"}
      />
    </>
  );
}
