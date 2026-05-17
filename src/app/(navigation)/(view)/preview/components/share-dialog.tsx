"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/toast";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@iconify/react";
import { shortenUrl } from "@/utils/common";
import siteConfig from "@/contstant/site-config";

type ShareDialogProps = {
  slug: string;
};

export function ShareDialog({ slug }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState<string>("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(window.location.href);
    }
  }, []);

  const handleCopy = async () => {
    try {
      const shortUrl = await shortenUrl(url, "snippets").catch(() => url);
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link.");
    }
  };

  const shareUrl = encodeURIComponent(url);
  const baseText = `Crafted this beautiful code presentation using ${siteConfig.name} ✨ Check it out!`;

  const urls = {
    twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${encodeURIComponent(baseText)}&via=iamsimpleneeraj`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${encodeURIComponent(
      `Code Snippet on ${siteConfig.name}`,
    )}&summary=${encodeURIComponent(`${baseText} @simpleneeraj`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${encodeURIComponent(
      `${baseText} @simpleneeraj`,
    )}`,
  };

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" className="gap-2" />}>
        <Icon icon="solar:share-linear" className="size-4" />
        <span>Share</span>
      </DialogTrigger>

      <DialogPopup className="sm:max-w-md rounded-2xl overflow-hidden p-0">
        {/* Ambient top strip */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-500/50 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-emerald-500/6 to-transparent pointer-events-none" />

        <DialogHeader className="relative px-5 pt-5 pb-4">
          <DialogTitle className="flex items-center gap-2.5 text-base">
            <motion.div
              className="flex size-8 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/25"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
            >
              <Icon icon="solar:share-bold" className="size-4 text-white" />
            </motion.div>
            Share Snippet
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Share this snippet with your friends or colleagues.
          </DialogDescription>
        </DialogHeader>

        <DialogPanel className="flex flex-col gap-5 px-5 pb-5">
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="flex flex-col min-h-16 py-3 gap-2"
              render={<a href={urls.twitter} target="_blank" rel="noopener noreferrer" />}
            >
              <Icon icon="ri:twitter-x-fill" className="size-5" />
              <span className="text-xs">Twitter</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col min-h-16 py-3 gap-2"
              render={<a href={urls.linkedin} target="_blank" rel="noopener noreferrer" />}
            >
              <Icon icon="ri:linkedin-fill" className="size-5" />
              <span className="text-xs">LinkedIn</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col min-h-16 py-3 gap-2"
              render={<a href={urls.facebook} target="_blank" rel="noopener noreferrer" />}
            >
              <Icon icon="ri:facebook-circle-fill" className="size-5" />
              <span className="text-xs">Facebook</span>
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground/80 px-1">Or copy link</p>
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.25 }}
              className="flex items-center gap-1.5 rounded-xl border bg-muted/50 pl-3 pr-1 py-1.5"
            >
              <Icon icon="solar:link-bold" className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate font-mono text-xs text-muted-foreground select-all">
                {url || "Loading..."}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 size-7 p-0 rounded-lg"
                onClick={handleCopy}
                aria-label="Copy link"
                disabled={!url}
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
                      <Icon icon="solar:check-circle-bold" className="size-3.5 text-emerald-500" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="clipboard"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Icon icon="solar:copy-bold" className="size-3.5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  );
}
