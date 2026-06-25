"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icon } from "@/components/ui/icon";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"request" | "sent">("request");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/account/reset-password`,
      });
      if (resetError) {
        setError(resetError.message || "Failed to send the reset link. Please try again.");
        return;
      }
      setStep("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      <Card className="p-8 sm:p-9">
        {step === "sent" ? (
          <div className="flex flex-col items-center gap-5 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-foreground">
              <Icon icon="solar:letter-bold" className="size-6" />
            </span>
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">Check your inbox</h1>
              <p className="text-sm text-muted-foreground">
                If an account exists for <span className="font-medium text-foreground">{email}</span>, we sent a link to
                reset your password.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-7 flex flex-col gap-1 text-center">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">Reset your password</h1>
              <p className="text-sm text-muted-foreground">Enter your email and we&apos;ll send you a reset link</p>
            </div>

            {error && (
              <Alert variant="error" className="mb-5">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSendLink} className="flex flex-col gap-5">
              <Field name="email">
                <FieldLabel>Email address</FieldLabel>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={isLoading}
                  autoFocus
                />
                <FieldError match="valueMissing">Please enter your email address.</FieldError>
              </Field>

              <Button type="submit" size="lg" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Spinner />
                    Sending link…
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          </>
        )}
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          href="/account/sign-in"
          className="inline-flex items-center gap-1.5 font-medium text-foreground hover:underline"
        >
          <Icon icon="solar:arrow-left-linear" className="size-3.5" />
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
