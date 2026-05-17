import View from "@/components/view";
import BlackHoleLoader from "@/components/loader/black-hole";

export function PreviewLoading() {
  return (
    <View className="layout-fill flex items-center justify-center">
      <BlackHoleLoader />
    </View>
  );
}
