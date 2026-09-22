import { Badge, type BadgeTone } from "@pai/ui";

const TONES: Record<string, BadgeTone> = {
  // store
  trial: "blue",
  active: "green",
  past_due: "yellow",
  suspended: "red",
  closed: "gray",
  // subscription
  trialing: "blue",
  cancelled: "gray",
  // invoice
  draft: "gray",
  open: "yellow",
  paid: "green",
  void: "gray",
  uncollectible: "red",
  // theme
  in_review: "purple",
  approved: "green",
  rejected: "red",
  unlisted: "gray",
  // tickets
  pending: "yellow",
  resolved: "green",
  // payouts
  processing: "blue",
  failed: "red",
  // priority
  low: "gray",
  normal: "blue",
  high: "yellow",
  urgent: "red",
  // levels
  info: "blue",
  success: "green",
  warning: "yellow",
  critical: "red",
  // roles
  user: "gray",
  support: "blue",
  admin: "purple",
  superadmin: "brand",
};

export function label(s: string): string {
  return s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge tone={TONES[status] ?? "gray"} dot className={className}>
      {label(status)}
    </Badge>
  );
}

export function RoleBadge({ role }: { role: string }) {
  return <Badge tone={TONES[role] ?? "gray"}>{role === "superadmin" ? "Super admin" : label(role)}</Badge>;
}
