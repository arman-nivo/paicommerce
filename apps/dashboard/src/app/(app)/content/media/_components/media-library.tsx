"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, FileText, Film, ImagePlus, Images, Link2, Trash2, Upload, X } from "lucide-react";
import { Button, Card, cn, CopyButton, Dialog, EmptyState, Field, Input, Sheet, Spinner, toast, useConfirm } from "@pai/ui";
import { Header } from "@/components/page";
import { addMediaUrl, uploadFile } from "@/components/upload";
import { FilterSelect, SearchBox } from "@/components/url-controls";
import { run } from "@/lib/client";
import { formatDateTime } from "@/lib/format";
import { deleteMedia, updateMediaAlt } from "../actions";

export type MediaRow = { id: string; url: string; alt: string | null; mime: string | null; size: number | null; width: number | null; height: number | null; createdAt: string };

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif,video/mp4,video/webm,application/pdf";

export function formatBytes(n: number | null | undefined) {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function kind(m: Pick<MediaRow, "mime">): "image" | "video" | "pdf" {
  if (m.mime?.startsWith("video/")) return "video";
  if (m.mime === "application/pdf") return "pdf";
  return "image";
}

function fileName(url: string) {
  try {
    return decodeURIComponent(new URL(url, "http://x").pathname.split("/").pop() || url);
  } catch {
    return url;
  }
}

export function MediaLibrary({ items, total, pagination, libraryCount, libraryBytes, filtered }: { items: MediaRow[]; total: number; pagination: React.ReactNode; libraryCount: number; libraryBytes: number; filtered: boolean }) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<string[]>([]);
  const [active, setActive] = React.useState<MediaRow | null>(null);
  const [uploading, setUploading] = React.useState(0);
  const [drag, setDrag] = React.useState(false);
  const [urlOpen, setUrlOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const { confirm, dialog } = useConfirm();

  // Drop stale selections when the page of items changes.
  React.useEffect(() => {
    setSelected((s) => s.filter((id) => items.some((i) => i.id === id)));
    setActive((a) => (a ? (items.find((i) => i.id === a.id) ?? null) : null));
  }, [items]);

  const handleFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (!arr.length) return;
    setUploading((n) => n + arr.length);
    let ok = 0;
    const queue = [...arr];
    const worker = async () => {
      while (queue.length) {
        const f = queue.shift()!;
        try {
          await uploadFile(f);
          ok++;
        } catch (e) {
          toast.error(`${f.name}: ${(e as Error).message}`);
        } finally {
          setUploading((n) => n - 1);
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(3, arr.length) }, worker));
    if (ok) {
      toast.success(ok === 1 ? "File uploaded" : `${ok} files uploaded`);
      router.refresh();
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const removeIds = async (ids: string[]) => {
    const ok = await confirm({
      title: ids.length === 1 ? "Delete this file?" : `Delete ${ids.length} files?`,
      description: "Products, pages or theme sections still using these files will show a broken image. This can't be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    setDeleting(true);
    const res = await run(deleteMedia({ ids }), { success: (d) => (d.count === 1 ? "File deleted" : `${d.count} files deleted`) });
    setDeleting(false);
    if (res) {
      setSelected((s) => s.filter((x) => !ids.includes(x)));
      if (active && ids.includes(active.id)) setActive(null);
      router.refresh();
    }
  };

  const dropProps = {
    onDragOver: (e: React.DragEvent) => {
      if (!e.dataTransfer.types.includes("Files")) return;
      e.preventDefault();
      setDrag(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) setDrag(false);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDrag(false);
      if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    },
  };

  const selecting = selected.length > 0;
  const allOnPage = items.length > 0 && items.every((i) => selected.includes(i.id));

  return (
    <>
      {dialog}
      <Header
        title="Media library"
        description={libraryCount ? `${libraryCount.toLocaleString()} files · ${formatBytes(libraryBytes)} used` : "All images, videos and PDFs used in your store."}
        actions={
          <>
            <Button variant="outline" onClick={() => setUrlOpen(true)}>
              <Link2 /> Add from URL
            </Button>
            <Button onClick={() => fileRef.current?.click()} loading={uploading > 0}>
              {uploading > 0 ? null : <Upload />} {uploading > 0 ? `Uploading ${uploading}…` : "Upload files"}
            </Button>
          </>
        }
      />
      <input ref={fileRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => e.target.files && handleFiles(e.target.files)} />

      {libraryCount === 0 ? (
        <Card {...dropProps} className={cn("transition", drag && "border-primary ring-4 ring-primary/10")}>
          <EmptyState
            icon={<Images />}
            title="Your media library is empty"
            description="Drag & drop product photos, banners, videos or PDFs here — or click upload. PNG, JPG, WebP, GIF, SVG, MP4 and PDF up to 10 MB each."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={() => fileRef.current?.click()} loading={uploading > 0}>
                  <Upload /> Upload files
                </Button>
                <Button variant="outline" onClick={() => setUrlOpen(true)}>
                  <Link2 /> Add from URL
                </Button>
              </div>
            }
          />
        </Card>
      ) : (
        <Card {...dropProps} className={cn("relative overflow-hidden transition", drag && "border-primary ring-4 ring-primary/10")}>
          {drag && (
            <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-card/85 text-primary backdrop-blur-sm">
              <Upload className="size-8" />
              <span className="font-medium">Drop files to upload</span>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
            {selecting ? (
              <>
                <Button size="sm" variant="ghost" onClick={() => setSelected([])} aria-label="Clear selection">
                  <X /> {selected.length} selected
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelected(allOnPage ? [] : items.map((i) => i.id))}>
                  {allOnPage ? "Unselect page" : "Select all on page"}
                </Button>
                <Button size="sm" variant="destructive" className="ml-auto" onClick={() => removeIds(selected)} loading={deleting}>
                  <Trash2 /> Delete
                </Button>
              </>
            ) : (
              <>
                <SearchBox placeholder="Search by alt text or file name" className="max-w-sm" />
                <FilterSelect
                  param="type"
                  placeholder="All types"
                  options={[
                    { value: "image", label: "Images" },
                    { value: "video", label: "Videos" },
                    { value: "pdf", label: "PDFs" },
                  ]}
                />
                <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">Tip: drag files anywhere here to upload</span>
              </>
            )}
          </div>

          {items.length === 0 ? (
            <EmptyState icon={<Images />} title={filtered ? "No files match" : "Nothing on this page"} description={filtered ? "Try a different search or type." : undefined} />
          ) : (
            <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {uploading > 0 &&
                Array.from({ length: uploading }).map((_, i) => (
                  <div key={`u${i}`} className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/50 text-xs text-muted-foreground">
                    <Spinner /> Uploading…
                  </div>
                ))}
              {items.map((m) => (
                <Tile key={m.id} m={m} selected={selected.includes(m.id)} selecting={selecting} onToggle={() => toggle(m.id)} onOpen={() => (selecting ? toggle(m.id) : setActive(m))} />
              ))}
            </div>
          )}
          {pagination}
          {total > 0 && !pagination && <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">{total.toLocaleString()} {total === 1 ? "file" : "files"}</div>}
        </Card>
      )}

      <UrlDialog open={urlOpen} onClose={() => setUrlOpen(false)} onAdded={() => router.refresh()} />
      <DetailSheet m={active} onClose={() => setActive(null)} onDelete={(id) => removeIds([id])} onSaved={() => router.refresh()} />
    </>
  );
}

function Thumb({ m, className }: { m: MediaRow; className?: string }) {
  const k = kind(m);
  if (k === "video") return <video src={m.url} className={cn("size-full object-cover", className)} muted preload="metadata" />;
  if (k === "pdf")
    return (
      <div className={cn("flex size-full flex-col items-center justify-center gap-1 text-red-600 dark:text-red-400", className)}>
        <FileText className="size-8" />
        <span className="text-[11px] font-semibold">PDF</span>
      </div>
    );
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={m.url} alt={m.alt ?? ""} className={cn("size-full object-cover", className)} loading="lazy" />;
}

function Tile({ m, selected, selecting, onToggle, onOpen }: { m: MediaRow; selected: boolean; selecting: boolean; onToggle: () => void; onOpen: () => void }) {
  return (
    <div className={cn("group relative overflow-hidden rounded-lg border-2 bg-muted transition", selected ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-border")}>
      <button type="button" onClick={onOpen} className="block aspect-square w-full" title={m.alt ?? fileName(m.url)}>
        <Thumb m={m} />
      </button>
      <button
        type="button"
        onClick={onToggle}
        aria-label={selected ? "Unselect" : "Select"}
        className={cn(
          "absolute left-1.5 top-1.5 flex size-5 items-center justify-center rounded border shadow-sm transition",
          selected ? "border-primary bg-primary text-white" : "border-white/80 bg-black/20 text-transparent opacity-0 group-hover:opacity-100",
          selecting && "opacity-100",
        )}
      >
        <Check className="size-3" />
      </button>
      {kind(m) === "video" && (
        <span className="absolute right-1.5 top-1.5 rounded bg-black/60 p-0.5 text-white">
          <Film className="size-3" />
        </span>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/60 to-transparent px-2 pb-1 pt-4 text-[11px] text-white opacity-0 transition group-hover:opacity-100">{m.alt || fileName(m.url)}</div>
    </div>
  );
}

function UrlDialog({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: () => void }) {
  const [url, setUrl] = React.useState("");
  const [alt, setAlt] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const valid = /^https?:\/\/\S+$/i.test(url.trim());
  const submit = async () => {
    if (!valid) return;
    setBusy(true);
    try {
      await addMediaUrl(url.trim(), alt.trim() || undefined);
      toast.success("Added to media library");
      setUrl("");
      setAlt("");
      onClose();
      onAdded();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add image from URL"
      description="Link an image hosted elsewhere (e.g. Facebook CDN, Imgur, your old website). The file isn't copied."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} loading={busy} disabled={!valid}>
            Add image
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Image URL">
          <Input value={url} autoFocus onChange={(e) => setUrl(e.target.value)} placeholder="https://…/photo.jpg" onKeyDown={(e) => e.key === "Enter" && submit()} />
        </Field>
        {valid && (
          <div className="flex h-40 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url.trim()} alt="" className="max-h-full max-w-full object-contain" />
          </div>
        )}
        <Field label="Alt text (optional)" hint="Describe the image for Google and screen readers.">
          <Input value={alt} maxLength={200} onChange={(e) => setAlt(e.target.value)} placeholder="e.g. Red cotton saree with golden border" />
        </Field>
      </div>
    </Dialog>
  );
}

function DetailSheet({ m, onClose, onDelete, onSaved }: { m: MediaRow | null; onClose: () => void; onDelete: (id: string) => void; onSaved: () => void }) {
  const [alt, setAlt] = React.useState(m?.alt ?? "");
  const [saving, setSaving] = React.useState(false);
  const [dims, setDims] = React.useState<{ w: number; h: number } | null>(null);
  React.useEffect(() => {
    setAlt(m?.alt ?? "");
    setDims(m?.width && m.height ? { w: m.width, h: m.height } : null);
  }, [m]);
  if (!m) return null;
  const k = kind(m);
  const saveAlt = async () => {
    setSaving(true);
    const res = await run(updateMediaAlt({ id: m.id, alt }), { success: "Alt text saved" });
    setSaving(false);
    if (res) onSaved();
  };
  const info: [string, React.ReactNode][] = [
    ["File name", <span key="n" className="break-all">{fileName(m.url)}</span>],
    ["Type", m.mime === "image/remote" ? "External image (URL)" : (m.mime ?? "Image")],
    ["Size", formatBytes(m.size)],
    ...(dims ? ([["Dimensions", `${dims.w} × ${dims.h} px`]] as [string, React.ReactNode][]) : []),
    ["Added", formatDateTime(m.createdAt)],
  ];
  return (
    <Sheet
      open={!!m}
      onClose={onClose}
      title="File details"
      width={440}
      footer={
        <>
          <Button variant="outline" className="mr-auto text-red-600 hover:text-red-700" onClick={() => onDelete(m.id)}>
            <Trash2 /> Delete
          </Button>
          <Button variant="outline" onClick={() => window.open(m.url, "_blank", "noopener")}>
            <ExternalLink /> Open
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex max-h-72 min-h-40 items-center justify-center overflow-hidden rounded-lg border border-border bg-[repeating-conic-gradient(var(--muted)_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]">
          {k === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.url} alt={m.alt ?? ""} className="max-h-72 max-w-full object-contain" onLoad={(e) => !dims && setDims({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })} />
          ) : k === "video" ? (
            <video src={m.url} controls className="max-h-72 max-w-full" onLoadedMetadata={(e) => !dims && setDims({ w: e.currentTarget.videoWidth, h: e.currentTarget.videoHeight })} />
          ) : (
            <a href={m.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 py-8 text-red-600 dark:text-red-400">
              <FileText className="size-12" />
              <span className="text-sm font-medium underline">Open PDF</span>
            </a>
          )}
        </div>

        <Field label="URL">
          <div className="flex items-center gap-1.5">
            <Input readOnly value={m.url} onFocus={(e) => e.currentTarget.select()} className="font-mono text-xs" />
            <CopyButton value={m.url} className="h-9 shrink-0 border border-input px-3">
              Copy
            </CopyButton>
          </div>
        </Field>

        {k !== "pdf" && (
          <Field label="Alt text" hint="Describes the image for Google image search and visually-impaired shoppers.">
            <div className="space-y-2">
              <Input value={alt} maxLength={200} onChange={(e) => setAlt(e.target.value)} placeholder="e.g. Blue denim jacket, front view" onKeyDown={(e) => e.key === "Enter" && alt !== (m.alt ?? "") && saveAlt()} />
              {alt !== (m.alt ?? "") && (
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setAlt(m.alt ?? "")}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={saveAlt} loading={saving}>
                    Save alt text
                  </Button>
                </div>
              )}
            </div>
          </Field>
        )}

        <dl className="divide-y divide-border rounded-lg border border-border text-sm">
          {info.map(([k2, v]) => (
            <div key={k2} className="flex justify-between gap-4 px-3 py-2">
              <dt className="shrink-0 text-muted-foreground">{k2}</dt>
              <dd className="min-w-0 text-right">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <ImagePlus className="mt-0.5 size-3.5 shrink-0" /> Use this file anywhere — in products, pages, blog posts or your theme — by choosing it from the media picker.
        </p>
      </div>
    </Sheet>
  );
}
