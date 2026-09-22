import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@pai/ui";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-primary">
        <SearchX className="size-6" />
      </span>
      <h2 className="mt-4 text-lg font-semibold">We couldn't find that</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">It may have been deleted, or the link is wrong.</p>
      <Link href="/" className="mt-5">
        <Button variant="outline">Back to home</Button>
      </Link>
    </div>
  );
}
