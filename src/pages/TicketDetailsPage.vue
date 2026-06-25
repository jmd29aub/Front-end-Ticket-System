<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppButton from "@/components/ui/AppButton/AppButton.vue";
import AppIcon from "@/components/ui/AppIcon/AppIcon.vue";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge.vue";
import PriorityBadge from "@/components/ui/PriorityBadge/PriorityBadge.vue";
import { tickets } from "@/data/tickets";

const route = useRoute();
const router = useRouter();

const replyMessage = ref("");
const replyAttachmentName = ref("");
const replyFileInput = ref<HTMLInputElement | null>(null);

const ticketId = computed(() => String(route.params.id));

const ticket = computed(() => {
  return tickets.find((item) => item.id.replace("#", "") === ticketId.value.replace("#", ""));
});

const isResolved = computed(() => ticket.value?.status === "Resolved");

function goBackToDashboard() {
  router.push({ name: "client-dashboard" });
}

function handleSignOut() {
  router.push({ name: "login" });
}

function openReplyAttachment() {
  replyFileInput.value?.click();
}

function handleReplyAttachmentChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    replyAttachmentName.value = file.name;
  }
}

function handleSendReply() {
  console.log({
    message: replyMessage.value,
    attachment: replyAttachmentName.value,
  });

  replyMessage.value = "";
  replyAttachmentName.value = "";
}
</script>

