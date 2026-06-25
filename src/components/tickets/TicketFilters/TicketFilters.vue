<script setup lang="ts">
import AppIcon from "@/components/ui/AppIcon/AppIcon.vue";

defineProps<{
  search: string;
  status: string;
  priority: string;
  category: string;
  agent: string;
}>();

const emit = defineEmits<{
  (event: "update:search", value: string): void;
  (event: "update:status", value: string): void;
  (event: "update:priority", value: string): void;
  (event: "update:category", value: string): void;
  (event: "update:agent", value: string): void;
}>();

const statusOptions = ["Open", "In Progress", "Waiting for Client", "Resolved"];
const priorityOptions = ["High", "Medium", "Low"];
const categoryOptions = ["Account Access", "Billing", "Feature Request", "Technical Issue"];
const agentOptions = ["John Doe", "Support Team", "Sarah Smith"];

function handleSearchInput(event: Event) {
  emit("update:search", (event.target as HTMLInputElement).value);
}

function handleStatusChange(event: Event) {
  emit("update:status", (event.target as HTMLSelectElement).value);
}

function handlePriorityChange(event: Event) {
  emit("update:priority", (event.target as HTMLSelectElement).value);
}

function handleCategoryChange(event: Event) {
  emit("update:category", (event.target as HTMLSelectElement).value);
}

function handleAgentChange(event: Event) {
  emit("update:agent", (event.target as HTMLSelectElement).value);
}
</script>

<template>
  <section class="ticket-filters">
    <div class="ticket-filters__search">
      <span>
        <AppIcon name="search" :size="20" />
      </span>

      <input
        :value="search"
        type="text"
        placeholder="Search tickets..."
        @input="handleSearchInput"
      />
    </div>

    <select :value="status" @change="handleStatusChange">
      <option value="">Status</option>
      <option v-for="option in statusOptions" :key="option" :value="option">
        {{ option }}
      </option>
    </select>

    <select :value="priority" @change="handlePriorityChange">
      <option value="">Priority</option>
      <option v-for="option in priorityOptions" :key="option" :value="option">
        {{ option }}
      </option>
    </select>

    <select :value="category" @change="handleCategoryChange">
      <option value="">Category</option>
      <option v-for="option in categoryOptions" :key="option" :value="option">
        {{ option }}
      </option>
    </select>

    <select :value="agent" @change="handleAgentChange">
      <option value="">Assigned Agent</option>
      <option v-for="option in agentOptions" :key="option" :value="option">
        {{ option }}
      </option>
    </select>
  </section>
</template>

<style scoped lang="scss" src="./TicketFilters.scss"></style>
