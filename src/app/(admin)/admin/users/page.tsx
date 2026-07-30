"use client";

import { AdminUsersWithoutPharmacyPanel } from "@/components/admin/admin-users-without-pharmacy-panel";
import { DashboardPageShell } from "@/components/dashboard";

export default function AdminUsersPage() {
  return (
    <DashboardPageShell>
      <AdminUsersWithoutPharmacyPanel />
    </DashboardPageShell>
  );
}
