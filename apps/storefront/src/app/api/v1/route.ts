import { WEB_URL } from "@pai/core";

/** GET /api/v1 — unauthenticated index of the public REST API. */
export function GET() {
  return Response.json({
    name: "PaiCommerce REST API",
    version: "v1",
    docs: `${WEB_URL}/docs/api`,
    authentication: "Authorization: Bearer <api key>",
    rateLimit: { requests: 120, windowSeconds: 60 },
    resources: {
      products: ["GET /api/v1/products", "POST /api/v1/products", "GET /api/v1/products/{id-or-slug}", "PATCH /api/v1/products/{id}", "PATCH /api/v1/products/{id}/variants/{variantId}"],
      collections: ["GET /api/v1/collections", "GET /api/v1/collections/{id-or-slug}", "GET /api/v1/collections/{id-or-slug}/products"],
      orders: ["GET /api/v1/orders", "POST /api/v1/orders", "GET /api/v1/orders/{id}", "PATCH /api/v1/orders/{id}"],
      customers: ["GET /api/v1/customers", "POST /api/v1/customers", "GET /api/v1/customers/{id}"],
    },
    webhooks: ["order.created", "order.updated", "product.updated", "customer.created"],
  });
}
