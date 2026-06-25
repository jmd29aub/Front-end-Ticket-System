<script setup lang="ts">
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge.vue";
import PriorityBadge from "@/components/ui/PriorityBadge/PriorityBadge.vue";

type TicketStatus = "Open" | "In Progress" | "Resolved" | "Waiting for Client" | "Closed";
type TicketPriority = "High" | "Medium" | "Low";

defineProps<{
  title: string;
  ticketId: string;
  createdAt: string;
  status: TicketStatus;
  priority: TicketPriority;
}>();
</script>

<template>
  <div class="ticket-details-header">
    <div class="ticket-details-header__text">
      <h3 class="ticket-details-header__title">{{ title }}</h3>

      <div class="ticket-details-header__meta">
        <span>Ticket ID: #{{ ticketId.replace("#", "") }}</span>
        <span class="ticket-details-header__meta-dot"></span>
        <span>Created: {{ createdAt }}</span>
      </div>
    </div>

    <div class="ticket-details-header__badges">
      <StatusBadge :status="status" />
      <PriorityBadge :priority="priority" />
    </div>
  </div>
</template>

<style scoped lang="scss" src="./TicketDetailsHeader.scss"></style>
