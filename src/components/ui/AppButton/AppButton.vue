<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    variant?: "primary" | "secondary" | "danger";
    type?: "button" | "submit" | "reset";
  }>(),
  {
    variant: "primary",
    type: "button",
  },
);

const emit = defineEmits<{
  (e: "click"): void;
}>();

function handleClick() {
  emit("click");
}
</script>

<template>
  <button class="app-button" :class="`app-button--${variant}`" :type="type" @click="handleClick">
    {{ label }}
  </button>
</template>

<style scoped lang="scss" src="./AppButton.scss"></style>
