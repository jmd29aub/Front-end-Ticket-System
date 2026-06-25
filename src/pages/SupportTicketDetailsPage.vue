<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppButton from "@/components/ui/AppButton/AppButton.vue";
import AppIcon from "@/components/ui/AppIcon/AppIcon.vue";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge.vue";
import PriorityBadge from "@/components/ui/PriorityBadge/PriorityBadge.vue";
import {
  useSupportTickets,
  type SupportPriority,
  type SupportStatus,
} from "@/composables/useSupportTickets";

const route = useRoute();
const router = useRouter();

const { getSupportTicketById, updateSupportTicket } = useSupportTickets();

const ticketId = computed(() => String(route.params.id || "1025"));

const ticket = computed(() => {
  return getSupportTicketById(ticketId.value);
});

const draftStatus = ref<SupportStatus>("Open");
const draftPriority = ref<SupportPriority>("High");
const draftAgent = ref("John Doe");
const draftCategory = ref("Account Access");

const replyMessage = ref("");
const internalNote = ref("");
const saveMessage = ref("");

watch(
  ticket,
  (currentTicket) => {
    if (!currentTicket) {
      return;
    }

    draftStatus.value = currentTicket.status;
    draftPriority.value = currentTicket.priority;
    draftAgent.value = currentTicket.assignedTo;
    draftCategory.value = currentTicket.category;
  },
  { immediate: true },
);

function goBackToDashboard() {
  router.push({ name: "support-dashboard" });
}

function handleAllTickets() {
  router.push({ name: "support-dashboard" });
}

function handleSignOut() {
  router.push({ name: "login" });
}

function handleSaveChanges() {
  if (!ticket.value) {
    return;
  }

  updateSupportTicket(ticket.value.id, {
    status: draftStatus.value,
    priority: draftPriority.value,
    assignedTo: draftAgent.value,
    category: draftCategory.value,
  });

  saveMessage.value = "Changes saved successfully.";

  window.setTimeout(() => {
    saveMessage.value = "";
  }, 1800);
}

function handleSendReply() {
  console.log({
    ticketId: ticket.value?.id,
    reply: replyMessage.value,
  });

  replyMessage.value = "";
}

function handleSaveInternalNote() {
  console.log({
    ticketId: ticket.value?.id,
    internalNote: internalNote.value,
  });

  internalNote.value = "";
}
</script>

