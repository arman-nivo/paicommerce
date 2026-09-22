import { Card, Skeleton } from "@pai/ui";

export default function OrdersLoading() {
  return (
    <>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      <Card className="overflow-hidden">
        <div className="flex gap-4 border-b border-border px-4 py-3">
          {Array.from({ length: 7 }, (_, i) => (
            <Skeleton key={i} className="h-5 w-20" />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 border-b border-border p-3">
          <Skeleton className="h-9 w-full max-w-sm" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5">
              <Skeleton className="size-4" />
              <div className="w-20 space-y-1.5">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="hidden h-4 w-16 md:block" />
              <Skeleton className="hidden h-5 w-24 md:block" />
              <Skeleton className="hidden h-5 w-20 md:block" />
              <Skeleton className="hidden h-5 w-24 lg:block" />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
