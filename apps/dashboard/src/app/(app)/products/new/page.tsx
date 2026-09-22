import Link from "next/link";
import { Lock } from "lucide-react";
import { buttonVariants, Card, EmptyState } from "@pai/ui";
import { Header } from "@/components/page";
import { getCtx } from "@/lib/ctx";
import { ProductForm } from "../_components/editor/product-form";
import { EMPTY_PRODUCT } from "../_components/editor/types";
import { getEditorMeta } from "../_lib/editor-data";
import { productUsage } from "../_lib/server";

export const metadata = { title: "Add product" };

export default async function NewProductPage() {
  const ctx = await getCtx("products.manage");
  const [meta, usage] = await Promise.all([getEditorMeta(ctx.store), productUsage(ctx.store)]);
  if (usage.limit != null && usage.used >= usage.limit) {
    return (
      <>
        <Header title="Add product" back={{ href: "/products", label: "Products" }} />
        <Card>
          <EmptyState
            icon={<Lock />}
            title={`You've reached the ${usage.limit}-product limit`}
            description={`Your ${usage.planName} plan includes ${usage.limit} products. Upgrade to keep growing your catalog — or archive and delete products you no longer sell.`}
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Link href="/settings/billing" className={buttonVariants()}>
                  Upgrade plan
                </Link>
                <Link href="/products" className={buttonVariants({ variant: "outline" })}>
                  Back to products
                </Link>
              </div>
            }
          />
        </Card>
      </>
    );
  }
  return <ProductForm productId={null} initial={EMPTY_PRODUCT} meta={meta} />;
}
