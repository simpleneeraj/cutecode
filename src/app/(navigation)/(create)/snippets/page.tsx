import { Metadata } from "next";
import { cn } from "@/utils/cn";
import { CodeIcon } from "lucide-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export const metadata: Metadata = {
  title: "My Snippets — Save & Share Code Screenshots",
  description:
    "Save, manage, and share your code screenshots in one place. Access your CuteCode snippets any time, from any device.",
};

export default function SnippetsPage() {
  return (
    <div className={cn("h-screen flex flex-col")}>
      <main className="layout-fill">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CodeIcon />
            </EmptyMedia>
            <EmptyTitle>Working on it</EmptyTitle>
            <EmptyDescription>Snippets are coming soon. Check back later!</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {/* <Button>
              <PlusIcon />
              New Snippet
            </Button> */}
          </EmptyContent>
        </Empty>
      </main>
    </div>
  );
}
