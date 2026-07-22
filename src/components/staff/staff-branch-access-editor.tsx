"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { GitBranch } from "lucide-react";
import { toast } from "sonner";
import { useSaasBranches } from "@/hooks/useSaasSubscription";
import {
  useStaffBranchAccess,
  useUpdateStaffBranchAccessMutation,
} from "@/hooks/useUsers";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";

export type StaffBranchAccessEditorHandle = {
  /** Call this from the parent's Save button. Returns true on success. */
  save: () => Promise<boolean>;
  /** True if the user changed anything from the loaded state. */
  isDirty: boolean;
};

type Props = {
  pharmacyUserId: string | null;
  disabled?: boolean;
};

export const StaffBranchAccessEditor = forwardRef<
  StaffBranchAccessEditorHandle,
  Props
>(function StaffBranchAccessEditor({ pharmacyUserId, disabled }, ref) {
  const branchesQuery = useSaasBranches();
  const branches = branchesQuery.data ?? [];

  // ── Cached fetch — no spinner after first open ──────────────────────────
  const accessQuery = useStaffBranchAccess(pharmacyUserId);
  const updateMutation = useUpdateStaffBranchAccessMutation();

  // Local draft state (only changes when the user interacts)
  const [unrestricted, setUnrestricted] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);

  // Seed local state once the data arrives (or when staff member changes)
  useEffect(() => {
    if (!accessQuery.data) return;
    setUnrestricted(accessQuery.data.unrestricted);
    setSelected(accessQuery.data.branchIds);
  }, [accessQuery.data]);

  // Dirty check against what's in the cache
  const savedUnrestricted = accessQuery.data?.unrestricted ?? true;
  const savedSelected = accessQuery.data?.branchIds ?? [];
  const isDirty =
    unrestricted !== savedUnrestricted ||
    JSON.stringify([...selected].sort()) !==
      JSON.stringify([...savedSelected].sort());

  useImperativeHandle(
    ref,
    () => ({
      isDirty,
      save: async () => {
        if (!pharmacyUserId) return true;
        if (!isDirty) return true;

        if (!unrestricted && selected.length === 0) {
          toast.error("Select at least one branch, or turn on All branches");
          return false;
        }

        try {
          await updateMutation.mutateAsync({
            pharmacyUserId,
            branchIds: unrestricted ? [] : selected,
          });
          return true;
        } catch {
          toast.error("Could not update branch access");
          return false;
        }
      },
    }),
    [pharmacyUserId, unrestricted, selected, isDirty, updateMutation],
  );

  if (!pharmacyUserId) return null;

  const loading = accessQuery.isPending || branchesQuery.isPending;

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2 text-sm text-neutral-500">
        <Spinner className="h-4 w-4" />
        Loading branch access…
      </div>
    );
  }

  if (branches.length <= 1) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-neutral-500">
        <GitBranch className="h-3.5 w-3.5" />
        Single branch — access is automatic.
      </p>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-neutral-200/80 bg-neutral-50/50 p-3 dark:border-neutral-700 dark:bg-neutral-800/30">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">Branch access</Label>
          <p className="text-xs text-neutral-500">
            Assigned locations only — they see stock, sales, and POS for those
            branches. Turn off "All branches" and pick one or more shops.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-neutral-500">All branches</span>
          <Switch
            checked={unrestricted}
            disabled={disabled}
            onCheckedChange={(checked) => {
              if (checked) {
                setUnrestricted(true);
                return;
              }
              // Switching to restricted — default to first branch if none picked
              const nextSelected =
                selected.length > 0
                  ? selected
                  : branches[0]
                    ? [branches[0].id]
                    : [];
              setUnrestricted(false);
              setSelected(nextSelected);
            }}
          />
        </div>
      </div>

      {!unrestricted && (
        <div className="grid gap-2 sm:grid-cols-2">
          {branches.map((b) => {
            const checked = selected.includes(b.id);
            return (
              <label
                key={b.id}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={(isChecked) => {
                    const next = isChecked
                      ? [...selected, b.id]
                      : selected.filter((id) => id !== b.id);
                    setSelected(next);
                  }}
                />
                <span className="truncate">{b.name}</span>
              </label>
            );
          })}
        </div>
      )}

      {isDirty && (
        <p className="text-[11px] text-amber-600 dark:text-amber-400">
          Unsaved changes — click Save changes to apply.
        </p>
      )}
    </div>
  );
});
