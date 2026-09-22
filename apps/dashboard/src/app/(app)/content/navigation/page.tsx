import Link from "next/link";
import { ChevronRight, ListTree, Menu as MenuIcon, PanelBottom } from "lucide-react";
import { asc, db, eq, menus, type MenuItem } from "@pai/db";
import { Badge, Card, CardBody, EmptyState } from "@pai/ui";
import { Header } from "@/components/page";
import { getCtx } from "@/lib/ctx";
import { formatDate } from "@/lib/format";
import { CreateDefaultMenusButton, CreateMenuButton } from "./_components/menu-list-actions";

export const metadata = { title: "Navigation" };

function countItems(items: MenuItem[]): number {
  return items.reduce((n, i) => n + 1 + countItems(i.children ?? []), 0);
}

const DESCRIPTIONS: Record<string, string> = {
  main: "Shown in your store header on every page.",
  footer: "Shown at the bottom of every page — great for policies and contact info.",
};

export default async function NavigationPage() {
  const ctx = await getCtx("content.manage");
  const rows = await db.select().from(menus).where(eq(menus.storeId, ctx.store.id)).orderBy(asc(menus.handle));
  const order = (h: string) => (h === "main" ? 0 : h === "footer" ? 1 : 2);
  rows.sort((a, b) => order(a.handle) - order(b.handle) || a.title.localeCompare(b.title));
  const missingDefaults = !rows.some((r) => r.handle === "main") || !rows.some((r) => r.handle === "footer");

  return (
    <>
      <Header
        title="Navigation"
        description="Menus help customers find their way around your store. Edit your header and footer links here."
        actions={
          rows.length > 0 && (
            <>
              {missingDefaults && <CreateDefaultMenusButton />}
              <CreateMenuButton variant={missingDefaults ? "outline" : "default"} />
            </>
          )
        }
      />
      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ListTree />}
            title="Set up your store menus"
            description="We'll create a main menu (header) and a footer menu for you, pre-filled with your collections and pages. You can change everything afterwards."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <CreateDefaultMenusButton />
                <CreateMenuButton variant="outline" />
              </div>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((m) => {
            const n = countItems(m.items ?? []);
            const top = (m.items ?? []).slice(0, 6);
            const Icon = m.handle === "footer" ? PanelBottom : MenuIcon;
            return (
              <Link key={m.id} href={`/content/navigation/${m.id}`} className="group">
                <Card className="h-full transition group-hover:border-primary/40 group-hover:shadow-md">
                  <CardBody className="flex h-full flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                        <Icon className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold group-hover:text-primary">{m.title}</h3>
                          {m.handle === "main" || m.handle === "footer" ? <Badge tone="brand">Default</Badge> : <Badge>{m.handle}</Badge>}
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">{DESCRIPTIONS[m.handle] ?? `Handle: ${m.handle}`}</p>
                      </div>
                      <ChevronRight className="size-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {top.length ? (
                        top.map((i) => (
                          <span key={i.id} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {i.label}
                            {i.children?.length ? ` (${i.children.length})` : ""}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-amber-600 dark:text-amber-400">No links yet — click to add some.</span>
                      )}
                      {(m.items?.length ?? 0) > top.length && <span className="px-1 text-xs text-muted-foreground">+{m.items.length - top.length} more</span>}
                    </div>
                    <div className="mt-auto flex justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                      <span>
                        {n} {n === 1 ? "link" : "links"}
                      </span>
                      <span>Updated {formatDate(m.updatedAt)}</span>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
