import { redirect } from "next/navigation";
import CheckoutSuccessClient from "./page.client";

type Props = {
  searchParams: Promise<{ status?: string; subscription_id?: string; email?: string }>;
};

/**
 * Server component — runs before anything is sent to the browser.
 * If Dodo returns status=failed or status=canceled, redirect immediately
 * to the failure page without ever rendering the success UI.
 */
export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { status } = await searchParams;

  if (status === "failed" || status === "canceled" || status === "cancelled") {
    redirect("/checkout/failure");
  }

  return <CheckoutSuccessClient />;
}
