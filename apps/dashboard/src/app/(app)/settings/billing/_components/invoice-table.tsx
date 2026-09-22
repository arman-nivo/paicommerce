"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Receipt } from "lucide-react";
import { Badge, Button, Card, CardHeader, Dialog, EmptyState, Table, TBody, TD, TH, THead, TR, cn } from "@pai/ui";
import { run } from "@/lib/client";
import { formatDate, formatMoney } from "@/lib/format";
import { payInvoice } from "../actions";
import { PAY_METHODS, methodLabel, type PayMethod } from "./methods";

export type InvoiceView = { id: string; number: string; createdAt: string; description: string; amount: number; currency: string; status: string; paymentMethod: string | null; dueAt: string | null };

const TONE: Record<string, "green" | "yellow" | "gray" | "red"> = { paid: "green", open: "yellow", draft: "gray", void: "gray", uncollectible: "red" };

export function InvoiceTable({ invoices }: { invoices: InvoiceView[] }) {
  const router = useRouter();
  const [paying, setPaying] = React.useState<InvoiceView | null>(null);
  const [method, setMethod] = React.useState<PayMethod>("bkash");
  const [saving, setSaving] = React.useState(false);

  async function pay() {
    if (!paying) return;
    setSaving(true);
    const res = await run(payInvoice({ id: paying.id, method }), { success: (d) => `Invoice ${d.number} paid` });
    setSaving(false);
    if (res) {
      setPaying(null);
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader title="Invoices" description="Your PaiCommerce subscription payments" />
      {invoices.length === 0 ? (
        <EmptyState icon={<Receipt />} title="No invoices yet" description="When you start a paid plan, your invoices will appear here." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Invoice</TH>
              <TH>Date</TH>
              <TH>Description</TH>
              <TH className="text-right">Amount</TH>
              <TH>Status</TH>
              <TH>Method</TH>
              <TH />
            </TR>
          </THead>
          <TBody>
            {invoices.map((i) => (
              <TR key={i.id}>
                <TD className="whitespace-nowrap font-mono text-xs">{i.number}</TD>
                <TD className="whitespace-nowrap">{formatDate(i.createdAt)}</TD>
                <TD className="min-w-48">{i.description}</TD>
                <TD className="whitespace-nowrap text-right tabular-nums">{formatMoney(i.amount, i.currency)}</TD>
                <TD>
                  <Badge tone={TONE[i.status] ?? "gray"} dot>
                    <span className="capitalize">{i.status}</span>
                  </Badge>
                </TD>
                <TD className="whitespace-nowrap text-muted-foreground">{methodLabel(i.paymentMethod)}</TD>
                <TD className="text-right">
                  {i.status === "open" && (
                    <Button size="sm" onClick={() => setPaying(i)}>
                      Pay now
                    </Button>
                  )}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
      <Dialog
        open={!!paying}
        onClose={() => setPaying(null)}
        title={paying ? `Pay ${paying.number}` : ""}
        description={paying?.description}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setPaying(null)}>
              Cancel
            </Button>
            <Button onClick={pay} loading={saving}>
              Pay {paying ? formatMoney(paying.amount, paying.currency) : ""}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-3 gap-2">
          {PAY_METHODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMethod(m.value)}
              className={cn("flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm font-medium transition", method === m.value ? "border-primary bg-accent ring-1 ring-primary" : "border-border hover:border-primary/40")}
            >
              <span className="size-3 rounded-full" style={{ background: m.color }} />
              {m.label}
            </button>
          ))}
        </div>
      </Dialog>
    </Card>
  );
}
