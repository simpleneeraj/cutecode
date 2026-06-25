"use client";

import { cn } from "@/utils/cn";
import { Icon } from "@/components/ui/icon";
import siteConfig from "@/contstant/site-config";
import { BadgeVariant } from "@/typings/editor";
import { trackNavigation } from "@/lib/analytics";
import { usePathname, useRouter } from "next/navigation";
import { useSubscription } from "@/hooks/use-subscription";
import { usePremiumAccess } from "@/hooks/use-premium-access";
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs";

type Tab = (typeof siteConfig.tabs)[0];

export default function Navigations() {
  const router = useRouter();
  const pathname = usePathname();

  // const { isPro } = useSubscription();
  // const { checkAccess, withAccess } = usePremiumAccess();

  const onValueChange = (href: string) => {
    // const isPremium = tab?.tags?.includes(BadgeVariant.PREMIUM) ?? false;
    // const access = checkAccess(isPremium);
    router.push(href);
    // withAccess(access, () => {
    // trackNavigation.tabChanged(href as any);
    // });
  };

  return (
    <Tabs value={pathname} onValueChange={onValueChange}>
      <TabsList>
        {siteConfig.tabs.map((tab) => (
          <TabsTab key={tab.value} value={tab.href}>
            {tab.label}
            {/* {tab?.tags?.includes(BadgeVariant.PREMIUM) && (
              <Icon
                icon="solar:crown-star-bold"
                className={cn("size-3 text-amber-400", isPro ? "text-primary" : "text-amber-400")}
              />
            )} */}
          </TabsTab>
        ))}
      </TabsList>
    </Tabs>
  );
}
