import Link from "next/link";
import { ChevronRight, LifeBuoy } from "lucide-react";
import { Badge, Card, cn } from "@pai/ui";
import { Header } from "@/components/page";
import { ICONS } from "@/components/shell/icons";
import { can, getCtx, getStorePlan } from "@/lib/ctx";
import { SETTINGS_NAV } from "@/lib/nav";

export const metadata = { title: "Settings" };

export default async function SettingsIndex() {
  const ctx = await getCtx();
  const plan = await getStorePlan(ctx.store);
  const items = SETTINGS_NAV.filter((i) => !i.permission || can(ctx, i.permission));

  return (
    <div>
      <Header
        title="Settings"
        description={`Manage how ${ctx.store.name} works — payments, delivery, team and more.`}
        actions={
          <Badge tone="brand" dot>
            {plan.name} plan
          </Badge>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((i) => {
          const Icon = ICONS[i.icon] ?? ICONS.settings!;
          const danger = i.href === "/settings/danger";
          return (
            <Link key={i.href} href={i.href} className="group">
              <Card className="flex h-full items-start gap-4 p-4 transition group-hover:border-primary/40 group-hover:shadow-md">
                <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", danger ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" : "bg-accent text-primary")}>
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{i.label}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{i.description}</span>
                </span>
                <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Card>
            </Link>
          );
        })}
        <Link href="/support" className="group">
          <Card className="flex h-full items-start gap-4 border-dashed p-4 transition group-hover:border-primary/40">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <LifeBuoy className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">Help & support</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">Guides, contact our team or open a ticket</span>
            </span>
            <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
          </Card>
        </Link>
      </div>
    </div>
  );
}
