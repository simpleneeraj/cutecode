import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import { BASE_URL } from "@/utils/common";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

type Props = { params: Promise<{ slug: string }> };

export default async function SnippetOgImage({ params }: Props) {
  const { slug } = await params;

  const share = await prisma.shareLink.findUnique({
    where: { slug },
    select: {
      snippet: {
        select: {
          title: true,
          description: true,
          tags: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  const snippet = share?.snippet;
  const title = snippet?.title || "Code Snippet";
  const author = snippet?.user?.name || "Anonymous";
  const tags = snippet?.tags?.slice(0, 4) ?? [];
  const logoUrl = `${BASE_URL}/favicon.png`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f0d0b 0%, #1a1410 60%, #231a13 100%)",
          fontFamily: "system-ui, sans-serif",
          padding: "60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(199,107,70,0.18) 0%, transparent 70%)",
          }}
        />

        {/* Top: logo + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src={logoUrl} alt="CuteCode" width={40} height={40} style={{ borderRadius: 10 }} />
          <span style={{ color: "#e8d5c4", fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px" }}>
            CuteCode
          </span>
        </div>

        {/* Center: title + author */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: title.length > 40 ? 52 : 68,
              fontWeight: 800,
              color: "#f5ebe0",
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              maxWidth: 900,
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(199,107,70,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                color: "#C76B46",
                fontWeight: 700,
              }}
            >
              {author.charAt(0).toUpperCase()}
            </div>
            <span style={{ color: "rgba(245,235,224,0.65)", fontSize: 22 }}>{author}</span>
          </div>
        </div>

        {/* Bottom: tags + CTA */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {tags.map((tag) => (
              <div
                key={tag}
                style={{
                  background: "rgba(199,107,70,0.15)",
                  border: "1px solid rgba(199,107,70,0.3)",
                  borderRadius: 8,
                  padding: "6px 14px",
                  color: "#C76B46",
                  fontSize: 18,
                  fontWeight: 500,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
          <div
            style={{
              background: "#C76B46",
              color: "#fff",
              borderRadius: 12,
              padding: "14px 28px",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "-0.3px",
            }}
          >
            Remix on CuteCode
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
