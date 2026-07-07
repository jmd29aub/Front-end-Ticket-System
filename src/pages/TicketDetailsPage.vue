<script lang="ts" src="./TicketDetailsPage.ts"></script>


<template>
  <main class="ticket-details">
    <section
      class="ticket-details__shell"
      :class="{ 'ticket-details__shell--collapsed': !isSidebarOpen }"
    >
      <header class="ticket-details__sidebar-header">
        <div class="ticket-details__brand-group">
          <button class="ticket-details__brand-icon" type="button" @click="goToDashboard">
            <AppIcon name="tickets" :size="20" />
          </button>

          <h1 class="ticket-details__brand">Support Ticket System</h1>
        </div>
      </header>

      <header class="ticket-details__topbar">
        <nav class="ticket-details__nav">
          <div ref="notificationAreaRef" class="ticket-details__notification-area">
            <NotificationDropdown
              :is-open="isNotificationMenuOpen"
              :notifications="notifications"
              :unread-count="unreadNotificationsCount"
              :count-label="notificationCountLabel"
              :is-loading="isLoadingNotifications"
              :error-message="notificationErrorMessage"
              :format-time="formatNotificationTime"
              @toggle="handleToggleNotificationMenu"
              @mark-all-read="handleMarkAllNotificationsRead"
              @notification-click="handleNotificationClick"
            />
          </div>
          <button
            class="ticket-details__profile"
            type="button"
            @click="goToClientDashboardSection('profile')"
          >
            Profile
          </button>

          <button class="ticket-details__sign-out" type="button" @click="handleSignOut">
            <AppIcon name="sign-out" :size="18" />
            Sign Out
          </button>
        </nav>
      </header>

      <AccentLine class="ticket-details__accent-line" />

      <button
        class="ticket-details__sidebar-toggle"
        type="button"
        :aria-label="isSidebarOpen ? 'Collapse sidebar' : 'Open sidebar'"
        @click="toggleSidebar"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <aside class="ticket-details__sidebar">
        <nav class="ticket-details__sidebar-nav">
          <button
            class="ticket-details__sidebar-link"
            type="button"
            title="Dashboard"
            @click="goToDashboard"
          >
            <span class="ticket-details__sidebar-icon">
              <AppIcon name="tickets" :size="22" />
            </span>

            <span class="ticket-details__sidebar-text">Dashboard</span>
          </button>

          <button
            class="ticket-details__sidebar-link"
            type="button"
            title="Create Ticket"
            @click="goToCreateTicket"
          >
            <span class="ticket-details__sidebar-icon">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 5V19"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                />
                <path
                  d="M5 12H19"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                />
              </svg>
            </span>

            <span class="ticket-details__sidebar-text">Create Ticket</span>
          </button>

          <button
            class="ticket-details__sidebar-link"
            type="button"
            title="History"
            @click="goToClientDashboardSection('history')"
          >
            <span class="ticket-details__sidebar-icon">
              <AppIcon name="clock" :size="22" />
            </span>

            <span class="ticket-details__sidebar-text">History</span>
          </button>

          <button
            class="ticket-details__sidebar-link"
            type="button"
            title="Notification Center"
            @click="goToClientDashboardSection('notifications')"
          >
            <span class="ticket-details__sidebar-icon">
              <AppIcon name="notification" :size="22" />
            </span>

            <span class="ticket-details__sidebar-text">Notification Center</span>
          </button>

          <button
            class="ticket-details__sidebar-link"
            type="button"
            title="Settings"
            @click="goToClientDashboardSection('settings')"
          >
            <span class="ticket-details__sidebar-icon">
              <AppIcon name="settings" :size="22" />
            </span>

            <span class="ticket-details__sidebar-text">Settings</span>
          </button>
        </nav>
      </aside>

      <section v-if="isLoading" class="ticket-details__not-found">
        <h2>Loading ticket...</h2>
      </section>

      <template v-else-if="ticket">
        <section class="ticket-details__page-header">
          <div>
            <h2 class="ticket-details__page-title">Ticket #{{ ticket.id }} - {{ ticket.title }}</h2>

            <p class="ticket-details__page-subtitle">
              Track the progress of your support request and communicate with the support team
            </p>
          </div>

          <div class="ticket-details__header-actions">
            <AppButton label="← Back to Dashboard" variant="secondary" @click="goBackToDashboard" />
          </div>
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

              <div ref="conversationList" class="ticket-details__messages-panel">
                <TransitionGroup
                  name="message-pop"
                  tag="div"
                  class="ticket-details__messages-stack"
                >
                  <div
                    v-for="message in ticket.conversation"
                    :key="message.id"
                    class="ticket-details__message"
                    :class="{
                      'ticket-details__message--client': message.side === 'client',
                      'ticket-details__message--support': message.side === 'support',
                    }"
                  >
                    <div v-if="message.side === 'support'" class="ticket-details__avatar">
                      {{ message.avatar }}
                    </div>

                    <div
                      class="ticket-details__message-bubble"
                      :class="{
                        'ticket-details__message-bubble--client': message.side === 'client',
                        'ticket-details__message-bubble--sending': message.sendStatus === 'sending',
                        'ticket-details__message-bubble--failed': message.sendStatus === 'failed',
                      }"
                    >
                      <span>{{ message.senderLabel }}</span>
                      <strong>{{ message.message }}</strong>

                      <small v-if="message.sendStatus === 'sending'">Sending...</small>
                      <small v-if="message.sendStatus === 'failed'">Failed to send</small>
                    </div>

                    <div
                      v-if="message.side === 'client'"
                      class="ticket-details__avatar ticket-details__avatar--client"
                    >
                      {{ message.avatar }}
                    </div>
                  </div>
                </TransitionGroup>
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
                  @keydown.enter.prevent="handleSendReply"
                />

                <button class="ticket-details__reply-button" type="button" @click="handleSendReply">
                  <AppIcon name="send" :size="15" />
                  {{ isSendingReply ? "Sending..." : "Send Reply" }}
                </button>
              </div>

              <p v-if="replyAttachmentName" class="ticket-details__attachment-name">
                Attached file: {{ replyAttachmentName }}
              </p>

              <p v-if="replyErrorMessage" class="ticket-details__reply-error">
                {{ replyErrorMessage }}
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
                  <strong class="ticket-details__summary-text">
                    {{ ticket.expectedResponseTime }}
                  </strong>
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

            <article class="ticket-details__side-card ticket-details__danger-card">
              <div class="ticket-details__side-header">
                <div class="ticket-details__side-icon ticket-details__side-icon--danger">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 6H21"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                    <path
                      d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                    <path
                      d="M19 6L18.2 19.2C18.1385 20.2156 17.2967 21 16.2793 21H7.72074C6.70331 21 5.86147 20.2156 5.8 19.2L5 6"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                    <path
                      d="M10 11V17"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                    <path
                      d="M14 11V17"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                </div>

                <h3>Delete Ticket</h3>
              </div>

              <p>
                Delete this ticket only if it was created by mistake. A confirmation message will
                appear before deleting.
              </p>

              <button class="ticket-details__delete-button" type="button" @click="openDeleteModal">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                  <path
                    d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                  <path
                    d="M19 6L18.2 19.2C18.1385 20.2156 17.2967 21 16.2793 21H7.72074C6.70331 21 5.86147 20.2156 5.8 19.2L5 6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                  <path
                    d="M10 11V17"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                  <path
                    d="M14 11V17"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>

                <span>Delete Ticket</span>
              </button>
            </article>
          </aside>
        </section>
      </template>

      <section v-else class="ticket-details__not-found">
        <h2>Ticket not found</h2>
        <p>{{ errorMessage || "The ticket you are trying to view does not exist." }}</p>

        <AppButton label="Back to Dashboard" variant="secondary" @click="goBackToDashboard" />
      </section>

      <div v-if="isDeleteModalOpen" class="ticket-details__modal-overlay">
        <section class="ticket-details__delete-modal">
          <div class="ticket-details__modal-icon">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <path
                d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path
                d="M19 6L18.2 19.2C18.1385 20.2156 17.2967 21 16.2793 21H7.72074C6.70331 21 5.86147 20.2156 5.8 19.2L5 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path d="M10 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <path d="M14 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>

          <h2>Delete this ticket?</h2>

          <p>
            This action cannot be undone. Please confirm that you really want to delete ticket #{{
              ticket?.id
            }}.
          </p>

          <div v-if="requiresDeleteReason" class="ticket-details__reason-group">
            <label for="deleteReason">Reason required because this ticket is not open</label>

            <textarea
              id="deleteReason"
              v-model="deleteReason"
              placeholder="Write why this ticket needs to be deleted..."
            ></textarea>
          </div>

          <p v-else class="ticket-details__open-delete-note">
            This ticket is still open, so no reason is required.
          </p>

          <p v-if="deleteErrorMessage" class="ticket-details__delete-error">
            {{ deleteErrorMessage }}
          </p>

          <div class="ticket-details__modal-actions">
            <button class="ticket-details__modal-cancel" type="button" @click="closeDeleteModal">
              Cancel
            </button>

            <button
              class="ticket-details__modal-confirm"
              type="button"
              :disabled="isDeletingTicket"
              @click="confirmDeleteTicket"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                <path
                  d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <path
                  d="M19 6L18.2 19.2C18.1385 20.2156 17.2967 21 16.2793 21H7.72074C6.70331 21 5.86147 20.2156 5.8 19.2L5 6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <path d="M10 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                <path d="M14 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>

              <span>{{ isDeletingTicket ? "Deleting..." : "Yes, Delete Ticket" }}</span>
            </button>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss">
@use "./TicketDetailsPage.scss";
</style>