<template>
  <main class="support-ticket-details">
    <section class="support-ticket-details__shell">
      <header class="support-ticket-details__navbar">
        <div class="support-ticket-details__brand-group">
          <div class="support-ticket-details__brand-icon">
            <AppIcon name="tickets" :size="20" />
          </div>

          <h1 class="support-ticket-details__brand">Support Ticket System</h1>
        </div>

        <nav class="support-ticket-details__nav">
          <button class="support-ticket-details__nav-link" type="button" @click="handleAllTickets">
            All Tickets
          </button>

          <button class="support-ticket-details__notification" type="button">
            <AppIcon name="notification" :size="22" />
            <span>3</span>
          </button>

          <button class="support-ticket-details__profile" type="button">Profile</button>

          <button class="support-ticket-details__sign-out" type="button" @click="handleSignOut">
            <AppIcon name="sign-out" :size="18" />
            Sign Out
          </button>
        </nav>
      </header>

      <div class="support-ticket-details__accent-line"></div>

      <template v-if="ticket">
        <section class="support-ticket-details__page-header">
          <div>
            <h2 class="support-ticket-details__page-title">
              Ticket #{{ ticket.id }} - {{ ticket.title }}
            </h2>

            <p class="support-ticket-details__page-subtitle">
              Review, assign, update, and respond to this client support ticket
            </p>
          </div>

          <AppButton label="← Back to Dashboard" variant="secondary" @click="goBackToDashboard" />
        </section>

        <section class="support-ticket-details__content">
          <article class="support-ticket-details__main-card">
            <div class="support-ticket-details__main-header">
              <div>
                <h3 class="support-ticket-details__ticket-title">{{ ticket.title }}</h3>

                <div class="support-ticket-details__meta">
                  <span>Ticket ID: #{{ ticket.id }}</span>
                  <span class="support-ticket-details__meta-dot"></span>
                  <span>Created: {{ ticket.createdAt }}</span>
                </div>
              </div>

              <div class="support-ticket-details__badges">
                <StatusBadge :status="ticket.status" />
                <PriorityBadge :priority="ticket.priority" />
              </div>
            </div>

            <div class="support-ticket-details__divider"></div>

            <section class="support-ticket-details__section">
              <h4 class="support-ticket-details__section-title">Ticket Title</h4>

              <div class="support-ticket-details__title-box">
                {{ ticket.title }}
              </div>
            </section>

            <section class="support-ticket-details__section">
              <h4 class="support-ticket-details__section-title">Description</h4>

              <div class="support-ticket-details__description-box">
                {{ ticket.description }}
              </div>
            </section>

            <section class="support-ticket-details__section">
              <h4 class="support-ticket-details__section-title">Conversation</h4>

              <div class="support-ticket-details__conversation">
                <div class="support-ticket-details__message">
                  <div class="support-ticket-details__avatar">JD</div>

                  <div class="support-ticket-details__message-bubble">
                    <span>{{ ticket.client }}</span>
                    <strong>
                      Hello, I cannot log in to my account after resetting my password. It still
                      says the password is incorrect.
                    </strong>
                  </div>
                </div>

                <div
                  class="support-ticket-details__message support-ticket-details__message--support"
                >
                  <div class="support-ticket-details__message-bubble">
                    <span>John Doe</span>
                    <strong>
                      Thank you for reporting this. I am checking the account access logs and
                      password reset activity now.
                    </strong>
                  </div>

                  <div
                    class="support-ticket-details__avatar support-ticket-details__avatar--support"
                  >
                    JD
                  </div>
                </div>
              </div>
            </section>

            <section class="support-ticket-details__section">
              <h4 class="support-ticket-details__section-title">Reply to Client</h4>

              <textarea
                v-model="replyMessage"
                class="support-ticket-details__textarea"
                placeholder="Write a response to the client..."
              ></textarea>

              <button
                class="support-ticket-details__primary-button"
                type="button"
                @click="handleSendReply"
              >
                Send Reply
              </button>
            </section>

            <section class="support-ticket-details__section">
              <h4 class="support-ticket-details__section-title">Internal Note</h4>

              <textarea
                v-model="internalNote"
                class="support-ticket-details__textarea support-ticket-details__textarea--small"
                placeholder="Add an internal note for the support team..."
              ></textarea>

              <button
                class="support-ticket-details__secondary-button"
                type="button"
                @click="handleSaveInternalNote"
              >
                Save Internal Note
              </button>
            </section>
          </article>

          <aside class="support-ticket-details__side">
            <article class="support-ticket-details__side-card support-ticket-details__manage-card">
              <div class="support-ticket-details__side-header">
                <div class="support-ticket-details__side-icon">
                  <AppIcon name="settings" :size="25" />
                </div>

                <h3>Manage Ticket</h3>
              </div>

              <div class="support-ticket-details__form">
                <label>
                  <span>Status</span>

                  <select v-model="draftStatus">
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Waiting for Client</option>
                    <option>Resolved</option>
                  </select>
                </label>

                <label>
                  <span>Priority</span>

                  <select v-model="draftPriority">
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </label>

                <label>
                  <span>Assigned Agent</span>

                  <select v-model="draftAgent">
                    <option>John Doe</option>
                    <option>Support Team</option>
                    <option>Sarah Smith</option>
                  </select>
                </label>

                <label>
                  <span>Category</span>

                  <select v-model="draftCategory">
                    <option>Account Access</option>
                    <option>Billing</option>
                    <option>Feature Request</option>
                    <option>Technical Issue</option>
                  </select>
                </label>

                <button
                  class="support-ticket-details__primary-button support-ticket-details__primary-button--full"
                  type="button"
                  @click="handleSaveChanges"
                >
                  Save Changes
                </button>

                <div v-if="saveMessage" class="support-ticket-details__save-message">
                  <AppIcon name="check" :size="16" />
                  <span>{{ saveMessage }}</span>
                </div>
              </div>
            </article>

            <article class="support-ticket-details__side-card support-ticket-details__client-card">
              <div class="support-ticket-details__side-header">
                <div class="support-ticket-details__side-icon">
                  <AppIcon name="user" :size="25" />
                </div>

                <h3>Client Info</h3>
              </div>

              <div class="support-ticket-details__summary-list">
                <div class="support-ticket-details__summary-row">
                  <span class="support-ticket-details__summary-label">Name</span>
                  <strong class="support-ticket-details__summary-text">{{ ticket.client }}</strong>
                </div>

                <div class="support-ticket-details__summary-row">
                  <span class="support-ticket-details__summary-label">Email</span>
                  <strong class="support-ticket-details__summary-text">
                    {{ ticket.clientEmail }}
                  </strong>
                </div>

                <div class="support-ticket-details__summary-row">
                  <span class="support-ticket-details__summary-label">Category</span>
                  <strong class="support-ticket-details__summary-text">
                    {{ ticket.category }}
                  </strong>
                </div>
              </div>
            </article>

            <article
              class="support-ticket-details__side-card support-ticket-details__timeline-card"
            >
              <div class="support-ticket-details__side-header">
                <div class="support-ticket-details__side-icon">
                  <AppIcon name="clock" :size="25" />
                </div>

                <h3>Timeline</h3>
              </div>

              <div class="support-ticket-details__timeline">
                <div>
                  <span></span>
                  <p>
                    <strong>Created</strong>
                    {{ ticket.createdAt }}
                  </p>
                </div>

                <div>
                  <span></span>
                  <p>
                    <strong>Last Updated</strong>
                    {{ ticket.lastUpdated }}
                  </p>
                </div>

                <div>
                  <span></span>
                  <p>
                    <strong>Assigned To</strong>
                    {{ ticket.assignedTo }}
                  </p>
                </div>
              </div>
            </article>
          </aside>
        </section>
      </template>

      <section v-else class="support-ticket-details__not-found">
        <h2>Ticket not found</h2>
        <p>The ticket you are trying to view does not exist.</p>

        <AppButton label="Back to Dashboard" variant="secondary" @click="goBackToDashboard" />
      </section>
    </section>
  </main>
