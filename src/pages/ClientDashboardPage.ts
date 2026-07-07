import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AccentLine from "@/components/layout/AccentLine/AccentLine.vue";
import NotificationDropdown from "@/components/notifications/NotificationDropdown/NotificationDropdown.vue";
import PasswordConfirmationModal from "@/components/password/PasswordConfirmationModal/PasswordConfirmationModal.vue";
import AppButton from "@/components/ui/AppButton/AppButton.vue";
import AppIcon from "@/components/ui/AppIcon/AppIcon.vue";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge.vue";
import PriorityBadge from "@/components/ui/PriorityBadge/PriorityBadge.vue";
import { useNotifications } from "@/composables/useNotifications";
import { usePasswordConfirmation } from "@/composables/usePasswordConfirmation";
import { useTicketFilters } from "@/composables/useTicketFilters";
import { apiFetch, getCurrentUser, logoutUser } from "@/services/authHeaders";
import type { AppNotification } from "@/services/notifications";
import { listenToDashboardUpdates, listenToUserNotifications } from "@/services/realtime";
import { useAppTheme } from "@/services/theme";
import { updateTicket } from "@/services/tickets";
import {
  formatNotificationTime,
  formatRelativeTicketDate as formatLastUpdated,
} from "@/utils/dateFormatters";

type TicketStatus = "Open" | "In Progress" | "Resolved" | "Waiting for Client";
type TicketPriority = "High" | "Medium" | "Low";
type ProgressDirection = "next" | "previous";
type ClientSection =
  | "dashboard"
  | "view-all"
  | "history"
  | "notifications"
  | "profile"
  | "settings";

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
}

interface BackendTicketsResponse {
  success: boolean;
  message: string;
  data: BackendTicket[];
}

interface BackendTicketUpdateResponse {
  success: boolean;
  message: string;
  data?: BackendTicket;
  errors?: Record<string, string[]>;
}

interface ClientTicket {
  backendId: number;
  id: string;
  subject: string;
  category: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  lastUpdated: string;
  createdAt: string;
}

