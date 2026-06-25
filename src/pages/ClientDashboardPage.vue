<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import AppIcon from "@/components/ui/AppIcon/AppIcon.vue";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge.vue";
import PriorityBadge from "@/components/ui/PriorityBadge/PriorityBadge.vue";

type TicketStatus = "Open" | "In Progress" | "Resolved" | "Waiting for Client";
type TicketPriority = "High" | "Medium" | "Low";
type ProgressDirection = "next" | "previous";

interface ClientTicket {
  id: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  lastUpdated: string;
}

const router = useRouter();

const tickets: ClientTicket[] = [
  {
    id: "#1025",
    subject: "Login issue",
    category: "Account Access",
    priority: "High",
    status: "In Progress",
    lastUpdated: "Today",
  },
  {
    id: "#1024",
    subject: "Billing issue",
    category: "Billing",
    priority: "Medium",
    status: "Open",
    lastUpdated: "Yesterday",
  },
  {
    id: "#1023",
    subject: "Feature request",
    category: "Feature Request",
    priority: "Low",
    status: "Resolved",
    lastUpdated: "Jun 15",
  },
];

const searchQuery = ref("");
const progressTicketIndex = ref(0);
const progressDirection = ref<ProgressDirection>("next");

const activeTickets = computed(
  () => tickets.filter((ticket) => ticket.status !== "Resolved").length,
);

const inProgressTickets = computed(() =>
  tickets.filter((ticket) => ticket.status === "In Progress"),
);

const resolvedTickets = computed(
  () => tickets.filter((ticket) => ticket.status === "Resolved").length,
);

const progressTickets = computed(() =>
  tickets.filter((ticket) => ticket.status === "In Progress" || ticket.status === "Resolved"),
);

const currentProgressTicket = computed(() => {
  return progressTickets.value[progressTicketIndex.value] ?? null;
});

const progressTransitionName = computed(() => {
  return progressDirection.value === "next" ? "progress-slide-next" : "progress-slide-previous";
});

const filteredTickets = computed(() => {
  const searchValue = searchQuery.value.trim().toLowerCase();

  if (!searchValue) {
    return tickets;
  }

  return tickets.filter((ticket) => {
    return [
      ticket.id,
      ticket.subject,
      ticket.category,
      ticket.priority,
      ticket.status,
      ticket.lastUpdated,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchValue);
  });
});

function handleCreateTicket() {
  router.push({ name: "create-ticket" });
}

function handleViewTicket(ticketId: string) {
  const cleanTicketId = ticketId.replace("#", "");
  router.push({ name: "ticket-details", params: { id: cleanTicketId } });
}

function handleViewAllTickets() {
  searchQuery.value = "";
}

function handlePreviousProgressTicket() {
  if (progressTickets.value.length <= 1) {
    return;
  }

  progressDirection.value = "previous";

  progressTicketIndex.value =
    (progressTicketIndex.value - 1 + progressTickets.value.length) % progressTickets.value.length;
}

function handleNextProgressTicket() {
  if (progressTickets.value.length <= 1) {
    return;
  }

  progressDirection.value = "next";

  progressTicketIndex.value = (progressTicketIndex.value + 1) % progressTickets.value.length;
}

function handleSignOut() {
  router.push({ name: "login" });
}
</script>

