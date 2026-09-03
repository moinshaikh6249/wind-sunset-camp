"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, CheckCheck, Circle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
  buildUserNotificationsFromBookings,
  formatNotificationTime,
  getUnreadCountFromApi,
  NotificationItem,
  normalizeNotificationsFromApi,
} from "@/lib/notifications";

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const role = ["admin", "super-admin"].includes(user?.role || "") ? "admin" : "user";
  const isAdmin = role === "admin";
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState<number>(0);

  const fetchAdminNotifications = React.useCallback(async () => {
    if (!isAdmin || !user) return;

    try {
      const payload = await api.get("/notifications?limit=120");
      const normalized = normalizeNotificationsFromApi(payload);
      setNotifications(normalized);
      setUnreadCount(getUnreadCountFromApi(payload, normalized));
    } catch {
      // Keep current list if request fails.
    }
  }, [isAdmin, user]);

  const fetchUserNotifications = React.useCallback(async () => {
    if (!user || isAdmin) return;

    try {
      const userBookings = await api.get("/bookings/my");
      const userNotifs = buildUserNotificationsFromBookings(userBookings);
      setNotifications(userNotifs);
      setUnreadCount(userNotifs.filter((n) => !n.isRead).length);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, isAdmin]);

  React.useEffect(() => {
    if (loading || !user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    if (isAdmin) {
      void fetchAdminNotifications();
      const intervalId = window.setInterval(() => {
        void fetchAdminNotifications();
      }, 30000);

      return () => window.clearInterval(intervalId);
    }

    void fetchUserNotifications();
  }, [fetchAdminNotifications, fetchUserNotifications, isAdmin, loading, user]);


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
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-slide-in">
      <Card className="glass-card border border-border/40 bg-card/65 dark:bg-card/45 backdrop-blur-xl rounded-3xl shadow-xl">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground font-headline">
              <Bell className="h-5 w-5 text-amber-700 dark:text-emerald-400" />
              Notifications Center
            </CardTitle>
            <span className="rounded-full border border-amber-500/30 dark:border-emerald-500/30 bg-amber-500/10 dark:bg-emerald-500/10 px-3 py-1 text-xs font-bold text-amber-800 dark:text-emerald-300">
              {unreadCount} unread
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button type="button" variant="secondary" size="sm" onClick={markAllAsRead} disabled={!notifications.length || unreadCount === 0} className="rounded-full text-xs font-semibold">
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
              Mark all as read
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={clearAll} disabled={!notifications.length} className="rounded-full text-xs font-semibold border-border/40">
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Clear all
            </Button>
            <Button asChild type="button" variant="ghost" size="sm" className="rounded-full text-xs font-semibold">
              <Link href={role === "admin" ? "/admin/dashboard" : "/dashboard"}>Back to Dashboard</Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {!notifications.length ? (
            <div className="rounded-2xl border border-dashed border-border/50 bg-muted/20 px-4 py-12 text-center">
              <p className="text-sm font-bold text-foreground">No notifications</p>
              <p className="mt-1 text-xs text-muted-foreground">You are completely caught up with campsite operations.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void markAsRead(item.id)}
                  className={`w-full rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 ${
                    item.isRead
                      ? "border-border/40 bg-muted/20 text-muted-foreground hover:bg-muted/40"
                      : "border-amber-500/30 dark:border-emerald-500/30 bg-amber-500/10 dark:bg-emerald-500/10 text-foreground shadow-sm hover:scale-[1.01]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-2.5">
                      {!item.isRead ? <Circle className="mt-1 h-2.5 w-2.5 shrink-0 fill-amber-600 dark:fill-emerald-400 text-amber-600 dark:text-emerald-400" /> : null}
                      <div className="min-w-0">
                        <p className={`truncate text-xs ${item.isRead ? "font-semibold" : "font-extrabold text-foreground"}`}>{item.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.message}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
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
