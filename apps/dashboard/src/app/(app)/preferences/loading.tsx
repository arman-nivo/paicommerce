import { Card, Skeleton } from "@pai/ui";

function CardSkeleton({ rows = 3, tall }: { rows?: number; tall?: boolean }) {
  return (
    <Card>
      <div className="space-y-2 border-b border-border px-5 py-4">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-64 max-w-full" />
      </div>
      <div className="space-y-4 p-5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
        {tall && <Skeleton className="h-40 w-full" />}
      </div>
    </Card>
  );
}

export default function Loading() {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CardSkeleton rows={2} tall />
          <CardSkeleton rows={4} />
          <CardSkeleton rows={2} />
        </div>
        <div className="space-y-6">
          <CardSkeleton rows={1} />
          <CardSkeleton rows={2} />
        </div>
      </div>
    </div>
  );
}
