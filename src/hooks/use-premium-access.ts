import { useSetAtom } from "jotai";
import { AccessLevel } from "@/typings/enums";
import { useUser } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { plansDialogOpenAtom } from "@/store/editor/plans";

function resolveAccess(isPremium: boolean, isSignedIn: boolean, isPro: boolean): AccessLevel {
  if (!isPremium) return AccessLevel.ALLOWED;
  // Not signed in → open plans dialog (it shows "Sign in to upgrade" CTA)
  if (!isSignedIn) return AccessLevel.REQUIRES_AUTH;
  if (!isPro) return AccessLevel.REQUIRES_PRO;
  return AccessLevel.ALLOWED;
}

export function usePremiumAccess() {
  const { isSignedIn, isLoaded } = useUser();
  const setPlansOpen = useSetAtom(plansDialogOpenAtom);
  const { isPro, isLoaded: subLoaded } = useSubscription();

  const isReady = isLoaded && subLoaded;

  /**
   * Checks if the user has access to a feature.
   * @param isPremium - Whether the feature is premium.
   * @returns Access level.
   */
  const checkAccess = (isPremium: boolean): AccessLevel => {
    // While auth is still loading, optimistically allow to prevent flash
    if (!isReady) return AccessLevel.ALLOWED;
    return resolveAccess(isPremium, !!isSignedIn, isPro);
  };

  /**
   * Gates any action behind access
   * @param access - Access level
   * @param onAllowed - Callback to execute if access is allowed
   */
  const withAccess = (access: AccessLevel, onAllowed: () => void) => {
    switch (access) {
      case AccessLevel.ALLOWED:
        onAllowed();
        break;
      // Both auth-required and pro-required → open plans dialog.
      // PlansDialog shows "Sign in to upgrade" when signed out,
      // and "Subscribe now" when signed in but not pro.
      case AccessLevel.REQUIRES_AUTH:
      case AccessLevel.REQUIRES_PRO:
        setPlansOpen(true);
        break;
    }
  };

  return {
    checkAccess,
    withAccess,
  };
}
