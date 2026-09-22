import { serializeCollectionsForApi } from "@pai/core/webhooks";
import { findCollection } from "@/lib/api-v1/catalog";
import { apiRoute, notFound, ok } from "@/lib/api-v1/http";

export const GET = apiRoute<{ id: string }>("products:read", async ({ params, store }) => {
  const c = await findCollection(store.id, params.id);
  if (!c) throw notFound("Collection");
  const [data] = await serializeCollectionsForApi([c]);
  return ok(data);
});
