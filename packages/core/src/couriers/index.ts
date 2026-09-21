/**
 * Courier adapters. Each returns a normalised booking result that is stored on `orders.courier`.
 * Endpoints follow the providers' public merchant APIs; credentials come from store_integrations.
 */
export type CourierParcel = {
  invoice: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmount: number; // major units (BDT)
  note?: string;
  weightKg?: number;
  itemCount?: number;
};

export type CourierBooking = { ok: true; consignmentId: string; trackingCode?: string; trackingUrl?: string; status: string } | { ok: false; error: string };

export interface CourierAdapter {
  id: string;
  name: string;
  book(cfg: Record<string, unknown>, p: CourierParcel): Promise<CourierBooking>;
  status?(cfg: Record<string, unknown>, consignmentId: string): Promise<string | null>;
}

const steadfast: CourierAdapter = {
  id: "steadfast",
  name: "Steadfast",
  async book(cfg, p) {
    try {
      const res = await fetch("https://portal.packzy.com/api/v1/create_order", {
        method: "POST",
        headers: { "Api-Key": String(cfg.apiKey), "Secret-Key": String(cfg.secretKey), "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice: p.invoice,
          recipient_name: p.recipientName,
          recipient_phone: p.recipientPhone,
          recipient_address: p.recipientAddress,
          cod_amount: p.codAmount,
          note: p.note ?? "",
        }),
      });
      const data = (await res.json()) as { status?: number; message?: string; consignment?: { consignment_id: number; tracking_code: string; status: string } };
      if (data.consignment)
        return {
          ok: true,
          consignmentId: String(data.consignment.consignment_id),
          trackingCode: data.consignment.tracking_code,
          trackingUrl: `https://steadfast.com.bd/t/${data.consignment.tracking_code}`,
          status: data.consignment.status,
        };
      return { ok: false, error: data.message ?? "Steadfast booking failed" };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  },
  async status(cfg, id) {
    const res = await fetch(`https://portal.packzy.com/api/v1/status_by_cid/${id}`, {
      headers: { "Api-Key": String(cfg.apiKey), "Secret-Key": String(cfg.secretKey) },
    });
    const data = (await res.json()) as { delivery_status?: string };
    return data.delivery_status ?? null;
  },
};

const redx: CourierAdapter = {
  id: "redx",
  name: "RedX",
  async book(cfg, p) {
    const base = cfg.sandbox ? "https://sandbox.redx.com.bd/v1.0.0-beta" : "https://openapi.redx.com.bd/v1.0.0-beta";
    try {
      const res = await fetch(`${base}/parcel`, {
        method: "POST",
        headers: { "API-ACCESS-TOKEN": `Bearer ${cfg.accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: p.recipientName,
          customer_phone: p.recipientPhone,
          customer_address: p.recipientAddress,
          merchant_invoice_id: p.invoice,
          cash_collection_amount: String(p.codAmount),
          parcel_weight: Math.round((p.weightKg ?? 0.5) * 1000),
          value: p.codAmount,
          instruction: p.note ?? "",
        }),
      });
      const data = (await res.json()) as { tracking_id?: string; message?: string };
      return data.tracking_id
        ? { ok: true, consignmentId: data.tracking_id, trackingCode: data.tracking_id, trackingUrl: `https://redx.com.bd/track-parcel/?trackingId=${data.tracking_id}`, status: "pending" }
        : { ok: false, error: data.message ?? "RedX booking failed" };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  },
};

const pathao: CourierAdapter = {
  id: "pathao",
  name: "Pathao",
  async book(cfg, p) {
    const base = cfg.sandbox ? "https://courier-api-sandbox.pathao.com" : "https://api-hermes.pathao.com";
    try {
      const tokRes = await fetch(`${base}/aladdin/api/v1/issue-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: cfg.clientId, client_secret: cfg.clientSecret, username: cfg.username, password: cfg.password, grant_type: "password" }),
      });
      const tok = (await tokRes.json()) as { access_token?: string; message?: string };
      if (!tok.access_token) return { ok: false, error: tok.message ?? "Pathao auth failed" };
      const res = await fetch(`${base}/aladdin/api/v1/orders`, {
        method: "POST",
        headers: { Authorization: `Bearer ${tok.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: Number(cfg.storeId),
          merchant_order_id: p.invoice,
          recipient_name: p.recipientName,
          recipient_phone: p.recipientPhone,
          recipient_address: p.recipientAddress,
          delivery_type: 48,
          item_type: 2,
          item_quantity: p.itemCount ?? 1,
          item_weight: p.weightKg ?? 0.5,
          amount_to_collect: p.codAmount,
          special_instruction: p.note ?? "",
        }),
      });
      const data = (await res.json()) as { data?: { consignment_id: string; order_status: string }; message?: string };
      return data.data
        ? { ok: true, consignmentId: data.data.consignment_id, trackingCode: data.data.consignment_id, status: data.data.order_status }
        : { ok: false, error: data.message ?? "Pathao booking failed" };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  },
};

export const COURIERS: Record<string, CourierAdapter> = { steadfast, redx, pathao };
