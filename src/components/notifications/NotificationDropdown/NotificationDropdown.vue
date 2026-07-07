<template>
  <button
    class="notification-dropdown__button"
    type="button"
    :aria-expanded="isOpen"
    aria-label="Open notifications"
    @click="emit('toggle')"
  >
    <AppIcon name="notification" :size="22" />
    <span v-if="unreadCount > 0">{{ countLabel }}</span>
  </button>

  <section v-if="isOpen" class="notification-dropdown__menu">
    <div class="notification-dropdown__menu-header">
      <div>
        <h3>Notifications</h3>
        <p>{{ unreadCount }} unread</p>
      </div>

      <button type="button" :disabled="unreadCount === 0" @click="emit('mark-all-read')">
        Mark all read
      </button>
    </div>

    <p v-if="errorMessage" class="notification-dropdown__error">
      {{ errorMessage }}
    </p>

    <p v-else-if="isLoading" class="notification-dropdown__empty">
      Loading notifications...
    </p>

    <div v-else-if="notifications.length > 0" class="notification-dropdown__list">
      <button
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-dropdown__item"
        :class="{ 'notification-dropdown__item--unread': !notification.read_at }"
        type="button"
        @click="emit('notification-click', notification)"
      >
        <span class="notification-dropdown__dot"></span>

        <span class="notification-dropdown__content">
          <span class="notification-dropdown__label">
            {{ notification.label }}
          </span>

          <strong>{{ notification.title }}</strong>
          <small>{{ notification.message }}</small>

          <em>
            {{
              notification.ticket_number ||
              (notification.ticket_id ? `#${notification.ticket_id}` : "Ticket update")
            }}
            <template v-if="formatTime(notification.updated_at || notification.created_at)">
              &middot;
              {{ formatTime(notification.updated_at || notification.created_at) }}
            </template>
          </em>
        </span>
      </button>
    </div>

    <p v-else class="notification-dropdown__empty">No notifications yet.</p>
  </section>
</template>

<script setup lang="ts">
import AppIcon from "@/components/ui/AppIcon/AppIcon.vue";
import type { AppNotification } from "@/services/notifications";

defineProps<{
  isOpen: boolean;
  notifications: AppNotification[];
  unreadCount: number;
  countLabel: string;
  isLoading: boolean;
  errorMessage: string;
  formatTime: (value: string | null) => string;
}>();

const emit = defineEmits<{
  toggle: [];
  "mark-all-read": [];
  "notification-click": [notification: AppNotification];
}>();
</script>

<style scoped lang="scss" src="./NotificationDropdown.scss"></style>
