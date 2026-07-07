import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
// @ts-ignore
import html2pdf from "html2pdf.js";
import ExcelJS from "exceljs";
import AccentLine from "@/components/layout/AccentLine/AccentLine.vue";
import NotificationDropdown from "@/components/notifications/NotificationDropdown/NotificationDropdown.vue";
import PasswordConfirmationModal from "@/components/password/PasswordConfirmationModal/PasswordConfirmationModal.vue";
import AppButton from "@/components/ui/AppButton/AppButton.vue";
import AppIcon from "@/components/ui/AppIcon/AppIcon.vue";
import SupportTicketTable from "@/components/tickets/SupportTicketTable/SupportTicketTable.vue";
import TicketFilters from "@/components/tickets/TicketFilters/TicketFilters.vue";
import { useNotifications } from "@/composables/useNotifications";
import { usePasswordConfirmation } from "@/composables/usePasswordConfirmation";
import { useTicketFilters } from "@/composables/useTicketFilters";
import { apiFetch, getCurrentUser, logoutUser } from "@/services/authHeaders";
import type { AppNotification } from "@/services/notifications";
import { listenToDashboardUpdates, listenToUserNotifications } from "@/services/realtime";
import { useAppTheme } from "@/services/theme";
import {
  formatDashboardDate as formatDateForDashboard,
  formatNotificationTime,
} from "@/utils/dateFormatters";
import {
  compareBackendDateActivity as compareTicketActivity,
  isBackendDateActivityNewer as isTicketActivityNewer,
} from "@/utils/dateComparators";

type SupportStatus = "Open" | "In Progress" | "Resolved" | "Waiting for Client";
type SupportPriority = "High" | "Medium" | "Low";
type ExportFormat = "pdf" | "excel";
type SupportSection =
  | "dashboard"
  | "assigned"
  | "all"
  | "clients"
  | "resolved"
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

interface SupportTicket {
  id: string;
  client: string;
  clientName: string;
  clientEmail: string;
  clientKey: string;
  subject: string;
  priority: SupportPriority;
  status: SupportStatus;
  assignedTo: string;
  category: string;
  date: string;
  lastActivityAt: string;
}

interface SupportClientProfile {
  id: string;
  name: string;
  email: string;
  initials: string;
  totalTickets: number;
  activeTickets: number;
  openTickets: number;
  inProgressTickets: number;
  waitingTickets: number;
  resolvedTickets: number;
  urgentTickets: number;
  lastActivityAt: string;
  lastActivityLabel: string;
  tickets: SupportTicket[];
}

