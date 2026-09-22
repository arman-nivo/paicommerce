import { NextResponse } from "next/server";
import { db, inArray, leads } from "@pai/db";
import { getAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { csvResponse, toCsv } from "@/lib/csv";
import { queryLeads } from "../query";

export async function GET(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.redirect(new URL("/login", req.url));
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const ids = (params.ids ?? "").split(",").filter((x) => /^[0-9a-f-]{36}$/i.test(x));
  const rows = ids.length ? await db.select().from(leads).where(inArray(leads.id, ids)) : (await queryLeads(params, true)).rows;
  const csv = toCsv(rows.map((l) => ({ name: l.name, email: l.email, phone: l.phone ?? "", company: l.company ?? "", source: l.source, message: l.message ?? "", created_at: l.createdAt.toISOString() })));
  await audit({ actorId: admin.id, action: "lead.exported", meta: { count: rows.length } });
  return csvResponse(csv, `leads-${new Date().toISOString().slice(0, 10)}.csv`);
}
