"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "./use-subscription";
import { createCustomerPortalAction, createCheckoutAction } from "@/lib/billing/actions";

function useBilling() {
  const router = useRouter();
  const { isPro } = useSubscription();
  const [isLoading, setIsLoading] = React.useState(false);

  async function openPortal() {
    try {
      setIsLoading(true);
      const url = await createCustomerPortalAction();
      window.location.href = url;
    } catch {
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  }

  async function openCheckout(productId: string) {
    try {
      setIsLoading(true);
      const url = await createCheckoutAction(productId);
      window.location.href = url;
    } catch {
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  }

  async function openBilling(productId?: string) {
    if (isPro) {
      await openPortal();
    } else if (productId) {
      await openCheckout(productId);
    } else {
      router.push("/");
    }
  }

  return { openPortal, openCheckout, openBilling, isLoading };
}

export default useBilling;
