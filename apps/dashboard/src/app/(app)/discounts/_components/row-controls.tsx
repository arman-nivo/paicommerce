"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Copy, Ellipsis, Trash2 } from "lucide-react";
import { Button, Dropdown, DropdownItem, Switch, useConfirm } from "@pai/ui";
import { run } from "@/lib/client";
import { deleteDiscount, duplicateDiscount, setDiscountActive } from "../actions";

/** Inline active toggle on the list page (optimistic). */
export function ActiveToggle({ id, active, code }: { id: string; active: boolean; code: string }) {
  const router = useRouter();
  const [on, setOn] = React.useState(active);
  const [pending, setPending] = React.useState(false);
  React.useEffect(() => setOn(active), [active]);
  return (
    <Switch
      checked={on}
      disabled={pending}
      aria-label={`${on ? "Disable" : "Enable"} ${code}`}
      onChange={async (e) => {
        const next = e.target.checked;
        setOn(next);
        setPending(true);
        const res = await run(setDiscountActive({ id, active: next }), { success: next ? `${code} enabled` : `${code} disabled` });
        setPending(false);
        if (!res) setOn(!next);
        else router.refresh();
      }}
    />
  );
}

/** Duplicate / delete menu for the edit page header. */
export function DiscountMenu({ id, code, usedCount }: { id: string; code: string; usedCount: number }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const duplicate = async () => {
    const res = await run(duplicateDiscount({ id }), { success: (d) => `Created ${d.code} (disabled until you turn it on)` });
    if (res) router.push(`/discounts/${res.id}`);
  };
  const remove = async () => {
    const ok = await confirm({
      title: `Delete ${code}?`,
      description: usedCount ? `This code was used ${usedCount} time${usedCount === 1 ? "" : "s"}. Past orders keep their discount, but customers can't use the code anymore.` : "Customers won't be able to use this code anymore.",
      confirmLabel: "Delete discount",
      danger: true,
    });
    if (!ok) return;
    const res = await run(deleteDiscount({ id }), { success: "Discount deleted" });
    if (res) {
      router.push("/discounts");
      router.refresh();
    }
  };
  return (
    <>
      <Button variant="outline" onClick={duplicate}>
        <Copy className="size-4" /> Duplicate
      </Button>
      <Dropdown
        trigger={
          <Button variant="outline" size="icon" aria-label="More actions">
            <Ellipsis className="size-4" />
          </Button>
        }
      >
        <DropdownItem danger icon={<Trash2 className="size-4" />} onClick={remove}>
          Delete discount
        </DropdownItem>
      </Dropdown>
      {dialog}
    </>
  );
}
