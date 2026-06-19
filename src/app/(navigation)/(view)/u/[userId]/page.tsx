import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ProfilePageClient from "./page.client";
import { BASE_URL } from "@/utils/common";

type PageProps = { params: Promise<{ userId: string }> };

async function getUserMeta(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, id: true, _count: { select: { snippets: true } } },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userId } = await params;
  const user = await getUserMeta(userId);
  if (!user) return { title: "User not found | CuteCode" };

  const name = user.name || "Anonymous";
  const title = `${name} — CuteCode`;
  const description = `${name} has published ${user._count.snippets} code snippet${user._count.snippets === 1 ? "" : "s"} on CuteCode. Browse and remix their work.`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/u/${userId}` },
    openGraph: { title, description, url: `${BASE_URL}/u/${userId}`, siteName: "CuteCode" },
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { userId } = await params;
  const user = await getUserMeta(userId);
  if (!user) notFound();
  return <ProfilePageClient userId={userId} />;
}
