export type NotificationType =
  | "new_booking_created"
  | "pending_booking_approval"
  | "booking_cancelled"
  | "payment_received"
  | "new_review_submitted"
  | "new_user_message";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export const DEFAULT_USER_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "u-booking-confirmed",
    type: "new_booking_created",
    title: "Booking Confirmed",
    message: "Your Pawna Lake booking is confirmed for this weekend.",
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: "u-upcoming-reminder",
    type: "pending_booking_approval",
    title: "Upcoming Camp Reminder",
    message: "Your camp starts tomorrow. Check your itinerary.",
    isRead: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: "u-offer",
    type: "new_user_message",
    title: "Limited Offer",
    message: "Early check-in upgrade is available at a special price.",
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

export function dedupeNotifications(items: NotificationItem[]) {
  const seen = new Set<string>();
  const deduped: NotificationItem[] = [];

  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    deduped.push(item);
  }

  return deduped;
}

export function formatNotificationTime(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return "just now";
  }

  const now = Date.now();
  const diffMs = Math.max(0, now - date.getTime());
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} day ago`;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

export function normalizeNotificationItem(raw: any): NotificationItem | null {
  const id = raw?._id || raw?.id;
  if (!id) return null;

  return {
    id: String(id),
    type: (raw?.type as NotificationType) || "new_user_message",
    title: String(raw?.title || "Notification"),
    message: String(raw?.message || ""),
    isRead: Boolean(raw?.isRead),
    createdAt: String(raw?.createdAt || new Date().toISOString()),
  };
}

export function normalizeNotificationsFromApi(payload: any): NotificationItem[] {
  const list = Array.isArray(payload?.notifications)
    ? payload.notifications
    : Array.isArray(payload)
      ? payload
      : [];

  const normalized = list
    .map((item: any) => normalizeNotificationItem(item))
    .filter((item: NotificationItem | null): item is NotificationItem => item !== null);

  return dedupeNotifications(normalized).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getUnreadCountFromApi(payload: any, notifications: NotificationItem[] = []): number {
  if (typeof payload?.unreadCount === 'number' && Number.isFinite(payload.unreadCount)) {
    return Math.max(0, payload.unreadCount);
  }

  return notifications.filter((item) => !item.isRead).length;
}
