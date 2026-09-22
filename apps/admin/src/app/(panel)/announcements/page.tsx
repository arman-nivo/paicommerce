import { Megaphone } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader } from "@pai/ui";
import { announcements, db, desc } from "@pai/db";
import { StatusBadge, label } from "@/components/badges";
import { requireAdminPage } from "@/lib/auth";
import { fmtDateTime } from "@/lib/format";
import { can } from "@/lib/roles";
import { AnnouncementButton, AnnouncementPreview, AnnouncementRowActions } from "./announcement-client";

export const metadata = { title: "Announcements" };

export default async function AnnouncementsPage() {
  const admin = await requireAdminPage();
  const canManage = can(admin.role, "content.manage");
  const rows = await db.select().from(announcements).orderBy(desc(announcements.active), desc(announcements.createdAt));
  const live = rows.filter((r) => r.active);
  return (
    <div>
      <PageHeader title="Announcements" description={`${live.length} live · shown to merchants in their dashboard`} actions={<AnnouncementButton canManage={canManage} />} />
      {rows.length === 0 ? (
        <Card>
          <EmptyState icon={<Megaphone />} title="No announcements" description="Broadcast maintenance windows, new features or policy changes to every merchant." action={<AnnouncementButton canManage={canManage} />} />
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((a) => (
            <Card key={a.id} className={a.active ? "" : "opacity-70"}>
              <div className="flex flex-col gap-3 p-4 md:flex-row md:items-start">
                <div className="min-w-0 flex-1">
                  <AnnouncementPreview title={a.title} body={a.body} level={a.level} />
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {a.active ? <Badge tone="green" dot>Live</Badge> : <Badge dot>Hidden</Badge>}
                    <StatusBadge status={a.level} />
                    <Badge>{label(a.audience)}</Badge>
                    <span>Created {fmtDateTime(a.createdAt)}</span>
                  </div>
                </div>
                <AnnouncementRowActions a={{ id: a.id, title: a.title, body: a.body, level: a.level, audience: a.audience, active: a.active }} canManage={canManage} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
