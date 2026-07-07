<script lang="ts" src="./CreateTicketPage.ts"></script>

<template>
  <main class="create-ticket">
    <section
      class="create-ticket__shell"
      :class="{ 'create-ticket__shell--collapsed': !isSidebarOpen }"
    >
      <header class="create-ticket__sidebar-header">
        <div class="create-ticket__brand-group">
          <button class="create-ticket__brand-icon" type="button" @click="goToDashboard">
            <AppIcon name="tickets" :size="20" />
          </button>

          <h1 class="create-ticket__brand">Support Ticket System</h1>
        </div>
      </header>

      <header class="create-ticket__topbar">
        <nav class="create-ticket__nav">
          <div ref="notificationAreaRef" class="create-ticket__notification-area">
            <button
              class="create-ticket__notification"
              type="button"
              :aria-expanded="isNotificationMenuOpen"
              aria-label="Open notifications"
              @click="handleToggleNotificationMenu"
            >
              <AppIcon name="notification" :size="22" />
              <span v-if="unreadNotificationsCount > 0">{{ notificationCountLabel }}</span>
            </button>

            <section v-if="isNotificationMenuOpen" class="create-ticket__notification-menu">
              <div class="create-ticket__notification-menu-header">
                <div>
                  <h3>Notifications</h3>
                  <p>{{ unreadNotificationsCount }} unread</p>
                </div>

                <button
                  type="button"
                  :disabled="unreadNotificationsCount === 0"
                  @click="handleMarkAllNotificationsRead"
                >
                  Mark all read
                </button>
              </div>

              <p v-if="notificationErrorMessage" class="create-ticket__notification-error">
                {{ notificationErrorMessage }}
              </p>

              <p v-else-if="isLoadingNotifications" class="create-ticket__notification-empty">
                Loading notifications...
              </p>

              <div v-else-if="notifications.length > 0" class="create-ticket__notification-list">
                <button
                  v-for="notification in notifications"
                  :key="notification.id"
                  class="create-ticket__notification-item"
                  :class="{
                    'create-ticket__notification-item--unread': !notification.read_at,
                  }"
                  type="button"
                  @click="handleNotificationClick(notification)"
                >
                  <span class="create-ticket__notification-dot"></span>

                  <span class="create-ticket__notification-content">
                    <span class="create-ticket__notification-label">
                      {{ notification.label }}
                    </span>

                    <strong>{{ notification.title }}</strong>
                    <small>{{ notification.message }}</small>

                    <em>
                      {{
                        notification.ticket_number ||
                        (notification.ticket_id ? `#${notification.ticket_id}` : "Ticket update")
                      }}
                      <template
                        v-if="
                          formatNotificationTime(notification.updated_at || notification.created_at)
                        "
                      >
                        ·
                        {{
                          formatNotificationTime(notification.updated_at || notification.created_at)
                        }}
                      </template>
                    </em>
                  </span>
                </button>
              </div>

              <p v-else class="create-ticket__notification-empty">No notifications yet.</p>
            </section>
          </div>

          <button
            class="create-ticket__nav-link"
            type="button"
            @click="goToClientDashboardSection('profile')"
          >
            Profile
          </button>

          <button class="create-ticket__sign-out" type="button" @click="handleSignOut">
            <AppIcon name="sign-out" :size="18" />
            Sign Out
          </button>
        </nav>
      </header>

      <div class="create-ticket__accent-line"></div>

      <button
        class="create-ticket__sidebar-toggle"
        type="button"
        :aria-label="isSidebarOpen ? 'Collapse sidebar' : 'Open sidebar'"
        @click="toggleSidebar"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <aside class="create-ticket__sidebar">
        <nav class="create-ticket__sidebar-nav">
          <button
            class="create-ticket__sidebar-link"
            type="button"
            title="Dashboard"
            @click="goToDashboard"
          >
            <span class="create-ticket__sidebar-icon">
              <AppIcon name="tickets" :size="22" />
            </span>

            <span class="create-ticket__sidebar-text">Dashboard</span>
          </button>

          <button
            class="create-ticket__sidebar-link create-ticket__sidebar-link--active"
            type="button"
            title="Create Ticket"
            @click="goToCreateTicket"
          >
            <span class="create-ticket__sidebar-icon">
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

            <span class="create-ticket__sidebar-text">Create Ticket</span>
          </button>

          <button
            class="create-ticket__sidebar-link"
            type="button"
            title="History"
            @click="goToClientDashboardSection('history')"
          >
            <span class="create-ticket__sidebar-icon">
              <AppIcon name="clock" :size="22" />
            </span>

            <span class="create-ticket__sidebar-text">History</span>
          </button>

          <button
            class="create-ticket__sidebar-link"
            type="button"
            title="Notification Center"
            @click="goToClientDashboardSection('notifications')"
          >
            <span class="create-ticket__sidebar-icon">
              <AppIcon name="notification" :size="22" />
            </span>

            <span class="create-ticket__sidebar-text">Notification Center</span>
          </button>

          <button
            class="create-ticket__sidebar-link"
            type="button"
            title="Settings"
            @click="goToClientDashboardSection('settings')"
          >
            <span class="create-ticket__sidebar-icon">
              <AppIcon name="settings" :size="22" />
            </span>

            <span class="create-ticket__sidebar-text">Settings</span>
          </button>
        </nav>
      </aside>

      <section class="create-ticket__main-scroll">
        <section class="create-ticket__header">
          <div>
            <h2 class="create-ticket__title">Create New Ticket</h2>

            <p class="create-ticket__subtitle">
              Submit a support request and our team will follow up with you.
            </p>
          </div>

          <AppButton label="← Back to Dashboard" variant="secondary" @click="goBackToDashboard" />
        </section>

        <section class="create-ticket__content">
          <form class="create-ticket__form-card" @submit.prevent="handleSubmitTicket">
            <div class="create-ticket__form-header">
              <h3>Ticket Information</h3>

              <p>Provide the details below so support can understand and prioritize your issue.</p>
            </div>

            <div class="create-ticket__form-body">
              <AppInput
                v-model="ticketTitle"
                label="Ticket Title"
                placeholder="Enter a short, descriptive title for your issue"
                required
              />

              <div class="create-ticket__form-grid">
                <AppSelect
                  v-model="category"
                  label="Category"
                  :options="categories"
                  placeholder="Select category"
                  required
                />

                <AppSelect
                  v-model="priority"
                  label="Priority"
                  :options="priorities"
                  placeholder="Select priority"
                  required
                />
              </div>

              <AppTextarea
                v-model="description"
                label="Description"
                placeholder="Describe your issue in detail."
                required
              />

              <input
                ref="fileInput"
                class="create-ticket__file-input"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                @change="handleFileChange"
              />

              <button class="create-ticket__attachment" type="button" @click="openFilePicker">
                <div class="create-ticket__attachment-icon">
                  <AppIcon name="attachment" :size="28" />
                </div>

                <div>
                  <strong>
                    {{ selectedFileName || "Upload screenshot or file" }}
                  </strong>

                  <span>
                    {{ selectedFileName ? "File selected" : "JPG, PNG, PDF" }}
                  </span>
                </div>
              </button>

              <p
                class="create-ticket__error-message"
                :class="{ 'create-ticket__error-message--hidden': !errorMessage }"
              >
                {{ errorMessage || "Error placeholder" }}
              </p>

              <div class="create-ticket__actions">
                <AppButton label="Cancel" variant="secondary" @click="handleCancel" />

                <AppButton :label="submitButtonLabel" type="submit" />
              </div>
            </div>
          </form>

          <aside class="create-ticket__side">
            <article class="create-ticket__info-card">
              <div class="create-ticket__info-header">
                <div class="create-ticket__info-icon">
                  <AppIcon name="info" :size="27" />
                </div>

                <h3>Before submitting</h3>
              </div>

              <ul class="create-ticket__tips">
                <li>Choose the correct category for the issue.</li>
                <li>Describe the problem clearly.</li>
                <li>Add screenshots if they help explain the issue.</li>
                <li>Select the correct priority level.</li>
              </ul>
            </article>

            <article class="create-ticket__response-card">
              <div class="create-ticket__info-header">
                <div class="create-ticket__info-icon">
                  <AppIcon name="clock" :size="27" />
                </div>

                <h3>Estimated Response Time</h3>
              </div>

              <div class="create-ticket__response-list">
                <div class="create-ticket__response-row">
                  <span class="create-ticket__dot create-ticket__dot--high"></span>
                  <span>High</span>
                  <strong>8 hours</strong>
                </div>

                <div class="create-ticket__response-row">
                  <span class="create-ticket__dot create-ticket__dot--medium"></span>
                  <span>Medium</span>
                  <strong>24 hours</strong>
                </div>

                <div class="create-ticket__response-row">
                  <span class="create-ticket__dot create-ticket__dot--low"></span>
                  <span>Low</span>
                  <strong>48 hours</strong>
                </div>
              </div>

              <p class="create-ticket__response-note">
                Response times may vary depending on the issue
              </p>
            </article>
          </aside>
        </section>
      </section>
    </section>
  </main>
</template>

<style scoped lang="scss">
@use "./CreateTicketPage.scss";
</style>
