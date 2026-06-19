import { Metadata } from "next";
import View from "@/components/view";
import Navigations from "../../components/navigation";
import { PreviewSnippetHeader } from "../preview/components/preview-snippet-header";

export const metadata: Metadata = {
  title: "Preview | CuteCode",
  description: "Preview your elegant code snippets on CuteCode.",
};

const SnippetsLayout = async ({ children }: React.PropsWithChildren) => {
  return (
    <View className="layout-fill relative flex-1 bg-accent dark:bg-black">
      <PreviewSnippetHeader title="Snippets">
        <Navigations />
      </PreviewSnippetHeader>
      {children}
    </View>
  );
};

export default SnippetsLayout;
