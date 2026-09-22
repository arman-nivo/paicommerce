"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Card, CardBody, CardHeader, CopyButton, Field, Input, Select, Textarea } from "@pai/ui";
import { EditLayout } from "@/components/page";
import { ImageField } from "@/components/media-picker";
import { SaveBar, useDirtyState } from "@/components/save-bar";
import { run } from "@/lib/client";
import { saveGeneral } from "../actions";
import { CURRENCIES, LOCALES, TIMEZONES } from "../options";

type Values = {
  name: string;
  logoUrl: string | null;
  description: string;
  email: string;
  phone: string;
  address: { line1: string; area: string; city: string; district: string; postalCode: string; country: string };
  currency: string;
  timezone: string;
  locale: string;
  category: string;
};

export function GeneralForm({ initial, slug, url, categories }: { initial: Values; slug: string; url: string; categories: { id: string; label: string }[] }) {
  const router = useRouter();
  const form = useDirtyState<Values>(initial);
  const v = form.value;
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const setAddr = (k: keyof Values["address"], val: string) => form.set("address", { ...v.address, [k]: val });

  async function save() {
    const e: Record<string, string> = {};
    if (v.name.trim().length < 2) e.name = "Store name is required";
    if (v.email && !/^\S+@\S+\.\S+$/.test(v.email)) e.email = "Enter a valid email";
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    const res = await run(saveGeneral(v), { success: "Store details saved" });
    setSaving(false);
    if (res) {
      form.commit();
      router.refresh();
    }
  }

  return (
    <>
      <EditLayout
        main={
          <>
            <Card>
              <CardHeader title="Store details" description="Shown to customers on your storefront, invoices and emails." />
              <CardBody className="space-y-4">
                <Field label="Store name" error={errors.name}>
                  <Input value={v.name} onChange={(e) => form.set("name", e.target.value)} maxLength={80} placeholder="e.g. Dhaka Fashion House" />
                </Field>
                <Field label="Short description" hint="One or two sentences about what you sell. Used for SEO and social sharing.">
                  <Textarea value={v.description} onChange={(e) => form.set("description", e.target.value)} maxLength={1000} rows={3} placeholder="Handmade cotton sarees and panjabis, delivered all over Bangladesh." />
                </Field>
                <Field label="Business category" hint="Helps us recommend themes and features.">
                  <Select value={v.category} onChange={(e) => form.set("category", e.target.value)}>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Contact information" description="Customers see this on your contact page and order emails. We also send order notifications here." />
              <CardBody className="grid gap-4 sm:grid-cols-2">
                <Field label="Store email" error={errors.email}>
                  <Input type="email" value={v.email} onChange={(e) => form.set("email", e.target.value)} placeholder="hello@yourstore.com" />
                </Field>
                <Field label="Phone number" hint="WhatsApp-enabled numbers work best.">
                  <Input type="tel" value={v.phone} onChange={(e) => form.set("phone", e.target.value)} placeholder="01XXXXXXXXX" />
                </Field>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Business address" description="Used on invoices and as the pickup address for courier bookings." />
              <CardBody className="grid gap-4 sm:grid-cols-2">
                <Field label="Address" className="sm:col-span-2">
                  <Input value={v.address.line1} onChange={(e) => setAddr("line1", e.target.value)} placeholder="House 12, Road 5, Block C" />
                </Field>
                <Field label="Area / Thana">
                  <Input value={v.address.area} onChange={(e) => setAddr("area", e.target.value)} placeholder="Dhanmondi" />
                </Field>
                <Field label="City">
                  <Input value={v.address.city} onChange={(e) => setAddr("city", e.target.value)} placeholder="Dhaka" />
                </Field>
                <Field label="District">
                  <Input value={v.address.district} onChange={(e) => setAddr("district", e.target.value)} placeholder="Dhaka" />
                </Field>
                <Field label="Postal code">
                  <Input value={v.address.postalCode} onChange={(e) => setAddr("postalCode", e.target.value)} placeholder="1209" inputMode="numeric" />
                </Field>
                <Field label="Country" className="sm:col-span-2">
                  <Input value={v.address.country} onChange={(e) => setAddr("country", e.target.value)} placeholder="Bangladesh" />
                </Field>
              </CardBody>
            </Card>
          </>
        }
        aside={
          <>
            <Card>
              <CardHeader title="Logo" description="Square image, at least 512×512px. PNG with transparent background works best." />
              <CardBody>
                <ImageField value={v.logoUrl} onChange={(u) => form.set("logoUrl", u)} aspect="aspect-square" label="Upload logo" className="mx-auto max-w-[200px]" />
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Store address (URL)" />
              <CardBody className="space-y-3">
                <Field label="Store handle" hint="Your handle can't be changed. Connect a custom domain instead.">
                  <Input value={slug} readOnly disabled />
                </Field>
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
                  <span className="min-w-0 flex-1 truncate font-medium">{url.replace(/^https?:\/\//, "")}</span>
                  <CopyButton value={url} />
                  <a href={url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground" aria-label="Open store">
                    <ExternalLink className="size-4" />
                  </a>
                </div>
                <a href="/domains" className="text-sm font-medium text-primary hover:underline">
                  Connect a custom domain →
                </a>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Regional settings" />
              <CardBody className="space-y-4">
                <Field label="Currency" hint={v.currency !== initial.currency ? "Changing currency does not convert your existing prices." : undefined}>
                  <Select value={v.currency} onChange={(e) => form.set("currency", e.target.value)}>
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Timezone" hint="Used for reports and order dates.">
                  <Select value={v.timezone} onChange={(e) => form.set("timezone", e.target.value)}>
                    {TIMEZONES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Storefront language">
                  <Select value={v.locale} onChange={(e) => form.set("locale", e.target.value)}>
                    {LOCALES.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </CardBody>
            </Card>
          </>
        }
      />
      <SaveBar dirty={form.dirty} saving={saving} onSave={save} onDiscard={form.reset} />
    </>
  );
}
