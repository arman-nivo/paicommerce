import { Card, Skeleton } from "@pai/ui";

export default function Loading() {
  return (
    <div>
      <Skeleton className="mb-3 h-4 w-24" />
      <div className="mb-6 flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="space-y-3 p-5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-24" />
          </Card>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="space-y-3 p-5">
            <Skeleton className="h-5 w-24" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </Card>
          <Card className="space-y-3 p-5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-24 w-full" />
          </Card>
        </div>
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="space-y-3 p-5">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