<template>
  <main class="ticket-details">
    <section class="ticket-details__shell">
      <header class="ticket-details__navbar">
        <div class="ticket-details__brand-group">
          <div class="ticket-details__brand-icon">
            <AppIcon name="tickets" :size="20" />
          </div>

          <h1 class="ticket-details__brand">Support Ticket System</h1>
        </div>

        <nav class="ticket-details__nav">
          <button class="ticket-details__notification" type="button">
            <AppIcon name="notification" :size="22" />
            <span>2</span>
          </button>

          <a href="#" class="ticket-details__profile">Profile</a>

          <button class="ticket-details__sign-out" type="button" @click="handleSignOut">
            <AppIcon name="sign-out" :size="18" />
            Sign Out
          </button>
        </nav>
      </header>

      <div class="ticket-details__accent-line"></div>

      <template v-if="ticket">
        <section class="ticket-details__page-header">
          <div>
            <h2 class="ticket-details__page-title">Ticket #{{ ticket.id }} - {{ ticket.title }}</h2>

            <p class="ticket-details__page-subtitle">
              Track the progress of your support request and communicate with the support team
            </p>
          </div>

          <AppButton label="← Back to Dashboard" variant="secondary" @click="goBackToDashboard" />
        </section>

        <section class="ticket-details__content">
          <article class="ticket-details__main-card">
            <div class="ticket-details__main-header">
              <div>
                <h3 class="ticket-details__ticket-title">{{ ticket.title }}</h3>

                <div class="ticket-details__meta">
                  <span>Ticket ID: #{{ ticket.id }}</span>
                  <span class="ticket-details__meta-dot"></span>
                  <span>Created: {{ ticket.createdAt }}</span>
                </div>
              </div>

              <div class="ticket-details__badges">
                <StatusBadge :status="ticket.status" />
                <PriorityBadge :priority="ticket.priority" />
              </div>
            </div>

            <div class="ticket-details__divider"></div>

            <section class="ticket-details__progress-section">
              <h4 class="ticket-details__section-title">Ticket Progress</h4>

              <div class="ticket-details__progress">
                <div class="ticket-details__step ticket-details__step--done">
                  <div class="ticket-details__step-circle">✓</div>
                  <strong>Submitted</strong>
                  <span>{{ ticket.progress.submitted }}</span>
                </div>

                <div class="ticket-details__line ticket-details__line--done"></div>

                <div class="ticket-details__step ticket-details__step--done">
                  <div class="ticket-details__step-circle">✓</div>
                  <strong>Open</strong>
                  <span>{{ ticket.progress.open }}</span>
                </div>

                <div
                  class="ticket-details__line"
                  :class="{
                    'ticket-details__line--done':
                      ticket.status === 'In Progress' || ticket.status === 'Resolved',
                  }"
                ></div>

                <div
                  class="ticket-details__step"
                  :class="{
                    'ticket-details__step--active': ticket.status === 'In Progress',
                    'ticket-details__step--done': ticket.status === 'Resolved',
                  }"
                >
                  <div class="ticket-details__step-circle">
                    {{ ticket.status === "Resolved" ? "✓" : "3" }}
                  </div>

                  <strong>In Progress</strong>
                  <span>{{ ticket.progress.inProgress }}</span>
                </div>

                <div
                  class="ticket-details__line"
                  :class="{ 'ticket-details__line--done': ticket.status === 'Resolved' }"
                ></div>

                <div
                  class="ticket-details__step"
                  :class="{ 'ticket-details__step--done': isResolved }"
                >
                  <div class="ticket-details__step-circle">
                    {{ isResolved ? "✓" : "4" }}
                  </div>

                  <strong>Resolved</strong>
                  <span v-if="ticket.progress.resolved">{{ ticket.progress.resolved }}</span>
                </div>
              </div>
            </section>

            <section class="ticket-details__description">
              <h4 class="ticket-details__section-title">Description</h4>

              <div class="ticket-details__description-box">
                {{ ticket.description }}
              </div>
            </section>

            <section class="ticket-details__conversation">
              <h4 class="ticket-details__section-title">Conversation</h4>

              <div class="ticket-details__message">
                <div class="ticket-details__avatar">{{ ticket.client }}</div>

                <div class="ticket-details__message-bubble">
                  <span>Support team</span>
                  <strong>How can we help you?</strong>
                </div>
              </div>

              <input
                ref="replyFileInput"
                class="ticket-details__file-input"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                @change="handleReplyAttachmentChange"
              />

              <div class="ticket-details__reply">
                <button
                  class="ticket-details__attach-button"
                  type="button"
                  @click="openReplyAttachment"
                >
                  <AppIcon name="attachment" :size="18" />
                </button>

                <input
                  v-model="replyMessage"
                  class="ticket-details__reply-input"
                  type="text"
                  placeholder="Write a reply"
                />

                <button class="ticket-details__reply-button" type="button" @click="handleSendReply">
                  <AppIcon name="send" :size="15" />
                  Send Reply
                </button>
              </div>

              <p v-if="replyAttachmentName" class="ticket-details__attachment-name">
                Attached file: {{ replyAttachmentName }}
              </p>
            </section>
          </article>

          <aside class="ticket-details__side">
            <article class="ticket-details__side-card ticket-details__summary-card">
              <div class="ticket-details__side-header">
                <div class="ticket-details__side-icon">
                  <AppIcon name="tickets" :size="24" />
                </div>

                <h3>Ticket Summary</h3>
              </div>

              <div class="ticket-details__summary-list">
                <div class="ticket-details__summary-row">
                  <span class="ticket-details__summary-label">Category</span>
                  <strong class="ticket-details__summary-text">{{ ticket.category }}</strong>
                </div>

                <div class="ticket-details__summary-row">
                  <span class="ticket-details__summary-label">Status</span>

                  <div class="ticket-details__summary-value">
                    <StatusBadge :status="ticket.status" />
                  </div>
                </div>

                <div class="ticket-details__summary-row">
                  <span class="ticket-details__summary-label">Priority</span>

                  <div class="ticket-details__summary-value">
                    <PriorityBadge :priority="ticket.priority" />
                  </div>
                </div>

                <div class="ticket-details__summary-row">
                  <span class="ticket-details__summary-label">Last updated</span>
                  <strong class="ticket-details__summary-text">{{ ticket.lastUpdated }}</strong>
                </div>
              </div>
            </article>

            <article class="ticket-details__side-card ticket-details__response-card">
              <div class="ticket-details__side-header">
                <div class="ticket-details__side-icon">
                  <AppIcon name="clock" :size="24" />
                </div>

                <h3>Response Time</h3>
              </div>

              <div class="ticket-details__response-list">
                <div class="ticket-details__summary-row">
                  <span class="ticket-details__summary-label">Expected response</span>
                  <strong class="ticket-details__summary-text">8 hours</strong>
                </div>

                <div class="ticket-details__summary-row">
                  <span class="ticket-details__summary-label">Current status</span>
                  <strong class="ticket-details__purple-text">{{ ticket.status }}</strong>
                </div>
              </div>

              <p class="ticket-details__note">Response times may vary depending on the issue</p>
            </article>

            <article class="ticket-details__side-card ticket-details__info-card">
              <div class="ticket-details__side-header">
                <div class="ticket-details__side-icon">
                  <AppIcon name="attachment" :size="22" />
                </div>

                <h3>Need to add information?</h3>
              </div>

              <p>Use the reply box to send more details or attach additional screenshots.</p>
            </article>
          </aside>
        </section>
      </template>

      <section v-else class="ticket-details__not-found">
        <h2>Ticket not found</h2>
        <p>The ticket you are trying to view does not exist.</p>

        <AppButton label="Back to Dashboard" variant="secondary" @click="goBackToDashboard" />
      </section>
    </section>
  </main>
</template>

<style scoped lang="scss">
@use "@/styles/variables" as *;

