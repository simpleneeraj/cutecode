"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Code2Icon, CopyIcon, CheckIcon } from "lucide-react";
import { toast } from "@/components/toast";
import { Input } from "@/components/ui/input";
import View from "@/components/view";

type EmbedDialogProps = {
  slug: string;
};

export function EmbedDialog({ slug }: EmbedDialogProps) {
  const [copied, setCopied] = useState(false);
  const embedUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/embed/${slug}`;
  const embedCode = `<iframe src="${embedUrl}" width="100%" height="500" frameborder="0" style="border:0;" allowfullscreen></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success("Embed code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="outline" className="gap-2">
          <Code2Icon className="size-4" />
          <span>Embed</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Embed Snippet</DialogTitle>
        </DialogHeader>
        <View className="flex flex-col gap-4 py-4">
          <p className="text-sm text-muted-foreground">Copy this code to embed the snippet on your website.</p>
          <div className="flex items-center gap-2">
            <Input readOnly value={embedCode} className="font-mono text-xs" />
            <Button size="icon" onClick={handleCopy} className="shrink-0">
              {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
            </Button>
          </div>

          <View className="p-3 bg-muted rounded-md border text-xs space-y-2">
            <p className="font-semibold">Preview</p>
            <div
              className="bg-background border rounded overflow-hidden p-2"
              dangerouslySetInnerHTML={{ __html: embedCode.replace('height="500"', 'height="150"') }}
            />
          </View>
        </View>
      </DialogContent>
    </Dialog>
  );
}
