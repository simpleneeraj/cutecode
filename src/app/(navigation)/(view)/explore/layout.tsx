import { Metadata } from "next";
import View from "@/components/view";
import Navigations from "../../components/navigation";
import { PreviewSnippetHeader } from "../preview/components/preview-snippet-header";

export const metadata: Metadata = {
  title: "Explore | CuteCode",
  description: "Browse beautiful code screenshots created by the CuteCode community.",
};

const ExploreLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <View className="layout-fill relative flex-1 bg-accent dark:bg-black">
      <PreviewSnippetHeader title="Explore">
        <Navigations />
      </PreviewSnippetHeader>
      {children}
    </View>
  );
};

export default ExploreLayout;
