/**
 * API path prefixes served by the Nest backend (NEXT_PUBLIC_API_URL).
 * Add a prefix here when its Next route handler is removed.
 */
export const MIGRATED_API_PREFIXES = [
  "/api/accounting",
  "/api/categories",
  "/api/exports",
  "/api/insurance",
  "/api/pharmacist",
  "/api/pharmacy",
  "/api/reports",
  "/api/alerts",
  "/api/stock-alerts",
  "/api/search",
  "/api/entitlements",
  "/api/me",
  "/api/notifications",
  "/api/inventory",
  "/api/customers",
  "/api/branches",
  "/api/staff",
  "/api/prescriptions",
  "/api/sales",
  "/api/pos",
  "/api/analytics",
  "/api/invoices",
  "/api/plans",
  "/api/settings",
  "/api/subscriptions",
  "/api/polar",
  "/api/saas",
  "/api/integrations",
  "/api/realtime",
  "/api/auth",
  "/api/sign-in",
  "/api/onboarding",
  "/api/admin",
  "/api/superadmin",
  "/api/files",
  "/api/uploads",
  "/api/branding",
  "/api/validation",
  "/api/payments",
  "/api/dashboard",
  "/api/ai",
  "/api/ai-safety",
  "/api/cron",
] as const;

export function isMigratedApiPath(path: string): boolean {
  const normalized =
    path.startsWith("http://") || path.startsWith("https://")
      ? new URL(path).pathname
      : path.split("?")[0] ?? path;
  return MIGRATED_API_PREFIXES.some(
    (prefix) =>
      normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

export function resolveApiUrl(path: string): { url: string; isNest: boolean } {
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (apiBase && isMigratedApiPath(path)) {
    const relative = path.startsWith("/") ? path : `/${path}`;
    return { url: `${apiBase}${relative}`, isNest: true };
  }
  return { url: path, isNest: false };
}
