import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default async function Icon() {
  const source = `${process.env.NEXT_PUBLIC_BASE_URL}/favicon.png`;

  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0D1126",
        borderRadius: 12,
      }}
    >
      <img
        src={source}
        alt="CuteCode"
        style={{
          width: 26,
          height: 26,
        }}
      />
    </div>,
    { ...size },
  );
}
