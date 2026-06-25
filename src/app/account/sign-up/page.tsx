"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icon } from "@/components/ui/icon";
import { SocialAuthButtons } from "../components/social-auth-buttons";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom") || "/";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [step, setStep] = useState<"form" | "sent">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const username = email.split("@")[0];
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName.trim(), name: fullName.trim(), username },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectedFrom)}`,
        },
      });

      if (signUpError) {
        setError(signUpError.message || "Something went wrong. Please try again.");
        return;
      }

      // Session present → confirmations disabled, sign straight in.
      if (data.session) {
        router.push(redirectedFrom);
        router.refresh();
      } else {
        setStep("sent");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    setResendSuccess(false);
    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({ type: "signup", email });
      if (resendError) setError(resendError.message || "Failed to resend the email.");
      else setResendSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend the email.");
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
                We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>. Click it to
                finish creating your account.
              </p>
            </div>

            {error && (
              <Alert variant="error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {resendSuccess && (
              <Alert variant="success">
                <AlertDescription>Confirmation email resent.</AlertDescription>
              </Alert>
            )}

            <button
              type="button"
              onClick={handleResend}
              className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Didn&apos;t get it? Resend email
            </button>
          </div>
        ) : (
          <>
            <div className="mb-7 flex flex-col gap-1 text-center">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">Create your account</h1>
              <p className="text-sm text-muted-foreground">Start creating beautiful code screenshots</p>
            </div>

            <SocialAuthButtons disabled={isLoading} redirectedFrom={redirectedFrom} onError={(m) => setError(m || null)} />

            {error && (
              <Alert variant="error" className="mb-5">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Field name="fullName">
                <FieldLabel>Full name</FieldLabel>
                <Input
                  type="text"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  disabled={isLoading}
                />
                <FieldError match="valueMissing">Please enter your name.</FieldError>
              </Field>

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
                />
                <FieldError match="valueMissing">Please enter your email address.</FieldError>
              </Field>

              <Field name="password">
                <FieldLabel>Password</FieldLabel>
                <Input
                  type="password"
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <FieldError match="valueMissing">Please create a password.</FieldError>
                <FieldError match="tooShort">Password must be at least 8 characters.</FieldError>
                <FieldDescription>Use at least 8 characters.</FieldDescription>
              </Field>

              <Button type="submit" size="lg" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Spinner />
                    Creating account…
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </>
        )}
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/account/sign-in" className="font-medium text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
