import {
  getMeContext,
  setActivePharmacy,
  setActiveBranch,
  type MeContextMembership,
} from "@/lib/http/me-context";
import {
  selectPrimaryMembership,
  type PharmacyMembership,
} from "@/utils/select-pharmacy-membership";

export type PharmacyMembershipDetail = PharmacyMembership & {
  pharmacy_name: string | null;
};

export type ActivePharmacyContext = {
  activePharmacyId: string | null;
  activeBranchId: string | null;
  role: string | null;
  memberships: PharmacyMembershipDetail[];
  isPlatformAdmin: boolean;
};

function mapMembership(m: MeContextMembership): PharmacyMembershipDetail {
  return {
    pharmacy_id: m.pharmacyId,
    role: m.role,
    pharmacy_name: m.pharmacyName ?? null,
  };
}

export async function resolveActivePharmacyId(
  userId: string,
): Promise<string | null> {
  const ctx = await resolveActivePharmacyContext(userId);
  return ctx.activePharmacyId;
}

export async function resolveActivePharmacyContext(
  userId: string,
): Promise<ActivePharmacyContext> {
  try {
    const ctx = await getMeContext();
    return {
      activePharmacyId: ctx.activePharmacyId,
      activeBranchId: ctx.activeBranchId,
      role: ctx.role,
      memberships: ctx.memberships.map(mapMembership),
      isPlatformAdmin: ctx.user.isPlatformAdmin,
    };
  } catch {
    return {
      activePharmacyId: null,
      activeBranchId: null,
      role: null,
      memberships: [],
      isPlatformAdmin: false,
    };
  }
}

export async function setActivePharmacyId(
  userId: string,
  pharmacyId: string,
): Promise<ActivePharmacyContext> {
  const result = await setActivePharmacy(pharmacyId);
  if (!result.success) {
    throw new Error("You do not have access to this pharmacy");
  }
  return resolveActivePharmacyContext(userId);
}

export async function setActiveBranchId(
  userId: string,
  branchId: string,
): Promise<ActivePharmacyContext> {
  const result = await setActiveBranch(branchId);
  if (!result.success) {
    throw new Error("Invalid branch for the active pharmacy");
  }
  return resolveActivePharmacyContext(userId);
}

export async function resolveActivePharmacyIdForUser(
  userId: string,
): Promise<string | null> {
  return resolveActivePharmacyId(userId);
}
