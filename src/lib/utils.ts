import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Some real image fields restored from prod-sixdoctar are relative paths into the original
 * app's own static assets (e.g. "/icons/user-placeholder.png"), which 404 here since we never
 * had those files — only pass through values that are actual absolute URLs we can load. */
export function usableImageUrl(url?: string): string {
  return url && /^https?:\/\//i.test(url) ? url : "";
}
