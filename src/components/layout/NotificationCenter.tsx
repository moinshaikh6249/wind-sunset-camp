"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, CheckCheck, Circle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
  DEFAULT_USER_NOTIFICATIONS,
  formatNotificationTime,
  getUnreadCountFromApi,
  NotificationItem,
  normalizeNotificationsFromApi,
} from "@/lib/notifications";

export function NotificationCenter() {
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
      const payload = await api.get("/notifications?limit=80");
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

  const notificationsPageHref = isAdmin ? "/admin/notifications" : "/notifications";

  const handleMarkAsRead = async (id: string) => {
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

  const handleMarkAllAsRead = async () => {
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

  const handleClearAll = async () => {
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

  const renderNotificationList = (isMobile = false) => {
    if (notifications.length === 0) {
      return (
        <div className="px-4 py-8 text-center">
          <p className="text-sm font-medium text-foreground">No notifications</p>
          <p className="mt-1 text-xs text-muted-foreground">You are all caught up.</p>
        </div>
      );
    }

    if (isMobile) {
      return (
        <div className="max-h-[calc(100vh-15rem)] overflow-y-auto space-y-2 px-3 py-2">
          {notifications.slice(0, 12).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => void handleMarkAsRead(item.id)}
              className={`w-full rounded-xl border px-3 py-3 text-left transition-all duration-200 ${
                item.isRead
                  ? "border-border/60 bg-background/45 text-muted-foreground"
                  : "border-emerald-300/45 bg-emerald-50/60 text-foreground dark:bg-emerald-950/20"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2.5">
                  {!item.isRead ? <Circle className="mt-1 h-2.5 w-2.5 shrink-0 fill-red-500 text-red-500" /> : null}
                  <div className="min-w-0">
                    <p className={`truncate text-sm ${item.isRead ? "font-medium" : "font-semibold"}`}>{item.title}</p>
                    <p className="mt-1 text-xs leading-relaxed">{item.message}</p>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{formatNotificationTime(item.createdAt)}</span>
              </div>
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="max-h-80 overflow-y-auto p-2">
        {notifications.slice(0, 12).map((item) => (
          <DropdownMenuItem
            key={item.id}
            onSelect={(event) => {
              event.preventDefault();
              void handleMarkAsRead(item.id);
            }}
            className={`mb-1 cursor-pointer rounded-xl border px-3 py-2.5 transition-all duration-300 hover:bg-accent/10 data-[highlighted]:bg-accent/10 ${
              item.isRead
                ? "border-transparent text-muted-foreground"
                : "border-emerald-300/35 bg-emerald-50/50 font-semibold text-foreground dark:bg-emerald-950/20"
            }`}
          >
            <div className="w-full">
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm ${item.isRead ? "font-medium" : "font-semibold"}`}>{item.title}</p>
                <span className="mt-0.5 shrink-0 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  {formatNotificationTime(item.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.message}</p>
            </div>
            {!item.isRead ? (
              <span className="ml-2 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" aria-hidden />
            ) : null}
          </DropdownMenuItem>
        ))}
      </div>
    );
  };

  const notificationTrigger = (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-10 w-10 rounded-full border border-white/25 bg-background/45 text-foreground backdrop-blur-md transition-all duration-300 hover:scale-[1.05] hover:border-white/40 hover:bg-background/70 hover:shadow-[0_0_18px_rgba(255,255,255,0.16)] dark:border-white/20 dark:hover:shadow-[0_0_22px_rgba(74,222,128,0.25)]"
      aria-label="Open notifications"
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-[0_0_10px_rgba(239,68,68,0.6)]">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
      <span className="sr-only">Notifications</span>
    </Button>
  );

  return (
    <>
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>{notificationTrigger}</DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="bottom"
            sideOffset={10}
            className="w-[22rem] rounded-2xl border border-white/20 bg-background/80 p-0 shadow-[0_22px_46px_-28px_rgba(15,23,42,0.68)] backdrop-blur-xl data-[state=closed]:slide-out-to-right-2 data-[state=open]:slide-in-from-right-2 dark:border-white/10 dark:bg-slate-900/86"
          >
            <div className="border-b border-border/60 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">Notifications</p>
                <span className="rounded-full border border-border/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {unreadCount} unread
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {role === "admin" ? "Real-time system alerts and operational updates" : "Your booking and camp updates"}
              </p>
            </div>

            <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
              <Button type="button" size="sm" variant="secondary" className="h-8 rounded-lg text-xs" onClick={handleMarkAllAsRead} disabled={unreadCount === 0 || notifications.length === 0}>
                <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
                Mark all as read
              </Button>
              <Button type="button" size="sm" variant="outline" className="h-8 rounded-lg text-xs" onClick={handleClearAll} disabled={notifications.length === 0}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Clear all
              </Button>
            </div>

            {renderNotificationList(false)}

            <DropdownMenuSeparator className="my-0 bg-border/60" />

            <div className="p-2">
              <Button asChild variant="secondary" className="h-9 w-full rounded-xl text-sm">
                <Link href={notificationsPageHref}>View All Notifications</Link>
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="md:hidden">
        <Dialog>
          <DialogTrigger asChild>{notificationTrigger}</DialogTrigger>
          <DialogContent className="left-0 top-0 h-screen w-screen max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 bg-background/96 p-0 backdrop-blur-xl">
            <DialogTitle className="sr-only">Notifications</DialogTitle>

            <div className="border-b border-border/60 px-4 pb-3 pt-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-base font-semibold text-foreground">Notifications</p>
                <span className="rounded-full border border-border/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {unreadCount} unread
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {role === "admin" ? "Real-time system alerts and operational updates" : "Your booking and camp updates"}
              </p>
            </div>

            <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
              <Button type="button" size="sm" variant="secondary" className="h-8 rounded-lg text-xs" onClick={handleMarkAllAsRead} disabled={unreadCount === 0 || notifications.length === 0}>
                <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
                Mark all as read
              </Button>
              <Button type="button" size="sm" variant="outline" className="h-8 rounded-lg text-xs" onClick={handleClearAll} disabled={notifications.length === 0}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Clear all
              </Button>
            </div>

            {renderNotificationList(true)}

            <div className="border-t border-border/60 p-3">
              <Button asChild variant="secondary" className="h-10 w-full rounded-xl text-sm">
                <Link href={notificationsPageHref}>View All Notifications</Link>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
