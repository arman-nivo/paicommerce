"use client";

import { Printer } from "lucide-react";
import { Button } from "@pai/ui";

export function PrintButton() {
  return (
    <Button size="sm" onClick={() => window.print()}>
      <Printer /> Print / Save PDF
    </Button>
  );
}
