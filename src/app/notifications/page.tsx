"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, CheckCheck, Circle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
  DEFAULT_USER_NOTIFICATIONS,
  formatNotificationTime,
  getUnreadCountFromApi,
  NotificationItem,
  normalizeNotificationsFromApi,
} from "@/lib/notifications";

export default function NotificationsPage() {
  const { user } = useAuth();
  const role = ["admin", "super-admin"].includes(user?.role || "") ? "admin" : "user";
  const isAdmin = role === "admin";
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(
    isAdmin ? [] : DEFAULT_USER_NOTIFICATIONS
  );
  const [unreadCount, setUnreadCount] = React.useState<number>(
    isAdmin ? 0 : DEFAULT_USER_NOTIFICATIONS.filter((item) => !item.isRead).length
  );

  const fetchAdminNotifications = React.useCallback(async () => {
    if (!isAdmin) return;

    try {
      const payload = await api.get("/notifications?limit=120");
      const normalized = normalizeNotificationsFromApi(payload);
      setNotifications(normalized);
      setUnreadCount(getUnreadCountFromApi(payload, normalized));
    } catch {
      // Keep current list if request fails.
    }
  }, [isAdmin]);

  React.useEffect(() => {
    if (!isAdmin) {
      setNotifications(DEFAULT_USER_NOTIFICATIONS);
      setUnreadCount(DEFAULT_USER_NOTIFICATIONS.filter((item) => !item.isRead).length);
      return;
    }

    void fetchAdminNotifications();
    const intervalId = window.setInterval(() => {
      void fetchAdminNotifications();
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [fetchAdminNotifications, isAdmin]);

  const markAsRead = async (id: string) => {
    if (isAdmin) {
      try {
        await api.patch(`/notifications/${id}/read`);
        await fetchAdminNotifications();
        return;
      } catch {
        return;
      }
    }

    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (isAdmin) {
      try {
        await api.patch("/notifications/read-all");
        await fetchAdminNotifications();
      } catch {
        return;
      }
    }

    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
  };

  const clearAll = async () => {
    if (isAdmin) {
      try {
        await api.delete("/notifications/delete-all");
        await fetchAdminNotifications();
      } catch {
        return;
      }
    }

    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Card className="border-white/25 bg-background/70 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/70">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-xl text-foreground">
              <Bell className="h-5 w-5" />
              All Notifications
            </CardTitle>
            <span className="rounded-full border border-border/70 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              {unreadCount} unread
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={markAllAsRead} disabled={!notifications.length || unreadCount === 0}>
              <CheckCheck className="mr-1.5 h-4 w-4" />
              Mark all as read
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={clearAll} disabled={!notifications.length}>
              <Trash2 className="mr-1.5 h-4 w-4" />
              Clear all
            </Button>
            <Button asChild type="button" variant="ghost" size="sm">
              <Link href={role === "admin" ? "/admin/dashboard" : "/dashboard"}>Back to Dashboard</Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {!notifications.length ? (
            <div className="rounded-2xl border border-dashed border-border/70 px-4 py-10 text-center">
              <p className="text-sm font-medium text-foreground">No notifications</p>
              <p className="mt-1 text-xs text-muted-foreground">You are all caught up.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void markAsRead(item.id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                    item.isRead
                      ? "border-border/60 bg-background/45 text-muted-foreground"
                      : "border-emerald-300/45 bg-emerald-50/55 text-foreground shadow-[0_10px_20px_-18px_rgba(16,185,129,0.55)] dark:bg-emerald-950/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-2.5">
                      {!item.isRead ? <Circle className="mt-1 h-2.5 w-2.5 shrink-0 fill-red-500 text-red-500" /> : null}
                      <div className="min-w-0">
                        <p className={`truncate text-sm ${item.isRead ? "font-medium" : "font-semibold"}`}>{item.title}</p>
                        <p className="mt-1 text-xs leading-relaxed">{item.message}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {formatNotificationTime(item.createdAt)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
