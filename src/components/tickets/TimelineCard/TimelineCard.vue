<script setup lang="ts">
import AppCard from "@/components/ui/AppCard/AppCard.vue";
import AppIcon from "@/components/ui/AppIcon/AppIcon.vue";

defineProps<{
  createdAt: string;
  lastUpdated: string;
  assignedTo: string;
  stretch?: boolean;
}>();
</script>

<template>
  <AppCard class="timeline-card" min-height="164px" :stretch="stretch">
    <div class="timeline-card__header">
      <div class="timeline-card__icon">
        <AppIcon name="clock" :size="25" />
      </div>

      <h3>Timeline</h3>
    </div>

    <div class="timeline-card__timeline">
      <div>
        <span></span>
        <p>
          <strong>Created</strong>
          {{ createdAt }}
        </p>
      </div>

      <div>
        <span></span>
        <p>
          <strong>Last Updated</strong>
          {{ lastUpdated }}
        </p>
      </div>

      <div>
        <span></span>
        <p>
          <strong>Assigned To</strong>
          {{ assignedTo }}
        </p>
      </div>
    </div>
  </AppCard>
</template>

<style scoped lang="scss" src="./TimelineCard.scss"></style>
