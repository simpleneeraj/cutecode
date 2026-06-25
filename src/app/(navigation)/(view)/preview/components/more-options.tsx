"use client";

import { Button } from "@/components/ui/button";
import {
  BanIcon,
  CodeIcon,
  Edit,
  EyeOffIcon,
  GlobeIcon,
  LockIcon,
  PinIcon,
  TrashIcon,
  TriangleAlertIcon,
  EllipsisVerticalIcon,
  ThumbsDownIcon,
} from "lucide-react";
import { Menu, MenuItem, MenuPopup, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import React, { useState } from "react";
import { EmbedDialog } from "./embed-dialog";
import { toast } from "sonner";

type Visibility = "public" | "private" | "unlisted";

type MoreOptionsProps = {
  slug: string;
  currentUserId?: string;
  authorId?: string;
  visibility?: Visibility;
  onEdit?: () => void;
  onDelete?: () => void;
  onVisibilityChange?: (v: Visibility) => void;
  onPin?: () => void;
  onReport?: () => void;
  onBlock?: () => void;
  onNotInterested?: () => void;
};

const VISIBILITY_CYCLE: Record<Visibility, { next: Visibility; label: string; icon: React.ReactNode }> = {
  public: {
    next: "unlisted",
    label: "Make Unlisted",
    icon: <EyeOffIcon className="size-4" aria-hidden />,
  },
  unlisted: {
    next: "private",
    label: "Make Private",
    icon: <LockIcon className="size-4" aria-hidden />,
  },
  private: {
    next: "public",
    label: "Make Public",
    icon: <GlobeIcon className="size-4" aria-hidden />,
  },
};

const testFun = () => {
  console.log("testFun");
  toast.message("Feature coming soon!", { id: "testFun" });
};
export default function MoreOptions({
  slug,
  currentUserId,
  authorId,
  visibility = "public",
  onEdit = () => testFun(),
  onDelete = () => testFun(),
  onVisibilityChange = () => testFun(),
  onPin = () => testFun(),
  onReport = () => testFun(),
  onBlock = () => testFun(),
  onNotInterested = () => testFun(),
}: MoreOptionsProps) {
  const [embedOpen, setEmbedOpen] = useState(false);

  const isOwner = !!currentUserId && currentUserId === authorId;
  const vis = VISIBILITY_CYCLE[visibility];

  return (
    <React.Fragment>
      <Menu>
        <MenuTrigger render={<Button variant="outline" size="sm" aria-label="More options" />}>
          <EllipsisVerticalIcon className="size-4" aria-hidden />
        </MenuTrigger>

        <MenuPopup align="end">
          {isOwner ? (
            <>
              <MenuItem onClick={onEdit}>
                <Edit className="size-4" aria-hidden />
                Edit Snippet
              </MenuItem>

              <MenuItem onClick={() => onVisibilityChange?.(vis.next)}>
                {vis.icon}
                {vis.label}
              </MenuItem>

              <MenuItem onClick={onPin}>
                <PinIcon className="size-4" aria-hidden />
                Pin to Profile
              </MenuItem>

              <MenuSeparator />

              <MenuItem onClick={() => setEmbedOpen(true)}>
                <CodeIcon className="size-4" aria-hidden />
                Embed Snippet
              </MenuItem>
              <MenuSeparator />

              <MenuItem onClick={onDelete} className={"text-destructive focus:text-destructive"}>
                <TrashIcon className="size-4" aria-hidden />
                Delete Snippet
              </MenuItem>
            </>
          ) : (
            <>
              {/* ── Viewer actions ── */}
              <MenuItem onClick={() => setEmbedOpen(true)}>
                <CodeIcon className="size-4" aria-hidden />
                Embed Snippet
              </MenuItem>

              <MenuSeparator />

              <MenuItem onClick={onNotInterested}>
                <ThumbsDownIcon className="size-4" aria-hidden />
                Not Interested
              </MenuItem>

              <MenuItem onClick={onReport}>
                <TriangleAlertIcon className="size-4" aria-hidden />
                Report
              </MenuItem>

              <MenuItem onClick={onBlock} className="text-destructive focus:text-destructive">
                <BanIcon className="size-4" aria-hidden />
                Block User
              </MenuItem>
            </>
          )}
        </MenuPopup>
      </Menu>

      <EmbedDialog slug={slug} open={embedOpen} onOpenChange={setEmbedOpen} />
    </React.Fragment>
  );
}
