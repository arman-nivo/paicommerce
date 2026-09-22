const LABELS: Record<string, string> = {
  "admin.login": "Signed in to admin",
  "admin.login_denied": "Denied admin sign-in",
  "store.suspended": "Suspended store",
  "store.reactivated": "Reactivated store",
  "store.status_changed": "Changed store status",
  "store.plan_changed": "Changed plan",
  "store.trial_extended": "Extended trial",
  "store.domain_verified": "Verified custom domain",
  "store.domain_unverified": "Unverified custom domain",
  "store.impersonated": "Impersonated store owner",
  "store.impersonation_ended": "Ended impersonation",
  "store.note": "Added note",
  "user.disabled": "Disabled user",
  "user.enabled": "Enabled user",
  "user.password_reset": "Reset password",
  "user.role_changed": "Changed role",
  "user.invited": "Invited team member",
  "plan.created": "Created plan",
  "plan.updated": "Updated plan",
  "plan.deleted": "Deleted plan",
  "invoice.created": "Created invoice",
  "invoice.paid": "Marked invoice paid",
  "invoice.void": "Voided invoice",
  "subscription.updated": "Updated subscription",
  "theme.approved": "Approved theme",
  "theme.rejected": "Rejected theme",
  "theme.featured": "Featured theme",
  "theme.unfeatured": "Unfeatured theme",
  "theme.unlisted": "Unlisted theme",
  "theme.relisted": "Relisted theme",
  "theme.updated": "Edited theme listing",
  "theme.registry_sync": "Synced themes from registry",
  "developer.updated": "Updated developer",
  "developer.verified": "Verified developer",
  "developer.unverified": "Removed developer verification",
  "payout.created": "Created payout",
  "payout.paid": "Marked payout paid",
  "payout.failed": "Marked payout failed",
  "ticket.replied": "Replied to ticket",
  "ticket.updated": "Updated ticket",
  "announcement.created": "Created announcement",
  "announcement.updated": "Updated announcement",
  "announcement.deleted": "Deleted announcement",
  "lead.deleted": "Deleted lead",
  "settings.updated": "Updated platform setting",
  "settings.deleted": "Deleted platform setting",
};

export function describeAction(action: string): string {
  if (LABELS[action]) return LABELS[action]!;
  const [, verb] = action.split(".");
  const s = (verb ?? action).replace(/[._]/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1) + (verb ? ` (${action.split(".")[0]})` : "");
}

export const AUDIT_ACTION_PREFIXES = ["admin", "store", "user", "plan", "invoice", "subscription", "theme", "developer", "payout", "ticket", "announcement", "lead", "settings"];
