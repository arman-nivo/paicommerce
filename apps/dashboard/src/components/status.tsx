import { Badge, type BadgeTone } from "@pai/ui";

const FULFILLMENT: Record<string, [string, BadgeTone]> = {
  unfulfilled: ["New", "yellow"],
  confirmed: ["Confirmed", "blue"],
  processing: ["Processing", "purple"],
  shipped: ["Shipped", "brand"],
  delivered: ["Delivered", "green"],
  returned: ["Returned", "red"],
  cancelled: ["Cancelled", "gray"],
};
const PAYMENT: Record<string, [string, BadgeTone]> = {
  pending: ["Payment pending", "yellow"],
  authorized: ["Authorized", "blue"],
  paid: ["Paid", "green"],
  partially_refunded: ["Partially refunded", "purple"],
  refunded: ["Refunded", "gray"],
  failed: ["Failed", "red"],
};
const PRODUCT: Record<string, [string, BadgeTone]> = {
  active: ["Active", "green"],
  draft: ["Draft", "gray"],
  archived: ["Archived", "yellow"],
};

export const FULFILLMENT_LABELS = Object.fromEntries(Object.entries(FULFILLMENT).map(([k, v]) => [k, v[0]]));
export const PAYMENT_STATUS_LABELS = Object.fromEntries(Object.entries(PAYMENT).map(([k, v]) => [k, v[0]]));

export function FulfillmentBadge({ status }: { status: string }) {
  const [l, t] = FULFILLMENT[status] ?? [status, "gray"];
  return (
    <Badge tone={t} dot>
      {l}
    </Badge>
  );
}
export function PaymentBadge({ status }: { status: string }) {
  const [l, t] = PAYMENT[status] ?? [status, "gray"];
  return <Badge tone={t}>{l}</Badge>;
}
export function ProductStatusBadge({ status }: { status: string }) {
  const [l, t] = PRODUCT[status] ?? [status, "gray"];
  return (
    <Badge tone={t} dot>
      {l}
    </Badge>
  );
}
