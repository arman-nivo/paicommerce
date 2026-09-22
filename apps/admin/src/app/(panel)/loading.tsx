import { Card, Skeleton } from "@pai/ui";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="space-y-3 p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-32" />
          </Card>
        ))}
      </div>
      <Card>
        <div className="border-b border-border p-3">
          <Skeleton className="h-8 w-72" />
        </div>
        <div className="space-y-3 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}
