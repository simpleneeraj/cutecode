import View from "@/components/view";
import BlackHoleLoader from "@/components/loader/black-hole";

export default function Loading() {
  return (
    <View className="layout-fill flex items-center justify-center">
      <BlackHoleLoader />
    </View>
  );
}
