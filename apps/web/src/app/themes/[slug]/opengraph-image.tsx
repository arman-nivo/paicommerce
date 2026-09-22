import { getManifest } from "@pai/theme-registry/manifests";
import { OG_SIZE, renderOg } from "@/lib/og";
import { themeStyle } from "@/lib/theme-styles";

export const alt = "PaiCommerce theme";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = getManifest(slug);
  const price = !m ? "" : m.price === 0 ? "Free theme" : `৳${(m.price / 100).toLocaleString("en-US")} theme`;
  return renderOg({
    eyebrow: `Theme Store · ${price}`,
    title: m ? m.name : "PaiCommerce theme",
    subtitle: m?.tagline,
    accent: themeStyle(slug).accent,
  });
}
