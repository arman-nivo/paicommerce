import { Card, Skeleton } from "@pai/ui";

export function ListSkeleton({ rows = 8, tabs = true }: { rows?: number; tabs?: boolean }) {
  return (
    <>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      <Card className="overflow-hidden">
        {tabs && (
          <div className="flex gap-4 border-b border-border px-4 py-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-5 w-16" />
            ))}
          </div>
        )}
        <div className="flex gap-2 border-b border-border p-3">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="hidden h-9 w-36 sm:block" />
          <Skeleton className="hidden h-9 w-36 sm:block" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="size-10 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="hidden h-5 w-16 sm:block" />
              <Skeleton className="hidden h-4 w-20 md:block" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

export function EditorSkeleton() {
  return (
    <>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-56" />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="space-y-4 p-5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-48 w-full" />
          </Card>
          <Card className="p-5">
            <Skeleton className="mb-4 h-4 w-20" />
            <div className="grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </Card>
          <Card className="grid gap-4 p-5 sm:grid-cols-2">
            <Skeleton className="h-9" />
            <Skeleton className="h-9" />
          </Card>
        </div>
        <div className="space-y-5">
          <Card className="space-y-3 p-5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-9 w-full" />
          </Card>
          <Card className="space-y-3 p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-24 w-full" />
          </Card>
        </div>
      </div>
    </>
  );
}
