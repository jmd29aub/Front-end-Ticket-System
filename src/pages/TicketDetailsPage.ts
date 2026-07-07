import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AccentLine from "@/components/layout/AccentLine/AccentLine.vue";
import NotificationDropdown from "@/components/notifications/NotificationDropdown/NotificationDropdown.vue";
import AppButton from "@/components/ui/AppButton/AppButton.vue";
import AppIcon from "@/components/ui/AppIcon/AppIcon.vue";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge.vue";
import PriorityBadge from "@/components/ui/PriorityBadge/PriorityBadge.vue";
import { useNotifications } from "@/composables/useNotifications";
import { apiFetch, apiJsonFetch, getCurrentUser, logoutUser } from "@/services/authHeaders";
import {
  markTicketMessageNotificationsAsRead,
  type AppNotification,
} from "@/services/notifications";
import { listenToTicketUpdates, listenToUserNotifications } from "@/services/realtime";
import { createTicketComment } from "@/services/tickets";
import { CLIENT_EDIT_CATEGORY_OPTIONS } from "@/constants/tickets";
import {
  formatTicketPriorityForFrontend as formatPriorityForFrontend,
  formatTicketStatusForFrontend as formatStatusForFrontend,
} from "@/utils/ticketFormatters";
import {
  formatNotificationTime,
  formatRelativeTicketDate as formatLastUpdated,
  formatTicketDate as formatDate,
} from "@/utils/dateFormatters";
import type { ActiveTicketStatus, TicketPriority } from "@/types/tickets";

type TicketStatus = ActiveTicketStatus;
type ConversationSide = "client" | "support";
type MessageSendStatus = "sending" | "sent" | "failed";
type ClientDashboardSection = "history" | "notifications" | "settings" | "profile";

interface BackendComment {
  id: number;
  ticket_id: number;
  author_type: string;
  author_name: string | null;
  message: string;
  created_at: string;
  updated_at: string;
}

interface BackendStatusHistory {
  id: number;
  ticket_id: number;
  old_status: string | null;
  new_status: string;
  changed_by_type: string;
  changed_by_name: string | null;
  changed_at: string;
  created_at: string;
  updated_at: string;
}

interface BackendTicket {
  id: number;
  title: string;
  category: string | null;
  description: string;
  status: string;
  priority: string;
  created_by_name: string | null;
  created_by_email: string | null;
  comments: BackendComment[];
  status_history: BackendStatusHistory[];
  created_at: string;
  updated_at: string;
}

interface BackendTicketResponse {
  success: boolean;
  message: string;
  data: BackendTicket;
}

interface BackendCommentResponse {
  success: boolean;
  message: string;
  data: BackendComment;
  errors?: Record<string, string[]>;
}

interface BackendDeleteResponse {
  success: boolean;
  message: string;
  data: null;
  errors?: Record<string, string[]>;
}

interface ConversationMessage {
  id: string;
  avatar: string;
  senderLabel: string;
  message: string;
  side: ConversationSide;
  sendStatus: MessageSendStatus;
}

interface TicketDetails {
  id: string;
  title: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
  createdAt: string;
  lastUpdated: string;
  client: string;
  expectedResponseTime: string;
  progress: {
    submitted: string;
    open: string;
    inProgress: string;
    resolved: string;
  };
  conversation: ConversationMessage[];
}

const DEFAULT_TICKET_CATEGORY = CLIENT_EDIT_CATEGORY_OPTIONS[0] ?? "General";

