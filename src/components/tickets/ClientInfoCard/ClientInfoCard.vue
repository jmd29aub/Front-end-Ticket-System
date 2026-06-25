<script setup lang="ts">
import AppCard from "@/components/ui/AppCard/AppCard.vue";
import AppIcon from "@/components/ui/AppIcon/AppIcon.vue";

defineProps<{
  name: string;
  email: string;
  category: string;
}>();
</script>

<template>
  <AppCard class="client-info-card" min-height="164px">
    <div class="client-info-card__header">
      <div class="client-info-card__icon">
        <AppIcon name="user" :size="25" />
      </div>

      <h3>Client Info</h3>
    </div>

    <div class="client-info-card__list">
      <div class="client-info-card__row">
        <span class="client-info-card__label">Name</span>
        <strong class="client-info-card__text">{{ name }}</strong>
      </div>

      <div class="client-info-card__row">
        <span class="client-info-card__label">Email</span>
        <strong class="client-info-card__text">{{ email }}</strong>
      </div>

      <div class="client-info-card__row">
        <span class="client-info-card__label">Category</span>
        <strong class="client-info-card__text">{{ category }}</strong>
      </div>
    </div>
  </AppCard>
</template>

<style scoped lang="scss" src="./ClientInfoCard.scss"></style>
