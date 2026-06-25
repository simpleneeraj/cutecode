"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { toast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { DialogProps } from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import { Dialog, DialogDescription, DialogHeader, DialogPanel, DialogPopup, DialogTitle } from "@/components/ui/dialog";
import { useEditorContext } from "@/store/editor/context/editor";
import View from "@/components/view";

import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { HugeiconsIcon } from "@hugeicons/react";
import { Checkmark, Copy01Icon } from "@hugeicons/core-free-icons";

type EmbedDialogProps = {
  slug: string;
} & DialogProps;

export function EmbedDialog({ slug, ...props }: EmbedDialogProps) {
  const [copied, setCopied] = useState(false);
  const { highlighter } = useEditorContext();

  const embedUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/embed/${slug}`;

  const embedCode = [
    `<iframe`,
    `  src="${embedUrl}"`,
    `  width="100%"`,
    `  height="500"`,
    `  frameborder="0"`,
    `  style="border:0;"`,
    `  allowfullscreen>`,
    `</iframe>`,
  ].join("\n");

  const highlighted = React.useMemo(
    () =>
      highlighter?.codeToHtml(embedCode, {
        lang: "html",
        theme: "min-dark",
        transformers: [
          {
            pre(node) {
              node.properties.style = "background: transparent;";
            },
            line(node, line) {
              node.properties["data-line"] = line;
            },
          },
        ],
      }),
    [highlighter, embedCode],
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success("Embed code copied!");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Dialog {...props}>
      <DialogPopup className="sm:max-w-3xl overflow-hidden rounded-2xl p-0">
        <DialogHeader className="relative px-5 pt-5 pb-4">
          <DialogTitle className="flex items-center gap-2.5 text-base">
            <span className="flex size-8 items-center justify-center rounded-xl bg-foreground text-background">
              <Icon icon="solar:code-square-bold" className="size-4" />
            </span>
            Embed Snippet
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-muted-foreground">
            Copy this code to embed the snippet on your website or blog.
          </DialogDescription>
        </DialogHeader>

        <DialogPanel className="flex flex-col gap-5 px-5 pb-5">
          <View className="flex flex-col min-h-96">
            <Tabs defaultValue="tab-1" className="flex flex-col flex-1">
              <TabsList className="bg-transparent">
                <TabsTab value="tab-1">Preview</TabsTab>
                <TabsTab value="tab-2">Code</TabsTab>
              </TabsList>

              {/* Preview */}
              <TabsPanel value="tab-1" className="flex-1">
                <iframe src={embedUrl} className="w-full h-full min-h-80 rounded-xl border border-border/50" />
              </TabsPanel>

              {/* Code */}
              <TabsPanel value="tab-2" className="flex-1">
                <div className="flex items-start gap-1.5 h-full min-h-80 rounded-xl border bg-background pl-3 pr-1 py-1.5 relative">
                  <pre className="embed-code text-sm leading-6 overflow-auto font-dm-mono">
                    <code dangerouslySetInnerHTML={{ __html: highlighted! }} />
                  </pre>
                  <style>
                    {`
                      .embed-code code[data-line-numbers] .line::before,
                      pre .line::before {
                        content: attr(data-line);
                        display: inline-block;
                        width: 1.5rem;
                        margin-right: 1.25rem;
                        text-align: right;
                        color: hsl(var(--muted-foreground) / 0.8);
                        user-select: none;
                        font-size: 0.75rem;
                      }
                    `}
                  </style>
                  <View className="absolute top-0 right-0 p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 size-7 p-0 rounded-lg mt-1"
                      onClick={handleCopy}
                      aria-label="Copy embed code"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {copied ? (
                          <motion.span
                            key="check"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <HugeiconsIcon icon={Checkmark} className="size-3.5" />
                          </motion.span>
                        ) : (
                          <motion.span
                            key="clipboard"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <HugeiconsIcon icon={Copy01Icon} className="size-3.5" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Button>
                  </View>
                </div>
              </TabsPanel>
            </Tabs>
          </View>
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  );
}
