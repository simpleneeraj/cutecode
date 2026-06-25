import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Eye, Copy, CheckCircle } from "@solar-icons/react";

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
          <Eye weight="BoldDuotone" className="size-3.5" aria-hidden="true" />
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
            <CheckCircle weight="BoldDuotone" className="size-3.5" aria-hidden="true" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <Copy weight="LineDuotone" className="size-3.5" aria-hidden="true" />
            <span>Copy</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default SnippetInfo;
