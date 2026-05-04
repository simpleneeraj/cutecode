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
import { useSetAtom } from "jotai";
import { CheckIcon, ClipboardIcon, ExternalLinkIcon } from "lucide-react";
import { derivedFlashMessageAtom } from "@/store/editor/flash";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function SuccessDialog({
  isSuccessOpen,
  setIsSuccessOpen,
  publishedUrl,
}: {
  isSuccessOpen: boolean;
  setIsSuccessOpen: (open: boolean) => void;
  publishedUrl?: string;
}) {
  const setFlashMessage = useSetAtom(derivedFlashMessageAtom);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(publishedUrl ?? "").catch(() => {});
    setCopied(true);
    setFlashMessage({ icon: <ClipboardIcon />, message: "Copied!", timeout: 1500 });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
      <DialogPopup className="sm:max-w-sm" showCloseButton={false}>
        <DialogHeader className="items-center text-center gap-3">
          {/* Animated checkmark */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
            >
              <CheckIcon className="w-7 h-7 text-green-600 dark:text-green-400 stroke-[2.5]" />
            </motion.div>
          </motion.div>

          <div className="space-y-1">
            <DialogTitle>Snippet Published!</DialogTitle>
            <DialogDescription>Your snippet is live and the link is already in your clipboard.</DialogDescription>
          </div>
        </DialogHeader>

        <DialogPanel>
          {/* URL row */}
          <div className="flex items-center gap-1.5 rounded-lg border bg-muted/60 pl-3 pr-1 py-1 group">
            <span className="flex-1 truncate font-mono text-xs text-muted-foreground select-all">{publishedUrl}</span>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 h-7 w-7 p-0 rounded-md"
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
                    <CheckIcon className="size-3.5 text-green-500" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="clipboard"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ClipboardIcon className="size-3.5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </DialogPanel>

        <DialogFooter className="flex gap-2">
          <DialogClose render={<Button variant="outline" className="flex-1" />}>Close</DialogClose>
          <Button
            className="flex-1 gap-1.5"
            onClick={() => {
              window.open(publishedUrl ?? "", "_blank");
              setIsSuccessOpen(false);
            }}
          >
            Open Preview
            <ExternalLinkIcon className="size-3.5" />
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
