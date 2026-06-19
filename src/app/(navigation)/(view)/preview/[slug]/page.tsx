import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PreviewSnippetClient from "./page.client";
import { BASE_URL } from "@/utils/common";
import { prisma } from "@/lib/db";
import { ShareVisibility } from "@/generated/prisma/enums";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getShareLinkMeta(slug: string) {
  return prisma.shareLink.findUnique({
    where: { slug },
    select: {
      slug: true,
      visibility: true,
      indexable: true,
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
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const share = await getShareLinkMeta(slug);

  if (!share || !share.snippet) {
    return { title: "Snippet not found | CuteCode" };
  }

  const { snippet, visibility, indexable } = share;
  const isIndexable = visibility === ShareVisibility.PUBLIC && indexable;

  const title = snippet.title
    ? `${snippet.title} — CuteCode`
    : "Code Snippet — CuteCode";

  const description =
    snippet.description ||
    (snippet.user?.name
      ? `Beautiful code snippet by ${snippet.user.name}. View, copy, or remix it on CuteCode.`
      : "View and share this code snippet created with CuteCode. Beautiful syntax highlighting, custom themes, and HD export.");

  const ogImageUrl = `${BASE_URL}/preview/${slug}/opengraph-image`;

  return {
    title,
    description,
    keywords: snippet.tags?.length ? snippet.tags : undefined,
    alternates: { canonical: `${BASE_URL}/preview/${slug}` },
    robots: isIndexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: "website",
      url: `${BASE_URL}/preview/${slug}`,
      siteName: "CuteCode",
      title,
      description,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@iamsimpleneeraj",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function PreviewSnippetPage({ params }: PageProps) {
  const { slug } = await params;
  return <PreviewSnippetClient slug={slug} />;
}
