import { notFound } from "next/navigation";
import { getCtx } from "@/lib/ctx";
import { UUID_RE } from "@/app/(app)/orders/_lib/filters";
import { OrderDocument } from "../../../_components/document";
import { loadOrdersForPrint } from "../../../_components/load";
import { PrintToolbar } from "../../../_components/toolbar";

export const metadata = { title: "Invoice" };

export default async function InvoicePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ autoprint?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  if (!UUID_RE.test(id)) notFound();
  const ctx = await getCtx("orders.view");
  const [doc] = await loadOrdersForPrint(ctx.store.id, [id]);
  if (!doc) notFound();
  return (
    <>
      <PrintToolbar title={`Invoice #${doc.order.number}`} backHref={`/orders/${id}`} autoprint={!!sp.autoprint} />
      <OrderDocument store={ctx.store} order={doc.order} items={doc.items} type="invoice" />
    </>
  );
}
