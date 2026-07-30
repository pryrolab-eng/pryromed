import { emitNotificationEvent } from "@/lib/notifications/emit";

export const PLATFORM_ADMIN_EVENT = {
  pharmacyRegistered: "platform.pharmacy_registered",
  subscriptionPaid: "platform.subscription_paid",
  subscriptionCancelled: "platform.subscription_cancelled",
  maintenanceQueued: "platform.maintenance",
} as const;

/**
 * @deprecated Prefer Nest producers (onboarding / polar / admin maintenance)
 * which write `notification_outbox` with `pharmacy_id: null`.
 * Kept for rare client-side admin tooling; creates a pharmacy-scoped row only.
 */
export async function emitPlatformAdminNotification(input: {
  eventType: string;
  title: string;
  message: string;
  type?: string;
  actionUrl?: string;
  payload?: Record<string, unknown>;
}): Promise<string | null> {
  return emitNotificationEvent({
    eventType: input.eventType,
    pharmacyId: null,
    userId: null,
    payload: {
      title: input.title,
      message: input.message,
      type: input.type ?? "info",
      actionUrl: input.actionUrl,
      ...(input.payload ?? {}),
    },
  });
}
