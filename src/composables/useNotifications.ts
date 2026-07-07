import { computed, ref } from "vue";
import {
  loadNotifications,
  markAllNotificationsAsRead as markAllNotificationsAsReadRequest,
  markNotificationAsRead,
  type AppNotification,
} from "@/services/notifications";

export function useNotifications() {
  const notifications = ref<AppNotification[]>([]);
  const unreadNotificationsCount = ref(0);
  const isNotificationMenuOpen = ref(false);
  const notificationAreaRef = ref<HTMLElement | null>(null);
  const isLoadingNotifications = ref(false);
  const notificationErrorMessage = ref("");

  const notificationCountLabel = computed(() => {
    if (unreadNotificationsCount.value > 99) {
      return "99+";
    }

    return String(unreadNotificationsCount.value);
  });

  async function loadNotificationsList(showLoading = true) {
    if (showLoading) {
      isLoadingNotifications.value = true;
    }

    notificationErrorMessage.value = "";

    try {
      const result = await loadNotifications();

      notifications.value = result.notifications;
      unreadNotificationsCount.value = result.unread_count;
    } catch (error) {
      notificationErrorMessage.value =
        error instanceof Error ? error.message : "Notifications could not be loaded.";
    } finally {
      if (showLoading) {
        isLoadingNotifications.value = false;
      }
    }
  }

  async function markNotificationRead(notification: AppNotification) {
    if (notification.read_at) {
      return;
    }

    try {
      const updatedNotification = await markNotificationAsRead(notification.id);

      notifications.value = notifications.value.map((currentNotification) =>
        currentNotification.id === notification.id ? updatedNotification : currentNotification,
      );

      unreadNotificationsCount.value = Math.max(unreadNotificationsCount.value - 1, 0);
    } catch {
      await loadNotificationsList(false);
    }
  }

  async function markAllNotificationsRead() {
    if (unreadNotificationsCount.value === 0) {
      return;
    }

    try {
      await markAllNotificationsAsReadRequest();

      unreadNotificationsCount.value = 0;
      notifications.value = notifications.value.map((notification) => ({
        ...notification,
        read_at: notification.read_at || new Date().toISOString(),
      }));
    } catch {
      await loadNotificationsList(false);
    }
  }

  async function handleToggleNotificationMenu() {
    isNotificationMenuOpen.value = !isNotificationMenuOpen.value;

    if (isNotificationMenuOpen.value) {
      await loadNotificationsList(false);
    }
  }

  function closeNotificationMenu() {
    isNotificationMenuOpen.value = false;
  }

  function handleNotificationDocumentClick(event: MouseEvent) {
    if (!isNotificationMenuOpen.value) {
      return;
    }

    const clickedElement = event.target as Node | null;

    if (clickedElement && notificationAreaRef.value?.contains(clickedElement)) {
      return;
    }

    closeNotificationMenu();
  }

  return {
    notifications,
    unreadNotificationsCount,
    isNotificationMenuOpen,
    notificationAreaRef,
    isLoadingNotifications,
    notificationErrorMessage,
    notificationCountLabel,
    loadNotificationsList,
    markNotificationRead,
    markAllNotificationsRead,
    handleToggleNotificationMenu,
    closeNotificationMenu,
    handleNotificationDocumentClick,
  };
}
