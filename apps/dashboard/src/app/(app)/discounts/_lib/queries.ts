import { discounts, sql, type SQL } from "@pai/db";
import type { DiscountStatus } from "./shared";

/** SQL mirror of `discountStatus()` — keep the precedence identical. */
export const statusSql = sql<DiscountStatus>`case
  when not ${discounts.active} then 'disabled'
  when ${discounts.endsAt} is not null and ${discounts.endsAt} < now() then 'expired'
  when ${discounts.startsAt} is not null and ${discounts.startsAt} > now() then 'scheduled'
  when ${discounts.usageLimit} is not null and ${discounts.usedCount} >= ${discounts.usageLimit} then 'limit'
  else 'active' end`;

export function statusIs(s: DiscountStatus): SQL {
  return sql`(${statusSql}) = ${s}`;
}
