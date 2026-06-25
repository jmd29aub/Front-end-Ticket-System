<script setup lang="ts">
import { useRouter } from "vue-router";
import AppIcon from "@/components/ui/AppIcon/AppIcon.vue";

const props = withDefaults(
  defineProps<{
    variant?: "client" | "support";
    notificationCount?: number;
  }>(),
  {
    variant: "client",
    notificationCount: 3,
  },
);

const router = useRouter();

function handleMainLink() {
  if (props.variant === "client") {
    router.push({ name: "client-dashboard" });
  } else {
    router.push({ name: "support-dashboard" });
  }
}

function handleSignOut() {
  router.push({ name: "login" });
}
</script>

<template>
  <header class="app-navbar">
    <div class="app-navbar__brand-area">
      <div v-if="variant === 'support'" class="app-navbar__headset-icon">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M4 13V11C4 6.6 7.6 3 12 3C16.4 3 20 6.6 20 11V13"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />

          <path
            d="M4 13C4 12.4 4.4 12 5 12H7C7.6 12 8 12.4 8 13V17C8 17.6 7.6 18 7 18H5C4.4 18 4 17.6 4 17V13Z"
            stroke="currentColor"
            stroke-width="2"
          />

          <path
            d="M16 13C16 12.4 16.4 12 17 12H19C19.6 12 20 12.4 20 13V17C20 17.6 19.6 18 19 18H17C16.4 18 16 17.6 16 17V13Z"
            stroke="currentColor"
            stroke-width="2"
          />

          <path
            d="M20 17V18C20 19.7 18.7 21 17 21H13"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </div>

      <h1 class="app-navbar__brand">Support Ticket System</h1>
    </div>

    <nav class="app-navbar__nav">
      <template v-if="variant === 'client'">
        <button class="app-navbar__nav-link" type="button" @click="handleMainLink">
          My Tickets
        </button>

        <button class="app-navbar__nav-link" type="button">Profile</button>
      </template>

      <template v-else>
        <button class="app-navbar__nav-link" type="button" @click="handleMainLink">
          All Tickets
        </button>

        <button class="app-navbar__notification" type="button">
          <AppIcon name="notification" :size="22" />
          <span>{{ notificationCount }}</span>
        </button>

        <button class="app-navbar__nav-link" type="button">Profile</button>
      </template>

      <button class="app-navbar__sign-out" type="button" @click="handleSignOut">
        <AppIcon name="sign-out" :size="18" />
        Sign Out
      </button>
    </nav>
  </header>
</template>

<style scoped lang="scss" src="./AppNavbar.scss"></style>
