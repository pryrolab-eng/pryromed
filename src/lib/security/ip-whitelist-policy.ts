import { resolveApiUrl } from "@/lib/http/migrated-api-prefixes";
import { ipMatchesAllowlist } from "@/lib/security/ip-address";

export type IpWhitelistPolicy = {
  enabled: boolean;
  ips: string[];
};

const CACHE_TTL_MS = 60_000;

type CacheEntry = { policy: IpWhitelistPolicy; expiresAt: number };

const platformCache: { entry: CacheEntry | null } = { entry: null };
const pharmacyCache = new Map<string, CacheEntry>();

export function invalidateIpWhitelistCache(pharmacyId?: string | null): void {
  if (pharmacyId === undefined) {
    platformCache.entry = null;
    pharmacyCache.clear();
    return;
  }
  if (pharmacyId === null) {
    platformCache.entry = null;
    return;
  }
  pharmacyCache.delete(pharmacyId);
}

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const { url } = resolveApiUrl(path);
    const res = await fetch(url, { credentials: "include", cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getPlatformIpWhitelistPolicy(): Promise<IpWhitelistPolicy> {
  const now = Date.now();
  if (platformCache.entry && platformCache.entry.expiresAt > now) {
    return platformCache.entry.policy;
  }

  const [settings, list] = await Promise.all([
    fetchJson<{ settings: { ipWhitelistEnabled?: boolean } }>("/api/admin/system-settings"),
    fetchJson<{ ips: { ipAddress: string }[] }>("/api/admin/ip-whitelist"),
  ]);

  const enabled = settings?.settings?.ipWhitelistEnabled === true;
  const ips = list?.ips?.map((e) => e.ipAddress) ?? [];

  const policy = { enabled, ips };
  platformCache.entry = { policy, expiresAt: now + CACHE_TTL_MS };
  return policy;
}

export async function getPharmacyIpWhitelistPolicy(
  pharmacyId: string,
): Promise<IpWhitelistPolicy> {
  const now = Date.now();
  const cached = pharmacyCache.get(pharmacyId);
  if (cached && cached.expiresAt > now) {
    return cached.policy;
  }

  const list = await fetchJson<{ ips: { ipAddress: string; enabled?: boolean }[] }>(
    `/api/settings/security/ip-whitelist/manage`,
  );

  const enabled = list?.ips?.some((e) => e.enabled) ?? false;
  const ips = list?.ips?.map((e) => e.ipAddress) ?? [];

  const policy = { enabled, ips };
  pharmacyCache.set(pharmacyId, { policy, expiresAt: now + CACHE_TTL_MS });
  return policy;
}

export function isIpAllowedByPolicy(
  clientIp: string,
  policy: IpWhitelistPolicy,
): boolean {
  if (!policy.enabled) return true;
  if (policy.ips.length === 0) return true;
  if (!clientIp) return false;
  return ipMatchesAllowlist(clientIp, policy.ips);
}

/** When enforcement is active (production default). */
export function shouldEnforceIpWhitelist(): boolean {
  const flag = process.env.IP_WHITELIST_ENFORCE;
  if (flag === "false") return false;
  if (flag === "true") return true;
  return process.env.NODE_ENV === "production";
}
