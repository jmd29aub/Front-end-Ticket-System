<script setup lang="ts">
import AppIcon from "@/components/ui/AppIcon/AppIcon.vue";

defineProps<{
  title: string;
  value: number;
  icon: "tickets" | "clock" | "check" | "alert" | "user";
  tone: "purple" | "green" | "red";
}>();
</script>

<template>
  <article class="stat-card">
    <div class="stat-card__icon" :class="`stat-card__icon--${tone}`">
      <AppIcon :name="icon" :size="25" />
    </div>

    <div class="stat-card__content">
      <p class="stat-card__title">{{ title }}</p>
      <strong class="stat-card__value">{{ value }}</strong>
    </div>
  </article>
</template>

<style scoped lang="scss" src="./StatCard.scss"></style>
