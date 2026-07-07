<script lang="ts" src="./SupportTicketDetailsPage.ts"></script>


<template>
  <main class="support-ticket-details">
    <section
      class="support-ticket-details__shell"
      :class="{ 'support-ticket-details__shell--collapsed': !isSidebarOpen }"
    >
      <header class="support-ticket-details__sidebar-header">
        <div class="support-ticket-details__brand-group">
          <button
            class="support-ticket-details__headset-icon"
            type="button"
            aria-label="Go to support dashboard"
            @click="goBackToDashboard"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 13V11C4 6.6 7.6 3 12 3C16.4 3 20 6.6 20 11V13"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path
                d="M4 13C4 12.4 4.4 12 5 12H7C7.6 12 8 12.4 8 13V17C8 17.6 7.6 18 7 18H5C4.4 18 4 17.6 4 17V13Z"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M16 13C16 12.4 16.4 12 17 12H19C19.6 12 20 12.4 20 13V17C20 17.6 19.6 18 19 18H17C16.4 18 16 17.6 16 17V13Z"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M20 17V18C20 19.7 18.7 21 17 21H13"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>

          <h1 class="support-ticket-details__brand">Support Ticket System</h1>
        </div>
      </header>

      <header class="support-ticket-details__topbar">
        <nav class="support-ticket-details__nav">
          <div ref="notificationAreaRef" class="support-ticket-details__notification-area">
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
            class="support-ticket-details__profile"
            type="button"
            @click="goToSupportDashboardSection('profile')"
          >
            Profile
          </button>

          <button class="support-ticket-details__sign-out" type="button" @click="handleSignOut">
            <AppIcon name="sign-out" :size="18" />
            Sign Out
          </button>
        </nav>
      </header>

      <AccentLine class="support-ticket-details__accent-line" />

      <button
        class="support-ticket-details__sidebar-toggle"
        type="button"
        :aria-label="isSidebarOpen ? 'Collapse sidebar' : 'Open sidebar'"
        @click="toggleSidebar"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <aside class="support-ticket-details__sidebar">
        <nav class="support-ticket-details__sidebar-nav">
          <button
            class="support-ticket-details__sidebar-link"
            :class="{
              'support-ticket-details__sidebar-link--active':
                sourceDashboardSection === 'dashboard',
            }"
            type="button"
            title="Dashboard"
            @click="goToSupportDashboardSection('dashboard')"
          >
            <span class="support-ticket-details__sidebar-icon">
              <AppIcon name="tickets" :size="22" />
            </span>
            <span class="support-ticket-details__sidebar-text">Dashboard</span>
          </button>

          <button
            class="support-ticket-details__sidebar-link"
            :class="{
              'support-ticket-details__sidebar-link--active': sourceDashboardSection === 'assigned',
            }"
            type="button"
            title="Assigned to Me"
            @click="goToSupportDashboardSection('assigned')"
          >
            <span class="support-ticket-details__sidebar-icon">
              <AppIcon name="user" :size="22" />
            </span>
            <span class="support-ticket-details__sidebar-text">Assigned to Me</span>
          </button>

          <button
            class="support-ticket-details__sidebar-link"
            :class="{
              'support-ticket-details__sidebar-link--active': sourceDashboardSection === 'all',
            }"
            type="button"
            title="All Tickets"
            @click="goToSupportDashboardSection('all')"
          >
            <span class="support-ticket-details__sidebar-icon">
              <svg
                class="support-ticket-details__sidebar-svg"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path d="M7 5H19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                <path
                  d="M7 12H19"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />
                <path
                  d="M7 19H19"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />
                <path
                  d="M4 5H4.01"
                  stroke="currentColor"
                  stroke-width="2.4"
                  stroke-linecap="round"
                />
                <path
                  d="M4 12H4.01"
                  stroke="currentColor"
                  stroke-width="2.4"
                  stroke-linecap="round"
                />
                <path
                  d="M4 19H4.01"
                  stroke="currentColor"
                  stroke-width="2.4"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <span class="support-ticket-details__sidebar-text">All Tickets</span>
          </button>

          <button
            class="support-ticket-details__sidebar-link"
            :class="{
              'support-ticket-details__sidebar-link--active': sourceDashboardSection === 'clients',
            }"
            type="button"
            title="Clients"
            @click="goToSupportDashboardSection('clients')"
          >
            <span class="support-ticket-details__sidebar-icon">
              <svg
                class="support-ticket-details__sidebar-svg"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M9 11C10.933 11 12.5 9.433 12.5 7.5C12.5 5.567 10.933 4 9 4C7.067 4 5.5 5.567 5.5 7.5C5.5 9.433 7.067 11 9 11Z"
                  stroke="currentColor"
                  stroke-width="1.8"
                />
                <path
                  d="M15.2 10.5C16.6 10.5 17.7 9.4 17.7 8C17.7 6.6 16.6 5.5 15.2 5.5"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />
                <path
                  d="M4 20C4.45 16.9 6.35 15.2 9 15.2C11.65 15.2 13.55 16.9 14 20"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />
                <path
                  d="M15.3 15.8C17.55 16.2 19 17.6 19.7 20"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <span class="support-ticket-details__sidebar-text">Clients</span>
          </button>

          <button
            class="support-ticket-details__sidebar-link"
            :class="{
              'support-ticket-details__sidebar-link--active': sourceDashboardSection === 'resolved',
            }"
            type="button"
            title="Resolved Tickets"
            @click="goToSupportDashboardSection('resolved')"
          >
            <span class="support-ticket-details__sidebar-icon">
              <AppIcon name="check" :size="22" />
            </span>
            <span class="support-ticket-details__sidebar-text">Resolved Tickets</span>
          </button>

          <button
            class="support-ticket-details__sidebar-link"
            :class="{
              'support-ticket-details__sidebar-link--active':
                sourceDashboardSection === 'notifications',
            }"
            type="button"
            title="Notification Center"
            @click="goToSupportDashboardSection('notifications')"
          >
            <span class="support-ticket-details__sidebar-icon">
              <AppIcon name="notification" :size="22" />
            </span>
            <span class="support-ticket-details__sidebar-text">Notification Center</span>
          </button>

          <button
            class="support-ticket-details__sidebar-link"
            :class="{
              'support-ticket-details__sidebar-link--active': sourceDashboardSection === 'settings',
            }"
            type="button"
            title="Settings"
            @click="goToSupportDashboardSection('settings')"
          >
            <span class="support-ticket-details__sidebar-icon">
              <AppIcon name="settings" :size="22" />
            </span>
            <span class="support-ticket-details__sidebar-text">Settings</span>
          </button>
        </nav>
      </aside>

      <section v-if="isLoading" class="support-ticket-details__not-found">
        <h2>Loading ticket...</h2>
        <p>Please wait while the ticket details are loaded.</p>
      </section>

      <section v-else-if="errorMessage" class="support-ticket-details__not-found">
        <h2>Ticket could not be loaded</h2>
        <p>{{ errorMessage }}</p>

        <AppButton :label="backButtonLabel" variant="secondary" @click="goBackToDashboard" />
      </section>

      <template v-else-if="ticket">
        <section class="support-ticket-details__scroll-area">
          <section class="support-ticket-details__page-header">
            <div>
              <h2 class="support-ticket-details__page-title">
                Ticket #{{ ticket.id }} - {{ ticket.title }}
              </h2>

              <p class="support-ticket-details__page-subtitle">
                Review, assign, update, and respond to this client support ticket
              </p>
            </div>

            <AppButton :label="backButtonLabel" variant="secondary" @click="goBackToDashboard" />
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

              <section class="support-ticket-details__conversation-section">
                <h4 class="support-ticket-details__section-title">Conversation</h4>

                <div ref="conversationList" class="support-ticket-details__messages-panel">
                  <div
                    v-if="ticket.conversation.length === 0"
                    class="support-ticket-details__conversation-empty"
                  >
                    <div class="support-ticket-details__conversation-empty-icon">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path
                          d="M7 8H17"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                        />
                        <path
                          d="M7 12H14"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                        />
                        <path
                          d="M5 19L7.8 16.9C8.1 16.7 8.4 16.6 8.8 16.6H17C18.7 16.6 20 15.3 20 13.6V7C20 5.3 18.7 4 17 4H7C5.3 4 4 5.3 4 7V13.6C4 15 4.9 16.2 6.2 16.5"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </div>

                    <strong>Start the conversation</strong>
                    <span>Send a reply below to begin helping the client.</span>
                  </div>

                  <TransitionGroup
                    v-else
                    name="message-pop"
                    tag="div"
                    class="support-ticket-details__messages-stack"
                  >
                    <div
                      v-for="message in ticket.conversation"
                      :key="message.id"
                      class="support-ticket-details__message"
                      :class="{
                        'support-ticket-details__message--client': message.side === 'client',
                        'support-ticket-details__message--support': message.side === 'support',
                      }"
                    >
                      <div v-if="message.side === 'client'" class="support-ticket-details__avatar">
                        {{ message.avatar }}
                      </div>

                      <div
                        class="support-ticket-details__message-bubble"
                        :class="{
                          'support-ticket-details__message-bubble--support':
                            message.side === 'support',
                          'support-ticket-details__message-bubble--sending':
                            message.sendStatus === 'sending',
                          'support-ticket-details__message-bubble--failed':
                            message.sendStatus === 'failed',
                        }"
                      >
                        <span>{{ message.senderLabel }}</span>
                        <strong>{{ message.message }}</strong>

                        <div
                          v-if="message.attachments.length > 0"
                          class="support-ticket-details__message-attachments"
                        >
                          <div
                            v-for="attachment in message.attachments"
                            :key="attachment.id"
                            class="support-ticket-details__message-attachment"
                          >
                            <AppIcon name="attachment" :size="12" />
                            <span>{{ attachment.name }}</span>
                          </div>
                        </div>

                        <small v-if="message.sendStatus === 'sending'">Sending...</small>
                        <small v-if="message.sendStatus === 'failed'">Failed to send</small>
                      </div>

                      <div
                        v-if="message.side === 'support'"
                        class="support-ticket-details__avatar support-ticket-details__avatar--support"
                      >
                        {{ message.avatar }}
                      </div>
                    </div>
                  </TransitionGroup>
                </div>

                <input
                  ref="replyFileInput"
                  class="support-ticket-details__file-input"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  multiple
                  @change="handleReplyAttachmentChange"
                />

                <div class="support-ticket-details__reply">
                  <button
                    class="support-ticket-details__attach-button"
                    type="button"
                    @click="openReplyAttachment"
                  >
                    <AppIcon name="attachment" :size="18" />
                  </button>

                  <input
                    v-model="replyMessage"
                    class="support-ticket-details__reply-input"
                    type="text"
                    placeholder="Write a reply"
                    @keydown.enter.prevent="handleSendReply"
                  />

                  <button
                    class="support-ticket-details__reply-button"
                    type="button"
                    @click="handleSendReply"
                  >
                    <AppIcon name="send" :size="15" />
                    {{ isSendingReply ? "Sending..." : "Send Reply" }}
                  </button>
                </div>

                <p v-if="replyAttachmentName" class="support-ticket-details__attachment-name">
                  Attached file: {{ replyAttachmentName }}
                </p>

                <p v-if="replyErrorMessage" class="support-ticket-details__reply-error">
                  {{ replyErrorMessage }}
                </p>
              </section>

              <section class="support-ticket-details__section">
                <h4 class="support-ticket-details__section-title">Internal Note</h4>

                <textarea
                  v-model="internalNote"
                  class="support-ticket-details__textarea support-ticket-details__textarea--small"
                  placeholder="Add an internal note for the support team..."
                ></textarea>

                <p v-if="internalNoteMessage" class="support-ticket-details__local-note-message">
                  {{ internalNoteMessage }}
                </p>

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
              <article
                class="support-ticket-details__side-card support-ticket-details__manage-card"
              >
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
                      <option>{{ getLoggedInSupportName() }}</option>
                      <option>Support Team</option>
                      <option>Sarah Smith</option>
                    </select>
                  </label>

                  <label>
                    <span>Category</span>

                    <select v-model="draftCategory">
                      <option>General</option>
                      <option>Account</option>
                      <option>Account Access</option>
                      <option>Billing</option>
                      <option>Bug Report</option>
                      <option>Feature Request</option>
                      <option>Technical Issue</option>
                    </select>
                  </label>

                  <button
                    class="support-ticket-details__primary-button support-ticket-details__primary-button--full"
                    type="button"
                    :disabled="isSavingChanges"
                    @click="handleSaveChanges"
                  >
                    {{ isSavingChanges ? "Saving..." : "Save Changes" }}
                  </button>

                  <div v-if="saveMessage" class="support-ticket-details__save-message">
                    <AppIcon name="check" :size="16" />
                    <span>{{ saveMessage }}</span>
                  </div>
                </div>
              </article>

              <article
                class="support-ticket-details__side-card support-ticket-details__client-card"
              >
                <div class="support-ticket-details__side-header">
                  <div class="support-ticket-details__side-icon">
                    <AppIcon name="user" :size="25" />
                  </div>

                  <h3>Client Info</h3>
                </div>

                <div class="support-ticket-details__summary-list">
                  <div class="support-ticket-details__summary-row">
                    <span class="support-ticket-details__summary-label">Name</span>
                    <strong class="support-ticket-details__summary-text">{{
                      ticket.client
                    }}</strong>
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

                <button
                  class="support-ticket-details__agent-history-button"
                  type="button"
                  @click="openAgentHistoryModal"
                >
                  <AppIcon name="clock" :size="16" />
                  Track Agent History
                </button>

                <p v-if="resolvedAgentSummary" class="support-ticket-details__resolved-agent">
                  {{ resolvedAgentSummary }}
                </p>
              </article>
            </aside>
          </section>
        </section>
      </template>

      <section v-else class="support-ticket-details__not-found">
        <h2>Ticket not found</h2>
        <p>The ticket you are trying to view does not exist.</p>

        <AppButton :label="backButtonLabel" variant="secondary" @click="goBackToDashboard" />
      </section>
    </section>

    <div
      v-if="isAgentHistoryModalOpen"
      class="support-ticket-details__agent-modal-backdrop"
      @click.self="closeAgentHistoryModal"
    >
      <section class="support-ticket-details__agent-modal">
        <div class="support-ticket-details__agent-modal-header">
          <div>
            <h3>Agent History</h3>
            <p>Track who worked on this ticket and when status changes happened.</p>
          </div>

          <button type="button" aria-label="Close agent history" @click="closeAgentHistoryModal">
            ×
          </button>
        </div>

        <div class="support-ticket-details__agent-history-list">
          <article
            v-for="historyItem in agentHistoryItems"
            :key="historyItem.id"
            class="support-ticket-details__agent-history-item"
            :class="{
              'support-ticket-details__agent-history-item--resolved': historyItem.isResolved,
            }"
          >
            <span class="support-ticket-details__agent-history-dot"></span>

            <div>
              <h4>{{ historyItem.title }}</h4>
              <p>{{ historyItem.description }}</p>

              <small>
                <strong>{{ historyItem.agent }}</strong>
                · {{ historyItem.date }}
              </small>
            </div>
          </article>
        </div>

        <p v-if="!hasRecordedAgentHistory" class="support-ticket-details__agent-history-note">
          Full agent assignment tracking needs backend assignment-history records. This view shows
          the current assigned agent and any status history returned by the ticket API.
        </p>

        <button
          class="support-ticket-details__agent-modal-close"
          type="button"
          @click="closeAgentHistoryModal"
        >
          Close
        </button>
      </section>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use "./SupportTicketDetailsPage.scss";
</style>
