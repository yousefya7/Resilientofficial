import { useQuery } from "@tanstack/react-query";

export type PublicSettings = {
  preorderMode: boolean;
  preorderTimeframe: string;
  preorderMessage: string;
  galleryImages: string[];
  newArrivalsIds: string[];
};

export function usePublicSettings() {
  return useQuery<PublicSettings>({
    queryKey: ["/api/settings/public"],
    staleTime: 30_000,
  });
}
