/** Mirrors API_SCOPES in @pai/core/api-keys (kept client-safe here; that module imports the DB). */
export const API_SCOPES = [
  { value: "products:read", label: "Read products — products, variants and collections" },
  { value: "products:write", label: "Write products — create, update, archive, adjust inventory" },
  { value: "orders:read", label: "Read orders — orders, line items and timelines" },
  { value: "orders:write", label: "Write orders — create orders, update status, notes, couriers" },
  { value: "customers:read", label: "Read customers" },
  { value: "customers:write", label: "Write customers — create and update" },
] as const;

export const WEBHOOK_TOPICS = [
  { value: "order.created", label: "Order created" },
  { value: "order.updated", label: "Order updated" },
  { value: "product.updated", label: "Product updated" },
  { value: "customer.created", label: "Customer created" },
] as const;

export type ApiScope = (typeof API_SCOPES)[number]["value"];
export type WebhookTopic = (typeof WEBHOOK_TOPICS)[number]["value"];
