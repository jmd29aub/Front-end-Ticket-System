import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AccentLine from "@/components/layout/AccentLine/AccentLine.vue";
import NotificationDropdown from "@/components/notifications/NotificationDropdown/NotificationDropdown.vue";
import AppButton from "@/components/ui/AppButton/AppButton.vue";
import AppIcon from "@/components/ui/AppIcon/AppIcon.vue";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge.vue";
import PriorityBadge from "@/components/ui/PriorityBadge/PriorityBadge.vue";
import { useNotifications } from "@/composables/useNotifications";
import { apiFetch, getCurrentUser, logoutUser } from "@/services/authHeaders";
import {
  markNotificationAsRead,
  type AppNotification,
} from "@/services/notifications";
import {
  listenToDashboardUpdates,
  listenToTicketUpdates,
  listenToUserNotifications,
} from "@/services/realtime";
import { createTicketComment, updateTicket } from "@/services/tickets";
import { SUPPORT_MANAGE_CATEGORY_OPTIONS } from "@/constants/tickets";
import {
  formatTicketPriorityForFrontend as formatPriorityForFrontend,
  formatTicketStatusForFrontend as formatStatusForFrontend,
} from "@/utils/ticketFormatters";
import {
  formatDateTime,
  formatNotificationTime,
  formatRelativeTicketDate as formatLastUpdated,
  formatTicketDate as formatDate,
} from "@/utils/dateFormatters";
import type { ActiveTicketStatus, TicketCategory, TicketPriority } from "@/types/tickets";

type SupportStatus = ActiveTicketStatus;
type SupportPriority = TicketPriority;
type ConversationSide = "client" | "support";
type MessageSendStatus = "sending" | "sent" | "failed";
type SupportDashboardSection =
  | "dashboard"
  | "assigned"
  | "all"
  | "clients"
  | "resolved"
  | "notifications"
  | "settings"
  | "profile";

interface BackendComment {
  id: number;
  author_type: string;
  author_name: string | null;
  message: string;
  created_at: string;
}

interface BackendStatusHistory {
  id: number;
  old_status: string | null;
  new_status: string;
  changed_by_type: string;
  changed_by_name: string | null;
  changed_at: string;
  created_at?: string;
  updated_at?: string;
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
  created_at: string;
  updated_at: string;
  comments?: BackendComment[];
  status_history?: BackendStatusHistory[];
}

interface BackendTicketResponse {
  success: boolean;
  message: string;
  data?: BackendTicket;
  errors?: Record<string, string[]>;
}

interface BackendCommentResponse {
  success: boolean;
  message: string;
  data?: BackendComment;
  errors?: Record<string, string[]>;
}

interface ConversationAttachment {
  id: number;
  name: string;
  size: string;
}

interface ConversationMessage {
  id: string;
  avatar: string;
  senderLabel: string;
  message: string;
  side: ConversationSide;
  sendStatus: MessageSendStatus;
  attachments: ConversationAttachment[];
}

interface AgentHistoryItem {
  id: string;
  title: string;
  agent: string;
  date: string;
  description: string;
  isResolved: boolean;
}

interface SupportTicketDetails {
  backendId: number;
  id: string;
  title: string;
  description: string;
  status: SupportStatus;
  priority: SupportPriority;
  assignedTo: string;
  category: string;
  client: string;
  clientEmail: string;
  createdAt: string;
  lastUpdated: string;
  conversation: ConversationMessage[];
  statusHistory: BackendStatusHistory[];
}

const DEFAULT_SUPPORT_TICKET_CATEGORY = SUPPORT_MANAGE_CATEGORY_OPTIONS[0] ?? "General";

