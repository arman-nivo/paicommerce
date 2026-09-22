export const TICKET_CATEGORIES = ["Orders & checkout", "Payments", "Delivery & couriers", "Theme & design", "Domain", "Billing", "Account", "Bug report", "Other"] as const;
export const TICKET_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

export const STATUS_META: Record<string, { tone: "blue" | "yellow" | "green" | "gray"; label: string }> = {
  open: { tone: "blue", label: "Open" },
  pending: { tone: "yellow", label: "Awaiting your reply" },
  resolved: { tone: "green", label: "Resolved" },
  closed: { tone: "gray", label: "Closed" },
};

export const PRIORITY_TONE: Record<string, "gray" | "blue" | "yellow" | "red"> = { low: "gray", normal: "blue", high: "yellow", urgent: "red" };

/** The ticket table has no category column: category is stored as a "[Category] " subject prefix. */
export function splitSubject(subject: string): { category: string | null; title: string } {
  const m = /^\[([^\]]{1,40})\]\s*(.*)$/.exec(subject);
  return m ? { category: m[1]!, title: m[2] || subject } : { category: null, title: subject };
}
