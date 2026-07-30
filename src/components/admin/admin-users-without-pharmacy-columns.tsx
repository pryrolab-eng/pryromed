"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import type { AdminOrphanUser } from "@/lib/http/admin/users";
import { Badge } from "@/components/ui/badge";
import { DashboardButton } from "@/components/dashboard";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export function createAdminUsersWithoutPharmacyColumns(handlers: {
  onDelete: (user: AdminOrphanUser) => void;
  deletingId: string | null;
}): ColumnDef<AdminOrphanUser>[] {
  return [
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="User" />
      ),
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium leading-tight">
            {row.original.email ?? "—"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.fullName || "No name"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "emailConfirmed",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) =>
        row.original.emailConfirmed ? (
          <Badge variant="secondary">Confirmed</Badge>
        ) : (
          <Badge variant="outline">Unconfirmed</Badge>
        ),
    },
    {
      accessorKey: "ageDays",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="In system" />
      ),
      cell: ({ row }) => {
        const days = row.original.ageDays;
        if (days == null) return "—";
        if (days === 0) return "Today";
        if (days === 1) return "1 day";
        return `${days} days`;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: "lastSignInAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last sign-in" />
      ),
      cell: ({ row }) => formatDate(row.original.lastSignInAt),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DashboardButton
          tone="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700"
          disabled={handlers.deletingId === row.original.id}
          onClick={() => handlers.onDelete(row.original)}
        >
          <Trash2 className="size-4" />
          Delete
        </DashboardButton>
      ),
    },
  ];
}
