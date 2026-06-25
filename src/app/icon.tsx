import { ImageResponse } from "next/og";

// Flat, high-contrast mark (no gradient) — legible at 16px. Enterprise style.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 7,
          background: "#0A0A0B",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 9L11 12L8 15" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13 15H17" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
