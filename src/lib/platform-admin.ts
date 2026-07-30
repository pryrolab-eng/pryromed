import { resolveApiUrl } from "@/lib/http/migrated-api-prefixes";

/** Legacy: platform staff was modeled as pharmacy_users.role = admin (or superadmin if ever used). */
export function isLegacyPharmacyPlatformRole(role: string | null | undefined): boolean {
  return role === "admin" || role === "superadmin";
}

const CACHE_TTL_MS = 60_000;
const adminCache = new Map<string, { value: boolean; expiresAt: number }>();

async function fetchIsPlatformAdmin(): Promise<boolean> {
  try {
    const { url } = resolveApiUrl("/api/auth/bootstrap");
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) return false;
    const data = (await res.json()) as { me?: { isPlatformAdmin?: boolean } };
    return data?.me?.isPlatformAdmin === true;
  } catch {
    return false;
  }
}

/**
 * Pryrox platform operator: /superadmin and broad RLS via is_admin / is_superadmin.
 * Prefer public.users.is_platform_admin; still accepts legacy pharmacy_users admin rows.
 */
export async function resolveIsAppPlatformAdmin(
  userId: string,
  primaryPharmacyRole?: string | null,
): Promise<boolean> {
  if (isLegacyPharmacyPlatformRole(primaryPharmacyRole)) {
    return true;
  }

  const now = Date.now();
  const cached = adminCache.get(userId);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const value = await fetchIsPlatformAdmin();
  adminCache.set(userId, { value, expiresAt: now + CACHE_TTL_MS });
  return value;
}

/** Clear cached admin bits (e.g. after role changes). */
export function invalidatePlatformAdminCache(userId?: string): void {
  if (userId) {
    adminCache.delete(userId);
    return;
  }
  adminCache.clear();
}
