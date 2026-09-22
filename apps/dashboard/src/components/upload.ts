"use client";

export type UploadedMedia = { id: string; url: string; mime?: string; size?: number };

/** Upload a File to /api/upload (adds it to the media library). */
export async function uploadFile(file: File): Promise<UploadedMedia> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data as UploadedMedia;
}

/** Add a remote image URL to the media library. */
export async function addMediaUrl(url: string, alt?: string): Promise<UploadedMedia> {
  const res = await fetch("/api/upload", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url, alt }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not add URL");
  return data as UploadedMedia;
}
