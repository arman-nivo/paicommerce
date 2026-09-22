import { Skeleton } from "@pai/ui";

export default function CustomizerLoading() {
  return (
    <div className="flex h-dvh flex-col">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-3">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="ml-4 hidden h-8 w-44 md:block" />
        <div className="ml-auto flex gap-2">
          <Skeleton className="hidden h-8 w-28 md:block" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-80 shrink-0 space-y-2 border-r border-border bg-card p-3 lg:block">
          <Skeleton className="h-4 w-16" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={`h${i}`} className="h-9 w-full" />
          ))}
          <Skeleton className="mt-5 h-4 w-24" />
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
        <div className="flex flex-1 items-start justify-center bg-muted/60 p-4">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
        <div className="hidden w-[340px] shrink-0 space-y-4 border-l border-border bg-card p-4 xl:block">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
