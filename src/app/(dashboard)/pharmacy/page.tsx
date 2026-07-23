import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { resolveActivePharmacyContext } from "@/lib/pharmacy/active-pharmacy";
import { selectPrimaryMembership } from "@/utils/select-pharmacy-membership";
import { PHARMACY_ROUTES } from "@/lib/routes/pharmacy-paths";
import { isStaffWorkspaceRole } from "@/lib/rbac/pharmacy-roles";

/** Tenant root — redirect to role-appropriate home under /pharmacy. */
export default async function PharmacyRootPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/sign-in");
  }

  const ctx = await resolveActivePharmacyContext(user.id);
  const membership = selectPrimaryMembership(ctx.memberships);
  const role = membership?.role;

  if (isStaffWorkspaceRole(role)) {
    redirect(PHARMACY_ROUTES.staffDashboard);
  }
  redirect(PHARMACY_ROUTES.dashboard);
}
