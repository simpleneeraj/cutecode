"use client";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="top-center"
      gap={8}
      toastOptions={{
        classNames: {
          toast: [
            "group toast",
            "!bg-[#1a1a1a] !border-[#2e2e2e]",
            "!text-[#e8e8e8] !text-[13px] !font-medium",
            "!rounded-xl !shadow-xl",
            "!py-3 !px-4",
          ].join(" "),
          title: "!font-medium !text-[#e8e8e8]",
          description: "!text-[#888] !text-xs !mt-0.5",
          icon: "!text-[#a0a0a0]",
          actionButton: [
            "!bg-[#ffffff10] !text-[#e8e8e8]",
            "!text-xs !font-medium !rounded-lg",
            "!px-3 !py-1.5 hover:!bg-[#ffffff18]",
          ].join(" "),
          cancelButton: [
            "!bg-transparent !text-[#666]",
            "!text-xs hover:!text-[#999]",
          ].join(" "),
          success: "!border-[#1a3a2a] [&>[data-icon]]:!text-emerald-400",
          error: "!border-[#3a1a1a] [&>[data-icon]]:!text-red-400",
          warning: "!border-[#3a2e1a] [&>[data-icon]]:!text-amber-400",
          info: "!border-[#1a2a3a] [&>[data-icon]]:!text-blue-400",
          loading: "[&>[data-icon]]:!text-[#888]",
          closeButton: [
            "!bg-[#222] !border-[#333] !text-[#888]",
            "hover:!bg-[#2a2a2a] hover:!text-[#ccc]",
            "!rounded-lg",
          ].join(" "),
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