export default defineComponent({
  name: "TicketDetailsPage",
  components: {
    AccentLine,
    NotificationDropdown,
    AppButton,
    AppIcon,
    StatusBadge,
    PriorityBadge,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    const ticket = ref<TicketDetails | null>(null);
    const replyMessage = ref("");
    const replyAttachmentName = ref("");
    const replyFileInput = ref<HTMLInputElement | null>(null);
    const conversationList = ref<HTMLElement | null>(null);
    const isLoading = ref(false);
    const isSendingReply = ref(false);
    const errorMessage = ref("");
    const replyErrorMessage = ref("");
    const currentClientName = ref("Client User");
    const isSidebarOpen = ref(false);
    const {
      notifications,
      unreadNotificationsCount,
      isNotificationMenuOpen,
      notificationAreaRef,
      isLoadingNotifications,
      notificationErrorMessage,
      notificationCountLabel,
      loadNotificationsList: loadTicketDetailsNotifications,
      markNotificationRead,
      markAllNotificationsRead: handleMarkAllNotificationsRead,
      handleToggleNotificationMenu,
      closeNotificationMenu,
      handleNotificationDocumentClick: handleDocumentClick,
    } = useNotifications();
    
    const isDeleteModalOpen = ref(false);
    const deleteReason = ref("");
    const deleteErrorMessage = ref("");
    const isDeletingTicket = ref(false);
    
    let realtimeCleanup: (() => void) | null = null;
    let notificationRealtimeCleanup: (() => void) | null = null;
    
    const ticketId = computed(() => String(route.params.id ?? ""));
    
    const isResolved = computed(() => ticket.value?.status === "Resolved");
    
    const requiresDeleteReason = computed(() => {
      return ticket.value?.status !== "Open";
    });
    
    function getClientDisplayName() {
      return currentClientName.value || "Client User";
    }
    
    function toggleSidebar() {
      isSidebarOpen.value = !isSidebarOpen.value;
    }
    
    function goToCreateTicket() {
      router.push({ name: "create-ticket" });
    }
    
    function goToClientDashboardSection(section: ClientDashboardSection) {
      router.push({
        name: "client-dashboard",
        query: {
          section,
          returnTo: route.fullPath,
        },
      });
    }
    
    function getHistoryDate(statusHistory: BackendStatusHistory[], status: string) {
      const historyItem = statusHistory.find((item) => item.new_status === status);
    
      return historyItem ? formatDate(historyItem.changed_at) : "";
    }
    
    function getExpectedResponseTime(priority: TicketPriority) {
      if (priority === "High") {
        return "8 hours";
      }
    
      if (priority === "Low") {
        return "48 hours";
      }
    
      return "24 hours";
    }
    
    function getAvatarFromName(name: string | null, fallback: string) {
      if (!name) {
        return fallback;
      }
    
      return name.charAt(0).toUpperCase();
    }
    
    function buildConversation(comments: BackendComment[]): ConversationMessage[] {
      const defaultMessage: ConversationMessage = {
        id: "default-support-message",
        avatar: "S",
        senderLabel: "Support team",
        message: "How can we help you?",
        side: "support",
        sendStatus: "sent",
      };
    
      const commentMessages: ConversationMessage[] = comments.map((comment) => {
        const isClient = comment.author_type === "client";
    
        return {
          id: String(comment.id),
          avatar: getAvatarFromName(comment.author_name, isClient ? "C" : "S"),
          senderLabel: comment.author_name || (isClient ? "Client" : "Support team"),
          message: comment.message,
          side: isClient ? "client" : "support",
          sendStatus: "sent",
        };
      });
    
      return [defaultMessage, ...commentMessages];
    }
    
    function mapBackendTicket(backendTicket: BackendTicket): TicketDetails {
      const priority = formatPriorityForFrontend(backendTicket.priority);
    
      return {
        id: String(backendTicket.id),
        title: backendTicket.title,
      category: backendTicket.category || DEFAULT_TICKET_CATEGORY,
        priority,
        status: formatStatusForFrontend(backendTicket.status),
        description: backendTicket.description,
        createdAt: formatDate(backendTicket.created_at),
        lastUpdated: formatLastUpdated(backendTicket.updated_at || backendTicket.created_at),
        client: getAvatarFromName(backendTicket.created_by_name, "C"),
        expectedResponseTime: getExpectedResponseTime(priority),
        progress: {
          submitted: formatDate(backendTicket.created_at),
          open:
            getHistoryDate(backendTicket.status_history, "open") ||
            formatDate(backendTicket.created_at),
          inProgress: getHistoryDate(backendTicket.status_history, "in_progress") || "Pending",
          resolved:
            getHistoryDate(backendTicket.status_history, "resolved") ||
            getHistoryDate(backendTicket.status_history, "closed"),
        },
        conversation: buildConversation(backendTicket.comments || []),
      };
    }
    
    async function scrollConversationToBottom(behavior: ScrollBehavior = "smooth") {
      await nextTick();
    
      window.requestAnimationFrame(() => {
        if (!conversationList.value) {
          return;
        }
    
        conversationList.value.scrollTo({
          top: conversationList.value.scrollHeight,
          behavior,
        });
      });
    
      window.setTimeout(() => {
        if (!conversationList.value) {
          return;
        }
    
        conversationList.value.scrollTo({
          top: conversationList.value.scrollHeight,
          behavior,
        });
      }, 80);
    }
    
    async function loadTicket(showLoading = true) {
      if (showLoading) {
        isLoading.value = true;
        errorMessage.value = "";
      }
    
      try {
        const oldConversationLength = ticket.value?.conversation.length ?? 0;
        const oldLastMessageId = ticket.value?.conversation.at(-1)?.id ?? "";
    
        const response = await apiFetch(`/tickets/${ticketId.value}`);
    
        const result: BackendTicketResponse = await response.json();
    
        if (!response.ok) {
          throw new Error(result.message || "Ticket could not be loaded.");
        }
    
        ticket.value = mapBackendTicket(result.data);
    
        if (showLoading) {
          isLoading.value = false;
          await scrollConversationToBottom("auto");
          return;
        }
    
        const newConversationLength = ticket.value.conversation.length;
        const newLastMessageId = ticket.value.conversation.at(-1)?.id ?? "";
    
        if (newConversationLength > oldConversationLength || newLastMessageId !== oldLastMessageId) {
          await scrollConversationToBottom();
        }
      } catch (error) {
        if (showLoading) {
          ticket.value = null;
          errorMessage.value =
            error instanceof Error ? error.message : "Something went wrong while loading the ticket.";
        }
      } finally {
        if (showLoading) {
          isLoading.value = false;
        }
      }
    }
    
    async function markCurrentTicketMessageNotificationsAsRead() {
      const numericTicketId = Number(ticketId.value);
    
      if (Number.isNaN(numericTicketId)) {
        return;
      }
    
      const hasUnreadMessageNotificationsForCurrentTicket = notifications.value.some((notification) => {
        return (
          notification.ticket_id === numericTicketId &&
          notification.type === "support_reply" &&
          !notification.read_at
        );
      });
    
      if (!hasUnreadMessageNotificationsForCurrentTicket) {
        return;
      }
    
      try {
        const result = await markTicketMessageNotificationsAsRead(numericTicketId);
        const readAt = new Date().toISOString();
    
        unreadNotificationsCount.value = result.unread_count;
    
        notifications.value = notifications.value.map((notification) => {
          if (notification.ticket_id !== numericTicketId || notification.type !== "support_reply") {
            return notification;
          }
    
          return {
            ...notification,
            read_at: notification.read_at || readAt,
          };
        });
      } catch {
        await loadTicketDetailsNotifications(false);
      }
    }
    
    function cleanupTicketRealtime() {
      if (realtimeCleanup) {
        realtimeCleanup();
        realtimeCleanup = null;
      }
    }
    
    function setupTicketRealtime() {
      cleanupTicketRealtime();
    
      const numericTicketId = Number(ticketId.value);
    
      if (Number.isNaN(numericTicketId)) {
        return;
      }
    
      realtimeCleanup = listenToTicketUpdates(
        numericTicketId,
        () => {
          if (isSendingReply.value || isDeletingTicket.value) {
            return;
          }
    
          void loadTicket(false);
    
          void loadTicketDetailsNotifications(false).then(() => {
            void markCurrentTicketMessageNotificationsAsRead();
          });
        },
        () => {
          router.push({ name: "client-dashboard" });
        },
      );
    }
    
    async function handleNotificationClick(notification: AppNotification) {
      if (!notification.ticket_id) {
        return;
      }
    
      if (!notification.read_at) {
        await markNotificationRead(notification);
      }
    
      closeNotificationMenu();
    
      if (String(notification.ticket_id) !== ticketId.value) {
        await router.push({
          name: "ticket-details",
          params: { id: String(notification.ticket_id) },
        });
      }
    }
    
    function goBackToDashboard() {
      router.push({ name: "client-dashboard" });
    }
    
    function goToDashboard() {
      router.push({ name: "client-dashboard" });
    }
    
    async function handleSignOut() {
      try {
        await logoutUser();
      } finally {
        router.push({ name: "login" });
      }
    }
    
    function openReplyAttachment() {
      replyFileInput.value?.click();
    }
    
    function handleReplyAttachmentChange(event: Event) {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
    
      if (file) {
        replyAttachmentName.value = file.name;
      }
    }
    
    async function handleSendReply() {
      const message = replyMessage.value.trim();
    
      if (!message || isSendingReply.value || !ticket.value) {
        return;
      }
    
      const temporaryMessageId = `temporary-${Date.now()}`;
      const clientDisplayName = getClientDisplayName();
    
      const optimisticMessage: ConversationMessage = {
        id: temporaryMessageId,
        avatar: getAvatarFromName(clientDisplayName, "C"),
        senderLabel: clientDisplayName,
        message,
        side: "client",
        sendStatus: "sending",
      };
    
      ticket.value.conversation.push(optimisticMessage);
      replyMessage.value = "";
      replyAttachmentName.value = "";
      replyErrorMessage.value = "";
      isSendingReply.value = true;
    
      await scrollConversationToBottom();
    
      try {
        const response = await createTicketComment(ticketId.value, {
          author_type: "client",
          author_name: clientDisplayName,
          message,
        });
    
        const result: BackendCommentResponse = await response.json();
    
        if (!response.ok) {
          const validationErrors = result.errors ? Object.values(result.errors).flat().join(" ") : "";
    
          throw new Error(validationErrors || result.message || "Reply could not be sent.");
        }
    
        const savedMessage = ticket.value.conversation.find((item) => item.id === temporaryMessageId);
    
        if (savedMessage) {
          savedMessage.id = String(result.data.id);
          savedMessage.sendStatus = "sent";
        }
    
        await scrollConversationToBottom();
      } catch (error) {
        const failedMessage = ticket.value.conversation.find((item) => item.id === temporaryMessageId);
    
        if (failedMessage) {
          failedMessage.sendStatus = "failed";
        }
    
        replyErrorMessage.value =
          error instanceof Error ? error.message : "Something went wrong while sending the reply.";
      } finally {
        isSendingReply.value = false;
      }
    }
    
    function openDeleteModal() {
      deleteReason.value = "";
      deleteErrorMessage.value = "";
      isDeleteModalOpen.value = true;
    }
    
    function closeDeleteModal() {
      if (isDeletingTicket.value) {
        return;
      }
    
      isDeleteModalOpen.value = false;
      deleteReason.value = "";
      deleteErrorMessage.value = "";
    }
    
    async function confirmDeleteTicket() {
      if (!ticket.value || isDeletingTicket.value) {
        return;
      }
    
      deleteErrorMessage.value = "";
    
      if (requiresDeleteReason.value && deleteReason.value.trim() === "") {
        deleteErrorMessage.value = "Please write a reason before deleting this ticket.";
        return;
      }
    
      isDeletingTicket.value = true;
    
      try {
        const response = await apiJsonFetch(`/tickets/${ticketId.value}`, {
          method: "DELETE",
          body: JSON.stringify({
            delete_reason: deleteReason.value.trim(),
          }),
        });
    
        const result: BackendDeleteResponse = await response.json();
    
        if (!response.ok) {
          const validationErrors = result.errors ? Object.values(result.errors).flat().join(" ") : "";
    
          throw new Error(validationErrors || result.message || "Ticket could not be deleted.");
        }
    
        router.push({ name: "client-dashboard" });
      } catch (error) {
        deleteErrorMessage.value =
          error instanceof Error ? error.message : "Something went wrong while deleting the ticket.";
      } finally {
        isDeletingTicket.value = false;
      }
    }
    
    watch(ticketId, async (newTicketId, oldTicketId) => {
      if (!newTicketId || newTicketId === oldTicketId) {
        return;
      }
    
      await loadTicket(true);
      await loadTicketDetailsNotifications(false);
      await markCurrentTicketMessageNotificationsAsRead();
    
      setupTicketRealtime();
    });
    
    onMounted(async () => {
      document.addEventListener("click", handleDocumentClick);
    
      try {
        const user = await getCurrentUser();
    
        if (!user) {
          router.push({ name: "login" });
          return;
        }
    
        if (user.role !== "client") {
          router.push({ name: "support-dashboard" });
          return;
        }
    
        currentClientName.value = user.name || "Client User";
    
        await Promise.all([loadTicket(true), loadTicketDetailsNotifications()]);
    
        await markCurrentTicketMessageNotificationsAsRead();
    
        setupTicketRealtime();
    
        notificationRealtimeCleanup = listenToUserNotifications(user.id, () => {
          void loadTicketDetailsNotifications(false).then(() => {
            void markCurrentTicketMessageNotificationsAsRead();
          });
        });
      } catch {
        router.push({ name: "login" });
      }
    });
    
    onBeforeUnmount(() => {
      document.removeEventListener("click", handleDocumentClick);
    
      cleanupTicketRealtime();
    
      if (notificationRealtimeCleanup) {
        notificationRealtimeCleanup();
        notificationRealtimeCleanup = null;
      }
    });

    return {
      ticket,
      replyMessage,
      replyAttachmentName,
      replyFileInput,
      conversationList,
      isLoading,
      isSendingReply,
      errorMessage,
      replyErrorMessage,
      currentClientName,
      isSidebarOpen,
      notifications,
      unreadNotificationsCount,
      isNotificationMenuOpen,
      notificationAreaRef,
      isLoadingNotifications,
      notificationErrorMessage,
      isDeleteModalOpen,
      deleteReason,
      deleteErrorMessage,
      isDeletingTicket,
      ticketId,
      isResolved,
      requiresDeleteReason,
      notificationCountLabel,
      getClientDisplayName,
      toggleSidebar,
      goToCreateTicket,
      goToClientDashboardSection,
      formatStatusForFrontend,
      formatPriorityForFrontend,
      formatDate,
      formatLastUpdated,
      formatNotificationTime,
      getHistoryDate,
      getExpectedResponseTime,
      getAvatarFromName,
      buildConversation,
      mapBackendTicket,
      scrollConversationToBottom,
      loadTicket,
      loadTicketDetailsNotifications,
      markCurrentTicketMessageNotificationsAsRead,
      cleanupTicketRealtime,
      setupTicketRealtime,
      handleToggleNotificationMenu,
      handleNotificationClick,
      handleMarkAllNotificationsRead,
      handleDocumentClick,
      goBackToDashboard,
      goToDashboard,
      handleSignOut,
      openReplyAttachment,
      handleReplyAttachmentChange,
      handleSendReply,
      openDeleteModal,
      closeDeleteModal,
      confirmDeleteTicket,
    };
  },
});
