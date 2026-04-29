import { Kbds } from "@/components/kbd";
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
import { Kbd } from "@/components/ui/kbd";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LinkIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { OTPField, OTPFieldInput } from "@/components/ui/otp-field";
import { Loader2 } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import { dispatchPublishSnippetAtom, publishSnippetAtom } from "./store";
import { Visibility } from "./types";
import { AnimatePresence, motion } from "motion/react";
import { usePublish } from "@/hooks/usePublish";
import {
  currentElementIdAtom,
  currentSlideIdAtom,
  editorStateAtom,
  fileNameAtom,
  windowWidthAtom,
} from "../../store/editor";
import { derivedFlashMessageAtom } from "../../store/flash";
import { useAuth } from "@clerk/nextjs";
import React, { useState } from "react";
import SuccessDialog from "./success-dialog";

const OTP_LENGTH = 6;
const OTP_SLOTS = Array.from({ length: OTP_LENGTH }, (_, i) => `otp-slot-${i}`);

const PublishSnippet: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const { description, visibility, passcode, isSuccessOpen, publishedUrl } = useAtomValue(publishSnippetAtom);

  const dispatch = useSetAtom(dispatchPublishSnippetAtom);
  const setFlashMessage = useSetAtom(derivedFlashMessageAtom);

  const slideId = useAtomValue(currentSlideIdAtom);
  const elementId = useAtomValue(currentElementIdAtom);
  const editorState = useAtomValue(editorStateAtom);
  const windowWidth = useAtomValue(windowWidthAtom);
  const fileName = useAtomValue(fileNameAtom);

  const { isSignedIn } = useAuth();
  const { publish } = usePublish();

  const publishSnippet = async () => {
    if (!isSignedIn) {
      setFlashMessage({ message: "Please sign in to publish.", timeout: 3000 });
      return;
    }

    if (!slideId || !elementId) {
      setFlashMessage({ message: "No element selected to publish.", timeout: 3000 });
      return;
    }

    if (!editorState) {
      setFlashMessage({ message: "Editor is still loading, please try again.", timeout: 3000 });
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
        title: fileName || undefined,
        description: description || undefined,
        visibility,
        passcode: visibility === Visibility.PASSCODE ? passcode : undefined,
      });

      const url = `${window.location.origin}/preview/${slug}`;
      dispatch({ publishedUrl: url, isSuccessOpen: true });
      await navigator.clipboard.writeText(url).catch(() => {});
      // setOpen(false);
    } catch {
      setFlashMessage({ message: "Failed to publish snippet.", timeout: 3000 });
    } finally {
      setIsPending(false);
    }
  };

  const isPublishDisabled = isPending || (visibility === Visibility.PASSCODE && passcode.length < OTP_LENGTH);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" />} onPointerDown={(e) => e.stopPropagation()}>
        <HugeiconsIcon icon={LinkIcon} />
        Publish Snippet
        <Kbds>
          <Kbd>⌘</Kbd>
          <Kbd>⇧</Kbd>
          <Kbd>C</Kbd>
        </Kbds>
      </DialogTrigger>

      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Publish Snippet</DialogTitle>
          <DialogDescription>
            Share your snippet with the world, restrict it to those with a passcode, or keep it private for personal
            reference.
          </DialogDescription>
        </DialogHeader>

        <DialogPanel className="flex flex-col gap-4">
          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              placeholder="Briefly describe what this snippet does, the problem it solves, or any usage notes…"
              value={description}
              onChange={(e) => dispatch({ description: e.target.value })}
              rows={3}
            />
          </Field>

          <Field>
            <FieldLabel>Visibility</FieldLabel>
            <Select value={visibility} onValueChange={(v) => v && dispatch({ visibility: v as Visibility })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectPopup>
                <SelectItem value={Visibility.PUBLIC}>Public — anyone with the link can view</SelectItem>
                <SelectItem value={Visibility.PASSCODE}>Passcode Protected — viewers must enter a code</SelectItem>
                <SelectItem value={Visibility.PRIVATE}>Private — only visible to you</SelectItem>
              </SelectPopup>
            </Select>
          </Field>

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
                <Field className="items-center border p-8 rounded-lg bg-accent">
                  <FieldLabel>Passcode</FieldLabel>
                  <OTPField
                    size="lg"
                    value={passcode}
                    length={OTP_LENGTH}
                    aria-label="6-digit passcode to protect your snippet"
                    onValueChange={(passcode) => dispatch({ passcode })}
                  >
                    {OTP_SLOTS.map((key, i) => (
                      <OTPFieldInput key={key} aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`} />
                    ))}
                  </OTPField>
                  <p className="text-xs text-muted-foreground mt-1">
                    Share this passcode with anyone you want to give access to.
                  </p>
                </Field>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogPanel>

        <DialogFooter>
          <DialogClose render={<Button className="flex-1" variant="outline" disabled={isPending} />}>
            Cancel
          </DialogClose>
          <Button className="flex-1" onClick={publishSnippet} disabled={isPublishDisabled}>
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Publishing…
              </>
            ) : (
              "Publish"
            )}
          </Button>
          <SuccessDialog
            isSuccessOpen={isSuccessOpen}
            setIsSuccessOpen={(open) => dispatch({ isSuccessOpen: open })}
            publishedUrl={publishedUrl ?? undefined}
          />
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
};

export default PublishSnippet;
