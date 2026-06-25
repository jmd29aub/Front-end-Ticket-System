<script setup lang="ts">
withDefaults(
  defineProps<{
    name:
      | "sign-out"
      | "tickets"
      | "clock"
      | "check"
      | "alert"
      | "user"
      | "clients"
      | "settings"
      | "search"
      | "notification"
      | "export"
      | "attachment"
      | "send"
      | "info";
    size?: number;
  }>(),
  {
    size: 22,
  },
);
</script>

<template>
  <svg
    v-if="name === 'sign-out'"
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M10 17L15 12L10 7"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path d="M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    <path
      d="M14 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H14"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>

  <svg
    v-else-if="name === 'tickets'"
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M4 7C4 5.9 4.9 5 6 5H18C19.1 5 20 5.9 20 7V9C18.9 9 18 9.9 18 11C18 12.1 18.9 13 20 13V17C20 18.1 19.1 19 18 19H6C4.9 19 4 18.1 4 17V13C5.1 13 6 12.1 6 11C6 9.9 5.1 9 4 9V7Z"
      stroke="currentColor"
      stroke-width="2"
      stroke-linejoin="round"
    />
    <path
      d="M10 8V16"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-dasharray="2 2"
    />
  </svg>

  <svg
    v-else-if="name === 'clock'"
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" />
    <path
      d="M12 8V12L15 14"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>

  <svg
    v-else-if="name === 'check'"
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M20 6L9 17L4 12"
      stroke="currentColor"
      stroke-width="2.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>

  <svg
    v-else-if="name === 'alert'"
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path d="M12 4L21 20H3L12 4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
    <path d="M12 9V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    <path d="M12 17H12.01" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  </svg>

  <svg
    v-else-if="name === 'user'"
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" />
    <path
      d="M4 20C5.5 16.5 8.2 15 12 15C15.8 15 18.5 16.5 20 20"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>

  <svg
    v-else-if="name === 'clients'"
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="2" />
    <circle cx="17" cy="10" r="2.5" stroke="currentColor" stroke-width="2" />
    <path
      d="M3 20C4.2 16.8 6.2 15.5 9 15.5C11.8 15.5 13.8 16.8 15 20"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
    <path
      d="M14.5 16C16.8 16.2 18.5 17.5 20 20"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>

  <svg
    v-else-if="name === 'settings'"
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
    <path
      d="M19 12C19 11.6 19 11.3 18.9 10.9L21 9.3L19 5.8L16.5 6.8C16 6.4 15.5 6.1 14.9 5.9L14.5 3H10.5L10.1 5.9C9.5 6.1 9 6.4 8.5 6.8L6 5.8L4 9.3L6.1 10.9C6 11.3 6 11.6 6 12C6 12.4 6 12.7 6.1 13.1L4 14.7L6 18.2L8.5 17.2C9 17.6 9.5 17.9 10.1 18.1L10.5 21H14.5L14.9 18.1C15.5 17.9 16 17.6 16.5 17.2L19 18.2L21 14.7L18.9 13.1C19 12.7 19 12.4 19 12Z"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linejoin="round"
    />
  </svg>

  <svg
    v-else-if="name === 'search'"
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="2" />
    <path d="M16 16L20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>

  <svg
    v-else-if="name === 'notification'"
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M18 10C18 6.7 15.8 4 12 4C8.2 4 6 6.7 6 10V14L4 17H20L18 14V10Z"
      stroke="currentColor"
      stroke-width="2"
      stroke-linejoin="round"
    />
    <path
      d="M10 19C10.4 20.2 11.1 21 12 21C12.9 21 13.6 20.2 14 19"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>

  <svg
    v-else-if="name === 'export'"
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path d="M12 4V14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    <path
      d="M8 10L12 14L16 10"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path d="M5 18H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>

  <svg
    v-else-if="name === 'attachment'"
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M9 12L14.5 6.5C16 5 18.5 5 20 6.5C21.5 8 21.5 10.5 20 12L12 20C9.8 22.2 6.2 22.2 4 20C1.8 17.8 1.8 14.2 4 12L12 4"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>

  <svg
    v-else-if="name === 'send'"
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path d="M21 3L10 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    <path
      d="M21 3L14 21L10 14L3 10L21 3Z"
      stroke="currentColor"
      stroke-width="2"
      stroke-linejoin="round"
    />
  </svg>

  <svg
    v-else-if="name === 'info'"
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" />
    <path d="M12 11V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    <path d="M12 8H12.01" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  </svg>
</template>

<style scoped lang="scss" src="./AppIcon.scss"></style>
