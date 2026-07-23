import { resolveApiUrl } from "@/lib/http/migrated-api-prefixes";
import { invalidateIpWhitelistCache } from "@/lib/security/ip-whitelist-policy";

/** Insert client IP if not already on the pharmacy allowlist. */
export async function ensurePharmacyIpOnWhitelist(
  pharmacyId: string,
  clientIp: string,
  description = "Added automatically when enabling IP whitelist",
): Promise<void> {
  const { url } = resolveApiUrl("/api/settings/security/ip-whitelist/manage");
  await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ip: clientIp, description }),
  });
  invalidateIpWhitelistCache(pharmacyId);
}

/** Insert client IP on platform allowlist (pharmacy_id IS NULL). */
export async function ensurePlatformIpOnWhitelist(
  clientIp: string,
  description = "Added automatically when enabling platform IP whitelist",
): Promise<void> {
  const { url } = resolveApiUrl("/api/admin/ip-whitelist");
  await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ip: clientIp, description }),
  });
  invalidateIpWhitelistCache(null);
}
