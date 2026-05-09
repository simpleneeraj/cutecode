import EmbedSnippetClient from "./page.client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Embed | CuteCode",
  description: "Embed your elegant code snippets with CuteCode.",
};

type EmbedSnippetProps = {
  params: Promise<{ slug: string }>;
};

const EmbedSnippet = async ({ params }: EmbedSnippetProps) => {
  const { slug } = await params;

  return <EmbedSnippetClient slug={slug} />;
};

export default EmbedSnippet;
