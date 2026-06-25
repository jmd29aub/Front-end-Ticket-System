<script setup lang="ts">
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge.vue";
import PriorityBadge from "@/components/ui/PriorityBadge/PriorityBadge.vue";
import ViewDetailsButton from "@/components/ui/ViewDetailsButton/ViewDetailsButton.vue";

type TicketStatus = "Open" | "In Progress" | "Resolved" | "Waiting for Client" | "Closed";
type TicketPriority = "High" | "Medium" | "Low";

interface ClientTicket {
  id: string;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  date: string;
}

defineProps<{
  tickets: ClientTicket[];
}>();

const emit = defineEmits<{
  (event: "viewTicket", ticketId: string): void;
}>();

function formatTicketId(ticketId: string) {
  return ticketId.startsWith("#") ? ticketId : `#${ticketId}`;
}

function handleViewTicket(ticketId: string) {
  emit("viewTicket", ticketId);
}
</script>

<template>
  <div class="client-ticket-table">
    <table class="client-ticket-table__table">
      <thead>
        <tr>
          <th>Ticket ID</th>
          <th>Subject</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Date</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="ticket in tickets" :key="ticket.id">
          <td>{{ formatTicketId(ticket.id) }}</td>

          <td>{{ ticket.subject }}</td>

          <td>
            <PriorityBadge :priority="ticket.priority" />
          </td>

          <td>
            <StatusBadge :status="ticket.status" />
          </td>

          <td>{{ ticket.date }}</td>

          <td>
            <ViewDetailsButton @click="handleViewTicket(ticket.id)" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss" src="./ClientTicketTable.scss"></style>
