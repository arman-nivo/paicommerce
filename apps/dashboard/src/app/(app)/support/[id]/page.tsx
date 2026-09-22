import { notFound } from "next/navigation";
import { LifeBuoy } from "lucide-react";
import { and, db, eq, supportTickets } from "@pai/db";
import { Avatar, Badge, Card, CardHeader, cn } from "@pai/ui";
import { Header } from "@/components/page";
import { getCtx } from "@/lib/ctx";
import { formatDateTime } from "@/lib/format";
import { PRIORITY_TONE, STATUS_META, splitSubject } from "../meta";
import { CloseTicketButton, ReplyBox } from "./_components/reply-box";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Ticket ${id.slice(0, 8)}` };
}

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getCtx();
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const t = await db.query.supportTickets.findFirst({ where: and(eq(supportTickets.id, id), eq(supportTickets.storeId, ctx.store.id)) });
  if (!t) notFound();

  const { category, title } = splitSubject(t.subject);
  const st = STATUS_META[t.status] ?? STATUS_META.open!;
  const closed = t.status === "closed";

  return (
    <div className="mx-auto max-w-3xl">
      <Header
        back={{ href: "/support", label: "Support" }}
        title={title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={st.tone} dot>
              {st.label}
            </Badge>
            <Badge tone={PRIORITY_TONE[t.priority] ?? "gray"}>
              <span className="capitalize">{t.priority} priority</span>
            </Badge>
            {category && <span className="text-xs">{category}</span>}
            <span className="text-xs">· opened {formatDateTime(t.createdAt)}</span>
          </span>
        }
        actions={!closed && <CloseTicketButton id={t.id} />}
      />
      <Card>
        <CardHeader title="Conversation" description={`${t.messages.length} message${t.messages.length === 1 ? "" : "s"}`} />
        <ol className="space-y-5 p-5">
          {t.messages.map((m, i) => {
            const mine = m.from === "merchant";
            return (
              <li key={i} className={cn("flex items-end gap-2.5", mine && "flex-row-reverse")}>
                {mine ? (
                  <Avatar name={m.authorName || "You"} size={30} />
                ) : (
                  <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <LifeBuoy className="size-4" />
                  </span>
                )}
                <div className={cn("max-w-[85%] sm:max-w-[75%]", mine && "text-right")}>
                  <p className="mb-1 px-1 text-xs text-muted-foreground">
                    {mine ? m.authorName : `${m.authorName || "PaiCommerce"} · Support`} · {formatDateTime(m.at)}
                  </p>
                  <div
                    className={cn(
                      "whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-left text-sm leading-relaxed",
                      mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-border bg-muted",
                    )}
                  >
                    {m.body}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        <div className="border-t border-border p-5">
          <ReplyBox id={t.id} closed={closed} />
        </div>
      </Card>
    </div>
  );
}