<template>
  <main class="client-dashboard">
    <section class="client-dashboard__shell">
      <header class="client-dashboard__navbar">
        <div class="client-dashboard__brand-group">
          <div class="client-dashboard__brand-icon">
            <AppIcon name="tickets" :size="20" />
          </div>

          <h1 class="client-dashboard__brand">Support Ticket System</h1>
        </div>

        <nav class="client-dashboard__nav">
          <button class="client-dashboard__notification" type="button">
            <AppIcon name="notification" :size="22" />
            <span>2</span>
          </button>

          <a href="#" class="client-dashboard__profile">Profile</a>

          <button class="client-dashboard__sign-out" type="button" @click="handleSignOut">
            <AppIcon name="sign-out" :size="18" />
            Sign Out
          </button>
        </nav>
      </header>

      <div class="client-dashboard__accent-line"></div>

      <section class="client-dashboard__content">
        <section class="client-dashboard__hero">
          <div>
            <h2 class="client-dashboard__title">Welcome back, Joe</h2>

            <p class="client-dashboard__subtitle">
              Track your support requests, check progress, and create a new ticket when you need
              help.
            </p>
          </div>

          <button class="client-dashboard__create-button" type="button" @click="handleCreateTicket">
            Create New Ticket
          </button>
        </section>

        <section class="client-dashboard__stats">
          <article class="client-dashboard__stat-card">
            <div class="client-dashboard__stat-icon">
              <AppIcon name="tickets" :size="28" />
            </div>

            <div>
              <p>Active Tickets</p>
              <strong>{{ activeTickets }}</strong>
            </div>
          </article>

          <article class="client-dashboard__stat-card">
            <div class="client-dashboard__stat-icon">
              <AppIcon name="clock" :size="28" />
            </div>

            <div>
              <p>In Progress</p>
              <strong>{{ inProgressTickets.length }}</strong>
            </div>
          </article>

          <article class="client-dashboard__stat-card">
            <div class="client-dashboard__stat-icon client-dashboard__stat-icon--resolved">
              <AppIcon name="check" :size="28" />
            </div>

            <div>
              <p>Resolved</p>
              <strong>{{ resolvedTickets }}</strong>
            </div>
          </article>
        </section>

        <section class="client-dashboard__overview">
          <article class="client-dashboard__progress-card">
            <template v-if="currentProgressTicket">
              <div class="client-dashboard__progress-carousel">
                <Transition :name="progressTransitionName" mode="out-in">
                  <div :key="currentProgressTicket.id" class="client-dashboard__progress-slide">
                    <div class="client-dashboard__progress-header">
                      <div
                        class="client-dashboard__info-icon"
                        :class="{
                          'client-dashboard__info-icon--resolved':
                            currentProgressTicket.status === 'Resolved',
                        }"
                      >
                        <AppIcon
                          :name="currentProgressTicket.status === 'Resolved' ? 'check' : 'clock'"
                          :size="22"
                        />
                      </div>

                      <div class="client-dashboard__progress-title-group">
                        <h3>Latest ticket progress</h3>
                        <p>{{ currentProgressTicket.id }} · {{ currentProgressTicket.subject }}</p>
                      </div>

                      <StatusBadge :status="currentProgressTicket.status" />

                      <div
                        v-if="progressTickets.length > 1"
                        class="client-dashboard__progress-controls"
                      >
                        <button
                          type="button"
                          aria-label="Previous ticket progress"
                          @click="handlePreviousProgressTicket"
                        >
                          ←
                        </button>

                        <span>{{ progressTicketIndex + 1 }} / {{ progressTickets.length }}</span>

                        <button
                          type="button"
                          aria-label="Next ticket progress"
                          @click="handleNextProgressTicket"
                        >
                          →
                        </button>
                      </div>
                    </div>

                    <div class="client-dashboard__progress-track">
                      <div
                        class="client-dashboard__progress-step client-dashboard__progress-step--done"
                      >
                        <span></span>
                        <p>Submitted</p>
                      </div>

                      <div
                        class="client-dashboard__progress-line client-dashboard__progress-line--done"
                      ></div>

                      <div
                        class="client-dashboard__progress-step"
                        :class="{
                          'client-dashboard__progress-step--active':
                            currentProgressTicket.status === 'In Progress',
                          'client-dashboard__progress-step--done':
                            currentProgressTicket.status === 'Resolved',
                        }"
                      >
                        <span></span>
                        <p>In Review</p>
                      </div>

                      <div
                        class="client-dashboard__progress-line"
                        :class="{
                          'client-dashboard__progress-line--done':
                            currentProgressTicket.status === 'Resolved',
                        }"
                      ></div>

                      <div
                        class="client-dashboard__progress-step"
                        :class="{
                          'client-dashboard__progress-step--active client-dashboard__progress-step--resolved':
                            currentProgressTicket.status === 'Resolved',
                        }"
                      >
                        <span></span>
                        <p>Resolved</p>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </template>

            <template v-else>
              <div class="client-dashboard__progress-empty">
                <div class="client-dashboard__info-icon client-dashboard__info-icon--resolved">
                  <AppIcon name="check" :size="22" />
                </div>

                <div>
                  <h3>No recent progress</h3>
                  <p>You currently have no ticket being reviewed or recently resolved.</p>
                </div>
              </div>
            </template>
          </article>

          <article class="client-dashboard__info-card">
            <div class="client-dashboard__info-icon client-dashboard__info-icon--resolved">
              <AppIcon name="check" :size="22" />
            </div>

            <div>
              <h3>No action needed</h3>

              <p>
                Your active tickets are already submitted. You can open full details from the ticket
                table below.
              </p>
            </div>
          </article>
        </section>

        <section class="client-dashboard__tickets-card">
          <div class="client-dashboard__tickets-header">
            <div>
              <h3>Recent Tickets</h3>

              <p>View the latest support requests from your account.</p>
            </div>

            <div class="client-dashboard__search">
              <AppIcon name="search" :size="18" />

              <input v-model="searchQuery" type="text" placeholder="Search tickets..." />
            </div>
          </div>

          <div class="client-dashboard__table-wrapper">
            <table class="client-dashboard__table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="ticket in filteredTickets" :key="ticket.id">
                  <td>{{ ticket.id }}</td>
                  <td>{{ ticket.subject }}</td>
                  <td>{{ ticket.category }}</td>
                  <td>
                    <PriorityBadge :priority="ticket.priority" />
                  </td>
                  <td>
                    <StatusBadge :status="ticket.status" />
                  </td>
                  <td>{{ ticket.lastUpdated }}</td>
                  <td>
                    <button
                      class="client-dashboard__details-button"
                      type="button"
                      @click="handleViewTicket(ticket.id)"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p v-if="filteredTickets.length === 0" class="client-dashboard__empty">
            No tickets match your search.
          </p>

          <button class="client-dashboard__view-all" type="button" @click="handleViewAllTickets">
            View all tickets
            <span>→</span>
          </button>
        </section>
      </section>
    </section>
  </main>
