import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppButton from "@/components/ui/AppButton/AppButton.vue";
import AppIcon from "@/components/ui/AppIcon/AppIcon.vue";
import AppInput from "@/components/ui/AppInput/AppInput.vue";
import AppSelect from "@/components/ui/AppSelect/AppSelect.vue";
import AppTextarea from "@/components/ui/AppTextarea/AppTextarea.vue";
import { apiJsonFetch, getCurrentUser, logoutUser } from "@/services/authHeaders";
import {
  loadNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type AppNotification,
} from "@/services/notifications";
import { listenToDashboardUpdates, listenToUserNotifications } from "@/services/realtime";
import { CREATE_TICKET_CATEGORY_OPTIONS, TICKET_PRIORITY_OPTIONS } from "@/constants/tickets";

type ClientDashboardSection = "history" | "notifications" | "settings" | "profile";

export default defineComponent({
  name: "CreateTicketPage",
  components: {
    AppButton,
    AppIcon,
    AppInput,
    AppSelect,
    AppTextarea,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const ticketTitle = ref("");
    const category = ref("");
    const priority = ref("");
    const description = ref("");
    const selectedFileName = ref("");
    const fileInput = ref<HTMLInputElement | null>(null);
    const errorMessage = ref("");
    const isSubmitting = ref(false);
    const isCheckingUser = ref(true);
    const isSidebarOpen = ref(false);

    const notifications = ref<AppNotification[]>([]);
    const unreadNotificationsCount = ref(0);
    const isNotificationMenuOpen = ref(false);
    const notificationAreaRef = ref<HTMLElement | null>(null);
    const isLoadingNotifications = ref(false);
    const notificationErrorMessage = ref("");

    let ticketRealtimeCleanup: (() => void) | null = null;
    let notificationRealtimeCleanup: (() => void) | null = null;

    const categories = CREATE_TICKET_CATEGORY_OPTIONS;
    const priorities = TICKET_PRIORITY_OPTIONS;

    const submitButtonLabel = computed(() => {
      return isSubmitting.value ? "Submitting..." : "Submit Ticket";
    });

    const notificationCountLabel = computed(() => {
      if (unreadNotificationsCount.value > 99) {
        return "99+";
      }

      return String(unreadNotificationsCount.value);
    });

    function toggleSidebar() {
      isSidebarOpen.value = !isSidebarOpen.value;
    }

    function goToDashboard() {
      router.push({ name: "client-dashboard" });
    }

    function goBackToDashboard() {
      router.push({ name: "client-dashboard" });
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

    function openFilePicker() {
      fileInput.value?.click();
    }

    function handleFileChange(event: Event) {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];

      if (file) {
        selectedFileName.value = file.name;
      }
    }

    function formatPriorityForBackend(selectedPriority: string) {
      const normalizedPriority = selectedPriority.toLowerCase();

      if (normalizedPriority === "high") {
        return "high";
      }

      if (normalizedPriority === "medium") {
        return "normal";
      }

      if (normalizedPriority === "low") {
        return "low";
      }

      return "normal";
    }

    function formatNotificationTime(dateValue: string | null) {
      if (!dateValue) {
        return "";
      }

      const date = new Date(dateValue);
      const now = new Date();

      if (Number.isNaN(date.getTime())) {
        return "";
      }

      const differenceInMilliseconds = now.getTime() - date.getTime();
      const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
      const differenceInHours = Math.floor(differenceInMinutes / 60);
      const differenceInDays = Math.floor(differenceInHours / 24);

      if (differenceInMinutes < 1) {
        return "Just now";
      }

      if (differenceInMinutes < 60) {
        return `${differenceInMinutes}m ago`;
      }

      if (differenceInHours < 24) {
        return `${differenceInHours}h ago`;
      }

      if (differenceInDays === 1) {
        return "Yesterday";
      }

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    async function loadCreateTicketNotifications(showLoading = true) {
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

    async function handleToggleNotificationMenu() {
      isNotificationMenuOpen.value = !isNotificationMenuOpen.value;

      if (isNotificationMenuOpen.value) {
        await loadCreateTicketNotifications(false);
      }
    }

    async function handleNotificationClick(notification: AppNotification) {
      if (!notification.ticket_id) {
        return;
      }

      if (!notification.read_at) {
        try {
          const updatedNotification = await markNotificationAsRead(notification.id);

          notifications.value = notifications.value.map((currentNotification) =>
            currentNotification.id === notification.id ? updatedNotification : currentNotification,
          );

          unreadNotificationsCount.value = Math.max(unreadNotificationsCount.value - 1, 0);
        } catch {
          await loadCreateTicketNotifications(false);
        }
      }

      isNotificationMenuOpen.value = false;

      router.push({
        name: "ticket-details",
        params: { id: String(notification.ticket_id) },
      });
    }

    async function handleMarkAllNotificationsRead() {
      if (unreadNotificationsCount.value === 0) {
        return;
      }

      try {
        await markAllNotificationsAsRead();

        unreadNotificationsCount.value = 0;
        notifications.value = notifications.value.map((notification) => ({
          ...notification,
          read_at: notification.read_at || new Date().toISOString(),
        }));
      } catch {
        await loadCreateTicketNotifications(false);
      }
    }

    function handleDocumentClick(event: MouseEvent) {
      if (!isNotificationMenuOpen.value) {
        return;
      }

      const clickedElement = event.target as Node | null;

      if (clickedElement && notificationAreaRef.value?.contains(clickedElement)) {
        return;
      }

      isNotificationMenuOpen.value = false;
    }

    function validateTicketForm() {
      if (
        ticketTitle.value.trim() === "" ||
        category.value.trim() === "" ||
        priority.value.trim() === "" ||
        description.value.trim() === ""
      ) {
        errorMessage.value = "Please fill in all required fields before submitting the ticket.";
        return false;
      }

      errorMessage.value = "";
      return true;
    }

    async function handleSubmitTicket() {
      if (isSubmitting.value || isCheckingUser.value) {
        return;
      }

      if (!validateTicketForm()) {
        return;
      }

      isSubmitting.value = true;
      errorMessage.value = "";

      try {
        const response = await apiJsonFetch("/tickets", {
          method: "POST",
          body: JSON.stringify({
            title: ticketTitle.value.trim(),
            category: category.value.trim(),
            priority: formatPriorityForBackend(priority.value),
            description: description.value.trim(),
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          const validationErrors = result.errors ? Object.values(result.errors).flat().join(" ") : "";

          throw new Error(validationErrors || result.message || "Ticket could not be created.");
        }

        router.push({ name: "client-dashboard" });
      } catch (error) {
        errorMessage.value =
          error instanceof Error ? error.message : "Something went wrong while creating the ticket.";
      } finally {
        isSubmitting.value = false;
      }
    }

    function handleCancel() {
      router.push({ name: "client-dashboard" });
    }

    async function handleSignOut() {
      try {
        await logoutUser();
      } finally {
        router.push({ name: "login" });
      }
    }

    onMounted(async () => {
      document.addEventListener("click", handleDocumentClick);

      try {
        const user = await getCurrentUser();

        if (!user) {
          router.push({ name: "login" });
          return;
        }

        if (user.role !== "client") {
          errorMessage.value = "Only client accounts can create tickets.";
          return;
        }

        await loadCreateTicketNotifications();

        ticketRealtimeCleanup = listenToDashboardUpdates(user.id, "client", () => {
          void loadCreateTicketNotifications(false);
        });

        notificationRealtimeCleanup = listenToUserNotifications(user.id, () => {
          void loadCreateTicketNotifications(false);
        });
      } catch {
        router.push({ name: "login" });
      } finally {
        isCheckingUser.value = false;
      }
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", handleDocumentClick);

      if (ticketRealtimeCleanup) {
        ticketRealtimeCleanup();
        ticketRealtimeCleanup = null;
      }

      if (notificationRealtimeCleanup) {
        notificationRealtimeCleanup();
        notificationRealtimeCleanup = null;
      }
    });

    return {
      ticketTitle,
      category,
      priority,
      description,
      selectedFileName,
      fileInput,
      errorMessage,
      isSubmitting,
      isSidebarOpen,
      notifications,
      unreadNotificationsCount,
      isNotificationMenuOpen,
      notificationAreaRef,
      isLoadingNotifications,
      notificationErrorMessage,
      categories,
      priorities,
      submitButtonLabel,
      notificationCountLabel,
      toggleSidebar,
      goToDashboard,
      goBackToDashboard,
      goToCreateTicket,
      goToClientDashboardSection,
      openFilePicker,
      handleFileChange,
      formatNotificationTime,
      handleToggleNotificationMenu,
      handleNotificationClick,
      handleMarkAllNotificationsRead,
      handleSubmitTicket,
      handleCancel,
      handleSignOut,
    };
  },
});
