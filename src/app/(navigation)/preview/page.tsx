import React from 'react';
import PreviewSnippetClient from './client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Preview | CuteCode",
  description: "Preview your elegant code snippets on CuteCode.",
};

type PreviewSnippetProps = object;

const PreviewSnippet: React.FC<PreviewSnippetProps> = ({}) => {
  return <PreviewSnippetClient />;
};

export default PreviewSnippet;
