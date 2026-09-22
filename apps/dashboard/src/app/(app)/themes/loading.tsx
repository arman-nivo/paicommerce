import { Card, Skeleton } from "@pai/ui";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>
      <Card className="grid overflow-hidden md:grid-cols-[1.35fr_1fr]">
        <Skeleton className="aspect-[16/10] rounded-none md:aspect-auto md:min-h-72" />
        <div className="space-y-4 p-6">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-2 gap-4 pt-2">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
          <div className="flex gap-2 pt-6">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
      </Card>
      <div className="space-y-3">
        <Skeleton className="h-5 w-36" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-[16/10] rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex gap-2 pt-3">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 flex-1" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
