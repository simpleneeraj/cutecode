"use client";

import Link from "next/link";
import { useState } from "react";
import View from "@/components/view";
import siteConfig from "@/contstant/site-config";
import { useSharePreview } from "@/hooks/use-share";
import BlackHoleLoader from "@/components/loader/black-hole";
import { PasscodeGate } from "../../(view)/preview/components/passcode-gate";
import { SnippetFrame } from "../../(view)/preview/components/snippet-frame";
import SnippetNotFound from "../../(view)/preview/components/preview-not-found";

type EmbedSnippetClientProps = { slug: string };

export default function EmbedSnippetClient({ slug }: EmbedSnippetClientProps) {
  const [passcode, setPasscode] = useState("");
  const [submittedPasscode, setSubmittedPasscode] = useState("");

  const { data, isLoading, error } = useSharePreview(slug, {
    passcode: submittedPasscode,
  });

  if (isLoading) {
    return (
      <View className="flex items-center justify-center min-h-[200px]">
        <BlackHoleLoader />
      </View>
    );
  }

  const trpcError = error as { data?: { code?: string } } | null;
  const requiresPasscode = trpcError?.data?.code === "FORBIDDEN";

  if (requiresPasscode) {
    return (
      <View className="flex items-center justify-center p-4 bg-background border rounded-lg">
        <PasscodeGate
          passcode={passcode}
          invalidPasscode={!!submittedPasscode}
          onChange={setPasscode}
          onSubmit={() => setSubmittedPasscode(passcode)}
        />
      </View>
    );
  }

  if (error || !data) {
    return <SnippetNotFound />;
  }

  const { snippet } = data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawPresentation: any = snippet.presentation;
  const elements: Record<string, unknown> | undefined = rawPresentation?.elements;
  const slideElements: Record<string, string[]> | undefined = rawPresentation?.slideElements;

  const elementIds: string[] = slideElements
    ? (Object.values(slideElements).flat() as string[])
    : Object.keys(elements ?? {});

  return (
    <View className="flex flex-col gap-4 p-2 ">
      <View className="flex-1 flex flex-col justify-center">
        {elementIds.map((elId) => {
          const element = elements?.[elId] as Record<string, unknown> | undefined;
          if (!element) return null;
          return (
            <SnippetFrame key={elId} elementId={elId} element={element} windowWidth={rawPresentation?.width ?? 800} />
          );
        })}
      </View>

      <View className="flex items-center justify-end px-2 pt-2 border-t">
        <Link
          href={`${process.env.NEXT_PUBLIC_BASE_URL}`}
          target="_blank"
          className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
        >
          <span className="text-xxs font-medium uppercase tracking-wider text-muted-foreground">Powered by</span>
          <img src={`${process.env.NEXT_PUBLIC_BASE_URL}/favicon.png`} alt="" className="w-4 h-4" />
          <span>{siteConfig.name}</span>
        </Link>
      </View>
    </View>
  );
}