</template>

<style scoped lang="scss">
@use "@/styles/variables" as *;

.client-dashboard {
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
    width: 100%;
    height: $accent-line-height;
    background-color: $color-secondary;
  }

  &__content {
    padding: 40px $page-padding-x 36px;
    box-sizing: border-box;
  }

  &__hero {
    background-color: $color-surface;
    border: $card-border;
    border-radius: $card-radius;
    padding: 26px 30px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-xl;
    position: relative;
    overflow: hidden;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 22px;
      bottom: 22px;
      width: 4px;
      border-radius: 0 999px 999px 0;
      background-color: $color-secondary;
    }
  }

  &__title {
    margin: 0;
    color: $color-main-text;
    font-size: 28px;
    font-weight: 800;
  }

  &__subtitle {
    margin: 18px 0 0;
    max-width: 620px;
    color: $color-secondary-text;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.6;
  }

  &__create-button {
    min-width: $button-min-width;
    height: $button-height;
    padding: 0 $button-padding-x;
    border: 1px solid $color-secondary;
    border-radius: $radius-md;
    background-color: $color-secondary;
    color: $color-primary;
    font-size: $button-font-size;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;

    &:hover {
      background-color: #9415d4;
    }
  }

  &__stats {
    margin-top: 32px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 54px;
  }

  &__stat-card {
    min-height: 120px;
    background-color: $color-surface;
    border: $card-border;
    border-radius: $card-radius;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: $space-lg;
    padding: 0 34px;
    box-sizing: border-box;

    p {
      margin: 0 0 $space-sm;
      color: $color-secondary-text;
      font-size: $font-size-sm;
      font-weight: 500;
    }

    strong {
      color: #000000;
      font-size: 34px;
      font-weight: 800;
      line-height: 1;
    }
  }

  &__stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: rgba($color-secondary, 0.12);
    color: $color-secondary;
    display: grid;
    place-items: center;
    flex-shrink: 0;

    &--resolved {
      background-color: rgba($color-success, 0.14);
      color: $color-success;
    }
  }

  &__overview {
    margin-top: 24px;
    display: grid;
    grid-template-columns: 1.35fr 1fr;
    gap: 24px;
  }

  &__progress-card,
  &__info-card {
    min-height: 118px;
    background-color: $color-surface;
    border: $card-border;
    border-radius: $card-radius;
    padding: 20px 24px;
    box-sizing: border-box;
  }

  &__progress-card {
    overflow: hidden;
  }

  &__progress-carousel {
    width: 100%;
    overflow: hidden;
  }

  &__progress-slide {
    width: 100%;
  }

  &__progress-header {
    display: flex;
    align-items: center;
    gap: $space-md;
  }

  &__progress-title-group {
    flex: 1;

    h3 {
      margin: 0;
      color: $color-main-text;
      font-size: $font-size-sm;
      font-weight: 800;
    }

    p {
      margin: 7px 0 0;
      color: $color-secondary-text;
      font-size: 13px;
      font-weight: 600;
    }
  }

  &__progress-card :deep(.status-badge) {
    height: 22px;
    min-width: 82px;
    font-size: 10px;
  }

  &__progress-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: $space-sm;

    button {
      width: 28px;
      height: 28px;
      border: 1px solid $color-border;
      border-radius: $radius-md;
      background-color: $color-primary;
      color: $color-secondary;
      font-size: 14px;
      font-weight: 800;
      cursor: pointer;
      display: grid;
      place-items: center;

      &:hover {
        border-color: $color-secondary;
        background-color: rgba($color-secondary, 0.06);
      }
    }

    span {
      color: $color-secondary-text;
      font-size: 11px;
      font-weight: 800;
      white-space: nowrap;
    }
  }

  &__progress-track {
    margin-top: 22px;
    display: flex;
    align-items: flex-start;
  }

  &__progress-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 76px;

    span {
      width: 13px;
      height: 13px;
      border-radius: 50%;
      background-color: $color-border;
      border: 3px solid $color-surface;
      box-shadow: 0 0 0 1px $color-border;
      box-sizing: border-box;
    }

    p {
      margin: 8px 0 0;
      color: $color-secondary-text;
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
    }

    &--done,
    &--active {
      span {
        background-color: $color-secondary;
        box-shadow: 0 0 0 1px rgba($color-secondary, 0.35);
      }
    }

    &--active {
      p {
        color: $color-secondary;
        font-weight: 800;
      }
    }

    &--resolved {
      span {
        background-color: $color-success;
        box-shadow: 0 0 0 1px rgba($color-success, 0.35);
      }

      p {
        color: $color-success;
      }
    }
  }

  &__progress-line {
    height: 2px;
    flex: 1;
    margin-top: 6px;
    background-color: $color-border;

    &--done {
      background-color: rgba($color-secondary, 0.55);
    }
  }

  &__progress-empty {
    min-height: 78px;
    display: flex;
    align-items: center;
    gap: $space-md;

    h3 {
      margin: 0;
      color: $color-main-text;
      font-size: $font-size-sm;
      font-weight: 800;
    }

    p {
      margin: 8px 0 0;
      color: $color-secondary-text;
      font-size: 13px;
      font-weight: 600;
      line-height: 1.5;
    }
  }

  &__info-card {
    display: flex;
    align-items: center;
    gap: $space-md;

    h3 {
      margin: 0;
      color: $color-main-text;
      font-size: $font-size-sm;
      font-weight: 800;
    }

    p {
      margin: 8px 0 0;
      color: $color-secondary-text;
      font-size: 13px;
      font-weight: 600;
      line-height: 1.5;
    }
  }

  &__info-icon {
    width: 42px;
    height: 42px;
    border-radius: $radius-md;
    background-color: rgba($color-secondary, 0.1);
    color: $color-secondary;
    display: grid;
    place-items: center;
    flex-shrink: 0;

    &--resolved {
      background-color: rgba($color-success, 0.14);
      color: $color-success;
    }
  }

  &__tickets-card {
    margin-top: 24px;
    background-color: $color-surface;
    border: $card-border;
    border-radius: $card-radius;
    padding: 22px 24px 26px;
    box-sizing: border-box;
  }

  &__tickets-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: $space-lg;
    margin-bottom: 22px;

    h3 {
      margin: 0;
      color: $color-main-text;
      font-size: $font-size-lg;
      font-weight: 800;
    }

    p {
      margin: 8px 0 0;
      color: $color-secondary-text;
      font-size: 13px;
      font-weight: 600;
    }
  }

  &__search {
    width: 330px;
    height: 40px;
    border: 1px solid #cbd5e1;
    border-radius: $radius-md;
    display: flex;
    align-items: center;
    gap: $space-sm;
    padding: 0 $space-md;
    box-sizing: border-box;
    color: $color-secondary-text;
    flex-shrink: 0;
    margin-top: 2px;

    input {
      width: 100%;
      border: none;
      outline: none;
      color: $color-main-text;
      font-size: 13px;
      font-weight: 500;

      &::placeholder {
        color: #9ca3af;
      }
    }

    &:focus-within {
      border-color: $color-secondary;
      box-shadow: 0 0 0 3px rgba($color-secondary, 0.08);
    }
  }

  &__table-wrapper {
    overflow-x: auto;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;

    th {
      text-align: left;
      color: $color-secondary-text;
      font-size: $font-size-sm;
      font-weight: 500;
      padding: 0 10px $space-md;
      border-bottom: 1px solid $color-border;
      white-space: nowrap;
    }

    td {
      color: #000000;
      font-size: 13px;
      font-weight: 500;
      padding: 14px 10px;
      border-bottom: 1px solid $color-border;
      vertical-align: middle;
      white-space: nowrap;
    }
  }

  &__table :deep(.priority-badge),
  &__table :deep(.status-badge) {
    height: 22px;
    font-size: 10px;
    min-width: 62px;
  }

  &__table :deep(.status-badge--waiting-for-client) {
    min-width: 118px;
  }

  &__details-button {
    min-width: 104px;
    height: 32px;
    border: 1px solid $color-secondary;
    border-radius: $radius-md;
    background-color: $color-primary;
    color: $color-secondary;
    font-size: 11px;
    font-weight: 800;
    cursor: pointer;

    &:hover {
      background-color: rgba($color-secondary, 0.06);
    }
  }

  &__empty {
    margin: 24px 0 0;
    text-align: center;
    color: $color-secondary-text;
    font-size: $font-size-sm;
    font-weight: 700;
  }

  &__view-all {
    margin: 24px auto 0;
    border: none;
    background: transparent;
    color: $color-secondary;
    font-size: $font-size-sm;
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: $space-sm;

    span {
      font-size: 18px;
      line-height: 1;
    }
  }
}

