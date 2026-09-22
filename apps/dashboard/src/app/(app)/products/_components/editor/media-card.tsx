"use client";
import * as React from "react";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ImagePlus, Images, Link2, Pencil, Upload, X } from "lucide-react";
import { Button, Card, CardBody, CardHeader, cn, Dialog, Input, Spinner, toast } from "@pai/ui";
import { MediaPickerDialog } from "@/components/media-picker";
import { addMediaUrl, uploadFile } from "@/components/upload";

type Img = { url: string; alt?: string };

export function MediaCard({ images, onChange, title }: { images: Img[]; onChange: (v: Img[]) => void; title: string }) {
  const [picker, setPicker] = React.useState(false);
  const [uploading, setUploading] = React.useState(0);
  const [drag, setDrag] = React.useState(false);
  const [urlOpen, setUrlOpen] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [altIdx, setAltIdx] = React.useState<number | null>(null);
  const [altText, setAltText] = React.useState("");
  const fileRef = React.useRef<HTMLInputElement>(null);
  const imagesRef = React.useRef(images);
  imagesRef.current = images;

  const dndId = React.useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const addUrls = (urls: string[]) => {
    const cur = imagesRef.current;
    const fresh = urls.filter((u) => !cur.some((i) => i.url === u)).map((u) => ({ url: u }));
    if (fresh.length) onChange([...cur, ...fresh]);
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) {
      toast.error("Please choose image files (JPG, PNG, WebP, GIF).");
      return;
    }
    setUploading((n) => n + list.length);
    await Promise.all(
      list.map(async (f) => {
        try {
          const m = await uploadFile(f);
          addUrls([m.url]);
        } catch (e) {
          toast.error(`${f.name}: ${(e as Error).message}`);
        } finally {
          setUploading((n) => n - 1);
        }
      }),
    );
  };

  const addFromUrl = async () => {
    const u = url.trim();
    if (!/^https?:\/\//i.test(u)) {
      toast.error("Enter a full image URL starting with https://");
      return;
    }
    try {
      const m = await addMediaUrl(u, title || undefined);
      addUrls([m.url]);
      setUrl("");
      setUrlOpen(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = images.findIndex((i) => i.url === active.id);
    const to = images.findIndex((i) => i.url === over.id);
    if (from >= 0 && to >= 0) onChange(arrayMove(images, from, to));
  };

  return (
    <Card>
      <CardHeader
        title="Media"
        description="Drag to reorder — the first image is the main photo customers see."
        action={
          <div className="flex gap-1">
            <Button type="button" size="sm" variant="ghost" onClick={() => setUrlOpen(true)}>
              <Link2 /> <span className="hidden sm:inline">Add from URL</span>
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setPicker(true)}>
              <Images /> <span className="hidden sm:inline">Library</span>
            </Button>
          </div>
        }
      />
      <CardBody
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setDrag(true);
          }
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          if (!e.dataTransfer.files.length) return;
          e.preventDefault();
          setDrag(false);
          uploadFiles(e.dataTransfer.files);
        }}
        className={cn("transition", drag && "bg-accent/60")}
      >
        {images.length === 0 && !uploading ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={cn("flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-6 py-10 text-center transition hover:border-primary", drag && "border-primary")}
          >
            <ImagePlus className="size-7 text-primary" />
            <span className="text-sm font-medium">Add photos</span>
            <span className="text-xs text-muted-foreground">Drag & drop images here, or click to upload. Square photos (1:1) look best.</span>
          </button>
        ) : (
          <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={images.map((i) => i.url)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                {images.map((img, i) => (
                  <SortableThumb
                    key={img.url}
                    img={img}
                    main={i === 0}
                    onRemove={() => onChange(images.filter((x) => x.url !== img.url))}
                    onAlt={() => {
                      setAltIdx(i);
                      setAltText(img.alt ?? "");
                    }}
                  />
                ))}
                {Array.from({ length: uploading }).map((_, i) => (
                  <div key={`u${i}`} className="flex aspect-square items-center justify-center rounded-lg border border-border bg-muted">
                    <Spinner className="text-muted-foreground" />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
                >
                  <Upload className="size-4" /> Upload
                </button>
              </div>
            </SortableContext>
          </DndContext>
        )}
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && (uploadFiles(e.target.files), (e.target.value = ""))} />
      </CardBody>

      <MediaPickerDialog open={picker} onClose={() => setPicker(false)} onSelect={addUrls} multiple />

      <Dialog
        open={urlOpen}
        onClose={() => setUrlOpen(false)}
        size="sm"
        title="Add image from URL"
        footer={
          <>
            <Button variant="outline" onClick={() => setUrlOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addFromUrl} disabled={!url.trim()}>
              Add image
            </Button>
          </>
        }
      >
        <Input autoFocus value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addFromUrl()} placeholder="https://…/photo.jpg" />
      </Dialog>

      <Dialog
        open={altIdx !== null}
        onClose={() => setAltIdx(null)}
        size="sm"
        title="Image description (alt text)"
        description="Describes the photo for screen readers and search engines, e.g. “Red cotton saree with golden border”."
        footer={
          <>
            <Button variant="outline" onClick={() => setAltIdx(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (altIdx !== null) onChange(images.map((im, i) => (i === altIdx ? { url: im.url, ...(altText.trim() ? { alt: altText.trim() } : {}) } : im)));
                setAltIdx(null);
              }}
            >
              Save
            </Button>
          </>
        }
      >
        {altIdx !== null && images[altIdx] && (
          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[altIdx]!.url} alt="" className="mx-auto max-h-48 rounded-lg object-contain" />
            <Input autoFocus value={altText} maxLength={300} onChange={(e) => setAltText(e.target.value)} placeholder="Describe this image" />
          </div>
        )}
      </Dialog>
    </Card>
  );
}

function SortableThumb({ img, main, onRemove, onAlt }: { img: Img; main: boolean; onRemove: () => void; onAlt: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: img.url });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted", isDragging && "z-10 opacity-80 shadow-xl ring-2 ring-primary")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img.url} alt={img.alt ?? ""} className="size-full object-cover" draggable={false} />
      <button type="button" {...attributes} {...listeners} className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing" aria-label="Drag to reorder" />
      {main && <span className="pointer-events-none absolute left-1.5 top-1.5 rounded-md bg-foreground/85 px-1.5 py-0.5 text-[10px] font-semibold text-background">Main</span>}
      <GripVertical className="pointer-events-none absolute bottom-1.5 left-1.5 size-4 text-white opacity-0 drop-shadow transition group-hover:opacity-100" />
      <div className="absolute right-1 top-1 flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
        <button type="button" onClick={onAlt} className="rounded-md bg-card/90 p-1 text-foreground shadow hover:bg-card" aria-label="Edit alt text" title="Edit alt text">
          <Pencil className="size-3" />
        </button>
        <button type="button" onClick={onRemove} className="rounded-md bg-card/90 p-1 text-red-600 shadow hover:bg-card" aria-label="Remove image" title="Remove">
          <X className="size-3" />
        </button>
      </div>
      {img.alt && <span className="pointer-events-none absolute bottom-1.5 right-1.5 rounded bg-foreground/70 px-1 text-[9px] font-medium text-background">ALT</span>}
    </div>
  );
}
