"use client";

import { DashboardConfirmDialog } from "@/components/dashboard/dashboard-alert-dialog";
import { signOutClient } from "@/lib/auth/client-sign-out";

type SignOutConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: "admin" | "pharmacy";
};

/** In-app sign-out confirmation (replaces window.confirm). */
export function SignOutConfirmDialog({ open, onOpenChange, variant = "pharmacy" }: SignOutConfirmDialogProps) {
  return (
    <DashboardConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Sign out?"
      description={variant === "admin"
        ? "You will leave the platform admin console and need to sign in again."
        : "You will need to sign in again to access your pharmacy workspace."
      }
      confirmLabel="Sign out"
      confirmTone="destructive"
      onConfirm={async () => {
        await signOutClient();
      }}
    />
  );
}
