import { SETTINGS_NAV } from "@/lib/nav";
import { can, getCtx } from "@/lib/ctx";
import { SettingsFrame } from "./_components/settings-frame";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getCtx();
  const items = SETTINGS_NAV.filter((i) => !i.permission || can(ctx, i.permission)).map(({ href, label, icon }) => ({ href, label, icon }));
  return <SettingsFrame items={items}>{children}</SettingsFrame>;
}
