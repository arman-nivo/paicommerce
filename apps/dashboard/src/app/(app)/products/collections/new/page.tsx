import { storeUrl } from "@pai/core";
import { getCtx } from "@/lib/ctx";
import { CollectionForm, EMPTY_COLLECTION } from "../_components/collection-form";

export const metadata = { title: "Create collection" };

export default async function NewCollectionPage() {
  const ctx = await getCtx("products.manage");
  return <CollectionForm id={null} initial={EMPTY_COLLECTION} storeUrl={storeUrl(ctx.store)} />;
}
