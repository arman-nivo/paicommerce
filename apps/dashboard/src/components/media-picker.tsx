"use client";
import * as React from "react";
import { Check, ImagePlus, Link2, Search, Upload, X } from "lucide-react";
import { Button, cn, Dialog, Input, Skeleton, Spinner, toast } from "@pai/ui";
import { addMediaUrl, uploadFile } from "./upload";

type MediaItem = { id: string; url: string; alt: string | null; mime: string | null };

/**
 * Media library dialog: browse, upload (drag & drop), or paste a URL.
 * onSelect receives the chosen URL(s).
 */
export function MediaPickerDialog({ open, onClose, onSelect, multiple, accept = "image/*" }: { open: boolean; onClose: () => void; onSelect: (urls: string[]) => void; multiple?: boolean; accept?: string }) {
  const [items, setItems] = React.useState<MediaItem[] | null>(null);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [q, setQ] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [uploading, setUploading] = React.useState(0);
  const [drag, setDrag] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const load = React.useCallback(async (query = "") => {
    const res = await fetch(`/api/media?q=${encodeURIComponent(query)}`);
    if (res.ok) setItems((await res.json()).items);
    else setItems([]);
  }, []);

  React.useEffect(() => {
    if (open) {
      setSelected([]);
      setItems(null);
      load();
    }
  }, [open, load]);
  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => load(q), 250);
    return () => clearTimeout(t);
  }, [q, open, load]);

  const handleFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files);
    setUploading((n) => n + arr.length);
    for (const f of arr) {
      try {
        const m = await uploadFile(f);
        setItems((cur) => [{ id: m.id, url: m.url, alt: f.name, mime: m.mime ?? null }, ...(cur ?? [])]);
        setSelected((s) => (multiple ? [...s, m.url] : [m.url]));
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  const addUrl = async () => {
    try {
      const m = await addMediaUrl(url.trim());
      setItems((cur) => [{ id: m.id, url: m.url, alt: null, mime: "image/remote" }, ...(cur ?? [])]);
      setSelected((s) => (multiple ? [...s, m.url] : [m.url]));
      setUrl("");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const toggle = (u: string) => setSelected((s) => (s.includes(u) ? s.filter((x) => x !== u) : multiple ? [...s, u] : [u]));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      title="Media library"
      description="Upload new files, paste an image URL, or reuse something you've uploaded before."
      footer={
        <>
          <span className="mr-auto self-center text-xs text-muted-foreground">{selected.length ? `${selected.length} selected` : "Nothing selected"}</span>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!selected.length}
            onClick={() => {
              onSelect(selected);
              onClose();
            }}
          >
            {multiple ? "Add selected" : "Select"}
          </Button>
        </>
      }
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
        }}
        className="space-y-4"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={cn("flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-5 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary", drag && "border-primary bg-accent text-primary")}
          >
            {uploading ? <Spinner /> : <Upload className="size-4" />}
            {uploading ? `Uploading ${uploading}…` : "Upload files or drop them here"}
          </button>
          <div className="flex items-center gap-2 rounded-xl border border-border p-2">
            <Link2 className="ml-1 size-4 shrink-0 text-muted-foreground" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && url && addUrl()}
              placeholder="Paste image URL (https://…)"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <Button size="sm" variant="secondary" disabled={!url} onClick={addUrl}>
              Add
            </Button>
          </div>
        </div>
        <input ref={fileRef} type="file" accept={accept} multiple={multiple} hidden onChange={(e) => e.target.files && handleFiles(e.target.files)} />
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by file name / alt text" className="pl-9" />
        </div>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
          {items === null && Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
          {items?.map((m) => {
            const on = selected.includes(m.url);
            const isVideo = m.mime?.startsWith("video/");
            return (
              <button
                type="button"
                key={m.id}
                onClick={() => toggle(m.url)}
                className={cn("group relative aspect-square overflow-hidden rounded-lg border-2 bg-muted", on ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-border")}
                title={m.alt ?? m.url}
              >
                {isVideo ? (
                  <video src={m.url} className="size-full object-cover" muted />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt={m.alt ?? ""} className="size-full object-cover" loading="lazy" />
                )}
                {on && (
                  <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-white">
                    <Check className="size-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {items?.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <ImagePlus className="mx-auto mb-2 size-8 opacity-40" />
            No media yet — upload your first image above.
          </div>
        )}
      </div>
    </Dialog>
  );
}

/** Single image field: preview + change/remove, backed by the media picker. */
export function ImageField({ value, onChange, aspect = "aspect-video", label = "Select image", className }: { value: string | null | undefined; onChange: (url: string | null) => void; aspect?: string; label?: string; className?: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className={className}>
      {value ? (
        <div className={cn("group relative overflow-hidden rounded-lg border border-border bg-muted", aspect)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="size-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
            <Button size="sm" variant="secondary" onClick={() => setOpen(true)} type="button">
              Change
            </Button>
            <Button size="icon-sm" variant="secondary" onClick={() => onChange(null)} type="button" aria-label="Remove image">
              <X />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn("flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground transition hover:border-primary hover:text-primary", aspect)}
        >
          <ImagePlus className="size-5" />
          {label}
        </button>
      )}
      <MediaPickerDialog open={open} onClose={() => setOpen(false)} onSelect={(u) => onChange(u[0] ?? null)} />
    </div>
  );
}
