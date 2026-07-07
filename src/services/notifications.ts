import { apiFetch, apiJsonFetch } from "./authHeaders";

export interface AppNotification {
  id: string;
  ticket_id: number | null;
  ticket_number: string | null;
  type: string | null;
  label: string;
  title: string;
  message: string;
  actor_name: string | null;
  actor_role: string | null;
  reply_count: number | null;
  last_comment_id: number | null;
  read_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

interface NotificationsResponseData {
  notifications: AppNotification[];
  unread_count: number;
}

interface MarkAllReadResponseData {
  unread_count: number;
}

interface MarkTicketReadResponseData {
  ticket_id: number;
  unread_count: number;
}

export async function loadNotifications() {
  const response = await apiFetch("/notifications");

  const result = (await response.json()) as ApiResponse<NotificationsResponseData>;

  if (!response.ok || !result.data) {
    throw new Error(result.message || "Notifications could not be loaded.");
  }

  return result.data;
}

export async function markNotificationAsRead(notificationId: string) {
  const response = await apiJsonFetch(`/notifications/${notificationId}/read`, {
    method: "POST",
  });

  const result = (await response.json()) as ApiResponse<AppNotification>;

  if (!response.ok || !result.data) {
    throw new Error(result.message || "Notification could not be marked as read.");
  }

  return result.data;
}

export async function markTicketMessageNotificationsAsRead(ticketId: number) {
  const response = await apiJsonFetch(`/notifications/tickets/${ticketId}/messages/read`, {
    method: "POST",
  });

  const result = (await response.json()) as ApiResponse<MarkTicketReadResponseData>;

  if (!response.ok || !result.data) {
    throw new Error(result.message || "Ticket message notifications could not be marked as read.");
  }

  return result.data;
}

export async function markAllNotificationsAsRead() {
  const response = await apiJsonFetch("/notifications/read-all", {
    method: "POST",
  });

  const result = (await response.json()) as ApiResponse<MarkAllReadResponseData>;

  if (!response.ok || !result.data) {
    throw new Error(result.message || "Notifications could not be marked as read.");
  }

  return result.data;
}
