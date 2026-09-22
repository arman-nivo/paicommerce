import { initials } from "@pai/core";
import { Badge } from "@pai/ui";
import type { IntegrationView } from "../_lib/integrations";

export function IntegrationLogo({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
  return (
    <span className="flex shrink-0 items-center justify-center rounded-xl font-display font-bold text-white shadow-sm" style={{ background: color, width: size, height: size, fontSize: size * 0.36 }} aria-hidden>
      {initials(name.replace(/[^\p{L}\p{N}\s]/gu, " ")).slice(0, 2) || name[0]}
    </span>
  );
}

export function StatusBadge({ i }: { i: IntegrationView }) {
  if (i.isDefault) return <Badge tone="green" dot>Enabled by default</Badge>;
  if (i.connected && i.enabled) return <Badge tone="green" dot>Connected & enabled</Badge>;
  if (i.connected) return <Badge tone="yellow" dot>Disabled</Badge>;
  return <Badge tone="gray">Not connected</Badge>;
}
