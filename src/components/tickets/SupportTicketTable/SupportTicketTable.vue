<script setup lang="ts">
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge.vue";
import PriorityBadge from "@/components/ui/PriorityBadge/PriorityBadge.vue";
import ViewDetailsButton from "@/components/ui/ViewDetailsButton/ViewDetailsButton.vue";

type SupportStatus = "Open" | "In Progress" | "Resolved" | "Waiting for Client";
type SupportPriority = "High" | "Medium" | "Low";

interface SupportTicket {
  id: string;
  client: string;
  subject: string;
  priority: SupportPriority;
  status: SupportStatus;
  assignedTo: string;
  date: string;
}

defineProps<{
  tickets: SupportTicket[];
}>();

const emit = defineEmits<{
  (event: "viewTicket", ticketId: string): void;
}>();

function handleViewTicket(ticketId: string) {
  emit("viewTicket", ticketId);
}
</script>

<template>
  <div class="support-ticket-table">
    <table class="support-ticket-table__table">
      <thead>
        <tr>
          <th>Ticket ID</th>
          <th>Client</th>
          <th>Subject</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Assigned To</th>
          <th>Date</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="ticket in tickets" :key="ticket.id">
          <td>{{ ticket.id }}</td>

          <td>{{ ticket.client }}</td>

          <td>{{ ticket.subject }}</td>

          <td>
            <PriorityBadge :priority="ticket.priority" />
          </td>

          <td>
            <StatusBadge :status="ticket.status" />
          </td>

          <td>{{ ticket.assignedTo }}</td>

          <td>{{ ticket.date }}</td>

          <td>
            <ViewDetailsButton @click="handleViewTicket(ticket.id)" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss" src="./SupportTicketTable.scss"></style>
