"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, ExternalLink, Trash2 } from "lucide-react";
import { slugify, stripHtml, truncate } from "@pai/core";
import { Button, Card, CardBody, CardHeader, Field, Input, Switch, Textarea, useConfirm } from "@pai/ui";
import { ImageField } from "@/components/media-picker";
import { EditLayout, Header } from "@/components/page";
import { RichTextEditor } from "@/components/rich-text-editor";
import { SaveBar, useDirtyState } from "@/components/save-bar";
import { useStore } from "@/components/store-context";
import { TagInput } from "@/components/tag-input";
import { run } from "@/lib/client";
import { HandleField } from "../../_components/handle-field";
import { SeoCard } from "../../_components/seo-card";
import { fromDhakaInput, toDhakaInput } from "../../_lib/dhaka";
import { deletePosts, savePost } from "../actions";
import { PostStatusBadge, postStatus } from "./status";

export type PostFormValue = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverUrl: string | null;
  author: string;
  tags: string[];
  published: boolean;
  /** datetime-local value in Dhaka time */
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
};

export function PostForm({ id, initial, tagSuggestions = [] }: { id?: string; initial: PostFormValue; tagSuggestions?: string[] }) {
  const router = useRouter();
  const { store } = useStore();
  const { value: v, set, setValue, dirty, reset, commit } = useDirtyState(initial);
  const [saving, setSaving] = React.useState(false);
  const [slugTouched, setSlugTouched] = React.useState(!!id);
  const { confirm, dialog } = useConfirm();
  const isNew = !id;

  const setTitle = (title: string) => setValue((s) => ({ ...s, title, slug: slugTouched ? s.slug : slugify(title) === "item" ? "" : slugify(title) }));

  const save = async () => {
    setSaving(true);
    const res = await run(
      savePost({
        id: id ?? null,
        title: v.title,
        slug: v.slug,
        excerpt: v.excerpt,
        content: v.content,
        coverUrl: v.coverUrl,
        author: v.author,
        tags: v.tags,
        published: v.published,
        publishedAt: fromDhakaInput(v.publishedAt),
        seo: { title: v.seoTitle, description: v.seoDescription },
      }),
      { success: isNew ? "Blog post created" : "Blog post saved" },
    );
    setSaving(false);
    if (!res) return;
    const next = { ...v, slug: res.slug, publishedAt: v.publishedAt || toDhakaInput(new Date()) };
    setValue(next);
    commit(next);
    if (isNew) router.replace(`/content/blog/${res.id}`);
    else router.refresh();
  };

  const remove = async () => {
    if (!id) return;
    const ok = await confirm({ title: `Delete “${v.title || "this post"}”?`, description: "The post will be removed from your blog. This can't be undone.", confirmLabel: "Delete post", danger: true });
    if (!ok) return;
    if (await run(deletePosts({ ids: [id] }), { success: "Blog post deleted" })) {
      commit();
      router.push("/content/blog");
    }
  };

  const status = postStatus(v.published, fromDhakaInput(v.publishedAt));
  const excerptFallback = v.excerpt || truncate(stripHtml(v.content), 160);

  return (
    <>
      {dialog}
      <Header
        back={{ href: "/content/blog", label: "Blog posts" }}
        title={isNew ? "Write blog post" : initial.title || "Untitled post"}
        description={isNew ? "Share news, guides and stories — great for SEO and Facebook sharing." : <PostStatusBadge status={postStatus(initial.published, fromDhakaInput(initial.publishedAt))} />}
        actions={
          !isNew && (
            <>
              <Button variant="outline" size="sm" onClick={() => window.open(`${store.url}/blog/${initial.slug}`, "_blank", "noopener")} disabled={postStatus(initial.published, fromDhakaInput(initial.publishedAt)) !== "published"}>
                <ExternalLink /> View on store
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={remove}>
                <Trash2 /> Delete
              </Button>
            </>
          )
        }
      />
      <EditLayout
        main={
          <>
            <Card>
              <CardBody className="space-y-4">
                <Field label="Title">
                  <Input value={v.title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 5 ways to style a cotton panjabi this Eid" autoFocus={isNew} maxLength={200} />
                </Field>
                <Field label="Content">
                  <RichTextEditor value={v.content} onChange={(html) => set("content", html)} placeholder="Tell your story…" minHeight={360} />
                </Field>
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Excerpt" description="A short summary shown on your blog page and when shared on Facebook." />
              <CardBody>
                <Textarea value={v.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={3} maxLength={1000} placeholder="Leave blank to use the first lines of the post." />
              </CardBody>
            </Card>
            <SeoCard
              title={v.seoTitle}
              description={v.seoDescription}
              onChange={(s) => setValue((cur) => ({ ...cur, seoTitle: s.title, seoDescription: s.description }))}
              fallbackTitle={v.title}
              fallbackDescription={excerptFallback}
              url={`${store.url}/blog/${v.slug || "your-post"}`}
              storeName={store.name}
            />
          </>
        }
        aside={
          <>
            <Card>
              <CardHeader title="Visibility" action={<PostStatusBadge status={status} />} />
              <CardBody className="space-y-4">
                <label className="flex cursor-pointer items-start justify-between gap-3">
                  <span>
                    <span className="block text-sm font-medium">Published</span>
                    <span className="block text-xs text-muted-foreground">{v.published ? "Visible on your blog from the publish date." : "Draft — only visible here."}</span>
                  </span>
                  <Switch checked={v.published} onChange={(e) => set("published", e.target.checked)} aria-label="Published" />
                </label>
                <Field label="Publish date" hint={status === "scheduled" ? "Scheduled — it will appear automatically at this time (Dhaka time)." : "Set a future date to schedule. Dhaka time."}>
                  <div className="flex gap-2">
                    <Input type="datetime-local" value={v.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} />
                    {v.publishedAt && (
                      <Button type="button" variant="ghost" size="sm" className="h-9" onClick={() => set("publishedAt", "")}>
                        Now
                      </Button>
                    )}
                  </div>
                </Field>
                {status === "scheduled" && (
                  <p className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                    <CalendarClock className="size-3.5" /> Goes live {new Date(fromDhakaInput(v.publishedAt)!).toLocaleString("en-GB", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" })}
                  </p>
                )}
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Cover image" description="Shown on the blog list and as the share image." />
              <CardBody>
                <ImageField value={v.coverUrl} onChange={(u) => set("coverUrl", u)} aspect="aspect-[16/9]" label="Add cover image" />
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Organisation" />
              <CardBody className="space-y-4">
                <Field label="Author">
                  <Input value={v.author} onChange={(e) => set("author", e.target.value)} maxLength={120} placeholder="Your name" />
                </Field>
                <Field label="Tags" hint="Press Enter or comma to add. e.g. Eid, Style guide, News">
                  <TagInput value={v.tags} onChange={(t) => set("tags", t)} suggestions={tagSuggestions.filter((t) => !v.tags.includes(t))} />
                </Field>
                <HandleField
                  prefix={`${store.url.replace(/^https?:\/\//, "")}/blog/`}
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
      <SaveBar dirty={dirty} saving={saving} onSave={save} onDiscard={isNew ? () => router.push("/content/blog") : reset} saveLabel={isNew ? "Create post" : "Save"} />
    </>
  );
}