export default defineComponent({
  name: "ClientDashboardPage",
  components: {
    AccentLine,
    NotificationDropdown,
    PasswordConfirmationModal,
    AppButton,
    AppIcon,
    StatusBadge,
    PriorityBadge,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    const tickets = ref<ClientTicket[]>([]);
    const {
      searchQuery,
      selectedStatus,
      selectedPriority,
      selectedCategory,
      hasActiveFilters,
      clearFilters,
    } = useTicketFilters();
    const activeSection = ref<ClientSection>("dashboard");
    const sectionReturnToPath = ref("");
    const isSidebarOpen = ref(false);
    
    const progressTicketIndex = ref(0);
    const progressDirection = ref<ProgressDirection>("next");
    const isLoading = ref(false);
    const errorMessage = ref("");
    const loggedInUserName = ref("Client");
    const loggedInUserEmail = ref("");
    const {
      notifications,
      unreadNotificationsCount,
      isNotificationMenuOpen,
      notificationAreaRef,
      isLoadingNotifications,
      notificationErrorMessage,
      notificationCountLabel,
      loadNotificationsList: loadClientNotifications,
      markNotificationRead,
      markAllNotificationsRead: handleMarkAllNotificationsRead,
      handleToggleNotificationMenu,
      closeNotificationMenu,
      handleNotificationDocumentClick: handleDocumentClick,
    } = useNotifications();
    
    const isEditModalOpen = ref(false);
    const ticketBeingEdited = ref<ClientTicket | null>(null);
    const editTitle = ref("");
    const editCategory = ref("");
    const editPriority = ref<TicketPriority>("Medium");
    const editDescription = ref("");
    const editErrorMessage = ref("");
    const editSuccessMessage = ref("");
    const isSavingEdit = ref(false);
    
    const { isDarkModeEnabled } = useAppTheme();
    const {
      isPasswordModalOpen,
      currentPassword,
      newPassword,
      confirmPassword,
      passwordSuccessMessage,
      passwordErrorMessage,
      isChangingPassword,
      showCurrentPassword: isCurrentPasswordVisible,
      showNewPassword: isNewPasswordVisible,
      showConfirmPassword: isConfirmPasswordVisible,
      passwordButtonLabel,
      currentPasswordInputType,
      newPasswordInputType,
      confirmPasswordInputType,
      currentPasswordToggleLabel,
      newPasswordToggleLabel,
      confirmPasswordToggleLabel,
      resetPasswordForm,
      openPasswordModal,
      closePasswordModal,
      toggleCurrentPasswordVisibility,
      toggleNewPasswordVisibility,
      toggleConfirmPasswordVisibility,
      handleChangePassword,
    } = usePasswordConfirmation();
    const realtimeNotificationsEnabled = ref(true);
    const currentUserId = ref<number | null>(null);
    
    let editSuccessTimeoutId: number | null = null;
    let realtimeCleanup: (() => void) | null = null;
    let notificationRealtimeCleanup: (() => void) | null = null;
    
    const categoryOptions = ["General", "Account", "Billing", "Bug Report", "Technical Issue"];
    const priorityOptions: TicketPriority[] = ["High", "Medium", "Low"];
    const statusOptions: TicketStatus[] = ["Open", "In Progress", "Waiting for Client", "Resolved"];
    
    const activeTicketList = computed(() => {
      return tickets.value.filter((ticket) => ticket.status !== "Resolved");
    });
    
    const historyTicketList = computed(() => {
      return tickets.value.filter((ticket) => ticket.status === "Resolved");
    });
    
    const dashboardTickets = computed(() => {
      return activeTicketList.value.slice(0, 5);
    });
    
    const activeTickets = computed(() => activeTicketList.value.length);
    
    const inProgressTickets = computed(() =>
      tickets.value.filter((ticket) => ticket.status === "In Progress"),
    );
    
    const resolvedTickets = computed(() => historyTicketList.value.length);
    
    const progressTickets = computed(() =>
      tickets.value.filter((ticket) => ticket.status === "In Progress" || ticket.status === "Resolved"),
    );
    
    const currentProgressTicket = computed(() => {
      return progressTickets.value[progressTicketIndex.value] ?? null;
    });
    
    const progressTransitionName = computed(() => {
      return progressDirection.value === "next" ? "progress-slide-next" : "progress-slide-previous";
    });
    
    const categoryFilterOptions = computed(() => {
      const categories = tickets.value
        .map((ticket) => ticket.category)
        .filter((category, index, list) => category && list.indexOf(category) === index);
    
      return categories.length > 0 ? categories : categoryOptions;
    });
    
    const filteredActiveTickets = computed(() => {
      return filterTickets(activeTicketList.value);
    });
    
    const filteredHistoryTickets = computed(() => {
      return filterTickets(historyTicketList.value);
    });
    
    const currentTableTickets = computed(() => {
      if (activeSection.value === "history") {
        return filteredHistoryTickets.value;
      }
    
      if (activeSection.value === "view-all") {
        return filteredActiveTickets.value;
      }
    
      return dashboardTickets.value;
    });
    
    const currentTableTitle = computed(() => {
      if (activeSection.value === "history") {
        return "Ticket History";
      }
    
      if (activeSection.value === "view-all") {
        return "All Active Tickets";
      }
    
      return "Recent Active Tickets";
    });
    
    const currentTableSubtitle = computed(() => {
      if (activeSection.value === "history") {
        return "Only resolved tickets appear here.";
      }
    
      if (activeSection.value === "view-all") {
        return "Search, filter, and view all your active support tickets.";
      }
    
      return "Showing your latest 5 active support requests.";
    });
    
    const shouldShowFilters = computed(() => {
      return activeSection.value === "view-all" || activeSection.value === "history";
    });
    
    const shouldShowStatusFilter = computed(() => {
      return activeSection.value === "view-all";
    });
    
    const modalCategoryOptions = computed(() => {
      if (editCategory.value && !categoryOptions.includes(editCategory.value)) {
        return [editCategory.value, ...categoryOptions];
      }
    
      return categoryOptions;
    });
    
    const isEditFormInvalid = computed(() => {
      return (
        editTitle.value.trim() === "" ||
        editCategory.value.trim() === "" ||
        editDescription.value.trim() === ""
      );
    });
    
    const dashboardReturnToPath = computed(() => {
      if (activeSection.value === "view-all") {
        return "";
      }
    
      return sectionReturnToPath.value;
    });
    
    const shouldUseReturnToBack = computed(() => {
      return Boolean(dashboardReturnToPath.value);
    });
    
    const fullPageBackButtonLabel = computed(() => {
      if (
        shouldUseReturnToBack.value &&
        dashboardReturnToPath.value.includes("/tickets/") &&
        !dashboardReturnToPath.value.includes("/tickets/create")
      ) {
        return "← Back to Ticket Details";
      }
    
      if (shouldUseReturnToBack.value) {
        return "← Go Back";
      }
    
      return "← Back to Dashboard";
    });
    
    const totalTicketsCreated = computed(() => tickets.value.length);
    
    const lastSubmittedTicket = computed(() => {
      return tickets.value[0] ?? null;
    });
    
    const mostUsedCategory = computed(() => {
      const categoryCount = new Map<string, number>();
    
      tickets.value.forEach((ticket) => {
        categoryCount.set(ticket.category, (categoryCount.get(ticket.category) ?? 0) + 1);
      });
    
      let topCategory = "N/A";
      let topCount = 0;
    
      categoryCount.forEach((count, category) => {
        if (count > topCount) {
          topCategory = category;
          topCount = count;
        }
      });
    
      return topCategory;
    });
    
    function filterTickets(ticketList: ClientTicket[]) {
      const searchValue = searchQuery.value.trim().toLowerCase();
    
      return ticketList.filter((ticket) => {
        const searchableText = [
          ticket.id,
          ticket.subject,
          ticket.category,
          ticket.priority,
          ticket.status,
          ticket.lastUpdated,
        ]
          .join(" ")
          .toLowerCase();
    
        const matchesSearch = !searchValue || searchableText.includes(searchValue);
        const matchesStatus = !selectedStatus.value || ticket.status === selectedStatus.value;
        const matchesPriority = !selectedPriority.value || ticket.priority === selectedPriority.value;
        const matchesCategory = !selectedCategory.value || ticket.category === selectedCategory.value;
    
        return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
      });
    }
    
    function canEditTicket(ticket: ClientTicket) {
      return ticket.status === "Open";
    }
    
    const dashboardSectionsFromQuery: ClientSection[] = [
      "dashboard",
      "view-all",
      "history",
      "notifications",
      "profile",
      "settings",
    ];
    
    function getDashboardSectionFromQuery(section: unknown): ClientSection {
      const sectionValue = Array.isArray(section) ? section[0] : section;
    
      if (typeof sectionValue !== "string") {
        return "dashboard";
      }
    
      if (dashboardSectionsFromQuery.includes(sectionValue as ClientSection)) {
        return sectionValue as ClientSection;
      }
    
      return "dashboard";
    }
    
    function normalizeReturnToPath(returnToValue: unknown) {
      const path = Array.isArray(returnToValue) ? returnToValue[0] : returnToValue;
    
      if (typeof path !== "string" || path.trim() === "") {
        return "";
      }
    
      const cleanPath = path.trim();
    
      if (!cleanPath.startsWith("/")) {
        return "";
      }
    
      if (cleanPath === route.fullPath) {
        return "";
      }
    
      if (cleanPath.startsWith("/login")) {
        return "";
      }
    
      if (cleanPath.startsWith("/client-dashboard")) {
        return "";
      }
    
      return cleanPath;
    }
    
    function syncSectionFromRouteQuery() {
      const section = getDashboardSectionFromQuery(route.query.section);
    
      if (section === "dashboard" || section === "view-all") {
        sectionReturnToPath.value = "";
      } else {
        sectionReturnToPath.value = normalizeReturnToPath(route.query.returnTo);
      }
    
      setSection(section, {
        fromRoute: true,
      });
    }
    
    function toggleSidebar() {
      isSidebarOpen.value = !isSidebarOpen.value;
    }
    
    function clearDashboardQuery() {
      if (!route.query.section && !route.query.returnTo) {
        return;
      }
    
      void router.replace({ name: "client-dashboard" });
    }
    
    function setSection(section: ClientSection, options: { fromRoute?: boolean } = {}) {
      if (!options.fromRoute) {
        sectionReturnToPath.value = "";
      }
    
      activeSection.value = section;
      isSidebarOpen.value = false;
    
      if (section === "dashboard") {
        sectionReturnToPath.value = "";
        clearFilters();
        clearDashboardQuery();
        return;
      }
    
      if (section === "view-all") {
        sectionReturnToPath.value = "";
        clearFilters();
        return;
      }
    
      if (section === "history") {
        searchQuery.value = "";
        selectedStatus.value = "";
        selectedPriority.value = "";
        selectedCategory.value = "";
        return;
      }
    
      if (section === "notifications") {
        void loadClientNotifications(false);
        return;
      }
    }
    
    function goBackToDashboard() {
      setSection("dashboard");
    }
    
    function goBackFromFullPage() {
      if (dashboardReturnToPath.value) {
        void router.push(dashboardReturnToPath.value);
        return;
      }
    
      goBackToDashboard();
    }
    
    function formatStatusForFrontend(status: string): TicketStatus {
      const normalizedStatus = status.toLowerCase();
    
      if (normalizedStatus === "open") {
        return "Open";
      }
    
      if (normalizedStatus === "in_progress") {
        return "In Progress";
      }
    
      if (normalizedStatus === "resolved" || normalizedStatus === "closed") {
        return "Resolved";
      }
    
      return "Waiting for Client";
    }
    
    function formatPriorityForFrontend(priority: string): TicketPriority {
      const normalizedPriority = priority.toLowerCase();
    
      if (normalizedPriority === "high") {
        return "High";
      }
    
      if (normalizedPriority === "low") {
        return "Low";
      }
    
      return "Medium";
    }
    
    function formatPriorityForBackend(priority: TicketPriority) {
      return priority.toLowerCase();
    }
    
    function mapBackendTicketToClient(ticket: BackendTicket): ClientTicket {
      return {
        backendId: ticket.id,
        id: `#${ticket.id}`,
        subject: ticket.title,
        category: ticket.category || "General",
        description: ticket.description,
        priority: formatPriorityForFrontend(ticket.priority),
        status: formatStatusForFrontend(ticket.status),
        lastUpdated: formatLastUpdated(ticket.updated_at || ticket.created_at),
        createdAt: formatLastUpdated(ticket.created_at),
      };
    }
    
    async function loadTickets(showLoading = true) {
      if (showLoading) {
        isLoading.value = true;
      }
    
      errorMessage.value = "";
    
      try {
        const response = await apiFetch("/tickets");
    
        const result: BackendTicketsResponse = await response.json();
    
        if (!response.ok) {
          throw new Error(result.message || "Tickets could not be loaded.");
        }
    
        tickets.value = result.data.map((ticket) => mapBackendTicketToClient(ticket));
    
        if (progressTicketIndex.value >= progressTickets.value.length) {
          progressTicketIndex.value = 0;
        }
      } catch (error) {
        errorMessage.value =
          error instanceof Error ? error.message : "Something went wrong while loading tickets.";
      } finally {
        if (showLoading) {
          isLoading.value = false;
        }
      }
    }
    
    function handleCreateTicket() {
      router.push({ name: "create-ticket" });
    }
    
    function handleViewTicket(ticketId: string) {
      const cleanTicketId = ticketId.replace("#", "");
      router.push({ name: "ticket-details", params: { id: cleanTicketId } });
    }
    
    async function handleNotificationClick(notification: AppNotification) {
      if (!notification.ticket_id) {
        return;
      }
    
      if (!notification.read_at) {
        await markNotificationRead(notification);
      }
    
      closeNotificationMenu();
    
      router.push({
        name: "ticket-details",
        params: { id: String(notification.ticket_id) },
      });
    }
    
    function handleOpenEditTicket(ticket: ClientTicket) {
      if (!canEditTicket(ticket)) {
        return;
      }
    
      ticketBeingEdited.value = ticket;
      editTitle.value = ticket.subject;
      editCategory.value = ticket.category;
      editPriority.value = ticket.priority;
      editDescription.value = ticket.description;
      editErrorMessage.value = "";
      isEditModalOpen.value = true;
    }
    
    function handleCloseEditModal(forceCloseOrEvent: boolean | Event = false) {
      const forceClose = forceCloseOrEvent === true;
    
      if (isSavingEdit.value && !forceClose) {
        return;
      }
    
      isEditModalOpen.value = false;
      ticketBeingEdited.value = null;
      editTitle.value = "";
      editCategory.value = "";
      editPriority.value = "Medium";
      editDescription.value = "";
      editErrorMessage.value = "";
    }
    
    function showEditSuccessMessage(message: string) {
      editSuccessMessage.value = message;
    
      if (editSuccessTimeoutId !== null) {
        window.clearTimeout(editSuccessTimeoutId);
      }
    
      editSuccessTimeoutId = window.setTimeout(() => {
        editSuccessMessage.value = "";
        editSuccessTimeoutId = null;
      }, 2200);
    }
    
    async function handleSaveEditedTicket() {
      if (!ticketBeingEdited.value || isSavingEdit.value) {
        return;
      }
    
      if (!canEditTicket(ticketBeingEdited.value)) {
        editErrorMessage.value = "Editing is only available while the ticket is open.";
        return;
      }
    
      if (isEditFormInvalid.value) {
        editErrorMessage.value = "Please fill in all ticket information before saving.";
        return;
      }
    
      const currentTicket = ticketBeingEdited.value;
    
      isSavingEdit.value = true;
      editErrorMessage.value = "";
    
      try {
        const response = await updateTicket(currentTicket.backendId, {
          title: editTitle.value.trim(),
          category: editCategory.value.trim(),
          priority: formatPriorityForBackend(editPriority.value),
          description: editDescription.value.trim(),
        });
    
        const result = (await response.json().catch(() => null)) as BackendTicketUpdateResponse | null;
    
        if (!response.ok) {
          const validationErrors = result?.errors ? Object.values(result.errors).flat().join(" ") : "";
    
          throw new Error(validationErrors || result?.message || "Ticket could not be updated.");
        }
    
        const updatedTicket = result?.data
          ? mapBackendTicketToClient(result.data)
          : {
              ...currentTicket,
              subject: editTitle.value.trim(),
              category: editCategory.value.trim(),
              priority: editPriority.value,
              description: editDescription.value.trim(),
              lastUpdated: "Today",
            };
    
        tickets.value = tickets.value.map((ticket) =>
          ticket.backendId === currentTicket.backendId ? updatedTicket : ticket,
        );
    
        handleCloseEditModal(true);
        showEditSuccessMessage("Changes saved successfully.");
      } catch (error) {
        editErrorMessage.value =
          error instanceof Error ? error.message : "Something went wrong while updating the ticket.";
      } finally {
        isSavingEdit.value = false;
      }
    }
    
    function handleViewAllTickets() {
      setSection("view-all");
    }
    
    function handlePreviousProgressTicket() {
      if (progressTickets.value.length <= 1) {
        return;
      }
    
      progressDirection.value = "previous";
    
      progressTicketIndex.value =
        (progressTicketIndex.value - 1 + progressTickets.value.length) % progressTickets.value.length;
    }
    
    function handleNextProgressTicket() {
      if (progressTickets.value.length <= 1) {
        return;
      }
    
      progressDirection.value = "next";
    
      progressTicketIndex.value = (progressTicketIndex.value + 1) % progressTickets.value.length;
    }
    
    async function handleSignOut() {
      try {
        await logoutUser();
      } finally {
        router.push({ name: "login" });
      }
    }
    
    function cleanupRealtimeConnections() {
      if (realtimeCleanup) {
        realtimeCleanup();
        realtimeCleanup = null;
      }
    
      if (notificationRealtimeCleanup) {
        notificationRealtimeCleanup();
        notificationRealtimeCleanup = null;
      }
    }
    
    function setupRealtimeConnections(userId: number) {
      cleanupRealtimeConnections();
    
      if (!realtimeNotificationsEnabled.value) {
        return;
      }
    
      realtimeCleanup = listenToDashboardUpdates(userId, "client", () => {
        void loadTickets(false);
        void loadClientNotifications(false);
      });
    
      notificationRealtimeCleanup = listenToUserNotifications(userId, () => {
        void loadClientNotifications(false);
      });
    }
    
    watch(
      () => [route.query.section, route.query.returnTo],
      () => {
        syncSectionFromRouteQuery();
      },
    );
    
    watch(realtimeNotificationsEnabled, () => {
      if (!currentUserId.value) {
        return;
      }
    
      if (realtimeNotificationsEnabled.value) {
        void loadTickets(false);
        void loadClientNotifications(false);
        setupRealtimeConnections(currentUserId.value);
        return;
      }
    
      cleanupRealtimeConnections();
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
    
        currentUserId.value = user.id;
        loggedInUserName.value = user.name || "Client";
        loggedInUserEmail.value = user.email || "";
    
        await Promise.all([loadTickets(), loadClientNotifications()]);
        syncSectionFromRouteQuery();
    
        setupRealtimeConnections(user.id);
      } catch {
        router.push({ name: "login" });
      }
    });
    
    onBeforeUnmount(() => {
      document.removeEventListener("click", handleDocumentClick);
    
      if (editSuccessTimeoutId !== null) {
        window.clearTimeout(editSuccessTimeoutId);
      }
    
      cleanupRealtimeConnections();
    });

    return {
      route,
      router,
      tickets,
      searchQuery,
      selectedStatus,
      selectedPriority,
      selectedCategory,
      activeSection,
      sectionReturnToPath,
      isSidebarOpen,
      progressTicketIndex,
      progressDirection,
      isLoading,
      errorMessage,
      loggedInUserName,
      loggedInUserEmail,
      notifications,
      unreadNotificationsCount,
      isNotificationMenuOpen,
      notificationAreaRef,
      isLoadingNotifications,
      notificationErrorMessage,
      isEditModalOpen,
      ticketBeingEdited,
      editTitle,
      editCategory,
      editPriority,
      editDescription,
      editErrorMessage,
      editSuccessMessage,
      isSavingEdit,
      isDarkModeEnabled,
      isPasswordModalOpen,
      realtimeNotificationsEnabled,
      currentUserId,
      currentPassword,
      newPassword,
      confirmPassword,
      passwordSuccessMessage,
      passwordErrorMessage,
      isChangingPassword,
      isCurrentPasswordVisible,
      isNewPasswordVisible,
      isConfirmPasswordVisible,
      editSuccessTimeoutId,
      realtimeCleanup,
      notificationRealtimeCleanup,
      categoryOptions,
      priorityOptions,
      statusOptions,
      activeTicketList,
      historyTicketList,
      dashboardTickets,
      activeTickets,
      inProgressTickets,
      resolvedTickets,
      progressTickets,
      currentProgressTicket,
      progressTransitionName,
      categoryFilterOptions,
      filteredActiveTickets,
      filteredHistoryTickets,
      currentTableTickets,
      currentTableTitle,
      currentTableSubtitle,
      shouldShowFilters,
      shouldShowStatusFilter,
      hasActiveFilters,
      modalCategoryOptions,
      isEditFormInvalid,
      notificationCountLabel,
      passwordButtonLabel,
      currentPasswordInputType,
      newPasswordInputType,
      confirmPasswordInputType,
      currentPasswordToggleLabel,
      newPasswordToggleLabel,
      confirmPasswordToggleLabel,
      dashboardReturnToPath,
      shouldUseReturnToBack,
      fullPageBackButtonLabel,
      totalTicketsCreated,
      lastSubmittedTicket,
      mostUsedCategory,
      filterTickets,
      canEditTicket,
      dashboardSectionsFromQuery,
      getDashboardSectionFromQuery,
      normalizeReturnToPath,
      syncSectionFromRouteQuery,
      toggleSidebar,
      clearDashboardQuery,
      setSection,
      goBackToDashboard,
      goBackFromFullPage,
      clearFilters,
      formatStatusForFrontend,
      formatPriorityForFrontend,
      formatPriorityForBackend,
      formatLastUpdated,
      formatNotificationTime,
      mapBackendTicketToClient,
      loadTickets,
      loadClientNotifications,
      handleCreateTicket,
      handleViewTicket,
      handleToggleNotificationMenu,
      handleNotificationClick,
      handleMarkAllNotificationsRead,
      handleOpenEditTicket,
      handleCloseEditModal,
      showEditSuccessMessage,
      handleSaveEditedTicket,
      handleViewAllTickets,
      handlePreviousProgressTicket,
      handleNextProgressTicket,
      handleSignOut,
      handleDocumentClick,
      cleanupRealtimeConnections,
      setupRealtimeConnections,
      resetPasswordForm,
      toggleCurrentPasswordVisibility,
      toggleNewPasswordVisibility,
      toggleConfirmPasswordVisibility,
      openPasswordModal,
      closePasswordModal,
      handleChangePassword,
    };
  },
});
