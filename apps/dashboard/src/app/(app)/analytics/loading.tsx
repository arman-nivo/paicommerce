import { Card, Skeleton } from "@pai/ui";

export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="space-y-3 p-5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-3 w-16" />
          </Card>
        ))}
      </div>
      <Card className="space-y-4 p-5">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-[260px] w-full" />
      </Card>
      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="space-y-4 p-5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-[220px] w-full" />
          </Card>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="space-y-3 p-5">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-8 w-full" />
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}
