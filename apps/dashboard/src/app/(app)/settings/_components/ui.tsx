import Link from "next/link";
import { Info, Lock, Sparkles } from "lucide-react";
import { Button, Card, cn, Skeleton, Switch } from "@pai/ui";

/** A label + description with a Switch on the right. */
export function ToggleRow({ label, description, checked, onChange, disabled, badge }: { label: React.ReactNode; description?: React.ReactNode; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; badge?: React.ReactNode }) {
  return (
    <label className={cn("flex cursor-pointer items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0", disabled && "cursor-not-allowed opacity-60")}>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2 text-sm font-medium">
          {label}
          {badge}
        </span>
        {description && <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{description}</span>}
      </span>
      <Switch className="mt-0.5" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

/** Soft informational callout. */
export function Callout({ icon, title, children, tone = "info", className }: { icon?: React.ReactNode; title?: React.ReactNode; children?: React.ReactNode; tone?: "info" | "warning" | "danger" | "success"; className?: string }) {
  const tones = {
    info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200",
    warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200",
    danger: "border-red-200 bg-red-50 text-red-900 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200",
  }[tone];
  return (
    <div className={cn("flex gap-3 rounded-xl border px-4 py-3 text-sm", tones, className)}>
      <span className="mt-0.5 shrink-0 [&_svg]:size-4">{icon ?? <Info />}</span>
      <div className="min-w-0 space-y-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className="text-[13px] leading-relaxed opacity-90">{children}</div>}
      </div>
    </div>
  );
}

/** Shown when a feature needs a higher plan. */
export function UpgradeCard({ title, description, plan = "Growth", className }: { title: string; description: React.ReactNode; plan?: string; className?: string }) {
  return (
    <Card className={cn("flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center", className)}>
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
        <Lock className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      <Link href="/settings/billing">
        <Button>
          <Sparkles /> Upgrade to {plan}
        </Button>
      </Link>
    </Card>
  );
}

/** Generic skeleton for settings pages. */
export function SettingsSkeleton({ cards = 2, aside = true }: { cards?: number; aside?: boolean }) {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className={cn("grid gap-5", aside && "lg:grid-cols-3")}>
        <div className={cn("space-y-5", aside && "lg:col-span-2")}>
          {Array.from({ length: cards }).map((_, i) => (
            <Card key={i} className="space-y-4 p-5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-2/3" />
            </Card>
          ))}
        </div>
        {aside && (
          <div className="space-y-5">
            <Card className="space-y-3 p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-32 w-full" />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

/** Skeleton for card grids (integrations, plans). */
export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="space-y-3 p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-xl" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-8 w-24" />
          </Card>
        ))}
      </div>
    </div>
  );
}
