import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = "PaiCommerce pricing";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOg({ eyebrow: "Pricing", title: "Start free. Grow in taka.", subtitle: "Simple BDT plans with 0% transaction fees on paid plans and a 14-day free trial." });
}
