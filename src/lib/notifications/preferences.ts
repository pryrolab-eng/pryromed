import { resolveApiUrl } from "@/lib/http/migrated-api-prefixes";

export type NotificationChannelPrefs = {
  channelInApp: boolean;
  channelEmail: boolean;
  channelPush: boolean;
};

const DEFAULT_PREFS: NotificationChannelPrefs = {
  channelInApp: true,
  channelEmail: true,
  channelPush: false,
};

async function fetchApi<T>(path: string): Promise<T | null> {
  try {
    const { url } = resolveApiUrl(path);
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getNotificationChannelPrefs(
  _userId: string,
  _pharmacyId: string | null,
): Promise<NotificationChannelPrefs> {
  const data = await fetchApi<{
    desktop: boolean;
    email: boolean;
    push: boolean;
  }>("/api/notifications/preferences");
  if (!data) return DEFAULT_PREFS;
  return {
    channelInApp: data.desktop,
    channelEmail: data.email,
    channelPush: data.push,
  };
}
