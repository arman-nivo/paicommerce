import { count, db, eq, supportTickets, themes } from "@pai/db";
import { Shell } from "@/components/shell";
import { requireAdminPage } from "@/lib/auth";
import { logout } from "../login/actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();
  const [[t], [r]] = await Promise.all([
    db.select({ n: count() }).from(supportTickets).where(eq(supportTickets.status, "open")),
    db.select({ n: count() }).from(themes).where(eq(themes.status, "in_review")),
  ]);
  return (
    <Shell user={{ name: admin.name, email: admin.email, role: admin.role, avatarUrl: admin.avatarUrl }} counts={{ tickets: t?.n ?? 0, review: r?.n ?? 0 }} logoutAction={logout}>
      {children}
    </Shell>
  );
}
