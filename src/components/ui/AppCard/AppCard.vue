<script setup lang="ts">
withDefaults(
  defineProps<{
    padding?: "none" | "sm" | "md" | "lg" | "xl";
    minHeight?: string;
    stretch?: boolean;
  }>(),
  {
    padding: "lg",
    minHeight: "auto",
    stretch: false,
  },
);
</script>

<template>
  <article
    class="app-card"
    :class="[
      `app-card--padding-${padding}`,
      {
        'app-card--stretch': stretch,
      },
    ]"
    :style="{ minHeight }"
  >
    <header v-if="$slots.header" class="app-card__header">
      <slot name="header"></slot>
    </header>

    <div class="app-card__body">
      <slot></slot>
    </div>

    <footer v-if="$slots.footer" class="app-card__footer">
      <slot name="footer"></slot>
    </footer>
  </article>
</template>

<style scoped lang="scss" src="./AppCard.scss"></style>
