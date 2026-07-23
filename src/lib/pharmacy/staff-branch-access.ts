import { getMeContext } from "@/lib/http/me-context";
import { getSaasBranches } from "@/lib/http/saas-branches";

const UNRESTRICTED_ROLES = new Set(["pharmacy_owner", "admin"]);

export async function getStaffAllowedBranchIds(
  userId: string,
  pharmacyId: string,
  role: string | null,
): Promise<string[] | null> {
  if (role && UNRESTRICTED_ROLES.has(role)) {
    return null;
  }

  try {
    const ctx = await getMeContext();
    if (ctx.activePharmacyId !== pharmacyId) return [];
    return ctx.allowedBranchIds;
  } catch {
    return [];
  }
}

export async function assertBranchAllowedForUser(
  userId: string,
  pharmacyId: string,
  role: string | null,
  branchId: string,
): Promise<void> {
  const allowed = await getStaffAllowedBranchIds(userId, pharmacyId, role);
  if (allowed === null) return;
  if (!allowed.includes(branchId)) {
    throw new Error("You do not have access to this branch");
  }
}

export async function pickStaffScopedBranchId(
  pharmacyId: string,
  allowedBranchIds: string[] | null,
  preferredBranchId: string | null,
): Promise<string | null> {
  if (allowedBranchIds !== null && allowedBranchIds.length === 0) {
    return null;
  }

  try {
    const { branches } = await getSaasBranches();
    const active = branches.filter(
      (b) =>
        b.is_active !== false &&
        (allowedBranchIds === null || allowedBranchIds.includes(b.id)),
    );
    active.sort(
      (a, b) =>
        (b.is_headquarters ? 1 : 0) - (a.is_headquarters ? 1 : 0) ||
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    if (active.length === 0) return null;

    if (preferredBranchId && active.some((b) => b.id === preferredBranchId)) {
      return preferredBranchId;
    }

    const hq = active.find((b) => b.is_headquarters);
    return hq?.id ?? active[0]?.id ?? null;
  } catch {
    return null;
  }
}

export async function resolveDataBranchScope(
  userId: string,
  pharmacyId: string,
  role: string | null,
  requestedBranchId: string | null | undefined,
  activeBranchId: string | null,
): Promise<{ branchId: string | null; allowedBranchIds: string[] | null }> {
  const allowedBranchIds = await getStaffAllowedBranchIds(
    userId,
    pharmacyId,
    role,
  );

  if (requestedBranchId) {
    const { branches } = await getSaasBranches();
    const branch = branches.find(
      (b) =>
        b.id === requestedBranchId &&
        b.pharmacy_id === pharmacyId &&
        b.is_active !== false,
    );
    if (!branch) {
      throw new Error("Invalid branch for the active pharmacy");
    }
    if (
      allowedBranchIds !== null &&
      !allowedBranchIds.includes(requestedBranchId)
    ) {
      throw new Error("You do not have access to this branch");
    }
    return { branchId: requestedBranchId, allowedBranchIds };
  }

  if (allowedBranchIds === null) {
    return { branchId: null, allowedBranchIds };
  }

  const pinned = await pickStaffScopedBranchId(
    pharmacyId,
    allowedBranchIds,
    activeBranchId,
  );
  if (!pinned) {
    throw new Error("No active branch. Ask an owner to assign you a location.");
  }
  return { branchId: pinned, allowedBranchIds };
}
