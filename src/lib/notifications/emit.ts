import { resolveApiUrl } from "@/lib/http/migrated-api-prefixes";

export type NotificationEventInput = {
  eventType: string;
  pharmacyId?: string | null;
  userId?: string | null;
  payload?: Record<string, unknown>;
};

export async function emitNotificationEvent(
  input: NotificationEventInput,
): Promise<string | null> {
  const payload = input.payload ?? {};
  const title = typeof payload.title === "string" ? payload.title : input.eventType;
  const message =
    typeof payload.message === "string" ? payload.message : input.eventType;

  try {
    const { url } = resolveApiUrl("/api/notifications");
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        message,
        type: typeof payload.type === "string" ? payload.type : "info",
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { success?: boolean; notification?: { id: string } };
    return data?.notification?.id ?? null;
  } catch (error) {
    console.error("emitNotificationEvent:", error);
    return null;
  }
}
