"use client";

import { useState } from "react";
import View from "@/components/view";
import { useShareLinkPreview } from "@/hooks/useShareLink";
import { PasscodeGate } from "../../preview/components/passcode-gate";
import { SnippetFrame } from "../../preview/components/snippet-frame";
import BlackHoleLoader from "@/components/loader/black-hole";
import Link from "next/link";
import { Logo } from "@/components/logo";

type EmbedSnippetClientProps = { slug: string };

export default function EmbedSnippetClient({ slug }: EmbedSnippetClientProps) {
  const [passcode, setPasscode] = useState("");
  const [submittedPasscode, setSubmittedPasscode] = useState("");

  const { data, isLoading, error } = useShareLinkPreview(slug, {
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
    return (
      <View className="flex items-center justify-center p-8 bg-background border rounded-lg text-muted-foreground">
        Snippet not found or access denied.
      </View>
    );
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
    <View className="flex flex-col gap-4 p-2">
      <View className="flex flex-col gap-6">
        {elementIds.map((elId) => {
          const element = elements?.[elId] as Record<string, unknown> | undefined;
          if (!element) return null;
          return (
            <SnippetFrame
              key={elId}
              elementId={elId}
              element={element}
              windowWidth={rawPresentation?.width ?? 800}
            />
          );
        })}
      </View>

      <View className="flex items-center justify-end px-2 pt-2 border-t mt-4">
        <Link 
          href="/" 
          target="_blank" 
          className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
        >
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Powered by</span>
          <Logo className="h-3 w-auto" />
        </Link>
      </View>
    </View>
  );
}
