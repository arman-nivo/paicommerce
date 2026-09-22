import { Card, Skeleton } from "@pai/ui";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-7 w-24 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-[4/3] rounded-none" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
