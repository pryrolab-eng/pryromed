import { resolveApiUrl } from "@/lib/http/migrated-api-prefixes";

type MeContext = {
  user: { id: string };
  activePharmacyId: string | null;
  memberships: { pharmacyId: string; role: string; isActive: boolean }[];
};

let cachedContext: MeContext | null = null;

async function fetchContext(): Promise<MeContext> {
  if (cachedContext) return cachedContext;
  const { url } = resolveApiUrl("/api/me/context");
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load session context");
  const data = (await res.json()) as MeContext;
  cachedContext = data;
  return data;
}

/** Active pharmacy for the current user. */
export async function requireUserPharmacyId(_userId?: string): Promise<string> {
  const pharmacyId = await resolveUserPharmacyId();
  if (!pharmacyId) {
    throw new Error("Pharmacy not found");
  }
  return pharmacyId;
}

export async function resolveUserPharmacyId(_userId?: string): Promise<string | null> {
  const ctx = await fetchContext();
  const active = ctx.memberships.find(
    (m) => m.pharmacyId === ctx.activePharmacyId,
  );
  if (active) return active.pharmacyId;
  return ctx.memberships[0]?.pharmacyId ?? null;
}

/** Resolves the user's active pharmacy or throws. */
export async function requireSessionPharmacyId(userId?: string): Promise<string> {
  return requireUserPharmacyId(userId);
}
