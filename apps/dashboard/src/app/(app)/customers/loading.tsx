import { Card, Skeleton } from "@pai/ui";

export default function Loading() {
  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="space-y-3 p-5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-3 w-40" />
          </Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="flex gap-4 border-b border-border px-4 py-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-20" />
          ))}
        </div>
        <div className="border-b border-border p-3">
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="ml-auto h-4 w-24" />
              <Skeleton className="hidden h-4 w-20 md:block" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
