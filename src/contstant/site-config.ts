import { BadgeVariant } from "@/typings/editor";

const siteConfig = {
  name: "CuteCode",
  version: "1.0.0",
  tabs: [
    { label: "Create", value: "Create", href: "/", tags: [] },
    { label: "Snippets", value: "Snippets", href: "/snippets", tags: [BadgeVariant.PREMIUM] },
    { label: "Explore", value: "Explore", href: "/explore", tags: [BadgeVariant.PREMIUM] } as const,
  ],
};

export default siteConfig;
