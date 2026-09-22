import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, Card, CardBody, CardHeader, cn } from "@pai/ui";
import { and, db, desc, eq, inArray, ne, plans, stores, supportTickets, users } from "@pai/db";
import { StatusBadge } from "@/components/badges";
import { BackLink, DL } from "@/components/link-tabs";
import { requireAdminPage } from "@/lib/auth";
import { fmtDateTime, timeAgo } from "@/lib/format";
import { ADMIN_ROLES, can } from "@/lib/roles";
import { ReplyBox, TicketProps } from "../ticket-client";

export const metadata = { title: "Ticket" };

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminPage();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const t = await db.query.supportTickets.findFirst({ where: eq(supportTickets.id, id) });
  if (!t) notFound();
  const [store, requester, staff, others] = await Promise.all([
    t.storeId
      ? db
          .select({ s: stores, planName: plans.name })
          .from(stores)
          .leftJoin(plans, eq(plans.id, stores.planId))
          .where(eq(stores.id, t.storeId))
          .then((r) => r[0])
      : Promise.resolve(undefined),
    t.userId ? db.query.users.findFirst({ where: eq(users.id, t.userId) }) : Promise.resolve(undefined),
    db.select({ id: users.id, name: users.name }).from(users).where(and(inArray(users.role, ADMIN_ROLES), eq(users.disabled, false))).orderBy(users.name),
    t.storeId
      ? db
          .select()
          .from(supportTickets)
          .where(and(eq(supportTickets.storeId, t.storeId), ne(supportTickets.id, id)))
          .orderBy(desc(supportTickets.createdAt))
          .limit(6)
      : Promise.resolve([]),
  ]);
  const canReply = can(admin.role, "tickets");

  return (
    <div className="space-y-5">
      <div>
        <BackLink href="/tickets">Support inbox</BackLink>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-bold tracking-tight">{t.subject}</h1>
          <StatusBadge status={t.status} />
          <StatusBadge status={t.priority} />
        </div>
        <p className="text-sm text-muted-foreground">
          Opened {fmtDateTime(t.createdAt)} · last update {timeAgo(t.updatedAt)} · {t.messages?.length ?? 0} messages
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-4">
              {(t.messages ?? []).length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No messages in this ticket.</p>}
              {(t.messages ?? []).map((m, i) => {
                const support = m.from === "support";
                return (
                  <div key={i} className={cn("flex gap-3", support && "flex-row-reverse")}>
                    <Avatar name={m.authorName || (support ? "Support" : "Merchant")} size={32} />
                    <div className={cn("max-w-[80%] rounded-2xl px-4 py-3 text-sm", support ? "rounded-tr-sm bg-primary text-primary-foreground" : "rounded-tl-sm bg-muted")}>
                      <div className={cn("mb-1 flex items-center gap-2 text-xs", support ? "text-primary-foreground/80" : "text-muted-foreground")}>
                        <span className="font-semibold">{m.authorName}</span>
                        <span>{support ? "Support" : "Merchant"}</span>
                        <span>· {m.at ? fmtDateTime(m.at) : ""}</span>
                      </div>
                      <p className="whitespace-pre-wrap break-words leading-relaxed">{m.body}</p>
                    </div>
                  </div>
                );
              })}
            </CardBody>
          </Card>
          {canReply && (
            <Card>
              <CardHeader title="Reply" description={`Replying as ${admin.name} (PaiCommerce Support)`} />
              <CardBody>
                <ReplyBox id={t.id} currentStatus={t.status} />
              </CardBody>
            </Card>
          )}
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader title="Properties" />
            <CardBody>{canReply ? <TicketProps id={t.id} status={t.status} priority={t.priority} assigneeId={t.assigneeId} staff={staff} meId={admin.id} /> : <DL items={[["Status", t.status], ["Priority", t.priority]]} />}</CardBody>
          </Card>
          <Card>
            <CardHeader title="Requester" />
            <CardBody>
              <DL
                items={[
                  ["Name", requester ? <Link key="u" href={`/users/${requester.id}`} className="hover:underline">{requester.name}</Link> : "—"],
                  ["Email", requester?.email ?? "—"],
                  ["Phone", requester?.phone ?? "—"],
                  ["Store", store ? <Link key="s" href={`/stores/${store.s.id}`} className="hover:underline">{store.s.name}</Link> : "—"],
                  ["Plan", store?.planName ?? "—"],
                  ["Store status", store ? <StatusBadge key="st" status={store.s.status} /> : "—"],
                ]}
              />
            </CardBody>
          </Card>
          {others.length > 0 && (
            <Card>
              <CardHeader title="Other tickets from this store" />
              <ul className="divide-y divide-border">
                {others.map((o) => (
                  <li key={o.id}>
                    <Link href={`/tickets/${o.id}`} className="flex items-center gap-2 px-5 py-2 text-sm hover:bg-muted/40">
                      <span className="flex-1 truncate">{o.subject}</span>
                      <StatusBadge status={o.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
