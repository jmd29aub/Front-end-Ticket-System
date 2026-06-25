<script setup lang="ts">
defineProps<{
  status: "Open" | "In Progress" | "Resolved" | "Closed" | "Waiting for Client";
}>();
</script>

<template>
  <span class="status-badge" :class="`status-badge--${status.toLowerCase().replaceAll(' ', '-')}`">
    {{ status }}
  </span>
</template>

<style scoped lang="scss" src="./StatusBadge.scss"></style>
