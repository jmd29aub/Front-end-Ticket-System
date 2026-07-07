<script lang="ts" src="./ClientDashboardPage.ts"></script>


<template>
  <main class="client-dashboard" :class="{ 'client-dashboard--dark': isDarkModeEnabled }">
    <section
      class="client-dashboard__shell"
      :class="{
        'client-dashboard__shell--collapsed': !isSidebarOpen,
      }"
    >
      <header class="client-dashboard__sidebar-header">
        <div class="client-dashboard__brand-group">
          <button
            class="client-dashboard__brand-icon"
            type="button"
            aria-label="Go to dashboard"
            @click="goBackToDashboard"
          >
            <AppIcon name="tickets" :size="20" />
          </button>

          <h1 class="client-dashboard__brand">Support Ticket System</h1>
        </div>
      </header>

      <header class="client-dashboard__topbar">
        <nav class="client-dashboard__nav">
          <div ref="notificationAreaRef" class="client-dashboard__notification-area">
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
          <button class="client-dashboard__profile" type="button" @click="setSection('profile')">
            Profile
          </button>

          <button class="client-dashboard__sign-out" type="button" @click="handleSignOut">
            <AppIcon name="sign-out" :size="18" />
            Sign Out
          </button>
        </nav>
      </header>

      <AccentLine class="client-dashboard__accent-line" />

      <button
        class="client-dashboard__sidebar-toggle"
        type="button"
        :aria-label="isSidebarOpen ? 'Collapse sidebar' : 'Open sidebar'"
        @click="toggleSidebar"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <aside class="client-dashboard__sidebar">
        <nav class="client-dashboard__sidebar-nav">
          <button
            class="client-dashboard__sidebar-link"
            :class="{ 'client-dashboard__sidebar-link--active': activeSection === 'dashboard' }"
            type="button"
            title="Dashboard"
            @click="setSection('dashboard')"
          >
            <span class="client-dashboard__sidebar-icon">
              <AppIcon name="tickets" :size="22" />
            </span>

            <span class="client-dashboard__sidebar-text">Dashboard</span>
          </button>

          <button
            class="client-dashboard__sidebar-link"
            type="button"
            title="Create Ticket"
            @click="handleCreateTicket"
          >
            <span class="client-dashboard__sidebar-icon">
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

            <span class="client-dashboard__sidebar-text">Create Ticket</span>
          </button>

          <button
            class="client-dashboard__sidebar-link"
            :class="{ 'client-dashboard__sidebar-link--active': activeSection === 'history' }"
            type="button"
            title="History"
            @click="setSection('history')"
          >
            <span class="client-dashboard__sidebar-icon">
              <AppIcon name="clock" :size="22" />
            </span>

            <span class="client-dashboard__sidebar-text">History</span>
          </button>

          <button
            class="client-dashboard__sidebar-link"
            :class="{ 'client-dashboard__sidebar-link--active': activeSection === 'notifications' }"
            type="button"
            title="Notification Center"
            @click="setSection('notifications')"
          >
            <span class="client-dashboard__sidebar-icon">
              <AppIcon name="notification" :size="22" />
            </span>

            <span class="client-dashboard__sidebar-text">Notification Center</span>
          </button>

          <button
            class="client-dashboard__sidebar-link"
            :class="{ 'client-dashboard__sidebar-link--active': activeSection === 'settings' }"
            type="button"
            title="Settings"
            @click="setSection('settings')"
          >
            <span class="client-dashboard__sidebar-icon">
              <AppIcon name="settings" :size="22" />
            </span>

            <span class="client-dashboard__sidebar-text">Settings</span>
          </button>
        </nav>
      </aside>

      <section class="client-dashboard__content">
        <template v-if="activeSection === 'dashboard'">
          <section class="client-dashboard__hero">
            <div>
              <h2 class="client-dashboard__title">Welcome back, {{ loggedInUserName }}</h2>

              <p class="client-dashboard__subtitle">
                Track your support requests, check progress, and create a new ticket when you need
                help.
              </p>
            </div>

            <button
              class="client-dashboard__create-button"
              type="button"
              @click="handleCreateTicket"
            >
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

          <p v-if="errorMessage" class="client-dashboard__error">
            {{ errorMessage }}
          </p>

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
                          <p>
                            {{ currentProgressTicket.id }} · {{ currentProgressTicket.subject }}
                          </p>
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
                  Resolved tickets are moved to History. Active tickets stay in your ticket list.
                </p>
              </div>
            </article>
          </section>

          <section class="client-dashboard__tickets-card">
            <div class="client-dashboard__tickets-header">
              <div>
                <h3>{{ currentTableTitle }}</h3>

                <p>{{ currentTableSubtitle }}</p>
              </div>
            </div>

            <p v-if="isLoading" class="client-dashboard__empty">Loading tickets...</p>

            <div v-else class="client-dashboard__table-wrapper">
              <table class="client-dashboard__table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Subject</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="ticket in currentTableTickets" :key="ticket.id">
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
                      <div class="client-dashboard__table-actions">
                        <button
                          class="client-dashboard__details-button"
                          type="button"
                          @click="handleViewTicket(ticket.id)"
                        >
                          View Details
                        </button>

                        <button
                          v-if="canEditTicket(ticket)"
                          class="client-dashboard__edit-button"
                          type="button"
                          aria-label="Edit ticket"
                          @click="handleOpenEditTicket(ticket)"
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <path
                              d="M4 20H8.5L19.2 9.3C20.1 8.4 20.1 7 19.2 6.1L17.9 4.8C17 3.9 15.6 3.9 14.7 4.8L4 15.5V20Z"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linejoin="round"
                            />
                            <path
                              d="M13.5 6L18 10.5"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p
              v-if="!isLoading && currentTableTickets.length === 0"
              class="client-dashboard__empty"
            >
              No active tickets yet.
            </p>

            <button
              v-if="activeTicketList.length > 5"
              class="client-dashboard__view-all"
              type="button"
              @click="handleViewAllTickets"
            >
              View all tickets
              <span>→</span>
            </button>
          </section>
        </template>

        <template v-else-if="activeSection === 'view-all' || activeSection === 'history'">
          <section class="client-dashboard__full-page-header">
            <div>
              <h2>{{ currentTableTitle }}</h2>
              <p>{{ currentTableSubtitle }}</p>
            </div>

            <AppButton
              :label="fullPageBackButtonLabel"
              variant="secondary"
              @click="goBackFromFullPage"
            />
          </section>

          <section class="client-dashboard__tickets-card client-dashboard__tickets-card--full">
            <div class="client-dashboard__tickets-header">
              <div>
                <h3>{{ currentTableTitle }}</h3>

                <p>
                  {{
                    activeSection === "history"
                      ? "Search and filter your resolved tickets."
                      : "Search and filter all your active tickets."
                  }}
                </p>
              </div>

              <div class="client-dashboard__search">
                <AppIcon name="search" :size="18" />

                <input v-model="searchQuery" type="text" placeholder="Search tickets..." />
              </div>
            </div>

            <section v-if="shouldShowFilters" class="client-dashboard__filters">
              <label v-if="shouldShowStatusFilter">
                <span>Status</span>

                <select v-model="selectedStatus">
                  <option value="">All statuses</option>
                  <option v-for="status in statusOptions" :key="status" :value="status">
                    {{ status }}
                  </option>
                </select>
              </label>

              <label>
                <span>Priority</span>

                <select v-model="selectedPriority">
                  <option value="">All priorities</option>
                  <option v-for="priority in priorityOptions" :key="priority" :value="priority">
                    {{ priority }}
                  </option>
                </select>
              </label>

              <label>
                <span>Category</span>

                <select v-model="selectedCategory">
                  <option value="">All categories</option>
                  <option
                    v-for="category in categoryFilterOptions"
                    :key="category"
                    :value="category"
                  >
                    {{ category }}
                  </option>
                </select>
              </label>

              <button
                class="client-dashboard__clear-filters"
                type="button"
                :disabled="!hasActiveFilters"
                @click="clearFilters"
              >
                Clear Filters
              </button>
            </section>

            <p v-if="isLoading" class="client-dashboard__empty">Loading tickets...</p>

            <div v-else class="client-dashboard__table-wrapper">
              <table class="client-dashboard__table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Subject</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="ticket in currentTableTickets" :key="ticket.id">
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
                      <div class="client-dashboard__table-actions">
                        <button
                          class="client-dashboard__details-button"
                          type="button"
                          @click="handleViewTicket(ticket.id)"
                        >
                          View Details
                        </button>

                        <button
                          v-if="canEditTicket(ticket)"
                          class="client-dashboard__edit-button"
                          type="button"
                          aria-label="Edit ticket"
                          @click="handleOpenEditTicket(ticket)"
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <path
                              d="M4 20H8.5L19.2 9.3C20.1 8.4 20.1 7 19.2 6.1L17.9 4.8C17 3.9 15.6 3.9 14.7 4.8L4 15.5V20Z"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linejoin="round"
                            />
                            <path
                              d="M13.5 6L18 10.5"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p
              v-if="!isLoading && currentTableTickets.length === 0"
              class="client-dashboard__empty"
            >
              No tickets match this view.
            </p>
          </section>
        </template>

        <section
          v-else-if="activeSection === 'notifications'"
          class="client-dashboard__notifications-page"
        >
          <section class="client-dashboard__full-page-header">
            <div>
              <h2>Notification Center</h2>
              <p>View all ticket updates, replies, and support activity.</p>
            </div>

            <AppButton
              :label="fullPageBackButtonLabel"
              variant="secondary"
              @click="goBackFromFullPage"
            />
          </section>

          <section class="client-dashboard__notification-center-card">
            <div class="client-dashboard__notification-center-header">
              <div>
                <h3>All Notifications</h3>
                <p>{{ unreadNotificationsCount }} unread notifications</p>
              </div>

              <button
                class="client-dashboard__mark-read-button"
                type="button"
                :disabled="unreadNotificationsCount === 0"
                @click="handleMarkAllNotificationsRead"
              >
                Mark all read
              </button>
            </div>

            <p v-if="notificationErrorMessage" class="client-dashboard__notification-error">
              {{ notificationErrorMessage }}
            </p>

            <p v-else-if="isLoadingNotifications" class="client-dashboard__empty">
              Loading notifications...
            </p>

            <div
              v-else-if="notifications.length > 0"
              class="client-dashboard__notification-center-list"
            >
              <button
                v-for="notification in notifications"
                :key="notification.id"
                class="client-dashboard__notification-center-item"
                :class="{
                  'client-dashboard__notification-center-item--unread': !notification.read_at,
                }"
                type="button"
                @click="handleNotificationClick(notification)"
              >
                <span class="client-dashboard__notification-center-dot"></span>

                <span class="client-dashboard__notification-center-content">
                  <span class="client-dashboard__notification-label">
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

            <p v-else class="client-dashboard__empty">No notifications yet.</p>
          </section>
        </section>

        <section v-else-if="activeSection === 'profile'" class="client-dashboard__profile-page">
          <section class="client-dashboard__full-page-header">
            <div>
              <h2>Client Profile</h2>
              <p>View your account information and ticket activity.</p>
            </div>

            <AppButton
              :label="fullPageBackButtonLabel"
              variant="secondary"
              @click="goBackFromFullPage"
            />
          </section>

          <section class="client-dashboard__profile-grid">
            <article class="client-dashboard__profile-card client-dashboard__profile-card--main">
              <div class="client-dashboard__profile-avatar">
                {{ loggedInUserName.charAt(0).toUpperCase() }}
              </div>

              <div>
                <h3>{{ loggedInUserName }}</h3>
                <p>{{ loggedInUserEmail || "No email available" }}</p>
                <span>Client Account</span>
              </div>
            </article>

            <article class="client-dashboard__profile-card">
              <span>Total Tickets</span>
              <strong>{{ totalTicketsCreated }}</strong>
            </article>

            <article class="client-dashboard__profile-card">
              <span>Active Tickets</span>
              <strong>{{ activeTickets }}</strong>
            </article>

            <article class="client-dashboard__profile-card">
              <span>Resolved Tickets</span>
              <strong>{{ resolvedTickets }}</strong>
            </article>

            <article class="client-dashboard__profile-card">
              <span>Most Used Category</span>
              <strong>{{ mostUsedCategory }}</strong>
            </article>

            <article class="client-dashboard__profile-card">
              <span>Last Submitted</span>
              <strong>{{ lastSubmittedTicket?.id || "N/A" }}</strong>
            </article>
          </section>
        </section>

        <section v-else class="client-dashboard__settings-page">
          <section class="client-dashboard__full-page-header">
            <div>
              <h2>Settings</h2>
              <p>Customize your dashboard preferences.</p>
            </div>

            <AppButton
              :label="fullPageBackButtonLabel"
              variant="secondary"
              @click="goBackFromFullPage"
            />
          </section>

          <section class="client-dashboard__settings-grid">
            <article class="client-dashboard__settings-card">
              <h3>Appearance</h3>

              <label class="client-dashboard__toggle-row">
                <span>Dark Mode</span>
                <input v-model="isDarkModeEnabled" type="checkbox" />
              </label>
            </article>

            <article class="client-dashboard__settings-card">
              <h3>Notifications</h3>

              <label class="client-dashboard__toggle-row">
                <span>Realtime Notifications</span>
                <input v-model="realtimeNotificationsEnabled" type="checkbox" />
              </label>

              <p class="client-dashboard__settings-note">
                Turning this off disconnects realtime updates until you turn it back on.
              </p>
            </article>

            <article class="client-dashboard__settings-card">
              <h3>Security</h3>

              <p class="client-dashboard__settings-note client-dashboard__settings-note--first">
                Update your account password using your current password.
              </p>

              <button
                class="client-dashboard__settings-button client-dashboard__settings-button--small"
                type="button"
                :disabled="isChangingPassword"
                @click="openPasswordModal"
              >
                Change Password
              </button>
            </article>
          </section>
        </section>
      </section>

      <div
        v-if="isEditModalOpen"
        class="client-dashboard__edit-overlay"
        @click.self="handleCloseEditModal"
      >
        <section class="client-dashboard__edit-modal">
          <div class="client-dashboard__edit-modal-header">
            <div class="client-dashboard__edit-modal-title">
              <div class="client-dashboard__edit-modal-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M4 20H8.5L19.2 9.3C20.1 8.4 20.1 7 19.2 6.1L17.9 4.8C17 3.9 15.6 3.9 14.7 4.8L4 15.5V20Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M13.5 6L18 10.5"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </div>

              <div>
                <h2>Edit Ticket</h2>
                <p>{{ ticketBeingEdited?.id }} · Update ticket information</p>
              </div>
            </div>

            <button
              class="client-dashboard__edit-close"
              type="button"
              aria-label="Close edit modal"
              @click="handleCloseEditModal"
            >
              ×
            </button>
          </div>

          <form class="client-dashboard__edit-form" @submit.prevent="handleSaveEditedTicket">
            <label class="client-dashboard__edit-field">
              <span>Ticket Title</span>
              <input v-model="editTitle" type="text" placeholder="Enter ticket title" />
            </label>

            <div class="client-dashboard__edit-grid">
              <label class="client-dashboard__edit-field">
                <span>Category</span>

                <select v-model="editCategory">
                  <option
                    v-for="category in modalCategoryOptions"
                    :key="category"
                    :value="category"
                  >
                    {{ category }}
                  </option>
                </select>
              </label>

              <label class="client-dashboard__edit-field">
                <span>Priority</span>

                <select v-model="editPriority">
                  <option v-for="priority in priorityOptions" :key="priority" :value="priority">
                    {{ priority }}
                  </option>
                </select>
              </label>
            </div>

            <label class="client-dashboard__edit-field">
              <span>Description</span>

              <textarea
                v-model="editDescription"
                placeholder="Describe the ticket issue..."
              ></textarea>
            </label>

            <p v-if="editErrorMessage" class="client-dashboard__edit-error">
              {{ editErrorMessage }}
            </p>

            <div class="client-dashboard__edit-actions">
              <button
                class="client-dashboard__edit-cancel"
                type="button"
                @click="handleCloseEditModal"
              >
                Cancel
              </button>

              <button
                class="client-dashboard__edit-save"
                type="submit"
                :disabled="isSavingEdit || isEditFormInvalid"
              >
                {{ isSavingEdit ? "Saving..." : "Save Changes" }}
              </button>
            </div>
          </form>
        </section>
      </div>

      <PasswordConfirmationModal
        v-if="isPasswordModalOpen"
        v-model:current-password="currentPassword"
        v-model:new-password="newPassword"
        v-model:confirm-password="confirmPassword"
        :current-password-input-type="currentPasswordInputType"
        :new-password-input-type="newPasswordInputType"
        :confirm-password-input-type="confirmPasswordInputType"
        :current-password-toggle-label="currentPasswordToggleLabel"
        :new-password-toggle-label="newPasswordToggleLabel"
        :confirm-password-toggle-label="confirmPasswordToggleLabel"
        :is-current-password-visible="isCurrentPasswordVisible"
        :is-new-password-visible="isNewPasswordVisible"
        :is-confirm-password-visible="isConfirmPasswordVisible"
        :success-message="passwordSuccessMessage"
        :error-message="passwordErrorMessage"
        :is-changing-password="isChangingPassword"
        :button-label="passwordButtonLabel"
        @close="closePasswordModal"
        @submit="handleChangePassword"
        @toggle-current-password="toggleCurrentPasswordVisibility"
        @toggle-new-password="toggleNewPasswordVisibility"
        @toggle-confirm-password="toggleConfirmPasswordVisibility"
      />
      <Transition name="success-pop">
        <div v-if="editSuccessMessage" class="client-dashboard__success-overlay">
          <section class="client-dashboard__success-message">
            <div class="client-dashboard__success-icon">
              <AppIcon name="check" :size="26" />
            </div>

            <p>{{ editSuccessMessage }}</p>
          </section>
        </div>
      </Transition>
    </section>
  </main>
</template>

<style scoped lang="scss">
@use "./ClientDashboardPage.scss";
</style>
