<script setup lang="ts">
defineProps<{
  priority: "High" | "Medium" | "Low";
}>();
</script>

<template>
  <span class="priority-badge" :class="`priority-badge--${priority.toLowerCase()}`">
    {{ priority }}
  </span>
</template>

<style scoped lang="scss" src="./PriorityBadge.scss"></style>
