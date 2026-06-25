<script setup lang="ts">
import AppCard from "@/components/ui/AppCard/AppCard.vue";
import AppIcon from "@/components/ui/AppIcon/AppIcon.vue";

type SupportStatus = "Open" | "In Progress" | "Resolved" | "Waiting for Client";
type SupportPriority = "High" | "Medium" | "Low";

defineProps<{
  status: SupportStatus;
  priority: SupportPriority;
  agent: string;
  category: string;
}>();

const emit = defineEmits<{
  (event: "update:status", value: SupportStatus): void;
  (event: "update:priority", value: SupportPriority): void;
  (event: "update:agent", value: string): void;
  (event: "update:category", value: string): void;
  (event: "save"): void;
}>();

const statusOptions: SupportStatus[] = ["Open", "In Progress", "Waiting for Client", "Resolved"];
const priorityOptions: SupportPriority[] = ["High", "Medium", "Low"];
const agentOptions = ["John Doe", "Support Team", "Sarah Smith"];
const categoryOptions = ["Account Access", "Billing", "Feature Request", "Technical Issue"];

function handleStatusChange(event: Event) {
  emit("update:status", (event.target as HTMLSelectElement).value as SupportStatus);
}

function handlePriorityChange(event: Event) {
  emit("update:priority", (event.target as HTMLSelectElement).value as SupportPriority);
}

function handleAgentChange(event: Event) {
  emit("update:agent", (event.target as HTMLSelectElement).value);
}

function handleCategoryChange(event: Event) {
  emit("update:category", (event.target as HTMLSelectElement).value);
}
</script>

<template>
  <AppCard class="manage-ticket-card" min-height="306px">
    <div class="manage-ticket-card__header">
      <div class="manage-ticket-card__icon">
        <AppIcon name="settings" :size="25" />
      </div>

      <h3>Manage Ticket</h3>
    </div>

    <div class="manage-ticket-card__form">
      <label>
        <span>Status</span>

        <select :value="status" @change="handleStatusChange">
          <option v-for="option in statusOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </label>

      <label>
        <span>Priority</span>

        <select :value="priority" @change="handlePriorityChange">
          <option v-for="option in priorityOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </label>

      <label>
        <span>Assigned Agent</span>

        <select :value="agent" @change="handleAgentChange">
          <option v-for="option in agentOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </label>

      <label>
        <span>Category</span>

        <select :value="category" @change="handleCategoryChange">
          <option v-for="option in categoryOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </label>

      <button class="manage-ticket-card__button" type="button" @click="$emit('save')">
        Save Changes
      </button>
    </div>
  </AppCard>
</template>

<style scoped lang="scss" src="./ManageTicketCard.scss"></style>
