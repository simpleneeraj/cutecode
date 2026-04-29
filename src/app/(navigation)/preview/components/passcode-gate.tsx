"use client";

import { useEffect, useRef } from "react";
import View from "@/components/view";
import { ShieldAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { OTPField, OTPFieldInput, OTPFieldSeparator } from "@/components/ui/otp-field";
import { motion, AnimatePresence } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { LockPasswordIcon } from "@hugeicons/core-free-icons";

const OTP_LENGTH = 6;
const OTP_SLOT_KEYS = Array.from({ length: OTP_LENGTH }, (_, i) => `otp-slot-${i}`);

type PasscodeGateProps = {
  passcode: string;
  invalidPasscode: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function PasscodeGate({ passcode, invalidPasscode, onChange, onSubmit }: PasscodeGateProps) {
  const isComplete = passcode.length === OTP_LENGTH;
  const prevComplete = useRef(false);

  useEffect(() => {
    if (isComplete && !prevComplete.current) onSubmit();
    prevComplete.current = isComplete;
  }, [isComplete, onSubmit]);

  return (
    <View className="layout-fill flex items-center justify-center bg-background/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <Card className="w-full max-w-sm">
          <CardHeader className="items-center text-center">
            <View className="flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                className="flex items-center justify-center w-14 h-14 rounded-2xl bg-muted border mb-2"
              >
                <HugeiconsIcon icon={LockPasswordIcon} />
              </motion.div>
            </View>
            <CardTitle>Passcode Required</CardTitle>
            <CardDescription>
              This snippet is protected. Enter the {OTP_LENGTH}-digit passcode to view it.
            </CardDescription>
          </CardHeader>

          <CardPanel className="flex flex-col items-center gap-4">
            <Field className="items-center">
              <FieldLabel className="sr-only">Passcode</FieldLabel>

              <OTPField
                length={OTP_LENGTH}
                size="lg"
                mask
                value={passcode}
                onValueChange={onChange}
                aria-label="6-digit passcode"
                aria-invalid={invalidPasscode || undefined}
              >
                {OTP_SLOT_KEYS.slice(0, 3).map((key, i) => (
                  <OTPFieldInput
                    key={key}
                    aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
                    aria-invalid={invalidPasscode || undefined}
                    className="placeholder:text-muted-foreground focus-visible:placeholder:text-transparent"
                    placeholder="•"
                  />
                ))}
                <OTPFieldSeparator />
                {OTP_SLOT_KEYS.slice(3).map((key, i) => (
                  <OTPFieldInput
                    key={key}
                    aria-label={`Digit ${i + 4} of ${OTP_LENGTH}`}
                    aria-invalid={invalidPasscode || undefined}
                    className="placeholder:text-muted-foreground focus-visible:placeholder:text-transparent"
                    placeholder="•"
                  />
                ))}
              </OTPField>

              <AnimatePresence mode="wait">
                {invalidPasscode ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1.5 text-destructive text-sm font-medium"
                  >
                    <ShieldAlertIcon className="size-3.5 shrink-0" />
                    Incorrect passcode. Try again.
                  </motion.div>
                ) : (
                  <motion.div
                    key="hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FieldDescription>Auto-submits when all digits are filled.</FieldDescription>
                  </motion.div>
                )}
              </AnimatePresence>
            </Field>

            <Button className="w-full" onClick={onSubmit} disabled={!isComplete}>
              Unlock
            </Button>
          </CardPanel>

          <CardFooter className="justify-center">
            <p className="text-xs text-muted-foreground">Contact the author if you don't have the passcode.</p>
          </CardFooter>
        </Card>
      </motion.div>
    </View>
  );
}
