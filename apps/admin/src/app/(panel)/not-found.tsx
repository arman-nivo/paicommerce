import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonVariants, Card, EmptyState } from "@pai/ui";

export default function NotFound() {
  return (
    <Card>
      <EmptyState icon={<SearchX />} title="Not found" description="The record you're looking for doesn't exist or was deleted." action={<Link href="/" className={buttonVariants()}>Back to overview</Link>} />
    </Card>
  );
}
