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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectItem, SelectPopup, SelectTrigger } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { OTPField, OTPFieldInput } from "@/components/ui/otp-field";
import { Loader2, X } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import { dispatchPublishSnippetAtom, publishSnippetAtom } from "./store";
import { Visibility } from "./types";
import { AnimatePresence, motion } from "motion/react";
import { usePublish } from "@/hooks/use-publish";
import {
  currentElementIdAtom,
  currentSlideIdAtom,
  editorStateAtom,
  fileNameAtom,
  windowWidthAtom,
} from "@/store/editor/editor";
import { toast } from "@/components/toast";
import { useAuth } from "@clerk/nextjs";
import React, { useState } from "react";
import SuccessDialog from "./success-dialog";
import { Icon } from "@iconify/react";
import { usePremiumAccess } from "@/hooks/use-premium-access";
import { AccessLevel } from "@/typings/enums";
import { cn } from "@/utils/cn";
import PremiumBadge from "@/app/(navigation)/(view)/preview/components/premium-badge";
import { trackSnippet } from "@/lib/analytics";

const OTP_LENGTH = 6;
const OTP_SLOTS = Array.from({ length: OTP_LENGTH }, (_, i) => `otp-slot-${i}`);

const visibilityConfig = {
  [Visibility.PUBLIC]: {
    icon: "solar:global-bold",
    label: "Public",
    sub: "Anyone with the link can view",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  [Visibility.PASSCODE]: {
    icon: "solar:lock-password-bold",
    label: "Passcode Protected",
    sub: "Viewers must enter a code",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  [Visibility.PRIVATE]: {
    icon: "solar:shield-keyhole-minimalistic-bold",
    label: "Private",
    sub: "Only visible to you",
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
};

const PublishSnippet: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const { title, tags, description, visibility, passcode, isSuccessOpen, publishedUrl } =
    useAtomValue(publishSnippetAtom);

  const dispatch = useSetAtom(dispatchPublishSnippetAtom);

  const slideId = useAtomValue(currentSlideIdAtom);
  const elementId = useAtomValue(currentElementIdAtom);
  const editorState = useAtomValue(editorStateAtom);
  const windowWidth = useAtomValue(windowWidthAtom);
  const fileName = useAtomValue(fileNameAtom);

  const { isSignedIn } = useAuth();
  const { publish } = usePublish();
  const { checkAccess, withAccess } = usePremiumAccess();

  const access = checkAccess(true);
  const isLocked = access !== AccessLevel.ALLOWED;

  const onTriggerClick = () => {
    if (isLocked) {
      withAccess(access, () => {});
      return;
    }
    trackSnippet.publishDialogOpened();
    setOpen(true);
  };

  const publishSnippet = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to publish.");
      return;
    }
    if (!slideId || !elementId) {
      toast.error("No element selected to publish.");
      return;
    }
    if (!editorState) {
      toast.error("Editor is still loading, please try again.");
      return;
    }

    setIsPending(true);
    try {
      const { slug } = await publish({
        name: fileName || "Untitled Presentation",
        width: windowWidth || 680,
        slides: editorState.slides,
        elements: editorState.elements,
        slideElements: editorState.slideElements,
        elementId,
        title: title || fileName || undefined,
        description: description || undefined,
        tags,
        visibility,
        passcode: visibility === Visibility.PASSCODE ? passcode : undefined,
      });

      const url = `${window.location.origin}/preview/${slug}`;
      dispatch({ publishedUrl: url, isSuccessOpen: true });
      await navigator.clipboard.writeText(url).catch(() => {});
      trackSnippet.published(visibility, Boolean(description?.trim()));
    } catch {
      toast.error("Failed to publish snippet.");
    } finally {
      setIsPending(false);
    }
  };

  const isPublishDisabled = isPending || (visibility === Visibility.PASSCODE && passcode.length < OTP_LENGTH);

  const currentVisibility = visibilityConfig[visibility];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Trigger */}
      <DialogTrigger
        render={<Button variant="ghost" className="justify-between w-full text-sm" />}
        onClick={onTriggerClick}
      >
        <span className="flex items-center gap-2">
          <Icon icon="solar:share-bold" className="size-4" />
          Publish snippet
        </span>
        <PremiumBadge />
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
            Publish Snippet
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Share your snippet publicly, protect it with a passcode, or keep it private.
          </DialogDescription>
        </DialogHeader>

        <DialogPanel className="flex flex-col gap-4 px-5">
          {/* Title */}
          <Field>
            <FieldLabel className="text-xs text-muted-foreground">Title</FieldLabel>
            <Input
              placeholder={fileName || "Untitled Snippet"}
              value={title}
              onChange={(e) => dispatch({ title: e.target.value })}
              className="text-sm"
            />
          </Field>

          {/* Description */}
          <Field>
            <FieldLabel className="text-xs text-muted-foreground">Description</FieldLabel>
            <Textarea
              placeholder="What does this snippet do? Any usage notes…"
              value={description}
              onChange={(e) => dispatch({ description: e.target.value })}
              rows={3}
              className="resize-none text-sm"
            />
          </Field>

          {/* Tags */}
          <Field>
            <FieldLabel className="text-xs text-muted-foreground">Tags</FieldLabel>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-md"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => dispatch({ tags: tags.filter((t) => t !== tag) })}
                      className="hover:text-destructive focus:outline-none"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
              <Input
                placeholder="Add tags (press Enter or comma)"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    const val = e.currentTarget.value.trim();
                    if (val && !tags.includes(val) && tags.length < 10) {
                      dispatch({ tags: [...tags, val] });
                      e.currentTarget.value = "";
                    }
                  }
                }}
                className="text-sm"
              />
            </div>
          </Field>

          {/* Visibility */}
          <Field>
            <FieldLabel className="text-xs text-muted-foreground">Visibility</FieldLabel>
            <Select value={visibility} onValueChange={(v) => v && dispatch({ visibility: v as Visibility })}>
              <SelectTrigger>
                <span className="flex items-center gap-2">
                  <span className={cn("flex size-5 items-center justify-center rounded-md", currentVisibility.bg)}>
                    <Icon icon={currentVisibility.icon} className={cn("size-3", currentVisibility.color)} />
                  </span>
                  {currentVisibility.label}
                </span>
              </SelectTrigger>
              <SelectPopup>
                {Object.entries(visibilityConfig).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    <span className="flex items-center gap-2.5">
                      <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-md", config.bg)}>
                        <Icon icon={config.icon} className={cn("size-3.5", config.color)} />
                      </span>
                      <span className="flex flex-col">
                        <span className="text-sm font-medium leading-none">{config.label}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">{config.sub}</span>
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectPopup>
            </Select>
          </Field>

          {/* Passcode field */}
          <AnimatePresence>
            {visibility === Visibility.PASSCODE && (
              <motion.div
                key="passcode-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                style={{ overflow: "hidden" }}
              >
                <Field className="items-center border border-amber-500/20 bg-amber-500/5 p-6 rounded-xl">
                  <FieldLabel className="text-xs text-amber-600 dark:text-amber-400">Set a 6-digit passcode</FieldLabel>
                  <OTPField
                    size="lg"
                    value={passcode}
                    length={OTP_LENGTH}
                    aria-label="6-digit passcode"
                    onValueChange={(passcode) => dispatch({ passcode })}
                  >
                    {OTP_SLOTS.map((key, i) => (
                      <OTPFieldInput key={key} aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`} />
                    ))}
                  </OTPField>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Share this code with anyone you want to grant access.
                  </p>
                </Field>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogPanel>

        <DialogFooter className="px-5 pb-5 pt-3 gap-2">
          <DialogClose render={<Button className="flex-1" variant="outline" disabled={isPending} />}>
            Cancel
          </DialogClose>
          <Button
            className="flex-1 relative overflow-hidden bg-linear-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-md shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400"
            onClick={publishSnippet}
            disabled={isPublishDisabled}
          >
            <motion.span
              className="absolute inset-0 translate-x-[-200%] bg-linear-to-r from-transparent via-white/20 to-transparent"
              whileHover={{ x: ["-200%", "200%"] }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-3.5 animate-spin" />
                Publishing…
              </span>
            ) : (
              <span className="flex items-center gap-2">Publish</span>
            )}
          </Button>
        </DialogFooter>

        <SuccessDialog
          isSuccessOpen={isSuccessOpen}
          setIsSuccessOpen={(open) => dispatch({ isSuccessOpen: open })}
          publishedUrl={publishedUrl ?? undefined}
        />
      </DialogPopup>
    </Dialog>
  );
};

export default PublishSnippet;
