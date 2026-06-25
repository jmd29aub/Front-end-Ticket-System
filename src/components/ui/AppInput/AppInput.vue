<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    modelValue: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
  }>(),
  {
    type: "text",
    placeholder: "",
    required: false,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
}
</script>

<template>
  <label class="app-input">
    <span class="app-input__label">
      {{ label }}
      <span v-if="required" class="app-input__required">*</span>
    </span>

    <input
      class="app-input__field"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      @input="handleInput"
    />
  </label>
</template>

<style scoped lang="scss" src="./AppInput.scss"></style>
