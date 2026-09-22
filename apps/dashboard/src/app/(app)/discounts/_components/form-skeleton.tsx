import { Card, Skeleton } from "@pai/ui";

export function DiscountFormSkeleton() {
  return (
    <div>
      <Skeleton className="mb-3 h-4 w-24" />
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {[3, 2, 2, 1].map((n, i) => (
            <Card key={i} className="space-y-3 p-5">
              <Skeleton className="h-5 w-32" />
              {Array.from({ length: n }).map((_, j) => (
                <Skeleton key={j} className="h-9 w-full" />
              ))}
            </Card>
          ))}
        </div>
        <Card className="h-fit space-y-3 p-5">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </Card>
      </div>
    </div>
  );
}
