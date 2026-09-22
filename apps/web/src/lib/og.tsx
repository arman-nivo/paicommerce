import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Shared Open Graph card renderer (next/og). */
export function renderOg({ eyebrow, title, subtitle, accent = "#7c3aed" }: { eyebrow: string; title: string; subtitle?: string; accent?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#070a18",
          backgroundImage: `radial-gradient(circle at 85% 10%, ${accent}66, transparent 45%), radial-gradient(circle at 10% 100%, #2545eb55, transparent 50%)`,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              background: "linear-gradient(135deg, #3b63f6, #7c3aed 55%, #db2777)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            P
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1, display: "flex" }}>
            Pai<span style={{ color: "#93b4fd" }}>Commerce</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, color: "#93b4fd", textTransform: "uppercase", letterSpacing: 4, fontWeight: 700 }}>{eyebrow}</div>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, marginTop: 18, maxWidth: 1000 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 30, color: "#cbd5e1", marginTop: 22, maxWidth: 980, lineHeight: 1.3 }}>{subtitle}</div>}
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 22, color: "#94a3b8" }}>
          <span>bKash · Nagad · COD</span>
          <span>•</span>
          <span>Steadfast · Pathao · RedX</span>
          <span>•</span>
          <span>paicommerce.com</span>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
