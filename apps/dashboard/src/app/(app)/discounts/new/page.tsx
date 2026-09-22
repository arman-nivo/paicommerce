import { Header } from "@/components/page";
import { getCtx } from "@/lib/ctx";
import { DiscountForm } from "../_components/discount-form";

export const metadata = { title: "Create discount" };

export default async function NewDiscountPage() {
  await getCtx("discounts.manage");
  return (
    <div>
      <Header back={{ href: "/discounts", label: "Discounts" }} title="Create discount" description="Set up a code your customers can use at checkout." />
      <DiscountForm
        initial={{
          code: "",
          title: "",
          type: "percentage",
          value: 10,
          minSubtotal: null,
          usageLimit: null,
          oncePerCustomer: false,
          startsAt: "",
          endsAt: "",
          active: true,
        }}
      />
    </div>
  );
}
