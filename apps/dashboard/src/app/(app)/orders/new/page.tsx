import { and, db, eq, orderItems, orders } from "@pai/db";
import { Header } from "@/components/page";
import { getCtx } from "@/lib/ctx";
import { str, type SearchParams } from "@/lib/format";
import { UUID_RE } from "../_lib/filters";
import { OrderForm, type DraftLine, type OrderPrefill } from "./_components/order-form";

export const metadata = { title: "Create order" };

export default async function NewOrderPage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await getCtx("orders.manage");
  const sp = await searchParams;
  const from = str(sp.from);
  let prefill: OrderPrefill | null = null;

  if (UUID_RE.test(from)) {
    const src = await db.query.orders.findFirst({ where: and(eq(orders.id, from), eq(orders.storeId, ctx.store.id)) });
    if (src) {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, src.id));
      const lines: DraftLine[] = items
        .filter((i) => i.productId)
        .map((i) => ({ productId: i.productId!, variantId: i.variantId, quantity: i.quantity, title: i.title, variantTitle: i.variantTitle, imageUrl: i.imageUrl }));
      const zones = ctx.store.settings?.delivery?.zones ?? [];
      prefill = {
        number: src.number,
        lines,
        customerId: src.customerId,
        name: src.name,
        phone: src.phone ?? "",
        email: src.email ?? "",
        address: {
          name: src.shippingAddress?.name ?? "",
          phone: src.shippingAddress?.phone ?? "",
          line1: src.shippingAddress?.line1 ?? "",
          area: src.shippingAddress?.area ?? "",
          city: src.shippingAddress?.city ?? src.shippingAddress?.district ?? "",
        },
        deliveryZoneId: zones.find((z) => z.name === src.deliveryZone)?.id ?? "",
        paymentMethod: src.paymentMethod,
        note: src.note ?? "",
      };
    }
  }

  const zones = (ctx.store.settings?.delivery?.zones ?? []).map((z) => ({ id: z.id, name: z.name, charge: z.charge, estimatedDays: z.estimatedDays ?? null }));

  return (
    <>
      <Header
        title={prefill ? `Duplicate order #${prefill.number}` : "Create order"}
        description="Take orders from phone calls, Facebook or WhatsApp — stock and totals update automatically."
        back={{ href: "/orders", label: "Orders" }}
      />
      <OrderForm zones={zones} prefill={prefill} freeShippingOver={ctx.store.settings?.delivery?.freeShippingOver ?? null} />
    </>
  );
}
