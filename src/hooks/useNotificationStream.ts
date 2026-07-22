"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { markNotificationRead } from "@/lib/http/notification-preferences";
import { resolveApiUrl } from "@/lib/http/migrated-api-prefixes";

export type LiveNotification = {
  id: string;
  title: string;
  message: string;
  type?: string | null;
  read?: boolean | null;
  date?: string | null;
  actionUrl?: string | null;
};

type UseNotificationStreamResult = {
  notifications: LiveNotification[];
  unreadCount: number;
  connected: boolean;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
};

function notificationScopeFromPath(pathname: string | null): "platform" | "pharmacy" {
  return pathname?.startsWith("/admin") ? "platform" : "pharmacy";
}

function withScope(path: string, scope: "platform" | "pharmacy"): string {
  if (scope !== "platform") return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}scope=platform`;
}

export function useNotificationStream(): UseNotificationStreamResult {
  const pathname = usePathname();
  const scope = notificationScopeFromPath(pathname);
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);
  const [connected, setConnected] = useState(false);
  const seenIds = useRef(new Set<string>());

  const refresh = useCallback(async () => {
    try {
      const { url } = resolveApiUrl(withScope("/api/notifications", scope));
      let response = await fetch(url, {
        cache: "no-store",
        credentials: "include",
      });
      // If access token expired, try to refresh it once then retry
      if (response.status === 401) {
        const refreshed = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        });
        if (refreshed.ok) {
          response = await fetch(url, {
            cache: "no-store",
            credentials: "include",
          });
        }
      }
      if (!response.ok) return;
      const data = (await response.json()) as LiveNotification[];
      setNotifications(data);
      seenIds.current = new Set(data.map((item) => item.id).filter(Boolean));
    } catch {
      /* Backend unreachable — keep current notifications, retry on next call */
    }
  }, [scope]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    seenIds.current = new Set();
    setNotifications([]);
    setConnected(false);

    let source: EventSource | null = null;
    let closed = false;

    const connect = () => {
      if (closed) return;
      const { url: streamUrl } = resolveApiUrl(withScope("/api/notifications/stream", scope));
      source = new EventSource(streamUrl, { withCredentials: true });

      source.onopen = () => setConnected(true);

      source.onerror = () => {
        setConnected(false);
        // Try refreshing the session then reconnect after a short delay
        source?.close();
        if (!closed) {
          fetch("/api/auth/refresh", { method: "POST", credentials: "include", cache: "no-store" })
            .catch(() => {})
            .finally(() => {
              if (!closed) setTimeout(connect, 3000);
            });
        }
      };

      source.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as {
            type?: string;
            notification?: LiveNotification;
          };
          if (payload.type !== "notification" || !payload.notification?.id) return;
          const item = payload.notification;
          if (seenIds.current.has(item.id)) return;
          seenIds.current.add(item.id);
          setNotifications((current) => [item, ...current].slice(0, 50));
        } catch {
          /* ignore malformed events */
        }
      };
    };

    connect();

    return () => {
      closed = true;
      source?.close();
      setConnected(false);
    };
  }, [scope]);

  const markRead = useCallback(
    async (id: string) => {
      setNotifications((current) =>
        current.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      try {
        if (scope === "platform") {
          const { url } = resolveApiUrl(withScope(`/api/notifications/${id}/read`, scope));
          await fetch(url, {
            method: "PATCH",
            credentials: "include",
          });
        } else {
          await markNotificationRead(id);
        }
      } catch {
        void refresh();
      }
    },
    [refresh, scope],
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, connected, refresh, markRead };
}
