import { AlertTriangle } from "lucide-react";
import { usePublicSettings } from "@/hooks/use-public-settings";

export function PreorderBanner() {
  const { data: settings } = usePublicSettings();

  if (!settings?.preorderMode) return null;

  const message = (settings.preorderMessage || "⚠️ PREORDER — Ships in {timeframe}")
    .replace("{timeframe}", settings.preorderTimeframe || "4-6 weeks");

  return (
    <div
      className="w-full bg-amber-400 text-black flex items-center justify-center gap-3 px-4 py-3 font-bold text-sm tracking-wide"
      data-testid="banner-preorder"
    >
      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}
