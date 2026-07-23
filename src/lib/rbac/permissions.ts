/** Capability keys — keep in sync with pharmacy_role_permissions seed migration. */
export const PHARMACY_PERMISSIONS = {
  workspaceHome: "workspace.home",
  clinicalDashboard: "clinical.dashboard",
  prescriptionsAccess: "prescriptions.access",
  inventoryAccess: "inventory.access",
  posAccess: "pos.access",
  salesView: "sales.view",
  customersAccess: "customers.access",
  patientsAccess: "patients.access",
  reportsView: "reports.view",
  settingsSelf: "settings.self",
  settingsPharmacy: "settings.pharmacy",
  staffManage: "staff.manage",
  branchesManage: "branches.manage",
  billingSelfServe: "billing.self_serve",
} as const;

export type PharmacyPermission =
  (typeof PHARMACY_PERMISSIONS)[keyof typeof PHARMACY_PERMISSIONS];

export function hasPermission(
  permissions: readonly string[] | null | undefined,
  permission: string,
): boolean {
  return (permissions ?? []).includes(permission);
}
