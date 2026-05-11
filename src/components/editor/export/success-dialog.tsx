import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/toast";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "@iconify/react";

export default function SuccessDialog({
  isSuccessOpen,
  setIsSuccessOpen,
  publishedUrl,
}: {
  isSuccessOpen: boolean;
  setIsSuccessOpen: (open: boolean) => void;
  publishedUrl?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(publishedUrl ?? "").catch(() => {});
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
      <DialogPopup className="sm:max-w-sm rounded-2xl overflow-hidden p-0" showCloseButton={false}>
        {/* Ambient top strip */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-500/60 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-emerald-500/8 to-transparent pointer-events-none" />

        <DialogHeader className="relative items-center text-center px-6 pt-6 pb-4 gap-4">
          {/* Animated icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.05 }}
            className="relative flex size-16 items-center justify-center"
          >
            {/* outer ring pulse */}
            <motion.div
              className="absolute inset-0 rounded-full bg-emerald-500/15"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            />
            <div className="flex size-14 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
              >
                <Icon icon="solar:verified-check-bold" className="size-7 text-white" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="space-y-1"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
          >
            <DialogTitle className="text-base font-semibold">Snippet Published!</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Your snippet is live. Link copied to clipboard.
            </DialogDescription>
          </motion.div>
        </DialogHeader>

        <DialogPanel className="px-5 pb-2">
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.25 }}
            className="flex items-center gap-1.5 rounded-xl border bg-muted/50 pl-3 pr-1 py-1.5"
          >
            <Icon icon="solar:link-bold" className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate font-mono text-xs text-muted-foreground select-all">{publishedUrl}</span>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 size-7 p-0 rounded-lg"
              onClick={handleCopy}
              aria-label="Copy link"
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
        </DialogPanel>

        <DialogFooter className="px-5 pb-5 pt-3 gap-2 mt-2">
          <DialogClose render={<Button variant="outline" className="flex-1" />}>
            {/* <Icon icon="solar:close-circle-bold" className="size-3.5" /> */}
            Close
          </DialogClose>
          <Button
            className="flex-1 relative overflow-hidden bg-linear-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-md shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400"
            onClick={() => {
              window.open(publishedUrl ?? "", "_blank");
              setIsSuccessOpen(false);
            }}
          >
            <motion.span
              className="absolute inset-0 translate-x-[-200%] bg-linear-to-r from-transparent via-white/20 to-transparent"
              whileHover={{ x: ["-200%", "200%"] }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
            {/* <Icon icon="solar:square-arrow-right-up-bold" className="size-3.5" /> */}
            Open Preview
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
