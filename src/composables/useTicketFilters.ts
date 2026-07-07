import { computed, ref } from "vue";

interface TicketFilterOptions {
  includeAgent?: boolean;
}

export function useTicketFilters(options: TicketFilterOptions = {}) {
  const { includeAgent = false } = options;

  const searchQuery = ref("");
  const selectedStatus = ref("");
  const selectedPriority = ref("");
  const selectedCategory = ref("");
  const selectedAgent = ref("");

  const hasActiveFilters = computed(() => {
    return Boolean(
      searchQuery.value.trim() ||
        selectedStatus.value ||
        selectedPriority.value ||
        selectedCategory.value ||
        (includeAgent && selectedAgent.value),
    );
  });

  function clearFilters() {
    searchQuery.value = "";
    selectedStatus.value = "";
    selectedPriority.value = "";
    selectedCategory.value = "";

    if (includeAgent) {
      selectedAgent.value = "";
    }
  }

  return {
    searchQuery,
    selectedStatus,
    selectedPriority,
    selectedCategory,
    selectedAgent,
    hasActiveFilters,
    clearFilters,
  };
}
