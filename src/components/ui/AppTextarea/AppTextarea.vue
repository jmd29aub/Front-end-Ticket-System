<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    modelValue: string;
    placeholder?: string;
    required?: boolean;
  }>(),
  {
    placeholder: "",
    required: false,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  emit("update:modelValue", target.value);
}
</script>

<template>
  <label class="app-textarea">
    <span class="app-textarea__label">
      {{ label }}
      <span v-if="required" class="app-textarea__required">*</span>
    </span>

    <textarea
      class="app-textarea__field"
      :value="modelValue"
      :placeholder="placeholder"
      @input="handleInput"
    ></textarea>
  </label>
</template>

<style scoped lang="scss" src="./AppTextarea.scss"></style>
