import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Eye, Copy, Check, ChartSplineIcon } from "lucide-react";

type SnippetInfoProps = {
  language: string | null;
  viewCount: number;
  copied: boolean;
  onCopy: () => void;
};
const SnippetInfo = ({ language, viewCount, copied, onCopy }: SnippetInfoProps) => {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-muted/40 border-b border-border">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 text-xxs text-muted-foreground">
          <ChartSplineIcon className="size-3.5" />
          <span className="tabular-nums">{viewCount}</span>
        </span>
        <Separator orientation="vertical" />{" "}
        {language && (
          <Badge variant="secondary" className="text-xxs font-mono">
            {language}
          </Badge>
        )}
      </div>
      <Button size="sm" variant="ghost" onClick={onCopy} aria-label={copied ? "Copied!" : "Copy code"}>
        {copied ? (
          <>
            <Check className="size-3.5 text-green-500" />
            <span className="text-green-500">Copied</span>
          </>
        ) : (
          <>
            <Copy className="size-3.5" />
            <span>Copy</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default SnippetInfo;
