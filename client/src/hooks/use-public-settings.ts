import { useQuery } from "@tanstack/react-query";

export type MusicSettings = {
  enabled: boolean;
  youtubeUrl: string;
  loop: boolean;
  volume: number;
};

export type PublicSettings = {
  preorderMode: boolean;
  preorderTimeframe: string;
  preorderMessage: string;
  galleryImages: string[];
  newArrivalsIds: string[];
  collectionImage: string;
  collectionHeading: string;
  music: MusicSettings;
};

export function usePublicSettings() {
  return useQuery<PublicSettings>({
    queryKey: ["/api/settings/public"],
    staleTime: 30_000,
  });
}