.ticket-details {
  min-height: 100vh;
  background-color: $color-background;
  padding: 0;
  display: block;
  box-sizing: border-box;

  &__shell {
    width: 100%;
    min-height: 100vh;
    background-color: $color-background;
  }

  &__navbar {
    height: $navbar-height;
    background-color: $color-surface;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 $page-padding-x;
    box-sizing: border-box;
  }

  &__brand-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__brand-icon {
    width: 32px;
    height: 32px;
    border-radius: $radius-md;
    background-color: $color-secondary;
    color: $color-primary;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  &__brand {
    margin: 0;
    font-family: $font-main;
    color: $color-main-text;
    font-size: $font-size-md;
    font-weight: 700;
    line-height: 1.2;
    white-space: nowrap;
  }

  &__nav {
    height: 100%;
    display: flex;
    align-items: center;
    gap: 64px;
  }

  &__notification {
    border: none;
    background: transparent;
    color: $color-main-text;
    cursor: pointer;
    position: relative;
    padding: 0;
    display: grid;
    place-items: center;

    span {
      position: absolute;
      top: -5px;
      right: -8px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: $color-secondary;
      color: $color-primary;
      font-size: 8px;
      font-weight: 800;
      display: grid;
      place-items: center;
    }
  }

  &__profile {
    color: $color-secondary-text;
    text-decoration: none;
    font-size: $font-size-sm;
    font-weight: 600;
  }

  &__sign-out {
    border: none;
    background: transparent;
    color: $color-secondary;
    font-size: $font-size-sm;
    font-weight: 700;
    cursor: pointer;
    padding-left: $space-lg;
    border-left: 1px solid $color-border;
    display: inline-flex;
    align-items: center;
    gap: $space-xs;
    white-space: nowrap;
  }

  &__accent-line {
    height: $accent-line-height;
    background-color: $color-secondary;
  }

  &__page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $page-header-padding-top $page-padding-x $page-header-padding-bottom;
  }

  &__page-title {
    margin: 0;
    color: $color-main-text;
    font-size: $page-title-size;
    font-weight: 800;
  }

  &__page-subtitle {
    margin: $page-subtitle-margin-top 0 0;
    color: $color-secondary-text;
    font-size: $page-subtitle-size;
    font-weight: 600;
  }

  &__content {
    display: grid;
    grid-template-columns: 1fr 325px;
    gap: $space-md;
    padding: 0 $page-padding-x $space-xl;
    align-items: stretch;
  }

  &__main-card {
    min-height: 552px;
    background-color: $color-surface;
    border: $card-border;
    border-radius: $card-radius;
    padding: 30px 34px 24px;
    box-sizing: border-box;
  }

  &__main-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: $space-lg;
  }

  &__ticket-title {
    margin: 0;
    color: $color-main-text;
    font-size: 20px;
    font-weight: 800;
  }

  &__meta {
    margin-top: $space-md;
    display: flex;
    align-items: center;
    gap: $space-md;
    color: $color-secondary-text;
    font-size: 12px;
    font-weight: 600;
  }

  &__meta-dot {
    width: 5px;
    height: 5px;
    background-color: $color-secondary;
    border-radius: 50%;
  }

  &__badges {
    display: flex;
    align-items: center;
    gap: $space-sm;
    padding-top: 4px;
  }

  &__divider {
    height: 1px;
    background-color: $color-border;
    margin: 18px 0 22px;
  }

  &__section-title {
    margin: 0;
    color: $color-main-text;
    font-size: 17px;
    font-weight: 800;
  }

  &__progress {
    margin-top: 34px;
    display: grid;
    grid-template-columns: 52px 1fr 52px 1fr 52px 1fr 52px;
    align-items: start;
  }

  &__step {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;

    strong {
      margin-top: 14px;
      color: $color-main-text;
      font-size: 13px;
      font-weight: 800;
    }

    span {
      margin-top: 4px;
      color: $color-secondary-text;
      font-size: 9px;
      font-weight: 600;
      white-space: nowrap;
    }

    &--active {
      strong {
        color: $color-secondary;
      }
    }
  }

  &__step-circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 1px solid #cbd5e1;
    background-color: $color-surface;
    color: $color-secondary;
    display: grid;
    place-items: center;
    font-size: 18px;
    font-weight: 900;
  }

  &__step--done &__step-circle,
  &__step--active &__step-circle {
    background-color: $color-secondary;
    border-color: $color-secondary;
    color: $color-primary;
  }

  &__line {
    height: 3px;
    background-color: #6b7280;
    margin-top: 24px;

    &--done {
      background-color: $color-secondary;
    }
  }

  &__description {
    margin-top: 38px;
  }

  &__description-box {
    margin-top: $space-md;
    min-height: 34px;
    background-color: #e5e7eb;
    border-radius: $radius-md;
    color: #000000;
    font-size: 12px;
    font-weight: 500;
    padding: 10px $space-md;
  }

  &__conversation {
    margin-top: 42px;
  }

  &__message {
    margin-top: $space-lg;
    display: flex;
    align-items: center;
    gap: $space-sm;
  }

  &__avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: rgba($color-secondary, 0.12);
    color: #000000;
    display: grid;
    place-items: center;
    font-size: 18px;
    font-weight: 700;
  }

  &__message-bubble {
    min-width: 205px;
    min-height: 52px;
    background-color: #e5e7eb;
    border-radius: $radius-md;
    padding: 9px $space-md;

    span {
      display: block;
      color: $color-secondary-text;
      font-size: 9px;
      font-weight: 800;
    }

    strong {
      display: block;
      margin-top: 4px;
      color: $color-main-text;
      font-size: 12px;
      font-weight: 800;
    }
  }

  &__file-input {
    display: none;
  }

  &__reply {
    margin-top: 46px;
    display: grid;
    grid-template-columns: 42px 1fr 136px;
    gap: $space-sm;
  }

  &__attach-button,
  &__reply-input,
  &__reply-button {
    height: 38px;
    border-radius: $radius-md;
  }

  &__attach-button {
    border: 1px solid #cbd5e1;
    background-color: $color-surface;
    color: $color-secondary-text;
    cursor: pointer;
    display: grid;
    place-items: center;

    &:hover {
      border-color: $color-secondary;
      color: $color-secondary;
      background-color: rgba($color-secondary, 0.04);
    }
  }

  &__reply-input {
    border: 1px solid #cbd5e1;
    padding: 0 $space-md;
    font-size: 12px;
    outline: none;

    &::placeholder {
      color: #9ca3af;
    }

    &:focus {
      border-color: $color-secondary;
    }
  }

  &__reply-button {
    border: 1px solid $color-secondary;
    background-color: $color-secondary;
    color: $color-primary;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  &__attachment-name {
    margin: $space-sm 0 0 50px;
    color: $color-secondary;
    font-size: 11px;
    font-weight: 700;
  }

  &__side {
    display: flex;
    flex-direction: column;
    gap: $space-md;
    height: 100%;
    align-self: stretch;
  }

  &__side-card {
    background-color: $color-surface;
    border: $card-border;
    border-radius: $card-radius;
    padding: 24px;
    box-sizing: border-box;
  }

  &__summary-card {
    min-height: 216px;
  }

  &__response-card {
    min-height: 164px;
  }

  &__info-card {
    flex: 1;
    min-height: 140px;
  }

  &__side-header {
    display: flex;
    align-items: center;
    gap: $space-md;

    h3 {
      margin: 0;
      color: $color-main-text;
      font-size: 17px;
      font-weight: 800;
      line-height: 1.25;
    }
  }

  &__side-icon {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background-color: rgba($color-secondary, 0.12);
    color: $color-secondary;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__side-icon :deep(svg) {
    display: block;
  }

  &__summary-list,
  &__response-list {
    margin-top: $space-lg;
    display: flex;
    flex-direction: column;
    gap: $space-md;
  }

  &__summary-row {
    display: grid;
    grid-template-columns: 105px 1fr;
    align-items: center;
    gap: $space-sm;
  }

  &__summary-label {
    color: $color-secondary-text;
    font-size: 12px;
    font-weight: 700;
  }

  &__summary-text {
    color: $color-secondary-text;
    font-size: 10px;
    font-weight: 800;
    text-align: right;
    white-space: nowrap;
  }

  &__summary-value {
    display: flex;
    justify-content: flex-end;
  }

  &__purple-text {
    color: $color-secondary;
    font-size: 12px;
    font-weight: 800;
    text-align: right;
    white-space: nowrap;
  }

  &__note {
    margin: 26px 0 0;
    text-align: center;
    color: $color-secondary-text;
    font-size: 10px;
    font-weight: 600;
  }

  &__info-card p {
    margin: 24px 0 0;
    color: $color-secondary-text;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.5;
  }

  &__not-found {
    padding: $space-xl;
    text-align: center;

    h2 {
      margin: 0;
      color: $color-main-text;
      font-size: $page-title-size;
    }

    p {
      color: $color-secondary-text;
      font-size: $font-size-sm;
    }
  }
}

@media (max-width: 900px) {
  .ticket-details {
    padding: 0;

    &__navbar,
    &__page-header {
      height: auto;
      flex-direction: column;
      align-items: flex-start;
      gap: $space-md;
      padding: $space-lg;
    }

    &__nav {
      height: auto;
      gap: $space-lg;
      flex-wrap: wrap;
    }

    &__content {
      grid-template-columns: 1fr;
      padding: $space-lg;
    }

    &__side {
      height: auto;
    }

    &__progress {
      grid-template-columns: 1fr;
      gap: $space-md;
    }

    &__line {
      display: none;
    }

    &__reply {
      grid-template-columns: 1fr;
    }

    &__attachment-name {
      margin-left: 0;
    }
  }
}
</style>
