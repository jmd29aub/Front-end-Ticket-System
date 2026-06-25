<script setup lang="ts">
import AppCard from "@/components/ui/AppCard/AppCard.vue";
import AppIcon from "@/components/ui/AppIcon/AppIcon.vue";

withDefaults(
  defineProps<{
    title?: string;
    highTime?: string;
    mediumTime?: string;
    lowTime?: string;
    note?: string;
  }>(),
  {
    title: "Estimated Response Time",
    highTime: "8 hours",
    mediumTime: "24 hours",
    lowTime: "48 hours",
    note: "Response times may vary depending on the issue",
  },
);
</script>

<template>
  <AppCard class="response-time-card" min-height="284px">
    <div class="response-time-card__header">
      <div class="response-time-card__icon">
        <AppIcon name="clock" :size="27" />
      </div>

      <h3>{{ title }}</h3>
    </div>

    <div class="response-time-card__list">
      <div class="response-time-card__row">
        <span class="response-time-card__dot response-time-card__dot--high"></span>
        <span>High</span>
        <strong>{{ highTime }}</strong>
      </div>

      <div class="response-time-card__row">
        <span class="response-time-card__dot response-time-card__dot--medium"></span>
        <span>Medium</span>
        <strong>{{ mediumTime }}</strong>
      </div>

      <div class="response-time-card__row">
        <span class="response-time-card__dot response-time-card__dot--low"></span>
        <span>Low</span>
        <strong>{{ lowTime }}</strong>
      </div>
    </div>

    <p class="response-time-card__note">{{ note }}</p>
  </AppCard>
</template>

<style scoped lang="scss" src="./ResponseTimeCard.scss"></style>
