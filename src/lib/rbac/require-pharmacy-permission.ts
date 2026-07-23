import { getMeContext } from "@/lib/http/me-context";
import {
  hasPermission,
  type PharmacyPermission,
} from "@/lib/rbac/permissions";

export class PharmacyPermissionError extends Error {
  readonly status = 403;
  constructor(message = "You do not have permission to perform this action") {
    super(message);
    this.name = "PharmacyPermissionError";
  }
}

export async function requirePharmacyPermission(
  userId: string,
  permission: PharmacyPermission,
) {
  const ctx = await getMeContext();
  if (!ctx.activePharmacyId) {
    throw new PharmacyPermissionError("Pharmacy not found");
  }
  if (!hasPermission(ctx.permissions, permission)) {
    throw new PharmacyPermissionError();
  }
  return { ctx, permissions: ctx.permissions };
}

export function permissionErrorResponse(error: unknown) {
  if (error instanceof PharmacyPermissionError) {
    return {
      body: { success: false, error: error.message, code: "forbidden" },
      status: 403 as const,
    };
  }
  return null;
}
