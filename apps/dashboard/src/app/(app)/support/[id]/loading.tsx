import { Card, Skeleton, cn } from "@pai/ui";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-7 w-72 max-w-full" />
        <Skeleton className="h-5 w-56" />
      </div>
      <Card className="space-y-5 p-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={cn("flex items-end gap-2.5", i % 2 === 0 && "flex-row-reverse")}>
            <Skeleton className="size-[30px] rounded-full" />
            <Skeleton className="h-16 w-2/3 rounded-2xl" />
          </div>
        ))}
        <Skeleton className="h-24 w-full" />
      </Card>
    </div>
  );
}
