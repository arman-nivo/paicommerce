import { getCtx } from "@/lib/ctx";
import { UUID_RE } from "@/app/(app)/orders/_lib/filters";
import { OrderDocument } from "../../_components/document";
import { loadOrdersForPrint } from "../../_components/load";
import { PrintToolbar } from "../../_components/toolbar";

export const metadata = { title: "Print orders" };

export default async function BulkPrintPage({ searchParams }: { searchParams: Promise<{ ids?: string; type?: string; autoprint?: string }> }) {
  const sp = await searchParams;
  const ctx = await getCtx("orders.view");
  const ids = (sp.ids ?? "").split(",").filter((x) => UUID_RE.test(x)).slice(0, 200);
  const type = sp.type === "slip" ? "slip" : "invoice";
  const docs = await loadOrdersForPrint(ctx.store.id, ids);
  const label = type === "slip" ? "Packing slips" : "Invoices";
  return (
    <>
      <PrintToolbar title={`${label} · ${docs.length} order${docs.length === 1 ? "" : "s"}`} backHref="/orders" autoprint={!!sp.autoprint && docs.length > 0} />
      {!docs.length ? (
        <p className="py-20 text-center text-sm text-muted-foreground">No orders selected. Go back and select orders to print.</p>
      ) : (
        docs.map((d) => <OrderDocument key={d.order.id} store={ctx.store} order={d.order} items={d.items} type={type} />)
      )}
    </>
  );
}
