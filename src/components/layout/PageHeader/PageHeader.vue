<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>

<template>
  <section class="page-header">
    <div class="page-header__text">
      <h2 class="page-header__title">{{ title }}</h2>

      <p v-if="subtitle" class="page-header__subtitle">
        {{ subtitle }}
      </p>
    </div>

    <div v-if="$slots.action" class="page-header__action">
      <slot name="action"></slot>
    </div>
  </section>
</template>

<style scoped lang="scss" src="./PageHeader.scss"></style>
