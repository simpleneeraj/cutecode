import { Metadata } from "next";
import View from "@/components/view";
import { PreviewSnippetHeader } from "../preview/components/preview-snippet-header";

export const metadata: Metadata = {
  title: "Preview | CuteCode",
  description: "Preview your elegant code snippets on CuteCode.",
};

const PreviewSnippetLayout = async ({ children }: React.PropsWithChildren) => {
  return (
    <View className="layout-fill relative flex-1 bg-transparent">
      <PreviewSnippetHeader title="Preview" />
      {children}
    </View>
  );
};

export default PreviewSnippetLayout;
