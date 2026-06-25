<script setup lang="ts">
import AppCard from "@/components/ui/AppCard/AppCard.vue";
import AppIcon from "@/components/ui/AppIcon/AppIcon.vue";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge.vue";
import PriorityBadge from "@/components/ui/PriorityBadge/PriorityBadge.vue";

type TicketStatus = "Open" | "In Progress" | "Resolved" | "Waiting for Client" | "Closed";
type TicketPriority = "High" | "Medium" | "Low";

withDefaults(
  defineProps<{
    category: string;
    status: TicketStatus;
    priority: TicketPriority;
    lastUpdated: string;
    title?: string;
  }>(),
  {
    title: "Ticket Summary",
  },
);
</script>

<template>
  <AppCard class="ticket-summary-card" min-height="216px">
    <div class="ticket-summary-card__header">
      <div class="ticket-summary-card__icon">
        <AppIcon name="tickets" :size="25" />
      </div>

      <h3>{{ title }}</h3>
    </div>

    <div class="ticket-summary-card__list">
      <div class="ticket-summary-card__row">
        <span class="ticket-summary-card__label">Category</span>
        <strong class="ticket-summary-card__text">{{ category }}</strong>
      </div>

      <div class="ticket-summary-card__row">
        <span class="ticket-summary-card__label">Status</span>

        <div class="ticket-summary-card__value">
          <StatusBadge :status="status" />
        </div>
      </div>

      <div class="ticket-summary-card__row">
        <span class="ticket-summary-card__label">Priority</span>

        <div class="ticket-summary-card__value">
          <PriorityBadge :priority="priority" />
        </div>
      </div>

      <div class="ticket-summary-card__row">
        <span class="ticket-summary-card__label">Last updated</span>
        <strong class="ticket-summary-card__text">{{ lastUpdated }}</strong>
      </div>
    </div>
  </AppCard>
</template>

<style scoped lang="scss" src="./TicketSummaryCard.scss"></style>
