import { ImageResponse } from "next/og";

// Image metadata
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
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img src={source} alt="Logo" width={32} height={32} />
    </div>,
    {
      ...size,
    },
  );
}
