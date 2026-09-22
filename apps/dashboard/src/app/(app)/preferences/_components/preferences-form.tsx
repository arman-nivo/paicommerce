"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "@pai/ui";
import { EditLayout } from "@/components/page";
import { SaveBar, useDirtyState } from "@/components/save-bar";
import { run } from "@/lib/client";
import { savePreferences } from "../actions";
import { fieldErrorsOf } from "../_lib/schema";
import { SeoSection, type SeoValues } from "./seo-section";
import { SocialSection, type SocialValues } from "./social-section";
import { TrackingSection, type TrackingValues } from "./tracking-section";
import { FaviconCard, PasswordCard, type PasswordValues } from "./side-cards";

export type PreferencesValues = {
  seo: SeoValues;
  faviconUrl: string | null;
  social: SocialValues;
  tracking: TrackingValues;
  password: PasswordValues;
};

export function PreferencesForm({ initial, url, storeName, fallbackDescription }: { initial: PreferencesValues; url: string; storeName: string; fallbackDescription: string }) {
  const router = useRouter();
  const form = useDirtyState<PreferencesValues>(initial);
  const v = form.value;
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [tried, setTried] = React.useState(false);

  // Re-validate live once the merchant has attempted a save, so errors clear as they fix them.
  React.useEffect(() => {
    if (tried) setErrors(fieldErrorsOf(v));
  }, [tried, v]);

  async function save() {
    setTried(true);
    const e = fieldErrorsOf(v);
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error(`Please fix ${Object.keys(e).length === 1 ? "the highlighted field" : `${Object.keys(e).length} highlighted fields`} before saving.`);
      return;
    }
    setSaving(true);
    const res = await run(savePreferences(v), { success: "Preferences saved" });
    setSaving(false);
    if (res) {
      // Show the canonical links / IDs we stored (e.g. "@shop" → "https://instagram.com/shop").
      const next: PreferencesValues = {
        ...v,
        social: res.social as SocialValues,
        tracking: res.tracking as TrackingValues,
        seo: { ...v.seo, title: v.seo.title.trim(), description: v.seo.description.trim() },
        password: { ...v.password, password: v.password.password.trim(), message: v.password.message.trim() },
      };
      form.setValue(next);
      form.commit(next);
      setTried(false);
      router.refresh();
    }
  }

  return (
    <>
      <EditLayout
        main={
          <>
            <SeoSection value={v.seo} onChange={(s) => form.set("seo", s)} errors={errors} url={url} storeName={storeName} fallbackDescription={fallbackDescription} />
            <SocialSection value={v.social} onChange={(s) => form.set("social", s)} errors={errors} />
            <TrackingSection value={v.tracking} onChange={(t) => form.set("tracking", t)} errors={errors} />
          </>
        }
        aside={
          <>
            <FaviconCard value={v.faviconUrl} onChange={(u) => form.set("faviconUrl", u)} storeName={storeName} error={errors.faviconUrl} />
            <PasswordCard value={v.password} onChange={(p) => form.set("password", p)} errors={errors} />
          </>
        }
      />
      <SaveBar
        dirty={form.dirty}
        saving={saving}
        onSave={save}
        onDiscard={() => {
          form.reset();
          setErrors({});
          setTried(false);
        }}
      />
    </>
  );
}
