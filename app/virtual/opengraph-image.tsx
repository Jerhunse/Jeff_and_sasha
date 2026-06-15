import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Jeffery & Sasha's Wedding — Join Us Virtually"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function VirtualOpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a1a1a",
          padding: 48,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            border: "2px solid #8a7340",
            outline: "1px solid #5c4a28",
            outlineOffset: 8,
            padding: "56px 72px",
            color: "#e8d9b0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 28, letterSpacing: 6, marginBottom: 24 }}>
            ✦ ❧ ✦
          </div>

          <div
            style={{
              fontSize: 26,
              letterSpacing: 2,
              textTransform: "uppercase",
              opacity: 0.85,
              marginBottom: 28,
            }}
          >
            The honour of your presence is requested
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontSize: 58,
                fontFamily: "Georgia, serif",
                fontWeight: 400,
              }}
            >
              Sasha Contreras
            </div>
            <div
              style={{
                fontSize: 34,
                fontStyle: "italic",
                opacity: 0.8,
              }}
            >
              and
            </div>
            <div
              style={{
                fontSize: 58,
                fontFamily: "Georgia, serif",
                fontWeight: 400,
              }}
            >
              Jeffery Erhunse
            </div>
          </div>

          <div
            style={{
              fontSize: 36,
              letterSpacing: 4,
              marginBottom: 32,
            }}
          >
            26 · June · 2026
          </div>

          <div
            style={{
              width: 120,
              height: 1,
              background: "#8a7340",
              marginBottom: 32,
            }}
          />

          <div
            style={{
              fontSize: 34,
              letterSpacing: 3,
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Join Us Virtually
          </div>

          <div style={{ fontSize: 24, opacity: 0.75 }}>
            Friday, June 26 · 3:00 PM Eastern
          </div>

          <div
            style={{
              marginTop: "auto",
              fontSize: 22,
              letterSpacing: 2,
              opacity: 0.55,
            }}
          >
            jeffandsasha.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
