"use client";

import { useMemo, useState } from "react";
import { UserX, Users } from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { createAdminUsersWithoutPharmacyColumns } from "@/components/admin/admin-users-without-pharmacy-columns";
import {
  DashboardAlertDialogActions,
  DashboardAlertDialogContent,
  DashboardAlertDialogDescription,
  DashboardAlertDialogHeader,
  DashboardAlertDialogTitle,
  DashboardDataTable,
  DashboardMetricGrid,
  DashboardPageLoading,
  DashboardStatCard,
} from "@/components/dashboard";
import { AlertDialog } from "@/components/ui/alert-dialog";
import {
  useAdminUsersWithoutPharmacy,
  useDeleteAdminAuthUserMutation,
} from "@/hooks/useAdminUsers";
import type { AdminOrphanUser } from "@/lib/http/admin/users";

export function AdminUsersWithoutPharmacyPanel() {
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminOrphanUser | null>(
    null,
  );

  const query = useAdminUsersWithoutPharmacy();
  const deleteMutation = useDeleteAdminAuthUserMutation();

  const users = query.data?.users ?? [];
  const note = query.data?.note;

  const olderThan30 = useMemo(
    () => users.filter((u) => (u.ageDays ?? 0) >= 30).length,
    [users],
  );
  const unconfirmed = useMemo(
    () => users.filter((u) => !u.emailConfirmed).length,
    [users],
  );

  const columns = useMemo(
    () =>
      createAdminUsersWithoutPharmacyColumns({
        onDelete: setDeleteTarget,
        deletingId: deleteMutation.isPending
          ? deleteMutation.variables ?? null
          : null,
      }),
    [deleteMutation.isPending, deleteMutation.variables],
  );

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(`Deleted ${deleteTarget.email ?? "user"}`);
      setDeleteTarget(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete user",
      );
    }
  };

  if (query.isLoading && users.length === 0) {
    return <DashboardPageLoading />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Unassigned"
        description="Accounts that signed up but never joined or created a pharmacy. These stay in the system indefinitely — there is no auto-purge."
      />

      {note ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          {note}
        </p>
      ) : null}

      <DashboardMetricGrid className="lg:grid-cols-3">
        <DashboardStatCard
          label="Unassigned"
          icon={UserX}
          value={users.length}
          hint="Excludes platform admins"
        />
        <DashboardStatCard
          label="30+ days old"
          icon={Users}
          value={olderThan30}
          hint="Still sitting unused"
        />
        <DashboardStatCard
          label="Unconfirmed email"
          icon={Users}
          value={unconfirmed}
        />
      </DashboardMetricGrid>

      <DashboardDataTable
        title="Unassigned users"
        description="Signed up with no pharmacy membership"
        columns={columns}
        data={users}
        searchPlaceholder="Search email or name…"
        searchValue={search}
        onSearchChange={setSearch}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DashboardAlertDialogContent>
          <DashboardAlertDialogHeader>
            <DashboardAlertDialogTitle>Delete user?</DashboardAlertDialogTitle>
            <DashboardAlertDialogDescription>
              This permanently removes{" "}
              <span className="font-medium">
                {deleteTarget?.email ?? "this account"}
              </span>
              . They have no pharmacy membership, so only the auth account is
              deleted.
            </DashboardAlertDialogDescription>
          </DashboardAlertDialogHeader>
          <DashboardAlertDialogActions
            cancelLabel="Cancel"
            confirmLabel={deleteMutation.isPending ? "Deleting…" : "Delete"}
            confirmTone="destructive"
            onCancel={() => !deleteMutation.isPending && setDeleteTarget(null)}
            onConfirm={() => void handleConfirmDelete()}
            confirmDisabled={deleteMutation.isPending}
          />
        </DashboardAlertDialogContent>
      </AlertDialog>
    </div>
  );
}
