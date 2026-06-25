<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string;
  }>(),
  {
    label: "View Details",
  },
);

const emit = defineEmits<{
  (event: "click"): void;
}>();

function handleClick() {
  emit("click");
}
</script>

<template>
  <button class="view-details-button" type="button" @click="handleClick">
    {{ label }}
  </button>
</template>

<style scoped lang="scss" src="./ViewDetailsButton.scss"></style>
