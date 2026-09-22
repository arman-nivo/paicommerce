import { BUSINESS_CATEGORIES } from "@pai/theme-sdk";

export const categoryLabel = (id: string) => BUSINESS_CATEGORIES.find((c) => c.id === id)?.label ?? id;
export const categoryShort = (id: string) => categoryLabel(id).split(/[,&]/)[0]!.trim();
