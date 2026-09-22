import { Card, Skeleton } from "@pai/ui";

export default function OrderLoading() {
  return (
    <>
      <Skeleton className="mb-3 h-4 w-20" />
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-28" />
          </div>
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="flex items-center justify-between p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-9 w-36" />
          </Card>
          <Card>
            <div className="border-b border-border px-5 py-4">
              <Skeleton className="h-4 w-24" />
            </div>
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex gap-3 border-b border-border px-5 py-3">
                <Skeleton className="size-14 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
            <div className="space-y-2 px-5 py-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </Card>
          <Card className="h-32" />
          <Card className="h-64" />
        </div>
        <div className="space-y-5">
          <Card className="space-y-3 p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-16 w-full" />
          </Card>
          <Card className="h-44" />
          <Card className="h-36" />
        </div>
      </div>
    </>
  );
}
