import { DeviceType } from "@devcraft/db";

/**
 * Classifies a User-Agent string into a Prisma DeviceType enum value.
 * Centralised here so analytics.routes.ts and blog.routes.ts (which both
 * log page views) share one implementation instead of duplicating the
 * regex logic with an `as any` cast at each call site.
 */
export function detectDevice(userAgent: string): DeviceType {
  if (/mobile/i.test(userAgent)) return DeviceType.MOBILE;
  if (/tablet/i.test(userAgent)) return DeviceType.TABLET;
  return DeviceType.DESKTOP;
}
