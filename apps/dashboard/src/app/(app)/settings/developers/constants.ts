export const API_SCOPES = [
  { value: "read_products", label: "Read products" },
  { value: "write_products", label: "Write products" },
  { value: "read_orders", label: "Read orders" },
  { value: "write_orders", label: "Write orders" },
  { value: "read_customers", label: "Read customers" },
] as const;

export const WEBHOOK_TOPICS = [
  { value: "order.created", label: "Order created" },
  { value: "order.updated", label: "Order updated" },
  { value: "product.updated", label: "Product updated" },
  { value: "customer.created", label: "Customer created" },
] as const;

export type ApiScope = (typeof API_SCOPES)[number]["value"];
export type WebhookTopic = (typeof WEBHOOK_TOPICS)[number]["value"];
