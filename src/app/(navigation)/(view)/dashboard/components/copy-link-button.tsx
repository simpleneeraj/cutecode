"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { getShareUrl } from "@/lib/share/urls";

export function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(getShareUrl(slug)).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onCopy}
      aria-label={copied ? "Copied" : "Copy share link"}
      title={copied ? "Copied" : "Copy share link"}
    >
      <Icon icon={copied ? "solar:check-circle-bold" : "solar:link-bold"} className="size-3.5" />
    </Button>
  );
}
