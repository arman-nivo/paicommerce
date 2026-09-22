"use client";
import { useRouter } from "next/navigation";
import * as React from "react";
import { ExternalLink, PartyPopper } from "lucide-react";
import { Button, Dialog } from "@pai/ui";

export function WelcomeDialog({ storeName, storeUrl }: { storeName: string; storeUrl: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(true);
  const close = () => {
    setOpen(false);
    router.replace("/", { scroll: false });
  };
  return (
    <Dialog open={open} onClose={close} size="sm">
      <div className="py-4 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-600/30">
          <PartyPopper className="size-7" />
        </div>
        <h2 className="mt-5 font-display text-2xl font-bold">{storeName} is ready! 🎉</h2>
        <p className="mt-2 text-sm text-muted-foreground">Your store is live with a theme, pages, delivery charges and Cash on Delivery. Follow the setup guide to add products and start selling.</p>
        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={close}>Let's go</Button>
          <a href={storeUrl} target="_blank" rel="noreferrer">
            <Button variant="outline" className="w-full">
              <ExternalLink /> View my store
            </Button>
          </a>
        </div>
      </div>
    </Dialog>
  );
}
