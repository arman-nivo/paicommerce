import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { csvResponse, toCsv } from "@/lib/csv";
import { queryStores } from "@/lib/queries/stores";

export async function GET(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.redirect(new URL("/login", req.url));
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const { rows } = await queryStores(params, { all: true });
  const csv = toCsv(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      status: r.status,
      plan: r.planName ?? "",
      category: r.category,
      owner_name: r.ownerName,
      owner_email: r.ownerEmail,
      custom_domain: r.customDomain ?? "",
      domain_verified: r.domainVerified,
      gmv_bdt: (r.gmv / 100).toFixed(2),
      orders: r.orderCount,
      last_order_at: r.lastOrderAt ? new Date(r.lastOrderAt).toISOString() : "",
      trial_ends_at: r.trialEndsAt?.toISOString() ?? "",
      created_at: r.createdAt.toISOString(),
    })),
  );
  await audit({ actorId: admin.id, action: "store.exported", meta: { count: rows.length, filters: params } });
  return csvResponse(csv, `stores-${new Date().toISOString().slice(0, 10)}.csv`);
}
