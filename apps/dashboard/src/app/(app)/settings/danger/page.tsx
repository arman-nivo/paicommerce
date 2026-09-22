import { Crown, LifeBuoy, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, EmptyState } from "@pai/ui";
import { Header } from "@/components/page";
import { getCtx } from "@/lib/ctx";
import { Callout } from "../_components/ui";
import { CloseStoreCard } from "./_components/close-store";

export const metadata = { title: "Danger zone" };

export default async function DangerPage() {
  const ctx = await getCtx();
  const isOwner = ctx.member.role === "owner";
  return (
    <div className="space-y-5">
      <Header title="Danger zone" description="Irreversible actions for your store. Please read carefully." />
      {!isOwner ? (
        <Card>
          <EmptyState icon={<ShieldAlert />} title="Only the store owner can do this" description="Closing the store or transferring ownership is limited to the owner. Ask them if you need something changed here." />
        </Card>
      ) : (
        <>
          <CloseStoreCard storeName={ctx.store.name} slug={ctx.store.slug} closed={ctx.store.status === "closed"} />
          <Card>
            <CardHeader title="Transfer ownership" description="Hand the store over to another person." />
            <div className="p-5">
              <Callout icon={<Crown />} title="Contact support to transfer ownership">
                For your security, ownership transfers are handled by our team after verifying both people.{" "}
                <Link href="/support" className="inline-flex items-center gap-1 font-medium underline">
                  <LifeBuoy className="size-3.5" /> Open a support ticket
                </Link>
              </Callout>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
