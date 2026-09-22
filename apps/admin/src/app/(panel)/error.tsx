"use client";

import { AlertTriangle } from "lucide-react";
import { Button, Card, EmptyState } from "@pai/ui";

export default function PanelError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card>
      <EmptyState
        icon={<AlertTriangle />}
        title="Something went wrong"
        description={error.digest ? `Error reference: ${error.digest}` : "An unexpected error occurred while loading this page."}
        action={<Button onClick={reset}>Try again</Button>}
      />
    </Card>
  );
}