</template>

<style scoped lang="scss">
@use "@/styles/variables" as *;

.support-ticket-details {
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

  &__nav-link,
  &__profile {
    border: none;
    background: transparent;
    color: $color-secondary-text;
    text-decoration: none;
    font-size: $font-size-sm;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
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

  &__section {
    margin-top: 30px;
  }

  &__section-title {
    margin: 0 0 $space-md;
    color: $color-main-text;
    font-size: 17px;
    font-weight: 800;
  }

  &__title-box,
  &__description-box {
    background-color: $color-background;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    color: $color-main-text;
    font-size: 12px;
    font-weight: 500;
    padding: 10px $space-md;
  }

  &__description-box {
    min-height: 34px;
    line-height: 1.6;
  }

  &__conversation {
    display: flex;
    flex-direction: column;
    gap: $space-md;
  }

  &__message {
    display: flex;
    align-items: center;
    gap: $space-sm;

    &--support {
      justify-content: flex-end;

      .support-ticket-details__message-bubble {
        background-color: rgba($color-secondary, 0.08);
      }
    }
  }

  &__avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: rgba($color-secondary, 0.12);
    color: $color-main-text;
    display: grid;
    place-items: center;
    font-size: 18px;
    font-weight: 700;
    flex-shrink: 0;

    &--support {
      background-color: rgba($color-secondary, 0.2);
      color: $color-secondary;
    }
  }

  &__message-bubble {
    max-width: 72%;
    min-height: 52px;
    background-color: $color-background;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    padding: 9px $space-md;
    box-sizing: border-box;

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
      line-height: 1.45;
    }
  }

  &__textarea {
    width: 100%;
    min-height: 82px;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    padding: $space-md;
    resize: none;
    outline: none;
    font-family: inherit;
    font-size: 12px;
    color: $color-main-text;
    background-color: $color-primary;
    box-sizing: border-box;

    &:focus {
      border-color: $color-secondary;
    }

    &--small {
      min-height: 64px;
    }
  }

  &__primary-button {
    min-width: 145px;
    height: $button-height;
    border: none;
    border-radius: $radius-md;
    background-color: $color-secondary;
    color: $color-primary;
    font-size: $button-font-size;
    font-weight: 800;
    cursor: pointer;
    margin-top: $space-sm;

    &--full {
      width: 100%;
    }
  }

  &__secondary-button {
    min-width: 170px;
    height: $button-height;
    border-radius: $radius-md;
    border: 1px solid $color-secondary;
    background-color: $color-primary;
    color: $color-secondary;
    font-size: $button-font-size;
    font-weight: 800;
    cursor: pointer;
    white-space: nowrap;
    margin-top: $space-sm;
  }

  &__save-message {
    min-height: 38px;
    margin: $space-md 0 0;
    padding: 0 $space-md;
    border: 1px solid rgba($color-success, 0.35);
    border-radius: $radius-md;
    background-color: rgba($color-success, 0.12);
    color: $color-success;
    font-size: 12px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $space-sm;
  }

  &__side {
    display: flex;
    flex-direction: column;
    gap: $space-md;
    align-self: stretch;
    min-height: 100%;
  }

  &__side-card {
    background-color: $color-surface;
    border: $card-border;
    border-radius: $card-radius;
    padding: 24px;
    box-sizing: border-box;
  }

  &__manage-card {
    min-height: 306px;
    flex: 0 0 auto;
  }

  &__client-card {
    min-height: 164px;
    flex: 0 0 auto;
  }

  &__timeline-card {
    flex: 1;
    min-height: 220px;
    display: flex;
    flex-direction: column;
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
    }
  }

  &__side-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: rgba($color-secondary, 0.12);
    color: $color-secondary;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  &__form {
    margin-top: $space-lg;
    display: flex;
    flex-direction: column;
    gap: $space-sm;

    label {
      display: flex;
      flex-direction: column;
      gap: $space-xs;
    }

    span {
      color: $color-main-text;
      font-size: 12px;
      font-weight: 700;
    }

    select {
      height: 38px;
      border: 1px solid $color-border;
      border-radius: $radius-md;
      padding: 0 $space-md;
      background-color: $color-primary;
      outline: none;
      font-size: 12px;
      color: $color-main-text;

      &:focus {
        border-color: $color-secondary;
      }
    }
  }

  &__summary-list {
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

  &__timeline {
    margin-top: $space-lg;
    display: flex;
    flex-direction: column;
    gap: $space-md;
    flex: 1;

    div {
      display: flex;
      gap: $space-sm;
    }

    span {
      width: 9px;
      height: 9px;
      background-color: $color-secondary;
      border-radius: 50%;
      margin-top: 4px;
      flex-shrink: 0;
    }

    p {
      margin: 0;
      color: $color-secondary-text;
      font-size: 11px;
      font-weight: 600;
      line-height: 1.4;
    }

    strong {
      display: block;
      color: $color-main-text;
      font-size: 12px;
      font-weight: 800;
    }
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
  .support-ticket-details {
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
      min-height: 0;
    }

    &__timeline-card {
      flex: none;
      min-height: 164px;
    }
  }
}
</style>
