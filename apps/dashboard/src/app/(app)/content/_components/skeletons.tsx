import { Card, Skeleton } from "@pai/ui";

export function ListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <Card>
        <div className="border-b border-border p-3">
          <Skeleton className="h-9 w-full max-w-sm" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5">
              <Skeleton className="size-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function EditSkeleton() {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-7 w-56" />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="space-y-4 p-5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-72 w-full" />
          </Card>
          <Card className="space-y-3 p-5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-20 w-full" />
          </Card>
        </div>
        <div className="space-y-5">
          <Card className="space-y-3 p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </Card>
          <Card className="space-y-3 p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </Card>
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton() {
  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-9 w-32" />
      </div>
      <Card className="p-4">
        <Skeleton className="mb-4 h-24 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </Card>
    </div>
  );
}
