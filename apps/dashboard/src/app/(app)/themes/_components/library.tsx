"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Ellipsis, ExternalLink, Eye, Paintbrush, Pencil, Rocket, Store, Trash2 } from "lucide-react";
import { Badge, Button, Card, Dropdown, DropdownItem, useConfirm } from "@pai/ui";
import { run } from "@/lib/client";
import { formatDate, formatDateTime } from "@/lib/format";
import { deleteTheme, duplicateTheme, publishTheme } from "../actions";
import { LinkButton } from "./link-button";
import { RenameDialog } from "./rename-dialog";
import { ThemeThumb } from "./theme-thumb";

export type LibraryTheme = {
  id: string;
  name: string;
  themeSlug: string;
  themeName: string;
  version: string;
  thumbnail: string | null;
  hasDraft: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  previewUrl: string;
  /** Slug of the Theme Store listing (null if the theme is no longer listed). */
  listingSlug: string | null;
};

function useThemeActions() {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [busy, setBusy] = React.useState<string | null>(null);

  const wrap = async <T,>(key: string, fn: () => Promise<T | undefined>) => {
    setBusy(key);
    const res = await fn();
    setBusy(null);
    if (res) router.refresh();
    return res;
  };

  return {
    dialog,
    busy,
    publish: async (t: LibraryTheme, liveName?: string | null) => {
      const ok = await confirm({
        title: `Publish ${t.name}?`,
        description: liveName
          ? `It will replace your live theme (${liveName}). Customers will see the new design immediately. ${liveName} stays in your library so you can switch back any time.`
          : "It will become your live theme and customers will see it immediately.",
        confirmLabel: "Publish",
      });
      if (!ok) return;
      await wrap(`publish:${t.id}`, () => run(publishTheme({ id: t.id }), { success: `${t.name} is now live` }));
    },
    duplicate: (t: LibraryTheme) => wrap(`dup:${t.id}`, () => run(duplicateTheme({ id: t.id }), { success: (d) => `Created “${d.name}”` })),
    remove: async (t: LibraryTheme) => {
      const ok = await confirm({
        title: `Delete ${t.name}?`,
        description: "This removes the theme and all of its customizations from your library. This can't be undone.",
        confirmLabel: "Delete theme",
        danger: true,
      });
      if (!ok) return;
      await wrap(`del:${t.id}`, () => run(deleteTheme({ id: t.id }), { success: "Theme deleted" }));
    },
  };
}

/* ─────────────────────────── Live theme hero ─────────────────────────── */