export default defineComponent({
  name: "SupportTicketDetailsPage",
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
    
    const ticket = ref<SupportTicketDetails | null>(null);
    const isLoading = ref(false);
    const errorMessage = ref("");
    const isSidebarOpen = ref(false);
    
    const supportAgentName = ref("Support User");
    const draftStatus = ref<SupportStatus>("Open");
    const draftPriority = ref<SupportPriority>("High");
    const draftAgent = ref("Support User");
    const draftCategory = ref<TicketCategory | string>(DEFAULT_SUPPORT_TICKET_CATEGORY);
    
    const replyMessage = ref("");
    const replyAttachmentName = ref("");
    const replyAttachedFiles = ref<File[]>([]);
    const replyFileInput = ref<HTMLInputElement | null>(null);
    const conversationList = ref<HTMLElement | null>(null);
    
    const internalNote = ref("");
    const saveMessage = ref("");
    const replyErrorMessage = ref("");
    const internalNoteMessage = ref("");
    
    const isSavingChanges = ref(false);
    const isSendingReply = ref(false);
    const isAgentHistoryModalOpen = ref(false);
    const {
      notifications,
      unreadNotificationsCount,
      isNotificationMenuOpen,
      notificationAreaRef,
      isLoadingNotifications,
      notificationErrorMessage,
      notificationCountLabel,
      loadNotificationsList: loadSupportTicketDetailsNotifications,
      markNotificationRead,
      markAllNotificationsRead: handleMarkAllNotificationsRead,
      handleToggleNotificationMenu,
      closeNotificationMenu,
      handleNotificationDocumentClick: handleDocumentClick,
    } = useNotifications();
    
    let realtimeCleanup: (() => void) | null = null;
    let dashboardRealtimeCleanup: (() => void) | null = null;
    let notificationRealtimeCleanup: (() => void) | null = null;
    
    const supportDashboardSections: SupportDashboardSection[] = [
      "dashboard",
      "assigned",
      "all",
      "clients",
      "resolved",
      "notifications",
      "settings",
      "profile",
    ];
    
    const ticketId = computed(() => String(route.params.id || ""));
    
    const sourceDashboardSection = computed<SupportDashboardSection>(() => {
      const explicitSection = getDashboardSectionFromQuery(route.query.fromSection);
    
      if (explicitSection) {
        return explicitSection;
      }
    
      const returnToPath = getReturnToPath();
    
      if (returnToPath.includes("section=clients")) {
        return "clients";
      }
    
      if (returnToPath.includes("section=assigned")) {
        return "assigned";
      }
    
      if (returnToPath.includes("section=all")) {
        return "all";
      }
    
      if (returnToPath.includes("section=resolved")) {
        return "resolved";
      }
    
      return "dashboard";
    });
    
    const backButtonLabel = computed(() => {
      const returnLabel = getStringFromQuery(route.query.returnLabel);
    
      if (returnLabel) {
        return `← Back to ${returnLabel}`;
      }
    
      const returnToPath = getReturnToPath();
    
      if (returnToPath.includes("section=clients")) {
        return "← Back to Clients";
      }
    
      if (returnToPath.includes("section=assigned")) {
        return "← Back to Assigned to Me";
      }
    
      if (returnToPath.includes("section=all")) {
        return "← Back to All Tickets";
      }
    
      if (returnToPath.includes("section=resolved")) {
        return "← Back to Resolved Tickets";
      }
    
      if (sourceDashboardSection.value === "clients") {
        return "← Back to Clients";
      }
    
      if (sourceDashboardSection.value === "assigned") {
        return "← Back to Assigned to Me";
      }
    
      if (sourceDashboardSection.value === "all") {
        return "← Back to All Tickets";
      }
    
      if (sourceDashboardSection.value === "resolved") {
        return "← Back to Resolved Tickets";
      }
    
      return "← Back to Dashboard";
    });
    
    const agentHistoryItems = computed<AgentHistoryItem[]>(() => {
      if (!ticket.value) {
        return [];
      }
    
      const items: AgentHistoryItem[] = [
        {
          id: `current-assignment-${ticket.value.backendId}`,
          title: "Current assignment",
          agent: ticket.value.assignedTo,
          date: ticket.value.lastUpdated,
          description: "This ticket is currently assigned to this support agent.",
          isResolved: false,
        },
      ];
    
      ticket.value.statusHistory.forEach((historyItem, index) => {
        const newStatus = formatStatusForFrontend(historyItem.new_status);
        const oldStatus = historyItem.old_status ? formatStatusForFrontend(historyItem.old_status) : "";
        const isResolvedEvent = newStatus === "Resolved";
        const agentName =
          historyItem.changed_by_name ||
          (historyItem.changed_by_type === "support" ? "Support team" : "System");
    
        items.push({
          id: `status-history-${historyItem.id}-${index}`,
          title: isResolvedEvent ? "Resolved ticket" : `Status changed to ${newStatus}`,
          agent: agentName,
          date: formatDateTime(historyItem.changed_at || historyItem.created_at),
          description: oldStatus ? `${oldStatus} → ${newStatus}` : `Marked as ${newStatus}`,
          isResolved: isResolvedEvent,
        });
      });
    
      return items;
    });
    
    const hasRecordedAgentHistory = computed(() => {
      return Boolean(ticket.value?.statusHistory.length);
    });
    
    const resolvedAgentSummary = computed(() => {
      const resolvedItem = [...agentHistoryItems.value].reverse().find((item) => item.isResolved);
    
      if (!resolvedItem) {
        return "";
      }
    
      return `Resolved by ${resolvedItem.agent} on ${resolvedItem.date}`;
    });
    
    function getLoggedInSupportName() {
      return supportAgentName.value || "Support User";
    }
    
    function getAvatarFromName(name: string | null, fallback: string) {
      if (!name) {
        return fallback;
      }
    
      return name.charAt(0).toUpperCase();
    }
    
    function formatStatusForBackend(status: SupportStatus) {
      if (status === "In Progress") {
        return "in_progress";
      }
    
      if (status === "Waiting for Client") {
        return "waiting_for_client";
      }
    
      return status.toLowerCase();
    }
    
    function formatPriorityForBackend(priority: SupportPriority) {
      return priority.toLowerCase();
    }
    
    function formatFileSize(size: number) {
      if (size < 1024) {
        return `${size} B`;
      }
    
      if (size < 1024 * 1024) {
        return `${Math.round(size / 1024)} KB`;
      }
    
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
    
    function extractMessageAttachments(message: string, commentId: number) {
      const attachmentMarker = "\n\nAttached files: ";
    
      if (!message.includes(attachmentMarker)) {
        return {
          cleanMessage: message,
          attachments: [] as ConversationAttachment[],
        };
      }
    
      const [cleanMessage = "", attachmentText = ""] = message.split(attachmentMarker);
      const attachmentNames = attachmentText
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);
    
      return {
        cleanMessage,
        attachments: attachmentNames.map((name, index) => ({
          id: commentId * 1000 + index,
          name,
          size: "Attached",
        })),
      };
    }
    
    function buildConversation(comments: BackendComment[]): ConversationMessage[] {
      return comments.map((comment) => {
        const isClient = comment.author_type === "client";
        const extractedMessage = extractMessageAttachments(comment.message, comment.id);
        const senderLabel = comment.author_name || (isClient ? "Client" : "Support team");
    
        return {
          id: String(comment.id),
          avatar: getAvatarFromName(comment.author_name, isClient ? "C" : "S"),
          senderLabel,
          message: extractedMessage.cleanMessage,
          side: isClient ? "client" : "support",
          sendStatus: "sent",
          attachments: extractedMessage.attachments,
        };
      });
    }
    
    function mapBackendTicket(backendTicket: BackendTicket): SupportTicketDetails {
      const supportName = getLoggedInSupportName();
    
      return {
        backendId: backendTicket.id,
        id: String(backendTicket.id),
        title: backendTicket.title,
        description: backendTicket.description,
        status: formatStatusForFrontend(backendTicket.status),
        priority: formatPriorityForFrontend(backendTicket.priority),
        assignedTo: supportName,
        category: backendTicket.category || DEFAULT_SUPPORT_TICKET_CATEGORY,
        client: backendTicket.created_by_name || "Client User",
        clientEmail: backendTicket.created_by_email || "client@example.com",
        createdAt: formatDate(backendTicket.created_at),
        lastUpdated: formatLastUpdated(backendTicket.updated_at || backendTicket.created_at),
        conversation: buildConversation(backendTicket.comments || []),
        statusHistory: backendTicket.status_history || [],
      };
    }
    
    function syncDraftsFromTicket(currentTicket: SupportTicketDetails) {
      draftStatus.value = currentTicket.status;
      draftPriority.value = currentTicket.priority;
      draftAgent.value = currentTicket.assignedTo;
      draftCategory.value = currentTicket.category;
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
      if (!ticketId.value) {
        errorMessage.value = "Ticket ID is missing.";
        return;
      }
    
      if (showLoading) {
        isLoading.value = true;
        errorMessage.value = "";
      }
    
      try {
        const oldConversationLength = ticket.value?.conversation.length ?? 0;
        const oldLastMessageId = ticket.value?.conversation.at(-1)?.id ?? "";
    
        const response = await apiFetch(`/tickets/${ticketId.value}`);
    
        const result: BackendTicketResponse = await response.json();
    
        if (!response.ok || !result.data) {
          throw new Error(result.message || "Ticket could not be loaded.");
        }
    
        const mappedTicket = mapBackendTicket(result.data);
    
        ticket.value = mappedTicket;
    
        if (showLoading) {
          syncDraftsFromTicket(mappedTicket);
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
    
    async function markCurrentTicketClientMessageNotificationsAsRead() {
      const numericTicketId = Number(ticketId.value);
    
      if (Number.isNaN(numericTicketId)) {
        return;
      }
    
      const unreadClientReplyNotifications = notifications.value.filter((notification) => {
        return (
          notification.ticket_id === numericTicketId &&
          notification.type === "client_reply" &&
          !notification.read_at
        );
      });
    
      if (unreadClientReplyNotifications.length === 0) {
        return;
      }
    
      try {
        await Promise.all(
          unreadClientReplyNotifications.map((notification) => markNotificationAsRead(notification.id)),
        );
    
        const readAt = new Date().toISOString();
        const readNotificationIds = new Set(
          unreadClientReplyNotifications.map((notification) => notification.id),
        );
    
        unreadNotificationsCount.value = Math.max(
          unreadNotificationsCount.value - unreadClientReplyNotifications.length,
          0,
        );
    
        notifications.value = notifications.value.map((notification) => {
          if (!readNotificationIds.has(notification.id)) {
            return notification;
          }
    
          return {
            ...notification,
            read_at: notification.read_at || readAt,
          };
        });
      } catch {
        await loadSupportTicketDetailsNotifications(false);
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
          if (isSendingReply.value || isSavingChanges.value) {
            return;
          }
    
          void loadTicket(false);
    
          void loadSupportTicketDetailsNotifications(false).then(() => {
            void markCurrentTicketClientMessageNotificationsAsRead();
          });
        },
        () => {
          goBackToDashboard();
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
    
      if (notification.type === "ticket_deleted") {
        goBackToDashboard();
        return;
      }
    
      await router.push({
        name: "support-ticket-details",
        params: { id: String(notification.ticket_id) },
      });
    }
    
    function toggleSidebar() {
      isSidebarOpen.value = !isSidebarOpen.value;
    }
    
    function getStringFromQuery(value: unknown) {
      const queryValue = Array.isArray(value) ? value[0] : value;
    
      if (typeof queryValue !== "string") {
        return "";
      }
    
      return queryValue.trim();
    }
    
    function getDashboardSectionFromQuery(section: unknown) {
      const sectionValue = Array.isArray(section) ? section[0] : section;
    
      if (typeof sectionValue !== "string") {
        return "";
      }
    
      if (supportDashboardSections.includes(sectionValue as SupportDashboardSection)) {
        return sectionValue as SupportDashboardSection;
      }
    
      return "";
    }
    
    function getReturnToPath() {
      const returnToPath = getStringFromQuery(route.query.returnTo);
    
      if (!returnToPath || !returnToPath.startsWith("/")) {
        return "";
      }
    
      if (returnToPath === route.fullPath) {
        return "";
      }
    
      return returnToPath;
    }
    
    function goBackToDashboard() {
      const returnToPath = getReturnToPath();
    
      if (returnToPath) {
        router.push(returnToPath);
        return;
      }
    
      router.push({ name: "support-dashboard" });
    }
    
    function goToSupportDashboardSection(section: SupportDashboardSection) {
      const query: Record<string, string> = {};
    
      if (section !== "dashboard") {
        query.section = section;
      }
    
      router.push({
        name: "support-dashboard",
        query,
      });
    }
    
    function openAgentHistoryModal() {
      isAgentHistoryModalOpen.value = true;
    }
    
    function closeAgentHistoryModal() {
      isAgentHistoryModalOpen.value = false;
    }
    
    async function handleSignOut() {
      try {
        await logoutUser();
      } finally {
        router.replace({ name: "login" });
      }
    }
    
    async function handleSaveChanges() {
      if (!ticket.value || isSavingChanges.value) {
        return;
      }
    
      isSavingChanges.value = true;
      saveMessage.value = "";
    
      try {
        const response = await updateTicket(ticket.value.backendId, {
          status: formatStatusForBackend(draftStatus.value),
          priority: formatPriorityForBackend(draftPriority.value),
          category: draftCategory.value,
          changed_by_type: "support",
          changed_by_name: getLoggedInSupportName(),
        });
    
        const result = (await response.json().catch(() => null)) as BackendTicketResponse | null;
    
        if (!response.ok) {
          const validationErrors = result?.errors ? Object.values(result.errors).flat().join(" ") : "";
    
          throw new Error(validationErrors || result?.message || "Ticket could not be updated.");
        }
    
        if (result?.data) {
          const mappedTicket = mapBackendTicket(result.data);
    
          ticket.value = mappedTicket;
          syncDraftsFromTicket(mappedTicket);
        } else {
          ticket.value = {
            ...ticket.value,
            status: draftStatus.value,
            priority: draftPriority.value,
            category: draftCategory.value,
            assignedTo: draftAgent.value,
            lastUpdated: "Today",
          };
        }
    
        saveMessage.value = "Changes saved successfully.";
    
        window.setTimeout(() => {
          saveMessage.value = "";
        }, 1800);
      } catch (error) {
        saveMessage.value =
          error instanceof Error ? error.message : "Something went wrong while saving changes.";
      } finally {
        isSavingChanges.value = false;
      }
    }
    
    function openReplyAttachment() {
      replyFileInput.value?.click();
    }
    
    function handleReplyAttachmentChange(event: Event) {
      const target = event.target as HTMLInputElement;
      const files = Array.from(target.files ?? []);
    
      if (files.length === 0) {
        return;
      }
    
      replyAttachedFiles.value = files;
      const firstFile = files[0];
    
      replyAttachmentName.value =
        files.length === 1 && firstFile ? firstFile.name : `${files.length} files selected`;
    
      target.value = "";
    }
    
    function buildMessageForBackend(message: string, files: File[]) {
      if (files.length === 0) {
        return message;
      }
    
      const fileNames = files.map((file) => file.name).join(", ");
    
      return `${message}\n\nAttached files: ${fileNames}`;
    }
    
    async function handleSendReply() {
      const message = replyMessage.value.trim();
    
      if (
        (!message && replyAttachedFiles.value.length === 0) ||
        isSendingReply.value ||
        !ticket.value
      ) {
        return;
      }
    
      const temporaryMessageId = `temporary-${Date.now()}`;
      const supportName = getLoggedInSupportName();
      const filesToSend = [...replyAttachedFiles.value];
    
      const optimisticMessage: ConversationMessage = {
        id: temporaryMessageId,
        avatar: getAvatarFromName(supportName, "S"),
        senderLabel: supportName,
        message: message || "Attached file.",
        side: "support",
        sendStatus: "sending",
        attachments: filesToSend.map((file, index) => ({
          id: Date.now() + index,
          name: file.name,
          size: formatFileSize(file.size),
        })),
      };
    
      ticket.value.conversation.push(optimisticMessage);
      replyMessage.value = "";
      replyAttachmentName.value = "";
      replyAttachedFiles.value = [];
      replyErrorMessage.value = "";
      isSendingReply.value = true;
    
      await scrollConversationToBottom();
    
      try {
        const response = await createTicketComment(ticket.value.backendId, {
          author_type: "support",
          author_name: supportName,
          message: buildMessageForBackend(message || "Attached file.", filesToSend),
        });
    
        const result: BackendCommentResponse = await response.json();
    
        if (!response.ok) {
          const validationErrors = result.errors ? Object.values(result.errors).flat().join(" ") : "";
    
          throw new Error(validationErrors || result.message || "Reply could not be sent.");
        }
    
        const savedMessage = ticket.value.conversation.find((item) => item.id === temporaryMessageId);
    
        if (savedMessage && result.data) {
          savedMessage.id = String(result.data.id);
          savedMessage.sendStatus = "sent";
        }
    
        ticket.value.lastUpdated = "Today";
    
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
    
    function handleSaveInternalNote() {
      if (!internalNote.value.trim()) {
        internalNoteMessage.value = "Please write an internal note before saving.";
        return;
      }
    
      internalNote.value = "";
      internalNoteMessage.value = "Internal note saved locally.";
    
      window.setTimeout(() => {
        internalNoteMessage.value = "";
      }, 1800);
    }
    
    watch(ticketId, async (newTicketId, oldTicketId) => {
      if (!newTicketId || newTicketId === oldTicketId) {
        return;
      }
    
      await loadTicket(true);
      await loadSupportTicketDetailsNotifications(false);
      await markCurrentTicketClientMessageNotificationsAsRead();
    
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
    
        const userRole = String(user.role ?? "")
          .trim()
          .toLowerCase();
    
        if (userRole !== "support") {
          router.push({ name: "client-dashboard" });
          return;
        }
    
        supportAgentName.value = user.name || "Support User";
        draftAgent.value = supportAgentName.value;
    
        await Promise.all([loadTicket(true), loadSupportTicketDetailsNotifications()]);
    
        await markCurrentTicketClientMessageNotificationsAsRead();
    
        setupTicketRealtime();
    
        dashboardRealtimeCleanup = listenToDashboardUpdates(user.id, "support", () => {
          void loadSupportTicketDetailsNotifications(false).then(() => {
            void markCurrentTicketClientMessageNotificationsAsRead();
          });
        });
    
        notificationRealtimeCleanup = listenToUserNotifications(user.id, () => {
          void loadSupportTicketDetailsNotifications(false).then(() => {
            void markCurrentTicketClientMessageNotificationsAsRead();
          });
        });
      } catch {
        router.push({ name: "login" });
      }
    });
    
    onBeforeUnmount(() => {
      document.removeEventListener("click", handleDocumentClick);
    
      cleanupTicketRealtime();
    
      if (dashboardRealtimeCleanup) {
        dashboardRealtimeCleanup();
        dashboardRealtimeCleanup = null;
      }
    
      if (notificationRealtimeCleanup) {
        notificationRealtimeCleanup();
        notificationRealtimeCleanup = null;
      }
    });

    return {
      route,
      router,
      ticket,
      isLoading,
      errorMessage,
      isSidebarOpen,
      supportAgentName,
      draftStatus,
      draftPriority,
      draftAgent,
      draftCategory,
      replyMessage,
      replyAttachmentName,
      replyAttachedFiles,
      replyFileInput,
      conversationList,
      internalNote,
      saveMessage,
      replyErrorMessage,
      internalNoteMessage,
      isSavingChanges,
      isSendingReply,
      isAgentHistoryModalOpen,
      notifications,
      unreadNotificationsCount,
      isNotificationMenuOpen,
      notificationAreaRef,
      isLoadingNotifications,
      notificationErrorMessage,
      realtimeCleanup,
      dashboardRealtimeCleanup,
      notificationRealtimeCleanup,
      supportDashboardSections,
      ticketId,
      notificationCountLabel,
      sourceDashboardSection,
      backButtonLabel,
      agentHistoryItems,
      hasRecordedAgentHistory,
      resolvedAgentSummary,
      getLoggedInSupportName,
      getAvatarFromName,
      formatStatusForFrontend,
      formatStatusForBackend,
      formatPriorityForFrontend,
      formatPriorityForBackend,
      formatDate,
      formatLastUpdated,
      formatDateTime,
      formatNotificationTime,
      formatFileSize,
      extractMessageAttachments,
      buildConversation,
      mapBackendTicket,
      syncDraftsFromTicket,
      scrollConversationToBottom,
      loadTicket,
      loadSupportTicketDetailsNotifications,
      markCurrentTicketClientMessageNotificationsAsRead,
      cleanupTicketRealtime,
      setupTicketRealtime,
      handleToggleNotificationMenu,
      handleNotificationClick,
      handleMarkAllNotificationsRead,
      handleDocumentClick,
      toggleSidebar,
      getStringFromQuery,
      getDashboardSectionFromQuery,
      getReturnToPath,
      goBackToDashboard,
      goToSupportDashboardSection,
      openAgentHistoryModal,
      closeAgentHistoryModal,
      handleSignOut,
      handleSaveChanges,
      openReplyAttachment,
      handleReplyAttachmentChange,
      buildMessageForBackend,
      handleSendReply,
      handleSaveInternalNote,
    };
  },
});
