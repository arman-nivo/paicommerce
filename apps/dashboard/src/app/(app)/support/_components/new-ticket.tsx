"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button, Dialog, Field, Input, Select, Textarea } from "@pai/ui";
import { run } from "@/lib/client";
import { createTicket } from "../actions";
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from "../meta";

type Category = (typeof TICKET_CATEGORIES)[number];
type Priority = (typeof TICKET_PRIORITIES)[number]["value"];

export function NewTicketButton() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [subject, setSubject] = React.useState("");
  const [category, setCategory] = React.useState<Category>(TICKET_CATEGORIES[0]);
  const [priority, setPriority] = React.useState<Priority>("normal");
  const [message, setMessage] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await run(createTicket({ subject, category, priority, message }), { success: "Ticket sent — we'll reply soon" });
    setSaving(false);
    if (res) {
      setOpen(false);
      setSubject("");
      setMessage("");
      setPriority("normal");
      router.push(`/support/${res.id}`);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus /> New ticket
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Contact support"
        description="Tell us what's going on. Screenshot links and order numbers help us answer faster."
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="new-ticket-form" loading={saving}>
              Send ticket
            </Button>
          </>
        }
      >
        <form id="new-ticket-form" onSubmit={submit} className="space-y-4">
          <Field label="Subject">
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. bKash payments not showing as paid" required minLength={3} maxLength={150} autoFocus />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Topic">
              <Select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                {TICKET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Priority" hint={priority === "urgent" ? "Use for store-down or payment issues" : undefined}>
              <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                {TICKET_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Message">
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} required minLength={2} maxLength={5000} placeholder="What happened, what you expected, and any order numbers…" />
          </Field>
        </form>
      </Dialog>
    </>
  );
}
