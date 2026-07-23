import { getSaasBranches, createSaasBranch } from "@/lib/http/saas-branches";

export const HEADQUARTERS_BRANCH_NAME = "Headquarters (HQ)";

export type BranchRow = {
  id: string;
  name?: string;
  is_headquarters?: boolean;
  is_active?: boolean;
};

export async function resolveHeadquartersBranchId(
  pharmacyId: string,
): Promise<string | null> {
  try {
    const { branches } = await getSaasBranches();
    const hq = branches.find(
      (b) => b.is_headquarters === true && b.is_active !== false,
    );
    return hq?.id ?? null;
  } catch {
    return null;
  }
}

export async function resolveDefaultStockingBranchId(
  pharmacyId: string,
): Promise<string | null> {
  const hq = await resolveHeadquartersBranchId(pharmacyId);
  if (hq) return hq;

  try {
    const { branches } = await getSaasBranches();
    const active = branches.filter((b) => b.is_active !== false);
    active.sort(
      (a, b) =>
        new Date(a.created_at ?? 0).getTime() -
        new Date(b.created_at ?? 0).getTime(),
    );
    return active[0]?.id ?? null;
  } catch {
    return null;
  }
}

export async function ensureHeadquartersBranch(
  pharmacyId: string,
): Promise<string | null> {
  const existing = await resolveHeadquartersBranchId(pharmacyId);
  if (existing) return existing;

  try {
    const branch = await createSaasBranch({ name: HEADQUARTERS_BRANCH_NAME });
    return branch.id;
  } catch {
    return resolveDefaultStockingBranchId(pharmacyId);
  }
}

export function isHeadquartersBranch(
  branch: Pick<BranchRow, "is_headquarters" | "name"> | null | undefined,
): boolean {
  if (!branch) return false;
  if (branch.is_headquarters === true) return true;
  const n = String(branch.name ?? "").toLowerCase();
  return (
    n.includes("headquarters") ||
    n.includes("(hq)") ||
    n.endsWith("\u2014 main") ||
    n.endsWith("- main")
  );
}
