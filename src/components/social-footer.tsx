import { BrandGithubIcon, BrandSlackIcon, BrandXIcon, BrandYoutubeIcon, RaycastLogoNegIcon } from "@raycast/icons";
import Link from "next/link";

const socialLinks = [
  {
    href: "https://github.com/simpleneeraj/cutecode",
    label: "GitHub",
    icon: BrandGithubIcon,
  },
  {
    href: "https://x.com/cutecode",
    label: "X",
    icon: BrandXIcon,
  },
  {
    href: "https://raycast.com/community",
    label: "Slack Community",
    icon: BrandSlackIcon,
  },
];

export function SocialFooter({ referral = "ray-so" }: { referral?: string }) {
  return (
    <div className="flex items-center gap-2 justify-between">
      <div className="flex flex-wrap items-center gap-4">
        <a href={`https://raycast.com/#ref=ray-so-${referral}`} className="flex items-center gap-1.5 text-gray-12 group">
          <RaycastLogoNegIcon className="w-4 h-4" />
          <span className="text-[13px] font-medium group-hover:underline">Forked from Raycast</span>
        </a>
        <Link href="/terms" className="text-[13px] font-medium text-gray-11 hover:underline">
          Terms & Conditions
        </Link>
      </div>
      <div className="flex gap-3">
        {socialLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-9 hover:text-gray-11 transition-colors"
          >
            <link.icon className="w-4 h-4" />
          </a>
        ))}
      </div>
    </div>
  );
}
