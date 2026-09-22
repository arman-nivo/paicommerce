import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = "PaiCommerce theme partner program";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOg({ eyebrow: "Theme partners", title: "Build themes in React. Keep 70%.", subtitle: "Sell on the PaiCommerce Theme Store with monthly payouts.", accent: "#6366f1" });
}
