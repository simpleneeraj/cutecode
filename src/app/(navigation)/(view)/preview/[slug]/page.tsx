import { Metadata } from "next";
import PreviewSnippetClient from "./page.client";
import { BASE_URL } from "@/utils/common";

export const metadata: Metadata = {
  title: "Code Snippet Preview",
  description:
    "View and share this code snippet created with CuteCode. Beautiful syntax highlighting, custom themes, and HD export — create your own in seconds.",
  alternates: {
    canonical: `${BASE_URL}/preview`,
  },
  robots: {
    index: false,
    follow: false,
  },
};
type PreviewSnippetPageProps = {
  params: Promise<{ slug: string }>;
};

const PreviewSnippetPage = async ({ params }: PreviewSnippetPageProps) => {
  const { slug } = await params;

  return <PreviewSnippetClient slug={slug} />;
};

export default PreviewSnippetPage;
