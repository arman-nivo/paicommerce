import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = "PaiCommerce — The e-commerce platform built for Bangladesh";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOg({ eyebrow: "E-commerce for Bangladesh", title: "Sell online in Bangladesh, beautifully.", subtitle: "Launch a store with local payments, couriers, fraud checks and 13 stunning themes." });
}
