<script setup lang="ts">
defineProps<{
  label: string;
  modelValue: string;
  options: string[];
  placeholder: string;
  required?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  emit("update:modelValue", target.value);
}
</script>

<template>
  <label class="app-select">
    <span class="app-select__label">
      {{ label }}
      <span v-if="required" class="app-select__required">*</span>
    </span>

    <select class="app-select__field" :value="modelValue" @change="handleChange">
      <option value="" disabled>
        {{ placeholder }}
      </option>

      <option v-for="option in options" :key="option" :value="option">
        {{ option }}
      </option>
    </select>
  </label>
</template>

<style scoped lang="scss" src="./AppSelect.scss"></style>
