<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    sender: string;
    message: string;
    initials?: string;
    side?: "left" | "right";
  }>(),
  {
    initials: "",
    side: "left",
  },
);

const displayInitials = computed(() => {
  if (props.initials) {
    return props.initials;
  }

  return props.sender
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
});
</script>

<template>
  <div class="conversation-message" :class="`conversation-message--${side}`">
    <div v-if="side === 'left'" class="conversation-message__avatar">
      {{ displayInitials }}
    </div>

    <div class="conversation-message__bubble">
      <span>{{ sender }}</span>
      <strong>{{ message }}</strong>
    </div>

    <div
      v-if="side === 'right'"
      class="conversation-message__avatar conversation-message__avatar--support"
    >
      {{ displayInitials }}
    </div>
  </div>
</template>

<style scoped lang="scss" src="./ConversationMessage.scss"></style>
