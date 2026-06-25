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
import { Spinner } from "@/components/ui/spinner";
import { Share, CloseCircle } from "@solar-icons/react";
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
import { useUser } from "@/hooks/use-auth";
import { getShareUrl } from "@/lib/share/urls";
import React, { useState } from "react";
import SuccessDialog from "./success-dialog";
import { Icon } from "@/components/ui/icon";
import { useSubscription } from "@/hooks/use-subscription";
import { plansDialogOpenAtom } from "@/store/editor/plans";
import { FREE_DAILY_PUBLISH_LIMIT } from "@/lib/billing/constants";
import { cn } from "@/utils/cn";
import { trackSnippet } from "@/lib/analytics";

const OTP_LENGTH = 6;
const OTP_SLOTS = Array.from({ length: OTP_LENGTH }, (_, i) => `otp-slot-${i}`);

const visibilityConfig = {
  [Visibility.PUBLIC]: {
    icon: "solar:global-bold-duotone",
    label: "Public",
    sub: "Anyone with the link can view",
    color: "text-foreground",
    bg: "bg-muted",
  },
  [Visibility.PASSCODE]: {
    icon: "solar:lock-password-bold-duotone",
    label: "Passcode Protected",
    sub: "Viewers must enter a code",
    color: "text-foreground",
    bg: "bg-muted",
  },
  [Visibility.PRIVATE]: {
    icon: "solar:shield-keyhole-minimalistic-bold-duotone",
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

  const { isSignedIn, isLoaded } = useUser();
  const { publish } = usePublish();
  const { isPro } = useSubscription();
  const setPlansOpen = useSetAtom(plansDialogOpenAtom);

  const onTriggerClick = () => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setPlansOpen(true);
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

      const url = getShareUrl(slug);
      dispatch({ publishedUrl: url, isSuccessOpen: true });
      await navigator.clipboard.writeText(url).catch(() => {});
      trackSnippet.published(visibility, Boolean(description?.trim()));
    } catch (err: unknown) {
      const message = (err as Error)?.message ?? "";
      if (message.includes("Daily publish limit")) {
        setOpen(false);
        setPlansOpen(true);
        toast.error(message);
      } else {
        toast.error("Failed to publish snippet.");
      }
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
          <Share weight="BoldDuotone" className="size-4" aria-hidden="true" />
          Publish snippet
        </span>
        {!isPro && isSignedIn && (
          <span className="text-xs text-muted-foreground">{FREE_DAILY_PUBLISH_LIMIT}/day</span>
        )}
      </DialogTrigger>

      <DialogPopup className="sm:max-w-md overflow-hidden rounded-2xl p-0">
        <DialogHeader className="relative px-5 pt-5 pb-4">
          <DialogTitle className="flex items-center gap-2.5 text-base">
            <span className="flex size-8 items-center justify-center rounded-xl bg-foreground text-background">
              <Share weight="BoldDuotone" className="size-4" aria-hidden="true" />
            </span>
            Publish Snippet
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-muted-foreground">
            Share your snippet publicly, protect it with a passcode, or keep it private.
            {!isPro && (
              <span className="mt-1 block text-muted-foreground">
                Free plan: {FREE_DAILY_PUBLISH_LIMIT} new publishes/day. Upgrade to Pro for unlimited.
              </span>
            )}
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
                      <CloseCircle weight="LineDuotone" className="size-3" aria-hidden="true" />
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
                <Field className="items-center rounded-xl border border-border bg-muted/50 p-6">
                  <FieldLabel className="text-xs text-muted-foreground">Set a 6-digit passcode</FieldLabel>
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
          <Button className="flex-1" onClick={publishSnippet} disabled={isPublishDisabled}>
            {isPending ? (
              <>
                <Spinner />
                Publishing…
              </>
            ) : (
              "Publish"
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
