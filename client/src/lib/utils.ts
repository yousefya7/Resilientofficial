import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function imgUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("https://res.cloudinary.com/dgawn40ku/")) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}
