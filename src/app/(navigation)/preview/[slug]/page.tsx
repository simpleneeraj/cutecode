import PreviewSnippetClient from "./page.client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preview | CuteCode",
  description: "Preview your elegant code snippets on CuteCode.",
};

type PreviewSnippetProps = {
  params: Promise<{ slug: string }>;
};

const PreviewSnippet = async ({ params }: PreviewSnippetProps) => {
  const { slug } = await params;

  return <PreviewSnippetClient slug={slug} />;
};

export default PreviewSnippet;
