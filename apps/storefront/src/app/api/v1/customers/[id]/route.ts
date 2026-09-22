import { serializeCustomerForApi } from "@pai/core/webhooks";
import { apiRoute, isUuid, notFound, ok } from "@/lib/api-v1/http";

export const GET = apiRoute<{ id: string }>("customers:read", async ({ params, store }) => {
  if (!isUuid(params.id)) throw notFound("Customer");
  const data = await serializeCustomerForApi(params.id, store.id);
  if (!data) throw notFound("Customer");
  return ok(data);
});
