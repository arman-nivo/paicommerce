"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, FileText, Sparkles, Trash2 } from "lucide-react";
import { slugify, stripHtml, truncate } from "@pai/core";
import { Badge, Button, Card, CardBody, CardHeader, cn, Field, Input, Switch, useConfirm } from "@pai/ui";
import { EditLayout, Header } from "@/components/page";
import { RichTextEditor } from "@/components/rich-text-editor";
import { SaveBar, useDirtyState } from "@/components/save-bar";
import { useStore } from "@/components/store-context";
import { RelativeTime } from "@/components/time";
import { run } from "@/lib/client";
import { HandleField } from "../../_components/handle-field";
import { SeoCard } from "../../_components/seo-card";
import { deletePages, savePage } from "../actions";
import type { PageTemplate } from "./templates";

export type PageFormValue = { title: string; slug: string; content: string; published: boolean; seoTitle: string; seoDescription: string };

export function PageForm({ id, initial, updatedAt, templates, existingSlugs = [] }: { id?: string; initial: PageFormValue; updatedAt?: string; templates?: PageTemplate[]; existingSlugs?: string[] }) {
  const router = useRouter();
  const { store } = useStore();
  const { value: v, set, setValue, dirty, reset, commit } = useDirtyState(initial);
  const [saving, setSaving] = React.useState(false);
  const [slugTouched, setSlugTouched] = React.useState(!!id);
  const { confirm, dialog } = useConfirm();
  const isNew = !id;

  const setTitle = (title: string) => setValue((s) => ({ ...s, title, slug: slugTouched ? s.slug : slugify(title) === "item" ? "" : slugify(title) }));

  const applyTemplate = (t: PageTemplate) => {
    setSlugTouched(false);
    setValue((s) => ({ ...s, title: t.title, slug: t.slug, content: t.content }));
  };

  const save = async () => {
    setSaving(true);
    const res = await run(
      savePage({ id: id ?? null, title: v.title, slug: v.slug, content: v.content, published: v.published, seo: { title: v.seoTitle, description: v.seoDescription } }),
      { success: isNew ? "Page created" : "Page saved" },
    );
    setSaving(false);
    if (!res) return;
    const next = { ...v, slug: res.slug };
    setValue(next);
    commit(next);
    if (isNew) router.replace(`/content/pages/${res.id}`);
    else router.refresh();
  };

  const remove = async () => {
    if (!id) return;
    const ok = await confirm({ title: `Delete “${v.title || "this page"}”?`, description: "The page will be removed from your store. Links to it will stop working. This can't be undone.", confirmLabel: "Delete page", danger: true });
    if (!ok) return;
    const res = await run(deletePages({ ids: [id] }), { success: "Page deleted" });
    if (res) {
      commit();
      router.push("/content/pages");
    }
  };

  const liveUrl = `${store.url}/pages/${v.slug || "your-page"}`;
  const excerpt = truncate(stripHtml(v.content), 160);
  const usedTemplate = templates?.filter((t) => existingSlugs.includes(t.slug)).map((t) => t.key) ?? [];

  return (
    <>
      {dialog}
      <Header
        back={{ href: "/content/pages", label: "Pages" }}
        title={isNew ? "Add page" : initial.title || "Untitled page"}
        description={
          !isNew && updatedAt ? (
            <span className="inline-flex items-center gap-2">
              {v.published ? <Badge tone="green" dot>Visible</Badge> : <Badge dot>Hidden</Badge>}
              <span>
                Last edited <RelativeTime date={updatedAt} />
              </span>
            </span>
          ) : (
            "Pages hold content that rarely changes — About us, Contact, policies, FAQ."
          )
        }
        actions={
          !isNew && (
            <>
              <Button variant="outline" size="sm" onClick={() => window.open(`${store.url}/pages/${initial.slug}`, "_blank", "noopener")} disabled={!initial.published}>
                <ExternalLink /> View on store
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={remove}>
                <Trash2 /> Delete
              </Button>
            </>
          )
        }
      />

      {isNew && templates && !v.title && !v.content && (
        <Card className="mb-5">
          <CardHeader title={<span className="inline-flex items-center gap-1.5"><Sparkles className="size-4 text-primary" /> Start from a template</span>} description={`Pre-written for Bangladeshi shoppers and personalised for ${store.name}. Edit anything before saving.`} />
          <CardBody className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {templates.map((t) => {
              const exists = usedTemplate.includes(t.key);
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className={cn("group flex items-start gap-3 rounded-lg border border-border p-3 text-left transition hover:border-primary hover:bg-accent/50")}
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-white">
                    <FileText className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      {t.title}
                      {exists && <Badge tone="gray">Exists</Badge>}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{t.blurb}</span>
                  </span>
                </button>
              );
            })}
          </CardBody>
        </Card>
      )}

      <EditLayout
        main={
          <>
            <Card>
              <CardBody className="space-y-4">
                <Field label="Title">
                  <Input value={v.title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. About us, Size guide, Contact" autoFocus={isNew} maxLength={200} />
                </Field>
                <Field label="Content">
                  <RichTextEditor value={v.content} onChange={(html) => set("content", html)} placeholder="Write your page content…" minHeight={320} />
                </Field>
              </CardBody>
            </Card>
            <SeoCard
              title={v.seoTitle}
              description={v.seoDescription}
              onChange={(s) => setValue((cur) => ({ ...cur, seoTitle: s.title, seoDescription: s.description }))}
              fallbackTitle={v.title}
              fallbackDescription={excerpt}
              url={liveUrl}
              storeName={store.name}
            />
          </>
        }
        aside={
          <>
            <Card>
              <CardHeader title="Visibility" />
              <CardBody className="space-y-3">
                <label className="flex cursor-pointer items-start justify-between gap-3">
                  <span>
                    <span className="block text-sm font-medium">{v.published ? "Visible on your store" : "Hidden"}</span>
                    <span className="block text-xs text-muted-foreground">{v.published ? "Anyone with the link can see this page." : "Only you can see it here. Customers get a 404."}</span>
                  </span>
                  <Switch checked={v.published} onChange={(e) => set("published", e.target.checked)} aria-label="Visible" />
                </label>
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Link" description="Add this page to a menu from Navigation." />
              <CardBody>
                <HandleField
                  prefix={`${store.url.replace(/^https?:\/\//, "")}/pages/`}
                  value={v.slug}
                  auto={!slugTouched}
                  onChange={(s, touched) => {
                    setSlugTouched(touched);
                    set("slug", s);
                  }}
                />
              </CardBody>
            </Card>
          </>
        }
      />
      <SaveBar dirty={dirty} saving={saving} onSave={save} onDiscard={isNew ? () => router.push("/content/pages") : reset} saveLabel={isNew ? "Create page" : "Save"} />
    </>
  );
}
