import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function DashboardEmptyState() {
  return (
    <Card className="flex flex-col items-center gap-4 px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon icon="solar:code-square-bold" className="size-6" />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-foreground">No snippets yet</h2>
        <p className="max-w-xs text-sm text-muted-foreground">
          Publish a snippet from the editor and its analytics will show up here.
        </p>
      </div>
      <Button render={<Link href="/" />}>
        <Icon icon="solar:add-square-linear" className="size-4" />
        Create a snippet
      </Button>
    </Card>
  );
}
