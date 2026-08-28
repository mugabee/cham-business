import { ImageResponse } from "next/og";

export const alt = "Cham Business Ltd — loans from RWF 300,000 to 20,000,000 in Kigali, Rwanda";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Statically generated at build time (no dynamic params here), so this
// doesn't add per-request cost on the constrained shared-hosting box this
// app runs on -- see next.config.ts / server.js for why that matters here.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#2563b8",
          backgroundImage: "linear-gradient(135deg, #2563b8 0%, #1b4a8f 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 56,
              height: 56,
              borderRadius: 18,
              backgroundColor: "#ffffff",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              color: "#2563b8",
            }}
          >
            C
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#ffffff" }}>
            Cham Business Ltd
          </div>
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.15,
            maxWidth: 900,
          }}
        >
          Loans from the Kicukiro office.
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 26,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          RWF 300,000 to 20,000,000. Decision within 2 working days.
        </div>
      </div>
    ),
    { ...size }
  );
}
