import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useUser() {
  const supabase = createClient();
  const { data, error, isLoading } = useSWR(
    "supabase-user",
    async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const user = data
    ? {
        id: data.id,
        fullName: data.user_metadata?.full_name || data.user_metadata?.name || "User",
        username: data.user_metadata?.username || data.email?.split("@")[0] || "user",
        primaryEmailAddress: {
          emailAddress: data.email || "",
        },
        imageUrl:
          data.user_metadata?.avatar_url ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            data.user_metadata?.full_name || data.email || "user"
          )}`,
        publicMetadata: {
          plan: data.app_metadata?.plan || "FREE",
          role: data.app_metadata?.role || "USER",
          subscriptionStatus: data.app_metadata?.subscriptionStatus || "active",
          gracePeriodEnd: data.app_metadata?.gracePeriodEnd || null,
        },
      }
    : null;

  return {
    user,
    isSignedIn: !!user,
    isLoaded: !isLoading,
  };
}

export function useClerk() {
  const supabase = createClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const openUserProfile = () => {
    toast.info("Account details are managed through your profile settings.");
  };

  return {
    signOut,
    openUserProfile,
  };
}