.progress-slide-next-enter-active,
.progress-slide-next-leave-active,
.progress-slide-previous-enter-active,
.progress-slide-previous-leave-active {
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
}

.progress-slide-next-enter-from {
  opacity: 0;
  transform: translateX(34px);
}

.progress-slide-next-leave-to {
  opacity: 0;
  transform: translateX(-34px);
}

.progress-slide-previous-enter-from {
  opacity: 0;
  transform: translateX(-34px);
}

.progress-slide-previous-leave-to {
  opacity: 0;
  transform: translateX(34px);
}

@media (max-width: 1000px) {
  .client-dashboard {
    &__navbar {
      height: auto;
      min-height: $navbar-height;
      flex-direction: column;
      align-items: flex-start;
      gap: $space-md;
      padding: $space-lg;
    }

    &__nav {
      height: auto;
      flex-wrap: wrap;
      gap: $space-lg;
    }

    &__content {
      padding: $space-lg;
    }

    &__hero,
    &__tickets-header {
      flex-direction: column;
      align-items: flex-start;
    }

    &__stats,
    &__overview {
      grid-template-columns: 1fr;
      gap: $space-md;
    }

    &__search {
      width: 100%;
      margin-top: 0;
    }

    &__progress-header {
      flex-wrap: wrap;
    }

    &__progress-controls {
      margin-left: 0;
    }

    &__progress-track {
      overflow-x: auto;
      padding-bottom: 4px;
    }

    &__tickets-card {
      padding: $space-lg;
    }
  }
}
</style>
