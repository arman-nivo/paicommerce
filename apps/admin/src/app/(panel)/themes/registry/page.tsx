import Link from "next/link";
import { Badge, Card, CardBody, CardHeader, PageHeader } from "@pai/ui";
import { db, themes } from "@pai/db";
import { StatusBadge, label } from "@/components/badges";
import { BackLink } from "@/components/link-tabs";
import { DataTable, EmptyRow, TD, TH, THead, TR } from "@/components/table";
import { requireAdminPage } from "@/lib/auth";
import { bdt } from "@/lib/format";
import { registryManifests } from "@/lib/registry";
import { can } from "@/lib/roles";
import { SyncPanel } from "../theme-client";

export const metadata = { title: "Theme code registry" };

export default async function RegistryPage() {
  const admin = await requireAdminPage();
  const manifests = registryManifests();
  const rows = await db.select().from(themes);
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const codeSlugs = new Set(manifests.map((m) => m.slug));
  const missing = manifests.filter((m) => !bySlug.has(m.slug));
  const orphans = rows.filter((r) => !codeSlugs.has(r.slug));
  const drift = manifests.filter((m) => {
    const r = bySlug.get(m.slug);
    return r && (r.version !== m.version || r.name !== m.name || r.price !== m.price);
  });

  return (
    <div className="space-y-5">
      <div>
        <BackLink href="/themes">Theme Store</BackLink>
        <PageHeader className="mb-0" title="Code registry" description={`${manifests.length} theme packages in @pai/theme-registry · ${rows.length} Theme Store listings`} />
      </div>
      {can(admin.role, "themes.manage") && (
        <Card>
          <CardHeader title="Sync listings" description="Creates listings for new theme packages and records version bumps. Existing listing copy is kept unless you choose to overwrite it." />
          <CardBody>
            <SyncPanel missingCount={missing.length} />
          </CardBody>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">In code, no listing</div>
          <div className="font-display text-2xl font-bold">{missing.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Listing, no code</div>
          <div className="font-display text-2xl font-bold">{orphans.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Out of sync (version/name/price)</div>
          <div className="font-display text-2xl font-bold">{drift.length}</div>
        </Card>
      </div>
      <Card className="overflow-hidden">
        <CardHeader title="All registry themes" />
        <DataTable maxHeight="none">
          <THead>
            <TH>Package</TH>
            <TH>Manifest</TH>
            <TH>Listing</TH>
            <TH>Sync state</TH>
          </THead>
          <tbody>
            {manifests.length === 0 && <EmptyRow colSpan={4} title="No themes in the registry" />}
            {manifests.map((m) => {
              const r = bySlug.get(m.slug);
              const issues = r ? [r.version !== m.version && `version ${r.version} → ${m.version}`, r.name !== m.name && `name “${r.name}” vs “${m.name}”`, r.price !== m.price && `price ${bdt(r.price)} vs ${bdt(m.price)}`].filter(Boolean) : [];
              return (
                <TR key={m.slug}>
                  <TD>
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.thumbnail} alt="" className="h-9 w-14 rounded border border-border object-cover" loading="lazy" />
                      <div>
                        <div className="font-medium">{m.name}</div>
                        <code className="text-xs text-muted-foreground">@pai-theme/{m.slug}</code>
                      </div>
                    </div>
                  </TD>
                  <TD className="text-xs">
                    v{m.version} · {m.price ? bdt(m.price) : "Free"} · {m.categories.map(label).join(", ")}
                    <div className="text-muted-foreground">by {m.author?.name}</div>
                  </TD>
                  <TD>
                    {r ? (
                      <Link href={`/themes/${r.id}`} className="inline-flex items-center gap-2 hover:underline">
                        <StatusBadge status={r.status} /> v{r.version}
                      </Link>
                    ) : (
                      <Badge tone="yellow">No listing</Badge>
                    )}
                  </TD>
                  <TD className="text-xs">{!r ? <span className="text-amber-600">Will be created on sync</span> : issues.length ? <span className="text-amber-600">{issues.join(" · ")}</span> : <span className="text-emerald-600">In sync</span>}</TD>
                </TR>
              );
            })}
          </tbody>
        </DataTable>
      </Card>
      {orphans.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader title="Listings without code" description="These listings can't be installed — the theme package is missing from the registry. Consider unlisting them." />
          <ul className="divide-y divide-border">
            {orphans.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                <Link href={`/themes/${r.id}`} className="font-medium hover:underline">
                  {r.name}
                </Link>
                <code className="text-xs text-muted-foreground">{r.slug}</code>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
