"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  AlertTriangle,
  Package,
  ShoppingCart,
  CheckCircle,
  Info,
  X,
  ArrowRight,
  CheckCheck,
} from "lucide-react";
import { useNotificationStream } from "@/hooks/useNotificationStream";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { statusToneBarClass } from "@/lib/ui/status-tone";
import { formatDistanceToNow } from "date-fns";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 5;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getNotificationIcon(type?: string | null) {
  switch (type) {
    case "expiry_warning":
    case "expired_stock":
      return (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        </div>
      );
    case "low_stock":
    case "stock_alert":
      return (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40">
          <Package className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
        </div>
      );
    case "sale_completed":
    case "sale.completed":
      return (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
          <ShoppingCart className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
        </div>
      );
    case "success":
      return (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
          <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
        </div>
      );
    default:
      return (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
          <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
        </div>
      );
  }
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return "";
  }
}

function isToday(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

// ---------------------------------------------------------------------------
// Action URL resolution
// Derives a navigation URL from the notification type when actionUrl is absent
// ---------------------------------------------------------------------------

function resolveActionUrl(
  type?: string | null,
  actionUrl?: string | null,
): string | null {
  if (actionUrl?.startsWith("/")) return actionUrl;
  switch (type) {
    case "expiry_warning":
    case "expired_stock":
      return "/pharmacy/inventory?filter=expiring";
    case "low_stock":
    case "stock_alert":
      return "/pharmacy/inventory?filter=low-stock";
    case "sale_completed":
    case "sale.completed":
      return "/pharmacy/sales";
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function NotificationBell() {
  const { notifications, unreadCount, connected, markRead, refresh, dismiss } =
    useNotificationStream();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Split into today vs earlier
  const todayItems = notifications.filter((n) => isToday(n.date));
  const earlierItems = notifications.filter((n) => !isToday(n.date));

  // Flattened visible slice
  const allItems = [...todayItems, ...earlierItems];
  const visibleItems = allItems.slice(0, visibleCount);
  const hasMore = allItems.length > visibleCount;

  const handleOpen = useCallback(
    (val: boolean) => {
      setOpen(val);
      if (val) {
        setVisibleCount(PAGE_SIZE);
        void refresh();
      }
    },
    [refresh],
  );

  const handleMarkAllRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.allSettled(unread.map((n) => markRead(n.id)));
  }, [notifications, markRead]);

  const handleItem = useCallback(
    async (id: string, read: boolean | null | undefined, url: string | null) => {
      if (!read) await markRead(id);
      if (url) {
        setOpen(false);
        router.push(url);
      }
    },
    [markRead, router],
  );

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative shrink-0"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          {/* Connection status dot */}
          <span
            className={cn(
              "absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full",
              connected
                ? statusToneBarClass.success
                : "bg-muted-foreground/30",
            )}
            aria-hidden
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] p-0 shadow-lg"
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-medium text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-neutral-900 dark:hover:text-neutral-50"
                onClick={() => void handleMarkAllRead()}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="max-h-[420px] overflow-y-auto">
          {allItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                <Bell className="h-5 w-5 text-neutral-400" />
              </div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                All caught up
              </p>
              <p className="text-xs text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <>
              {/* Today section */}
              {todayItems.length > 0 && (
                <div>
                  <div className="px-4 py-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Today
                    </span>
                  </div>
                  {visibleItems
                    .filter((n) => isToday(n.date))
                    .map((item) => {
                      const url = resolveActionUrl(item.type, item.actionUrl);
                      const isUnread = !item.read;
                      return (
                        <NotificationItem
                          key={item.id}
                          item={item}
                          isUnread={isUnread}
                          url={url}
                          onAction={handleItem}
                          onDismiss={dismiss}
                        />
                      );
                    })}
                </div>
              )}

              {/* Earlier section */}
              {earlierItems.length > 0 &&
                visibleItems.some((n) => !isToday(n.date)) && (
                  <div>
                    <div className="px-4 py-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Earlier
                      </span>
                    </div>
                    {visibleItems
                      .filter((n) => !isToday(n.date))
                      .map((item) => {
                        const url = resolveActionUrl(item.type, item.actionUrl);
                        const isUnread = !item.read;
                        return (
                          <NotificationItem
                            key={item.id}
                            item={item}
                            isUnread={isUnread}
                            url={url}
                            onAction={handleItem}
                            onDismiss={dismiss}
                          />
                        );
                      })}
                  </div>
                )}
            </>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        {allItems.length > 0 && (
          <div className="border-t">
            {hasMore && (
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="flex w-full items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
              >
                Show more
                <span className="text-muted-foreground">
                  ({allItems.length - visibleCount} remaining)
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/pharmacy/notifications");
              }}
              className="flex w-full items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-neutral-900 dark:hover:text-neutral-50 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              View all notifications
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// Single notification item
// ---------------------------------------------------------------------------

interface NotificationItemProps {
  item: {
    id: string;
    title: string;
    message: string;
    type?: string | null;
    read?: boolean | null;
    date?: string | null;
    actionUrl?: string | null;
  };
  isUnread: boolean;
  url: string | null;
  onAction: (id: string, read: boolean | null | undefined, url: string | null) => Promise<void>;
  onDismiss: (id: string) => Promise<void>;
}

function NotificationItem({ item, isUnread, url, onAction, onDismiss }: NotificationItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 px-4 py-3 transition-colors",
        "hover:bg-neutral-50 dark:hover:bg-neutral-800/60",
        isUnread ? "bg-blue-50/60 dark:bg-blue-950/20" : "bg-transparent",
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Clickable area — icon + content */}
      <button
        type="button"
        className={cn(
          "flex min-w-0 flex-1 items-start gap-3 text-left",
          url ? "cursor-pointer" : "cursor-default",
        )}
        onClick={() => void onAction(item.id, item.read, url)}
      >
        {getNotificationIcon(item.type)}

        <div className="min-w-0 flex-1 pr-6">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                "text-xs leading-snug",
                isUnread
                  ? "font-semibold text-neutral-900 dark:text-neutral-50"
                  : "font-medium text-neutral-700 dark:text-neutral-300",
              )}
            >
              {item.title}
            </p>
            {isUnread && (
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
            )}
          </div>
          <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground leading-relaxed">
            {item.message}
          </p>
          <div className="mt-1 flex items-center gap-2">
            {item.date && (
              <span className="text-[10px] text-muted-foreground/70">
                {formatDate(item.date)}
              </span>
            )}
            {url && (
              <span className="flex items-center gap-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
                View
                <ArrowRight className="h-2.5 w-2.5" />
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Dismiss × button — shown on hover via state */}
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={(e) => {
          e.stopPropagation();
          void onDismiss(item.id);
        }}
        className={cn(
          "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full transition-opacity",
          "bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600",
          "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200",
          hovered ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
