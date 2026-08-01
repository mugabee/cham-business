import { ImageResponse } from "next/og";

export const alt = "Cham Business Ltd — Friendly Personal Loans in Rwanda";
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
          Friendly personal loans for individuals across Rwanda
        </div>
        <div
          style={{
            marginTop: 32,
            display: "flex",
            gap: 16,
          }}
        >
          {["No hidden fees", "24h decisions", "RWF 300K–20M"].map((chip) => (
            <div
              key={chip}
              style={{
                display: "flex",
                fontSize: 22,
                color: "#ffffff",
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 999,
                padding: "10px 22px",
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