export default defineComponent({
  name: "SupportDashboardPage",
  components: {
    AccentLine,
    NotificationDropdown,
    PasswordConfirmationModal,
    AppButton,
    AppIcon,
    SupportTicketTable,
    TicketFilters,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { isDarkModeEnabled } = useAppTheme();
    
    const isSidebarOpen = ref(false);
    const activeSection = ref<SupportSection>("dashboard");
    const currentSupportUserId = ref<number | null>(null);
    const DASHBOARD_TICKET_LIMIT = 10;
    
    const {
      searchQuery,
      selectedStatus,
      selectedPriority,
      selectedCategory,
      selectedAgent,
      hasActiveFilters,
      clearFilters,
    } = useTicketFilters({ includeAgent: true });
    
    const clientSearchQuery = ref("");
    const selectedClientKey = ref("");
    const selectedClientFilter = ref("all");
    const selectedClientSort = ref("recent");
    const selectedClientTicketSearch = ref("");
    const selectedClientTicketStatus = ref("");
    const selectedClientTicketPriority = ref("");
    const selectedClientTicketCategory = ref("");
    const selectedClientTicketAgent = ref("");
    
    const supportTickets = ref<SupportTicket[]>([]);
    const isLoading = ref(false);
    const errorMessage = ref("");
    const supportAgentName = ref("Support User");
    const {
      notifications,
      unreadNotificationsCount,
      isNotificationMenuOpen,
      notificationAreaRef,
      isLoadingNotifications,
      notificationErrorMessage,
      notificationCountLabel,
      loadNotificationsList: loadSupportNotifications,
      markNotificationRead,
      markAllNotificationsRead: handleMarkAllNotificationsRead,
      handleToggleNotificationMenu,
      closeNotificationMenu,
      handleNotificationDocumentClick: handleDocumentClick,
    } = useNotifications();
    
    const showExportModal = ref(false);
    const isExportingReport = ref(false);
    const exportError = ref("");
    const selectedExportFormat = ref<ExportFormat>("pdf");
    
    const REALTIME_NOTIFICATIONS_STORAGE_KEY = "supportRealtimeNotificationsEnabled";
    const realtimeNotificationsEnabled = ref(
      localStorage.getItem(REALTIME_NOTIFICATIONS_STORAGE_KEY) !== "false",
    );
    
    const {
      isPasswordModalOpen,
      currentPassword,
      newPassword,
      confirmPassword: confirmNewPassword,
      passwordErrorMessage,
      passwordSuccessMessage,
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
    } = usePasswordConfirmation({
      guardOpenWhileChanging: false,
      useTrimmedEmptyValidation: false,
      minLengthMessage: "The new password must be at least 8 characters.",
      confirmationMismatchMessage: "The new password confirmation does not match.",
      useResponseSuccessMessage: false,
      successMessage: "Password changed successfully.",
    });
    
    let realtimeCleanup: (() => void) | null = null;
    let notificationRealtimeCleanup: (() => void) | null = null;
    
    const supportSectionsFromQuery: SupportSection[] = [
      "dashboard",
      "assigned",
      "all",
      "clients",
      "resolved",
      "notifications",
      "profile",
      "settings",
    ];
    
    const activeTicketsList = computed(() => {
      return supportTickets.value.filter((ticket) => ticket.status !== "Resolved");
    });
    
    const resolvedTicketsList = computed(() => {
      return supportTickets.value.filter((ticket) => ticket.status === "Resolved");
    });
    
    const clientProfiles = computed<SupportClientProfile[]>(() => {
      const profiles = new Map<string, SupportClientProfile>();
    
      supportTickets.value.forEach((ticket) => {
        const existingProfile = profiles.get(ticket.clientKey);
    
        if (!existingProfile) {
          profiles.set(ticket.clientKey, {
            id: ticket.clientKey,
            name: ticket.clientName,
            email: ticket.clientEmail,
            initials: getClientInitials(ticket.clientName, ticket.clientEmail),
            totalTickets: 1,
            activeTickets: ticket.status === "Resolved" ? 0 : 1,
            openTickets: ticket.status === "Open" ? 1 : 0,
            inProgressTickets: ticket.status === "In Progress" ? 1 : 0,
            waitingTickets: ticket.status === "Waiting for Client" ? 1 : 0,
            resolvedTickets: ticket.status === "Resolved" ? 1 : 0,
            urgentTickets: ticket.priority === "High" && ticket.status !== "Resolved" ? 1 : 0,
            lastActivityAt: ticket.lastActivityAt,
            lastActivityLabel: ticket.date,
            tickets: [ticket],
          });
    
          return;
        }
    
        existingProfile.totalTickets += 1;
        existingProfile.activeTickets += ticket.status === "Resolved" ? 0 : 1;
        existingProfile.openTickets += ticket.status === "Open" ? 1 : 0;
        existingProfile.inProgressTickets += ticket.status === "In Progress" ? 1 : 0;
        existingProfile.waitingTickets += ticket.status === "Waiting for Client" ? 1 : 0;
        existingProfile.resolvedTickets += ticket.status === "Resolved" ? 1 : 0;
        existingProfile.urgentTickets +=
          ticket.priority === "High" && ticket.status !== "Resolved" ? 1 : 0;
        existingProfile.tickets.push(ticket);
    
        if (isTicketActivityNewer(ticket.lastActivityAt, existingProfile.lastActivityAt)) {
          existingProfile.lastActivityAt = ticket.lastActivityAt;
          existingProfile.lastActivityLabel = ticket.date;
        }
      });
    
      return Array.from(profiles.values())
        .map((profile) => ({
          ...profile,
          tickets: [...profile.tickets].sort((firstTicket, secondTicket) => {
            return compareTicketActivity(secondTicket.lastActivityAt, firstTicket.lastActivityAt);
          }),
        }))
        .sort((firstProfile, secondProfile) => {
          return compareTicketActivity(secondProfile.lastActivityAt, firstProfile.lastActivityAt);
        });
    });
    
    const filteredClientProfiles = computed(() => {
      const searchValue = clientSearchQuery.value.trim().toLowerCase();
    
      return clientProfiles.value
        .filter((client) => {
          const searchableText = [
            client.name,
            client.email,
            client.totalTickets,
            client.activeTickets,
            client.openTickets,
            client.resolvedTickets,
            client.lastActivityLabel,
            ...client.tickets.map((ticket) => `${ticket.id} ${ticket.subject} ${ticket.status}`),
          ]
            .join(" ")
            .toLowerCase();
    
          const matchesSearch = !searchValue || searchableText.includes(searchValue);
          const matchesClientFilter =
            selectedClientFilter.value === "all" ||
            (selectedClientFilter.value === "active" && client.activeTickets > 0) ||
            (selectedClientFilter.value === "urgent" && client.urgentTickets > 0) ||
            (selectedClientFilter.value === "open" && client.openTickets > 0) ||
            (selectedClientFilter.value === "resolved" &&
              client.activeTickets === 0 &&
              client.resolvedTickets > 0);
    
          return matchesSearch && matchesClientFilter;
        })
        .sort((firstClient, secondClient) => {
          if (selectedClientSort.value === "name") {
            return firstClient.name.localeCompare(secondClient.name);
          }
    
          if (selectedClientSort.value === "tickets") {
            return (
              secondClient.totalTickets - firstClient.totalTickets ||
              compareTicketActivity(secondClient.lastActivityAt, firstClient.lastActivityAt)
            );
          }
    
          if (selectedClientSort.value === "active") {
            return (
              secondClient.activeTickets - firstClient.activeTickets ||
              compareTicketActivity(secondClient.lastActivityAt, firstClient.lastActivityAt)
            );
          }
    
          if (selectedClientSort.value === "urgent") {
            return (
              secondClient.urgentTickets - firstClient.urgentTickets ||
              compareTicketActivity(secondClient.lastActivityAt, firstClient.lastActivityAt)
            );
          }
    
          return compareTicketActivity(secondClient.lastActivityAt, firstClient.lastActivityAt);
        });
    });
    
    const selectedClientProfile = computed(() => {
      if (!selectedClientKey.value) {
        return null;
      }
    
      return clientProfiles.value.find((client) => client.id === selectedClientKey.value) || null;
    });
    
    const selectedClientTickets = computed(() => {
      const tickets = selectedClientProfile.value?.tickets || [];
      const searchValue = selectedClientTicketSearch.value.trim().toLowerCase();
    
      return tickets.filter((ticket) => {
        const searchableText = [
          ticket.id,
          ticket.client,
          ticket.subject,
          ticket.priority,
          ticket.status,
          ticket.assignedTo,
          ticket.category,
          ticket.date,
        ]
          .join(" ")
          .toLowerCase();
    
        const matchesSearch = !searchValue || searchableText.includes(searchValue);
        const matchesStatus =
          !selectedClientTicketStatus.value || ticket.status === selectedClientTicketStatus.value;
        const matchesPriority =
          !selectedClientTicketPriority.value || ticket.priority === selectedClientTicketPriority.value;
        const matchesCategory =
          !selectedClientTicketCategory.value || ticket.category === selectedClientTicketCategory.value;
        const matchesAgent =
          !selectedClientTicketAgent.value || ticket.assignedTo === selectedClientTicketAgent.value;
    
        return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesAgent;
      });
    });
    
    const hasActiveClientFilters = computed(() => {
      return Boolean(
        clientSearchQuery.value.trim() ||
        selectedClientFilter.value !== "all" ||
        selectedClientSort.value !== "recent",
      );
    });
    
    const hasActiveSelectedClientTicketFilters = computed(() => {
      return Boolean(
        selectedClientTicketSearch.value.trim() ||
        selectedClientTicketStatus.value ||
        selectedClientTicketPriority.value ||
        selectedClientTicketCategory.value ||
        selectedClientTicketAgent.value,
      );
    });
    
    const totalClientsCount = computed(() => clientProfiles.value.length);
    
    const activeClientsCount = computed(() => {
      return clientProfiles.value.filter((client) => client.activeTickets > 0).length;
    });
    
    const assignedTicketsList = computed(() => {
      return supportTickets.value.filter((ticket) => {
        return ticket.assignedTo === getSupportAgentName() && ticket.status !== "Resolved";
      });
    });
    
    const currentSectionBaseTickets = computed(() => {
      if (activeSection.value === "assigned") {
        return assignedTicketsList.value;
      }
    
      if (activeSection.value === "resolved") {
        return resolvedTicketsList.value;
      }
    
      return supportTickets.value;
    });
    
    const filteredSupportTickets = computed(() => {
      const searchValue = searchQuery.value.trim().toLowerCase();
    
      return currentSectionBaseTickets.value.filter((ticket) => {
        const searchableText = [
          ticket.id,
          ticket.client,
          ticket.subject,
          ticket.priority,
          ticket.status,
          ticket.assignedTo,
          ticket.category,
          ticket.date,
        ]
          .join(" ")
          .toLowerCase();
    
        const matchesSearch = !searchValue || searchableText.includes(searchValue);
        const matchesStatus = !selectedStatus.value || ticket.status === selectedStatus.value;
        const matchesPriority = !selectedPriority.value || ticket.priority === selectedPriority.value;
        const matchesCategory = !selectedCategory.value || ticket.category === selectedCategory.value;
        const matchesAgent = !selectedAgent.value || ticket.assignedTo === selectedAgent.value;
    
        return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesAgent;
      });
    });
    
    const dashboardActiveTickets = computed(() => {
      return filteredSupportTickets.value.filter((ticket) => ticket.status !== "Resolved");
    });
    
    const dashboardTableTickets = computed(() => {
      return dashboardActiveTickets.value.slice(0, DASHBOARD_TICKET_LIMIT);
    });
    
    const shouldShowDashboardViewAllButton = computed(() => {
      return dashboardActiveTickets.value.length > DASHBOARD_TICKET_LIMIT;
    });
    
    const shouldShowFullSectionExport = computed(() => {
      return activeSection.value === "assigned" || activeSection.value === "resolved";
    });
    
    const currentSectionTitle = computed(() => {
      if (activeSection.value === "assigned") {
        return "Assigned to Me";
      }
    
      if (activeSection.value === "all") {
        return "All Tickets";
      }
    
      if (activeSection.value === "clients") {
        return "Clients";
      }
    
      if (activeSection.value === "resolved") {
        return "Resolved Tickets";
      }
    
      if (activeSection.value === "notifications") {
        return "Notification Center";
      }
    
      if (activeSection.value === "profile") {
        return "Support Profile";
      }
    
      if (activeSection.value === "settings") {
        return "Settings";
      }
    
      return "Support Dashboard";
    });
    
    const currentSectionSubtitle = computed(() => {
      if (activeSection.value === "assigned") {
        return "Review and respond to active tickets assigned to your support account.";
      }
    
      if (activeSection.value === "all") {
        return "Search, filter, and manage every ticket in the system.";
      }
    
      if (activeSection.value === "clients") {
        return "Review client profiles, ticket history, and support activity in one place.";
      }
    
      if (activeSection.value === "resolved") {
        return "Review completed support tickets and past client issues.";
      }
    
      if (activeSection.value === "notifications") {
        return "View new tickets, client replies, deleted tickets, and ticket updates.";
      }
    
      if (activeSection.value === "profile") {
        return "View your support account and ticket activity.";
      }
    
      if (activeSection.value === "settings") {
        return "Customize support dashboard preferences and security.";
      }
    
      return "Manage, prioritize, and resolve client support tickets.";
    });
    
    const backButtonLabel = computed(() => {
      return getReturnToPath() ? "← Go Back" : "← Back to Dashboard";
    });
    
    const openTicketsCount = computed(() => {
      return supportTickets.value.filter((ticket) => ticket.status === "Open").length;
    });
    
    const urgentTicketsCount = computed(() => {
      return supportTickets.value.filter(
        (ticket) => ticket.priority === "High" && ticket.status !== "Resolved",
      ).length;
    });
    
    const assignedToMeCount = computed(() => assignedTicketsList.value.length);
    
    const exportTicketCount = computed(() => filteredSupportTickets.value.length);
    
    const exportFilterMessage = computed(() => {
      if (hasActiveFilters.value) {
        return "Only the tickets matching your current filters will be included in the report.";
      }
    
      return "No filters are currently applied. The report will include all tickets. You can cancel if you want to add filters first.";
    });
    
    const exportButtonText = computed(() => {
      if (isExportingReport.value) {
        return "Exporting...";
      }
    
      return selectedExportFormat.value === "pdf" ? "Yes, Export PDF" : "Yes, Export Excel";
    });
    
    function normalizeRole(role: unknown) {
      return String(role ?? "")
        .trim()
        .toLowerCase();
    }
    
    function getSupportSectionFromQuery(section: unknown): SupportSection {
      const sectionValue = Array.isArray(section) ? section[0] : section;
    
      if (typeof sectionValue !== "string") {
        return "dashboard";
      }
    
      if (supportSectionsFromQuery.includes(sectionValue as SupportSection)) {
        return sectionValue as SupportSection;
      }
    
      return "dashboard";
    }
    
    function getStringFromQuery(value: unknown) {
      const queryValue = Array.isArray(value) ? value[0] : value;
    
      if (typeof queryValue !== "string") {
        return "";
      }
    
      return queryValue.trim();
    }
    
    function syncSectionFromRouteQuery() {
      const section = getSupportSectionFromQuery(route.query.section);
    
      setSection(section, {
        fromRoute: true,
      });
    
      if (section === "clients") {
        selectedClientKey.value = getStringFromQuery(route.query.client);
        return;
      }
    
      selectedClientKey.value = "";
    }
    
    function getReturnToPath() {
      const returnToValue = Array.isArray(route.query.returnTo)
        ? route.query.returnTo[0]
        : route.query.returnTo;
    
      if (typeof returnToValue !== "string" || returnToValue.trim() === "") {
        return "";
      }
    
      const returnToPath = returnToValue.trim();
    
      if (!returnToPath.startsWith("/")) {
        return "";
      }
    
      if (returnToPath === route.fullPath) {
        return "";
      }
    
      if (returnToPath.startsWith("/support-dashboard")) {
        return "";
      }
    
      return returnToPath;
    }
    
    function clearSupportDashboardQuery() {
      if (!route.query.section && !route.query.returnTo) {
        return;
      }
    
      void router.replace({
        name: "support-dashboard",
      });
    }
    
    function toggleSidebar() {
      isSidebarOpen.value = !isSidebarOpen.value;
    }
    
    function setSection(section: SupportSection, options: { fromRoute?: boolean } = {}) {
      activeSection.value = section;
      isSidebarOpen.value = false;
    
      if (section === "dashboard") {
        clearFilters();
    
        if (!options.fromRoute) {
          clearSupportDashboardQuery();
        }
    
        return;
      }
    
      if (section === "assigned" || section === "all" || section === "resolved") {
        clearFilters();
        return;
      }
    
      if (section === "clients") {
        clearFilters();
        return;
      }
    
      if (section === "notifications") {
        void loadSupportNotifications(false);
      }
    }
    
    function goToDashboard() {
      setSection("dashboard");
    }
    
    function goBackToDashboard() {
      const returnToPath = getReturnToPath();
    
      if (returnToPath) {
        router.push(returnToPath);
        return;
      }
    
      setSection("dashboard");
    }
    
    function stopSupportRealtimeListeners() {
      if (realtimeCleanup) {
        realtimeCleanup();
        realtimeCleanup = null;
      }
    
      if (notificationRealtimeCleanup) {
        notificationRealtimeCleanup();
        notificationRealtimeCleanup = null;
      }
    }
    
    function startSupportRealtimeListeners() {
      if (!currentSupportUserId.value || !realtimeNotificationsEnabled.value) {
        return;
      }
    
      stopSupportRealtimeListeners();
    
      realtimeCleanup = listenToDashboardUpdates(currentSupportUserId.value, "support", () => {
        void loadSupportTickets(false);
        void loadSupportNotifications(false);
      });
    
      notificationRealtimeCleanup = listenToUserNotifications(currentSupportUserId.value, () => {
        void loadSupportNotifications(false);
      });
    }
    
    function handleRealtimeNotificationsChange() {
      localStorage.setItem(
        REALTIME_NOTIFICATIONS_STORAGE_KEY,
        realtimeNotificationsEnabled.value ? "true" : "false",
      );
    
      if (realtimeNotificationsEnabled.value) {
        startSupportRealtimeListeners();
        void loadSupportNotifications(false);
        return;
      }
    
      stopSupportRealtimeListeners();
    }
    
    async function handleSignOut() {
      try {
        await logoutUser();
      } finally {
        void router.replace({ name: "login" });
      }
    }
    
    function getSupportAgentName() {
      return supportAgentName.value || "Support User";
    }
    
    function formatStatusForFrontend(status: string): SupportStatus {
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
    
    function formatPriorityForFrontend(priority: string): SupportPriority {
      const normalizedPriority = priority.toLowerCase();
    
      if (normalizedPriority === "high") {
        return "High";
      }
    
      if (normalizedPriority === "low") {
        return "Low";
      }
    
      return "Medium";
    }
    
    function getTicketClientName(ticket: BackendTicket) {
      const clientName = ticket.created_by_name?.trim();
    
      return clientName || "Unknown Client";
    }
    
    function getTicketClientEmail(ticket: BackendTicket) {
      const clientEmail = ticket.created_by_email?.trim();
    
      return clientEmail || "No email provided";
    }
    
    function getClientKey(clientName: string, clientEmail: string) {
      const normalizedEmail = clientEmail.trim().toLowerCase();
    
      if (normalizedEmail && normalizedEmail !== "no email provided") {
        return normalizedEmail;
      }
    
      return clientName.trim().toLowerCase().replaceAll(" ", "-") || "unknown-client";
    }
    
    function getClientInitials(clientName: string, clientEmail: string) {
      const sourceValue = clientName && clientName !== "Unknown Client" ? clientName : clientEmail;
    
      const initials = sourceValue
        .split(/\s+|@/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
    
      return initials || "C";
    }
    
    function handleClientSearchInput(event: Event) {
      clientSearchQuery.value = (event.target as HTMLInputElement).value;
    }
    
    function handleClientFilterChange(event: Event) {
      selectedClientFilter.value = (event.target as HTMLSelectElement).value;
    }
    
    function handleClientSortChange(event: Event) {
      selectedClientSort.value = (event.target as HTMLSelectElement).value;
    }
    
    function handleSelectedClientTicketStatusChange(event: Event) {
      selectedClientTicketStatus.value = (event.target as HTMLSelectElement).value;
    }
    
    function handleSelectedClientTicketPriorityChange(event: Event) {
      selectedClientTicketPriority.value = (event.target as HTMLSelectElement).value;
    }
    
    function clearClientFilters() {
      clientSearchQuery.value = "";
      selectedClientFilter.value = "all";
      selectedClientSort.value = "recent";
    }
    
    function clearSelectedClientTicketFilters() {
      selectedClientTicketSearch.value = "";
      selectedClientTicketStatus.value = "";
      selectedClientTicketPriority.value = "";
      selectedClientTicketCategory.value = "";
      selectedClientTicketAgent.value = "";
    }
    
    function selectClient(clientId: string) {
      selectedClientKey.value = clientId;
      clearSelectedClientTicketFilters();
    
      void router.replace({
        name: "support-dashboard",
        query: {
          section: "clients",
          client: clientId,
        },
      });
    }
    
    function clearSelectedClient() {
      selectedClientKey.value = "";
      clearSelectedClientTicketFilters();
    
      void router.replace({
        name: "support-dashboard",
        query: {
          section: "clients",
        },
      });
    }
    
    function getTicketClientLabel(ticket: BackendTicket) {
      const clientName = getTicketClientName(ticket);
      const clientEmail = getTicketClientEmail(ticket);
    
      if (clientEmail !== "No email provided") {
        return `${clientName} (${clientEmail})`;
      }
    
      return clientName;
    }
    
    function mapBackendTicketToSupport(ticket: BackendTicket): SupportTicket {
      const clientName = getTicketClientName(ticket);
      const clientEmail = getTicketClientEmail(ticket);
      const lastActivityAt = ticket.updated_at || ticket.created_at;
    
      return {
        id: `#${ticket.id}`,
        client: getTicketClientLabel(ticket),
        clientName,
        clientEmail,
        clientKey: getClientKey(clientName, clientEmail),
        subject: ticket.title,
        priority: formatPriorityForFrontend(ticket.priority),
        status: formatStatusForFrontend(ticket.status),
        assignedTo: getSupportAgentName(),
        category: ticket.category || "General",
        date: formatDateForDashboard(lastActivityAt),
        lastActivityAt,
      };
    }
    
    async function loadSupportTickets(showLoading = true) {
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
    
        supportTickets.value = result.data.map((ticket) => mapBackendTicketToSupport(ticket));
      } catch (error) {
        errorMessage.value =
          error instanceof Error ? error.message : "Something went wrong while loading tickets.";
      } finally {
        if (showLoading) {
          isLoading.value = false;
        }
      }
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
        await loadSupportTickets(false);
        return;
      }
    
      await router.push({
        name: "support-ticket-details",
        params: { id: String(notification.ticket_id) },
      });
    }
    
    function escapeHtml(value: string) {
      return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }
    
    function getActiveFilters() {
      const filters = [
        searchQuery.value ? `Search: ${searchQuery.value}` : "",
        selectedStatus.value ? `Status: ${selectedStatus.value}` : "",
        selectedPriority.value ? `Priority: ${selectedPriority.value}` : "",
        selectedCategory.value ? `Category: ${selectedCategory.value}` : "",
        selectedAgent.value ? `Agent: ${selectedAgent.value}` : "",
      ].filter(Boolean);
    
      return filters.length > 0 ? filters : ["No filters applied"];
    }
    
    function getStatusClass(status: SupportStatus) {
      return `status-${status.toLowerCase().replaceAll(" ", "-")}`;
    }
    
    function getPriorityClass(priority: SupportPriority) {
      return `priority-${priority.toLowerCase()}`;
    }
    
    function buildReportHtml(
      ticketsToExport: SupportTicket[],
      activeFilters: string[],
      generatedDate: string,
    ) {
      const openCount = ticketsToExport.filter((ticket) => ticket.status === "Open").length;
      const inProgressCount = ticketsToExport.filter(
        (ticket) => ticket.status === "In Progress",
      ).length;
      const resolvedCount = ticketsToExport.filter((ticket) => ticket.status === "Resolved").length;
      const waitingCount = ticketsToExport.filter(
        (ticket) => ticket.status === "Waiting for Client",
      ).length;
    
      return `
        <div class="pdf-report">
          <style>
            * {
              box-sizing: border-box;
            }
    
            .pdf-report {
              width: 297mm;
              min-height: 210mm;
              background: #ffffff;
              color: #111827;
              font-family: Inter, Arial, sans-serif;
              padding: 10mm;
              box-sizing: border-box;
            }
    
            .report-card {
              width: 100%;
              min-height: 190mm;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              background: #ffffff;
              overflow: hidden;
            }
    
            .accent-line {
              height: 8px;
              background: #a81aea;
            }
    
            .report-header {
              padding: 22px 26px 18px;
              display: flex;
              align-items: flex-start;
              justify-content: space-between;
              gap: 24px;
              border-bottom: 1px solid #e5e7eb;
              background: #ffffff;
            }
    
            .brand {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 16px;
            }
    
            .brand-icon {
              width: 32px;
              height: 32px;
              border-radius: 8px;
              background: #a81aea;
            }
    
            .brand-name {
              font-size: 16px;
              font-weight: 800;
              color: #111827;
            }
    
            .report-title {
              margin: 0;
              color: #111827;
              font-size: 28px;
              font-weight: 900;
              line-height: 1.1;
            }
    
            .report-subtitle {
              margin: 10px 0 0;
              color: #6b7280;
              font-size: 13px;
              font-weight: 600;
              line-height: 1.45;
            }
    
            .meta-card {
              width: 250px;
              padding: 16px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              background: #f5f7fa;
            }
    
            .meta-row {
              display: flex;
              justify-content: space-between;
              gap: 16px;
              color: #6b7280;
              font-size: 11px;
              font-weight: 800;
              line-height: 1.9;
            }
    
            .meta-row strong {
              color: #111827;
              font-weight: 900;
            }
    
            .summary {
              padding: 20px 26px 14px;
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 12px;
            }
    
            .summary-card {
              min-height: 72px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              background: #ffffff;
              padding: 13px 14px;
            }
    
            .summary-card span {
              display: block;
              color: #6b7280;
              font-size: 10px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
    
            .summary-card strong {
              display: block;
              margin-top: 9px;
              color: #111827;
              font-size: 25px;
              font-weight: 900;
              line-height: 1;
            }
    
            .filters {
              margin: 0 26px 16px;
              padding: 14px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              background: #f5f7fa;
            }
    
            .section-title {
              margin: 0 0 10px;
              color: #111827;
              font-size: 15px;
              font-weight: 900;
            }
    
            .filter-list {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            }
    
            .filter-chip {
              min-height: 24px;
              padding: 0 10px;
              border-radius: 999px;
              background: rgba(168, 26, 234, 0.1);
              color: #a81aea;
              font-size: 10px;
              font-weight: 900;
              display: inline-flex;
              align-items: center;
            }
    
            .filter-chip--muted {
              background: rgba(107, 114, 128, 0.12);
              color: #6b7280;
            }
    
            .table-section {
              padding: 0 26px 18px;
            }
    
            .table-card {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
              background: #ffffff;
            }
    
            table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
            }
    
            th {
              background: #f5f7fa;
              color: #6b7280;
              font-size: 10px;
              font-weight: 900;
              text-align: left;
              padding: 10px 8px;
              border-bottom: 1px solid #e5e7eb;
              white-space: nowrap;
            }
    
            td {
              color: #111827;
              font-size: 10px;
              font-weight: 700;
              padding: 11px 8px;
              border-bottom: 1px solid #e5e7eb;
              vertical-align: middle;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
    
            tr:last-child td {
              border-bottom: none;
            }
    
            .col-id {
              width: 9%;
            }
    
            .col-client {
              width: 12%;
            }
    
            .col-subject {
              width: 17%;
            }
    
            .col-priority {
              width: 11%;
            }
    
            .col-status {
              width: 16%;
            }
    
            .col-agent {
              width: 13%;
            }
    
            .col-category {
              width: 13%;
            }
    
            .col-date {
              width: 9%;
            }
    
            .badge {
              min-height: 22px;
              min-width: 72px;
              padding: 0 9px;
              border-radius: 999px;
              font-size: 9px;
              font-weight: 900;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              white-space: nowrap;
            }
    
            .priority-high {
              background: rgba(229, 0, 0, 0.1);
              color: #e50000;
            }
    
            .priority-medium {
              background: rgba(255, 150, 69, 0.14);
              color: #ff9645;
            }
    
            .priority-low {
              background: rgba(39, 198, 99, 0.12);
              color: #27c663;
            }
    
            .status-open {
              background: rgba(168, 26, 234, 0.1);
              color: #a81aea;
            }
    
            .status-in-progress {
              background: rgba(255, 150, 69, 0.14);
              color: #ff9645;
            }
    
            .status-resolved {
              background: rgba(39, 198, 99, 0.12);
              color: #27c663;
            }
    
            .status-waiting-for-client {
              min-width: 98px;
              background: rgba(107, 114, 128, 0.12);
              color: #6b7280;
            }
    
            .footer {
              padding: 12px 26px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 10px;
              font-weight: 700;
              text-align: center;
              background: #fafafa;
            }
          </style>
    
          <main class="report-card">
            <div class="accent-line"></div>
    
            <section class="report-header">
              <div>
                <div class="brand">
                  <div class="brand-icon"></div>
                  <span class="brand-name">Support Ticket System</span>
                </div>
    
                <h1 class="report-title">Support Ticket Report</h1>
    
                <p class="report-subtitle">
                  A clean A4 export of the current support dashboard ticket view.
                </p>
              </div>
    
              <aside class="meta-card">
                <div class="meta-row">
                  <span>Generated</span>
                  <strong>${generatedDate}</strong>
                </div>
    
                <div class="meta-row">
                  <span>Total Tickets</span>
                  <strong>${ticketsToExport.length}</strong>
                </div>
    
                <div class="meta-row">
                  <span>Filters Applied</span>
                  <strong>${hasActiveFilters.value ? "Yes" : "No"}</strong>
                </div>
              </aside>
            </section>
    
            <section class="summary">
              <article class="summary-card">
                <span>Total</span>
                <strong>${ticketsToExport.length}</strong>
              </article>
    
              <article class="summary-card">
                <span>Open</span>
                <strong>${openCount}</strong>
              </article>
    
              <article class="summary-card">
                <span>In Progress</span>
                <strong>${inProgressCount}</strong>
              </article>
    
              <article class="summary-card">
                <span>Waiting</span>
                <strong>${waitingCount}</strong>
              </article>
    
              <article class="summary-card">
                <span>Resolved</span>
                <strong>${resolvedCount}</strong>
              </article>
            </section>
    
            <section class="filters">
              <h2 class="section-title">Applied Filters</h2>
    
              <div class="filter-list">
                ${activeFilters
                  .map((filter) => {
                    const mutedClass = filter === "No filters applied" ? " filter-chip--muted" : "";
    
                    return `<span class="filter-chip${mutedClass}">${escapeHtml(filter)}</span>`;
                  })
                  .join("")}
              </div>
            </section>
    
            <section class="table-section">
              <h2 class="section-title">Ticket List</h2>
    
              <div class="table-card">
                <table>
                  <thead>
                    <tr>
                      <th class="col-id">Ticket ID</th>
                      <th class="col-client">Client</th>
                      <th class="col-subject">Subject</th>
                      <th class="col-priority">Priority</th>
                      <th class="col-status">Status</th>
                      <th class="col-agent">Assigned To</th>
                      <th class="col-category">Category</th>
                      <th class="col-date">Date</th>
                    </tr>
                  </thead>
    
                  <tbody>
                    ${ticketsToExport
                      .map((ticket) => {
                        return `
                          <tr>
                            <td class="col-id">${escapeHtml(ticket.id)}</td>
                            <td class="col-client">${escapeHtml(ticket.client)}</td>
                            <td class="col-subject">${escapeHtml(ticket.subject)}</td>
                            <td class="col-priority">
                              <span class="badge ${getPriorityClass(ticket.priority)}">
                                ${escapeHtml(ticket.priority)}
                              </span>
                            </td>
                            <td class="col-status">
                              <span class="badge ${getStatusClass(ticket.status)}">
                                ${escapeHtml(ticket.status)}
                              </span>
                            </td>
                            <td class="col-agent">${escapeHtml(ticket.assignedTo)}</td>
                            <td class="col-category">${escapeHtml(ticket.category)}</td>
                            <td class="col-date">${escapeHtml(ticket.date)}</td>
                          </tr>
                        `;
                      })
                      .join("")}
                  </tbody>
                </table>
              </div>
            </section>
    
            <footer class="footer">
              This PDF was generated from the Support Ticket System dashboard.
            </footer>
          </main>
        </div>
      `;
    }
    
    function getExcelStatusColors(status: SupportStatus) {
      if (status === "Open") {
        return { fill: "F3D9FF", font: "A81AEA" };
      }
    
      if (status === "In Progress") {
        return { fill: "FFF0E6", font: "FF9645" };
      }
    
      if (status === "Resolved") {
        return { fill: "E6F8EE", font: "27C663" };
      }
    
      return { fill: "EEF0F3", font: "6B7280" };
    }
    
    function getExcelPriorityColors(priority: SupportPriority) {
      if (priority === "High") {
        return { fill: "FCE5E5", font: "E50000" };
      }
    
      if (priority === "Medium") {
        return { fill: "FFF0E6", font: "FF9645" };
      }
    
      return { fill: "E6F8EE", font: "27C663" };
    }
    
    function addThinBorder(cell: ExcelJS.Cell) {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE5E7EB" } },
        left: { style: "thin", color: { argb: "FFE5E7EB" } },
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
        right: { style: "thin", color: { argb: "FFE5E7EB" } },
      };
    }
    
    async function downloadExcelReport(
      ticketsToExport: SupportTicket[],
      activeFilters: string[],
      generatedDate: string,
    ) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Support Report");
    
      workbook.creator = "Support Ticket System";
      workbook.created = new Date();
    
      worksheet.properties.defaultRowHeight = 22;
    
      worksheet.columns = [
        { key: "id", width: 14 },
        { key: "client", width: 18 },
        { key: "subject", width: 28 },
        { key: "priority", width: 16 },
        { key: "status", width: 22 },
        { key: "assignedTo", width: 20 },
        { key: "category", width: 22 },
        { key: "date", width: 16 },
      ];
    
      worksheet.mergeCells("A1:H1");
      const titleCell = worksheet.getCell("A1");
    
      titleCell.value = "Support Ticket Report";
      titleCell.font = {
        name: "Arial",
        size: 20,
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFA81AEA" },
      };
      titleCell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      worksheet.getRow(1).height = 36;
    
      worksheet.mergeCells("A2:H2");
      const subtitleCell = worksheet.getCell("A2");
    
      subtitleCell.value = `Generated: ${generatedDate}   |   Filters Applied: ${
        hasActiveFilters.value ? "Yes" : "No"
      }   |   Tickets: ${ticketsToExport.length}`;
      subtitleCell.font = {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: "FF6B7280" },
      };
      subtitleCell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      worksheet.getRow(2).height = 26;
    
      worksheet.mergeCells("A4:H4");
      const filtersCell = worksheet.getCell("A4");
    
      filtersCell.value = `Applied Filters: ${activeFilters.join(", ")}`;
      filtersCell.font = {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: hasActiveFilters.value ? "FFA81AEA" : "FF6B7280" },
      };
      filtersCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: hasActiveFilters.value ? "FFF3D9FF" : "FFF5F7FA" },
      };
      filtersCell.alignment = {
        vertical: "middle",
        horizontal: "left",
      };
      addThinBorder(filtersCell);
      worksheet.getRow(4).height = 28;
    
      const openCount = ticketsToExport.filter((ticket) => ticket.status === "Open").length;
      const inProgressCount = ticketsToExport.filter(
        (ticket) => ticket.status === "In Progress",
      ).length;
      const waitingCount = ticketsToExport.filter(
        (ticket) => ticket.status === "Waiting for Client",
      ).length;
      const resolvedCount = ticketsToExport.filter((ticket) => ticket.status === "Resolved").length;
    
      const summaryCards = [
        {
          label: "Total",
          value: ticketsToExport.length,
          labelRange: "A6:B6",
          valueRange: "A7:B7",
          labelCell: "A6",
          valueCell: "A7",
        },
        {
          label: "Open",
          value: openCount,
          labelRange: "C6:C6",
          valueRange: "C7:C7",
          labelCell: "C6",
          valueCell: "C7",
        },
        {
          label: "In Progress",
          value: inProgressCount,
          labelRange: "D6:E6",
          valueRange: "D7:E7",
          labelCell: "D6",
          valueCell: "D7",
        },
        {
          label: "Waiting",
          value: waitingCount,
          labelRange: "F6:F6",
          valueRange: "F7:F7",
          labelCell: "F6",
          valueCell: "F7",
        },
        {
          label: "Resolved",
          value: resolvedCount,
          labelRange: "G6:H6",
          valueRange: "G7:H7",
          labelCell: "G6",
          valueCell: "G7",
        },
      ];
    
      summaryCards.forEach((card) => {
        worksheet.mergeCells(card.labelRange);
        worksheet.mergeCells(card.valueRange);
    
        const labelCell = worksheet.getCell(card.labelCell);
        const valueCell = worksheet.getCell(card.valueCell);
    
        labelCell.value = card.label;
        labelCell.font = {
          name: "Arial",
          size: 10,
          bold: true,
          color: { argb: "FF6B7280" },
        };
        labelCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF5F7FA" },
        };
        labelCell.alignment = {
          horizontal: "center",
          vertical: "middle",
        };
        addThinBorder(labelCell);
    
        valueCell.value = card.value;
        valueCell.font = {
          name: "Arial",
          size: 18,
          bold: true,
          color: { argb: "FF111827" },
        };
        valueCell.alignment = {
          horizontal: "center",
          vertical: "middle",
        };
        addThinBorder(valueCell);
      });
    
      worksheet.getRow(6).height = 24;
      worksheet.getRow(7).height = 30;
    
      worksheet.mergeCells("A9:H9");
      const tableTitleCell = worksheet.getCell("A9");
    
      tableTitleCell.value = "Ticket List";
      tableTitleCell.font = {
        name: "Arial",
        size: 13,
        bold: true,
        color: { argb: "FF111827" },
      };
      tableTitleCell.alignment = {
        horizontal: "left",
        vertical: "middle",
      };
      worksheet.getRow(9).height = 24;
    
      const headerRow = worksheet.getRow(10);
    
      headerRow.values = [
        "Ticket ID",
        "Client",
        "Subject",
        "Priority",
        "Status",
        "Assigned To",
        "Category",
        "Date",
      ];
      headerRow.height = 26;
    
      headerRow.eachCell((cell) => {
        cell.font = {
          name: "Arial",
          size: 11,
          bold: true,
          color: { argb: "FFFFFFFF" },
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFA81AEA" },
        };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FFA81AEA" } },
          left: { style: "thin", color: { argb: "FFA81AEA" } },
          bottom: { style: "thin", color: { argb: "FFA81AEA" } },
          right: { style: "thin", color: { argb: "FFA81AEA" } },
        };
      });
    
      ticketsToExport.forEach((ticket, index) => {
        const row = worksheet.addRow([
          ticket.id,
          ticket.client,
          ticket.subject,
          ticket.priority,
          ticket.status,
          ticket.assignedTo,
          ticket.category,
          ticket.date,
        ]);
    
        row.height = 26;
    
        row.eachCell((cell) => {
          cell.font = {
            name: "Arial",
            size: 10,
            bold: true,
            color: { argb: "FF111827" },
          };
          cell.alignment = {
            vertical: "middle",
            horizontal: "left",
          };
          addThinBorder(cell);
    
          if (index % 2 === 1) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFAFAFA" },
            };
          }
        });
    
        const priorityCell = row.getCell(4);
        const priorityColors = getExcelPriorityColors(ticket.priority);
    
        priorityCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: `FF${priorityColors.fill}` },
        };
        priorityCell.font = {
          name: "Arial",
          size: 10,
          bold: true,
          color: { argb: `FF${priorityColors.font}` },
        };
        priorityCell.alignment = {
          horizontal: "center",
          vertical: "middle",
        };
    
        const statusCell = row.getCell(5);
        const statusColors = getExcelStatusColors(ticket.status);
    
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: `FF${statusColors.fill}` },
        };
        statusCell.font = {
          name: "Arial",
          size: 10,
          bold: true,
          color: { argb: `FF${statusColors.font}` },
        };
        statusCell.alignment = {
          horizontal: "center",
          vertical: "middle",
        };
      });
    
      worksheet.autoFilter = {
        from: "A10",
        to: "H10",
      };
    
      const fileDate = new Date().toISOString().slice(0, 10);
      const buffer = await workbook.xlsx.writeBuffer();
    
      const blob = new Blob([buffer as BlobPart], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
    
      link.href = url;
      link.download = `support-ticket-report-${fileDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
    
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    
    function handleExportReport() {
      exportError.value = "";
      selectedExportFormat.value = "pdf";
    
      if (isLoading.value) {
        exportError.value = "Tickets are still loading. Please try again in a moment.";
        showExportModal.value = true;
        return;
      }
    
      if (filteredSupportTickets.value.length === 0) {
        exportError.value = "No tickets match your current filters.";
        showExportModal.value = true;
        return;
      }
    
      showExportModal.value = true;
    }
    
    function handleCancelExport() {
      if (isExportingReport.value) {
        return;
      }
    
      showExportModal.value = false;
      exportError.value = "";
    }
    
    async function handleConfirmExport() {
      const ticketsToExport = filteredSupportTickets.value;
    
      if (ticketsToExport.length === 0) {
        exportError.value = "No tickets match your current filters.";
        return;
      }
    
      isExportingReport.value = true;
      exportError.value = "";
    
      const generatedDate = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    
      const activeFilters = getActiveFilters();
    
      if (selectedExportFormat.value === "excel") {
        try {
          await downloadExcelReport(ticketsToExport, activeFilters, generatedDate);
          showExportModal.value = false;
        } catch (error) {
          exportError.value = "Something went wrong while exporting the Excel file.";
        } finally {
          isExportingReport.value = false;
        }
    
        return;
      }
    
      const reportElement = document.createElement("div");
    
      reportElement.style.position = "absolute";
      reportElement.style.left = "0";
      reportElement.style.top = "0";
      reportElement.style.width = "297mm";
      reportElement.style.backgroundColor = "#ffffff";
      reportElement.style.zIndex = "-1";
      reportElement.style.pointerEvents = "none";
    
      reportElement.innerHTML = buildReportHtml(ticketsToExport, activeFilters, generatedDate);
    
      document.body.appendChild(reportElement);
    
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 300);
      });
    
      const pdfReport = reportElement.querySelector(".pdf-report") as HTMLElement | null;
    
      if (!pdfReport) {
        exportError.value = "Report layout could not be created.";
        document.body.removeChild(reportElement);
        isExportingReport.value = false;
        return;
      }
    
      try {
        const fileDate = new Date().toISOString().slice(0, 10);
        const pdfOptions = {
          margin: 0,
          filename: `support-ticket-report-${fileDate}.pdf`,
          image: { type: "jpeg" as const, quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            scrollX: 0,
            scrollY: 0,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "landscape" as const,
          },
          pagebreak: {
            mode: ["avoid-all", "css", "legacy"],
          },
        };
    
        await html2pdf()
          .set(pdfOptions)
          .from(pdfReport)
          .save();
    
        showExportModal.value = false;
      } catch (error) {
        exportError.value = "Something went wrong while exporting the PDF.";
      } finally {
        document.body.removeChild(reportElement);
        isExportingReport.value = false;
      }
    }
    
    function handleViewAllTickets() {
      setSection("all");
    }
    
    function getCleanTicketIdFromPayload(ticketPayload: unknown) {
      if (typeof ticketPayload === "string" || typeof ticketPayload === "number") {
        return String(ticketPayload).replace("#", "").trim();
      }
    
      if (ticketPayload && typeof ticketPayload === "object") {
        const ticketRecord = ticketPayload as {
          id?: unknown;
          ticketId?: unknown;
          backendId?: unknown;
        };
    
        const possibleTicketId = ticketRecord.id ?? ticketRecord.ticketId ?? ticketRecord.backendId;
    
        if (typeof possibleTicketId === "string" || typeof possibleTicketId === "number") {
          return String(possibleTicketId).replace("#", "").trim();
        }
      }
    
      return "";
    }
    
    function getClientKeyForTicketReturn(ticketPayload: unknown) {
      const cleanTicketId = getCleanTicketIdFromPayload(ticketPayload);
    
      const ticket = supportTickets.value.find((currentTicket) => {
        return currentTicket.id.replace("#", "") === cleanTicketId;
      });
    
      return ticket?.clientKey || selectedClientKey.value || getStringFromQuery(route.query.client);
    }
    
    function getSupportTicketReturnToPath(ticketPayload: unknown = "") {
      if (activeSection.value === "clients") {
        const clientId = getClientKeyForTicketReturn(ticketPayload);
        const selectedClientQuery = clientId ? `&client=${encodeURIComponent(clientId)}` : "";
    
        return `/support-dashboard?section=clients${selectedClientQuery}`;
      }
    
      if (
        activeSection.value === "assigned" ||
        activeSection.value === "all" ||
        activeSection.value === "resolved"
      ) {
        return `/support-dashboard?section=${activeSection.value}`;
      }
    
      return "/support-dashboard";
    }
    
    function handleViewTicket(ticketPayload: unknown) {
      const cleanTicketId = getCleanTicketIdFromPayload(ticketPayload);
    
      if (!cleanTicketId) {
        return;
      }
    
      const returnToPath = getSupportTicketReturnToPath(ticketPayload);
      const query: Record<string, string> = {
        returnTo: returnToPath,
      };
    
      if (activeSection.value === "clients") {
        const clientId = getClientKeyForTicketReturn(ticketPayload);
    
        query.returnLabel = "Clients";
        query.fromSection = "clients";
    
        if (clientId) {
          query.client = clientId;
        }
      }
    
      router.push({
        name: "support-ticket-details",
        params: { id: cleanTicketId },
        query,
      });
    }
    
    watch(
      () => [route.query.section, route.query.client],
      () => {
        syncSectionFromRouteQuery();
      },
    );
    
    onMounted(async () => {
      document.addEventListener("click", handleDocumentClick);
    
      try {
        const user = await getCurrentUser();
    
        if (!user) {
          await router.replace({ name: "login" });
          return;
        }
    
        const userRole = normalizeRole(user.role);
    
        if (userRole !== "support") {
          await router.replace({ name: "client-dashboard" });
          return;
        }
    
        supportAgentName.value = user.name || "Support User";
        currentSupportUserId.value = user.id;
    
        await Promise.all([loadSupportTickets(), loadSupportNotifications()]);
        syncSectionFromRouteQuery();
        startSupportRealtimeListeners();
      } catch {
        void router.replace({ name: "login" });
      }
    });
    
    onBeforeUnmount(() => {
      document.removeEventListener("click", handleDocumentClick);
    
      stopSupportRealtimeListeners();
    });

    return {
      route,
      router,
      isSidebarOpen,
      activeSection,
      currentSupportUserId,
      DASHBOARD_TICKET_LIMIT,
      searchQuery,
      selectedStatus,
      selectedPriority,
      selectedCategory,
      selectedAgent,
      clientSearchQuery,
      selectedClientKey,
      selectedClientFilter,
      selectedClientSort,
      selectedClientTicketSearch,
      selectedClientTicketStatus,
      selectedClientTicketPriority,
      selectedClientTicketCategory,
      selectedClientTicketAgent,
      supportTickets,
      isLoading,
      errorMessage,
      supportAgentName,
      notifications,
      unreadNotificationsCount,
      isNotificationMenuOpen,
      notificationAreaRef,
      isLoadingNotifications,
      notificationErrorMessage,
      showExportModal,
      isExportingReport,
      exportError,
      selectedExportFormat,
      REALTIME_NOTIFICATIONS_STORAGE_KEY,
      realtimeNotificationsEnabled,
      isPasswordModalOpen,
      currentPassword,
      newPassword,
      confirmNewPassword,
      passwordErrorMessage,
      passwordSuccessMessage,
      isChangingPassword,
      isCurrentPasswordVisible,
      isNewPasswordVisible,
      isConfirmPasswordVisible,
      realtimeCleanup,
      notificationRealtimeCleanup,
      supportSectionsFromQuery,
      activeTicketsList,
      resolvedTicketsList,
      clientProfiles,
      filteredClientProfiles,
      selectedClientProfile,
      selectedClientTickets,
      hasActiveClientFilters,
      hasActiveSelectedClientTicketFilters,
      totalClientsCount,
      activeClientsCount,
      assignedTicketsList,
      currentSectionBaseTickets,
      filteredSupportTickets,
      dashboardActiveTickets,
      dashboardTableTickets,
      shouldShowDashboardViewAllButton,
      shouldShowFullSectionExport,
      currentSectionTitle,
      currentSectionSubtitle,
      backButtonLabel,
      openTicketsCount,
      urgentTicketsCount,
      assignedToMeCount,
      hasActiveFilters,
      exportTicketCount,
      exportFilterMessage,
      exportButtonText,
      notificationCountLabel,
      passwordButtonLabel,
      currentPasswordInputType,
      newPasswordInputType,
      confirmPasswordInputType,
      currentPasswordToggleLabel,
      newPasswordToggleLabel,
      confirmPasswordToggleLabel,
      normalizeRole,
      getSupportSectionFromQuery,
      getStringFromQuery,
      syncSectionFromRouteQuery,
      getReturnToPath,
      clearSupportDashboardQuery,
      toggleSidebar,
      clearFilters,
      setSection,
      goToDashboard,
      goBackToDashboard,
      resetPasswordForm,
      toggleCurrentPasswordVisibility,
      toggleNewPasswordVisibility,
      toggleConfirmPasswordVisibility,
      openPasswordModal,
      closePasswordModal,
      handleChangePassword,
      stopSupportRealtimeListeners,
      startSupportRealtimeListeners,
      handleRealtimeNotificationsChange,
      handleSignOut,
      getSupportAgentName,
      formatStatusForFrontend,
      formatPriorityForFrontend,
      formatDateForDashboard,
      formatNotificationTime,
      getTicketClientName,
      getTicketClientEmail,
      getClientKey,
      getClientInitials,
      compareTicketActivity,
      isTicketActivityNewer,
      handleClientSearchInput,
      handleClientFilterChange,
      handleClientSortChange,
      handleSelectedClientTicketStatusChange,
      handleSelectedClientTicketPriorityChange,
      clearClientFilters,
      clearSelectedClientTicketFilters,
      selectClient,
      clearSelectedClient,
      getTicketClientLabel,
      mapBackendTicketToSupport,
      loadSupportTickets,
      loadSupportNotifications,
      handleToggleNotificationMenu,
      handleNotificationClick,
      handleMarkAllNotificationsRead,
      handleDocumentClick,
      escapeHtml,
      getActiveFilters,
      getStatusClass,
      getPriorityClass,
      buildReportHtml,
      getExcelStatusColors,
      getExcelPriorityColors,
      addThinBorder,
      downloadExcelReport,
      handleExportReport,
      handleCancelExport,
      handleConfirmExport,
      handleViewAllTickets,
      getCleanTicketIdFromPayload,
      getClientKeyForTicketReturn,
      getSupportTicketReturnToPath,
      handleViewTicket,
      isDarkModeEnabled,
    };
  },
});
