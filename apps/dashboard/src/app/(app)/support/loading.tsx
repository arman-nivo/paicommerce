import { Card, Skeleton } from "@pai/ui";

export default function Loading() {
  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex gap-4 border-b border-border px-5 py-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-16" />
            ))}
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2 border-b border-border px-5 py-4 last:border-0">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </Card>
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="space-y-3 p-5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-2/3" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
