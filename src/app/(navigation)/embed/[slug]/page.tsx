import { Metadata } from "next";
import EmbedSnippetClient from "./page.client";

export const metadata: Metadata = {
  title: "Embed Snippet",
  description:
    "Embed this code snippet anywhere — blogs, docs, or websites. Beautiful syntax highlighting powered by CuteCode.",
  robots: {
    index: false,
    follow: false,
  },
};
type EmbedSnippetProps = {
  params: Promise<{ slug: string }>;
};

const EmbedSnippet = async ({ params }: EmbedSnippetProps) => {
  const { slug } = await params;

  return <EmbedSnippetClient slug={slug} />;
};

export default EmbedSnippet;