export function LiveThemeCard({ theme, storeUrl }: { theme: LibraryTheme; storeUrl: string }) {
  const actions = useThemeActions();
  const [renaming, setRenaming] = React.useState(false);

  return (
    <Card className="overflow-hidden">
      <div className="grid md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <a href={storeUrl} target="_blank" rel="noreferrer" className="group block border-b border-border md:border-b-0 md:border-r">
          <ThemeThumb src={theme.thumbnail} alt={`${theme.themeName} preview`} className="aspect-[16/10] md:h-full md:min-h-72 md:aspect-auto">
            <div className="absolute inset-x-0 top-0 flex items-center gap-1.5 border-b border-black/5 bg-white/85 px-3 py-2 backdrop-blur dark:bg-black/60">
              <span className="size-2 rounded-full bg-red-400" />
              <span className="size-2 rounded-full bg-amber-400" />
              <span className="size-2 rounded-full bg-emerald-400" />
              <span className="ml-2 truncate rounded bg-black/5 px-2 py-0.5 text-[11px] text-neutral-600 dark:bg-white/10 dark:text-neutral-300">{storeUrl.replace(/^https?:\/\//, "")}</span>
            </div>
          </ThemeThumb>
        </a>
        <div className="flex flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge tone="green" dot>
                  Live
                </Badge>
                {theme.hasDraft && <Badge tone="yellow">Unpublished changes</Badge>}
              </div>
              <h2 className="truncate text-xl font-semibold tracking-tight">{theme.name}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {theme.themeName} · v{theme.version}
              </p>
            </div>
            <Dropdown
              trigger={
                <Button variant="ghost" size="icon-sm" aria-label="More actions">
                  <Ellipsis className="size-4" />
                </Button>
              }
            >
              <DropdownItem icon={<Pencil />} onClick={() => setRenaming(true)}>
                Rename
              </DropdownItem>
              <DropdownItem icon={<Copy />} onClick={() => actions.duplicate(theme)} disabled={!!actions.busy}>
                Duplicate
              </DropdownItem>
              {theme.listingSlug && (
                <Link href={`/themes/store/${theme.listingSlug}`} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm hover:bg-muted [&_svg]:size-4">
                  <Store /> View in Theme Store
                </Link>
              )}
            </Dropdown>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Last saved</dt>
              <dd className="mt-0.5 font-medium">{formatDateTime(theme.updatedAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Published</dt>
              <dd className="mt-0.5 font-medium">{theme.publishedAt ? formatDateTime(theme.publishedAt) : "—"}</dd>
            </div>
          </dl>

          {theme.hasDraft && (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
              You have saved changes that aren&apos;t live yet. Open the editor and click <strong>Publish</strong> to show them to customers.
            </p>
          )}

          <div className="mt-auto flex flex-wrap gap-2 pt-6">
            <LinkButton href={`/themes/${theme.id}/customize`} className="flex-1 sm:flex-none">
              <Paintbrush /> Customize
            </LinkButton>
            <LinkButton href={storeUrl} external variant="outline" className="flex-1 sm:flex-none">
              <Eye /> View store
            </LinkButton>
            {theme.hasDraft && (
              <LinkButton href={theme.previewUrl} external variant="ghost" className="flex-1 sm:flex-none">
                <ExternalLink /> Preview draft
              </LinkButton>
            )}
          </div>
        </div>
      </div>
      <RenameDialog open={renaming} onClose={() => setRenaming(false)} id={theme.id} name={theme.name} />
      {actions.dialog}
    </Card>
  );
}

/* ─────────────────────────── Theme library grid ─────────────────────────── */

export function LibraryGrid({ themes, liveName }: { themes: LibraryTheme[]; liveName: string | null }) {
  const actions = useThemeActions();
  const [renaming, setRenaming] = React.useState<LibraryTheme | null>(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {themes.map((t) => (
          <Card key={t.id} className="group flex flex-col overflow-hidden">
            <Link href={`/themes/${t.id}/customize`} className="block border-b border-border" aria-label={`Customize ${t.name}`}>
              <ThemeThumb src={t.thumbnail} alt={`${t.themeName} preview`} className="aspect-[16/10]" />
            </Link>
            <div className="flex flex-1 flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{t.name}</h3>
                  <p className="truncate text-xs text-muted-foreground">
                    {t.themeName} · v{t.version}
                  </p>
                </div>
                <Dropdown
                  trigger={
                    <Button variant="ghost" size="icon-sm" aria-label={`More actions for ${t.name}`}>
                      <Ellipsis className="size-4" />
                    </Button>
                  }
                >
                  <a href={t.previewUrl} target="_blank" rel="noreferrer" className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm hover:bg-muted [&_svg]:size-4">
                    <Eye /> Preview
                  </a>
                  <DropdownItem icon={<Pencil />} onClick={() => setRenaming(t)}>
                    Rename
                  </DropdownItem>
                  <DropdownItem icon={<Copy />} onClick={() => actions.duplicate(t)} disabled={!!actions.busy}>
                    Duplicate
                  </DropdownItem>
                  {t.listingSlug && (
                    <Link href={`/themes/store/${t.listingSlug}`} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm hover:bg-muted [&_svg]:size-4">
                      <Store /> View in Theme Store
                    </Link>
                  )}
                  <DropdownItem icon={<Trash2 />} danger onClick={() => actions.remove(t)} disabled={!!actions.busy}>
                    Delete
                  </DropdownItem>
                </Dropdown>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Added {formatDate(t.createdAt)} · Updated {formatDate(t.updatedAt)}
              </p>
              {t.hasDraft && (
                <div className="mt-2">
                  <Badge tone="yellow">Edited</Badge>
                </div>
              )}
              <div className="mt-auto flex gap-2 pt-4">
                <LinkButton href={`/themes/${t.id}/customize`} variant="outline" size="sm" className="flex-1">
                  <Paintbrush /> Customize
                </LinkButton>
                <Button size="sm" className="flex-1" onClick={() => actions.publish(t, liveName)} loading={actions.busy === `publish:${t.id}`} disabled={!!actions.busy}>
                  <Rocket className="size-3.5" /> Publish
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {renaming && <RenameDialog open onClose={() => setRenaming(null)} id={renaming.id} name={renaming.name} />}
      {actions.dialog}
    </>
  );
}
