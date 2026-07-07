<script lang="ts" src="./SupportDashboardPage.ts"></script>


<template>
  <main class="support-dashboard">
    <section
      class="support-dashboard__shell"
      :class="{ 'support-dashboard__shell--collapsed': !isSidebarOpen }"
    >
      <header class="support-dashboard__sidebar-header">
        <div class="support-dashboard__brand-group">
          <button class="support-dashboard__headset-icon" type="button" @click="goToDashboard">
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

          <h1 class="support-dashboard__brand">Support Ticket System</h1>
        </div>
      </header>

      <header class="support-dashboard__topbar">
        <div class="support-dashboard__top-actions">
          <div ref="notificationAreaRef" class="support-dashboard__notification-area">
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

          <button class="support-dashboard__profile" type="button" @click="setSection('profile')">
            Profile
          </button>

          <button class="support-dashboard__sign-out" type="button" @click="handleSignOut">
            <AppIcon name="sign-out" :size="18" />
            Sign Out
          </button>
        </div>
      </header>

      <AccentLine class="support-dashboard__accent-line" />

      <button
        class="support-dashboard__sidebar-toggle"
        type="button"
        :aria-label="isSidebarOpen ? 'Collapse sidebar' : 'Open sidebar'"
        @click="toggleSidebar"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <aside class="support-dashboard__sidebar">
        <nav class="support-dashboard__sidebar-nav">
          <button
            class="support-dashboard__sidebar-link"
            :class="{ 'support-dashboard__sidebar-link--active': activeSection === 'dashboard' }"
            type="button"
            title="Dashboard"
            @click="setSection('dashboard')"
          >
            <span class="support-dashboard__sidebar-icon">
              <AppIcon name="tickets" :size="22" />
            </span>
            <span class="support-dashboard__sidebar-text">Dashboard</span>
          </button>

          <button
            class="support-dashboard__sidebar-link"
            :class="{ 'support-dashboard__sidebar-link--active': activeSection === 'assigned' }"
            type="button"
            title="Assigned to Me"
            @click="setSection('assigned')"
          >
            <span class="support-dashboard__sidebar-icon">
              <AppIcon name="user" :size="22" />
            </span>
            <span class="support-dashboard__sidebar-text">Assigned to Me</span>
          </button>

          <button
            class="support-dashboard__sidebar-link"
            :class="{ 'support-dashboard__sidebar-link--active': activeSection === 'all' }"
            type="button"
            title="All Tickets"
            @click="setSection('all')"
          >
            <span class="support-dashboard__sidebar-icon">
              <svg
                class="support-dashboard__sidebar-svg"
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
            <span class="support-dashboard__sidebar-text">All Tickets</span>
          </button>

          <button
            class="support-dashboard__sidebar-link"
            :class="{ 'support-dashboard__sidebar-link--active': activeSection === 'clients' }"
            type="button"
            title="Clients"
            @click="setSection('clients')"
          >
            <span class="support-dashboard__sidebar-icon">
              <svg
                class="support-dashboard__sidebar-svg"
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
            <span class="support-dashboard__sidebar-text">Clients</span>
          </button>

          <button
            class="support-dashboard__sidebar-link"
            :class="{ 'support-dashboard__sidebar-link--active': activeSection === 'resolved' }"
            type="button"
            title="Resolved Tickets"
            @click="setSection('resolved')"
          >
            <span class="support-dashboard__sidebar-icon">
              <AppIcon name="check" :size="22" />
            </span>
            <span class="support-dashboard__sidebar-text">Resolved Tickets</span>
          </button>

          <button
            class="support-dashboard__sidebar-link"
            :class="{
              'support-dashboard__sidebar-link--active': activeSection === 'notifications',
            }"
            type="button"
            title="Notification Center"
            @click="setSection('notifications')"
          >
            <span class="support-dashboard__sidebar-icon">
              <AppIcon name="notification" :size="22" />
            </span>
            <span class="support-dashboard__sidebar-text">Notification Center</span>
          </button>

          <button
            class="support-dashboard__sidebar-link"
            :class="{ 'support-dashboard__sidebar-link--active': activeSection === 'settings' }"
            type="button"
            title="Settings"
            @click="setSection('settings')"
          >
            <span class="support-dashboard__sidebar-icon">
              <AppIcon name="settings" :size="22" />
            </span>
            <span class="support-dashboard__sidebar-text">Settings</span>
          </button>
        </nav>
      </aside>

      <section class="support-dashboard__content">
        <template v-if="activeSection === 'dashboard'">
          <section class="support-dashboard__header">
            <div>
              <h2 class="support-dashboard__title">Support Dashboard</h2>
              <p class="support-dashboard__subtitle">
                Manage, prioritize, and resolve client support tickets.
              </p>
            </div>

            <button
              class="support-dashboard__export-button"
              type="button"
              @click="handleExportReport"
            >
              <AppIcon name="export" :size="17" />
              Export Report
            </button>
          </section>

          <section class="support-dashboard__stats">
            <article class="support-dashboard__stat-card">
              <div class="support-dashboard__stat-icon">
                <AppIcon name="tickets" :size="29" />
              </div>

              <div>
                <p>Open Tickets</p>
                <strong>{{ openTicketsCount }}</strong>
              </div>
            </article>

            <article class="support-dashboard__stat-card">
              <div class="support-dashboard__stat-icon support-dashboard__stat-icon--urgent">
                <AppIcon name="alert" :size="29" />
              </div>

              <div>
                <p>Urgent Tickets</p>
                <strong>{{ urgentTicketsCount }}</strong>
              </div>
            </article>

            <article class="support-dashboard__stat-card">
              <div class="support-dashboard__stat-icon">
                <AppIcon name="user" :size="29" />
              </div>

              <div>
                <p>Assigned to Me</p>
                <strong>{{ assignedToMeCount }}</strong>
              </div>
            </article>
          </section>

          <p v-if="errorMessage" class="support-dashboard__error">
            {{ errorMessage }}
          </p>

          <TicketFilters
            v-model:search="searchQuery"
            v-model:status="selectedStatus"
            v-model:priority="selectedPriority"
            v-model:category="selectedCategory"
            v-model:agent="selectedAgent"
          />

          <section class="support-dashboard__table-card">
            <div class="support-dashboard__table-header">
              <div>
                <h3>Ticket Queue</h3>
                <p>Search, filter, and open support tickets.</p>
              </div>
            </div>

            <p v-if="isLoading" class="support-dashboard__empty">Loading tickets...</p>

            <SupportTicketTable
              v-else
              :tickets="dashboardTableTickets"
              @view-ticket="handleViewTicket"
            />

            <p
              v-if="!isLoading && dashboardTableTickets.length === 0"
              class="support-dashboard__empty"
            >
              No tickets match your filters.
            </p>

            <button
              v-if="shouldShowDashboardViewAllButton"
              class="support-dashboard__view-all"
              type="button"
              @click="handleViewAllTickets"
            >
              View all tickets
              <span>→</span>
            </button>
          </section>
        </template>

        <template
          v-else-if="
            activeSection === 'assigned' || activeSection === 'all' || activeSection === 'resolved'
          "
        >
          <section class="support-dashboard__full-page-header">
            <div>
              <h2>{{ currentSectionTitle }}</h2>
              <p>{{ currentSectionSubtitle }}</p>
            </div>

            <div class="support-dashboard__full-page-actions">
              <button
                v-if="shouldShowFullSectionExport"
                class="support-dashboard__export-button support-dashboard__export-button--section"
                type="button"
                @click="handleExportReport"
              >
                <AppIcon name="export" :size="17" />
                Export Report
              </button>

              <button
                class="support-dashboard__back-button"
                type="button"
                @click="goBackToDashboard"
              >
                {{ backButtonLabel }}
              </button>
            </div>
          </section>

          <TicketFilters
            v-model:search="searchQuery"
            v-model:status="selectedStatus"
            v-model:priority="selectedPriority"
            v-model:category="selectedCategory"
            v-model:agent="selectedAgent"
          />

          <section class="support-dashboard__table-card support-dashboard__table-card--full">
            <div class="support-dashboard__table-header">
              <div>
                <h3>{{ currentSectionTitle }}</h3>
                <p>{{ filteredSupportTickets.length }} tickets in this view.</p>
              </div>
            </div>

            <p v-if="isLoading" class="support-dashboard__empty">Loading tickets...</p>

            <SupportTicketTable
              v-else
              :tickets="filteredSupportTickets"
              @view-ticket="handleViewTicket"
            />

            <p
              v-if="!isLoading && filteredSupportTickets.length === 0"
              class="support-dashboard__empty"
            >
              No tickets match this view.
            </p>
          </section>
        </template>

        <section v-else-if="activeSection === 'clients'" class="support-dashboard__clients-page">
          <section class="support-dashboard__full-page-header">
            <div>
              <h2>Clients</h2>
              <p>
                Review client profiles, filter client activity, and open each client’s ticket
                history.
              </p>
            </div>

            <button class="support-dashboard__back-button" type="button" @click="goBackToDashboard">
              {{ backButtonLabel }}
            </button>
          </section>

          <section class="support-dashboard__clients-overview-grid">
            <article class="support-dashboard__client-stat-card">
              <span>Total Clients</span>
              <strong>{{ totalClientsCount }}</strong>
              <small>Clients with at least one ticket</small>
            </article>

            <article class="support-dashboard__client-stat-card">
              <span>Active Clients</span>
              <strong>{{ activeClientsCount }}</strong>
              <small>Clients with unresolved tickets</small>
            </article>

            <article class="support-dashboard__client-stat-card">
              <span>Open Tickets</span>
              <strong>{{ openTicketsCount }}</strong>
              <small>Open across all clients</small>
            </article>

            <article class="support-dashboard__client-stat-card">
              <span>Resolved Tickets</span>
              <strong>{{ resolvedTicketsList.length }}</strong>
              <small>Completed client issues</small>
            </article>
          </section>

          <section class="support-dashboard__clients-filter-card">
            <div class="support-dashboard__clients-filter-heading">
              <div>
                <h3>Client Directory</h3>
                <p>
                  Search clients, filter account activity, then open a profile for ticket history.
                </p>
              </div>

              <button
                class="support-dashboard__client-clear-search"
                type="button"
                :disabled="!hasActiveClientFilters"
                @click="clearClientFilters"
              >
                Clear Filters
              </button>
            </div>

            <div class="support-dashboard__clients-filter-grid">
              <label
                class="support-dashboard__client-filter-field support-dashboard__client-filter-field--search"
              >
                <span>Search</span>

                <div class="support-dashboard__client-search">
                  <AppIcon name="search" :size="18" />

                  <input
                    :value="clientSearchQuery"
                    type="text"
                    placeholder="Search by name, email, ticket ID, or subject..."
                    @input="handleClientSearchInput"
                  />
                </div>
              </label>

              <label class="support-dashboard__client-filter-field">
                <span>Client Status</span>

                <select :value="selectedClientFilter" @change="handleClientFilterChange">
                  <option value="all">All clients</option>
                  <option value="active">Active clients</option>
                  <option value="urgent">Urgent clients</option>
                  <option value="open">Has open tickets</option>
                  <option value="resolved">Resolved only</option>
                </select>
              </label>

              <label class="support-dashboard__client-filter-field">
                <span>Sort By</span>

                <select :value="selectedClientSort" @change="handleClientSortChange">
                  <option value="recent">Recent activity</option>
                  <option value="tickets">Most tickets</option>
                  <option value="active">Most active tickets</option>
                  <option value="urgent">Most urgent tickets</option>
                  <option value="name">Client name</option>
                </select>
              </label>
            </div>
          </section>

          <section class="support-dashboard__clients-directory-card">
            <div class="support-dashboard__clients-directory-header">
              <div>
                <h3>Clients</h3>
                <p>{{ filteredClientProfiles.length }} clients shown</p>
              </div>

              <span>{{ totalClientsCount }} total</span>
            </div>

            <p v-if="isLoading" class="support-dashboard__empty">Loading clients...</p>

            <div
              v-else-if="filteredClientProfiles.length > 0"
              class="support-dashboard__clients-table"
            >
              <div class="support-dashboard__clients-table-head">
                <span>Client</span>
                <span>Ticket Summary</span>
                <span>Open / Urgent</span>
                <span>Last Activity</span>
                <span>Action</span>
              </div>

              <div
                v-for="client in filteredClientProfiles"
                :key="client.id"
                class="support-dashboard__clients-table-row"
                :class="{
                  'support-dashboard__clients-table-row--active':
                    selectedClientProfile?.id === client.id,
                }"
              >
                <div class="support-dashboard__clients-table-client">
                  <span class="support-dashboard__client-avatar">{{ client.initials }}</span>

                  <div>
                    <strong>{{ client.name }}</strong>
                    <small>{{ client.email }}</small>
                  </div>
                </div>

                <div class="support-dashboard__clients-table-summary">
                  <strong>{{ client.totalTickets }} tickets</strong>
                  <small>
                    {{ client.activeTickets }} active · {{ client.resolvedTickets }} resolved
                  </small>
                </div>

                <div class="support-dashboard__clients-table-badges">
                  <span
                    class="support-dashboard__client-badge support-dashboard__client-badge--urgent"
                  >
                    {{ client.urgentTickets }} urgent
                  </span>

                  <span
                    class="support-dashboard__client-badge support-dashboard__client-badge--open"
                  >
                    {{ client.openTickets }} open
                  </span>
                </div>

                <div class="support-dashboard__clients-table-activity">
                  <strong>{{ client.lastActivityLabel }}</strong>
                  <small>Latest ticket update</small>
                </div>

                <button
                  class="support-dashboard__client-view-profile"
                  type="button"
                  @click="selectClient(client.id)"
                >
                  View Profile
                </button>
              </div>
            </div>

            <p v-else class="support-dashboard__empty">No clients match your current filters.</p>
          </section>

          <section v-if="selectedClientProfile" class="support-dashboard__client-profile-panel">
            <div class="support-dashboard__client-profile-header">
              <div class="support-dashboard__client-profile-identity">
                <span class="support-dashboard__client-profile-avatar">
                  {{ selectedClientProfile.initials }}
                </span>

                <div>
                  <h3>{{ selectedClientProfile.name }}</h3>
                  <p>{{ selectedClientProfile.email }}</p>
                  <small>Last activity: {{ selectedClientProfile.lastActivityLabel }}</small>
                </div>
              </div>

              <button
                class="support-dashboard__client-close-profile"
                type="button"
                @click="clearSelectedClient"
              >
                Close Profile
              </button>
            </div>

            <section class="support-dashboard__client-profile-stats">
              <article>
                <span>Total Tickets</span>
                <strong>{{ selectedClientProfile.totalTickets }}</strong>
              </article>

              <article>
                <span>Active</span>
                <strong>{{ selectedClientProfile.activeTickets }}</strong>
              </article>

              <article>
                <span>In Progress</span>
                <strong>{{ selectedClientProfile.inProgressTickets }}</strong>
              </article>

              <article>
                <span>Resolved</span>
                <strong>{{ selectedClientProfile.resolvedTickets }}</strong>
              </article>
            </section>

            <section class="support-dashboard__client-profile-details">
              <div>
                <span>Email</span>
                <strong>{{ selectedClientProfile.email }}</strong>
              </div>

              <div>
                <span>Open Tickets</span>
                <strong>{{ selectedClientProfile.openTickets }}</strong>
              </div>

              <div>
                <span>Waiting for Client</span>
                <strong>{{ selectedClientProfile.waitingTickets }}</strong>
              </div>

              <div>
                <span>Urgent Active</span>
                <strong>{{ selectedClientProfile.urgentTickets }}</strong>
              </div>
            </section>

            <section class="support-dashboard__client-ticket-history">
              <div class="support-dashboard__client-ticket-history-header">
                <div>
                  <h3>Client Tickets</h3>
                  <p>
                    Showing {{ selectedClientTickets.length }} of
                    {{ selectedClientProfile.totalTickets }} tickets created by this client.
                  </p>
                </div>

                <button
                  class="support-dashboard__client-ticket-clear-button"
                  type="button"
                  :disabled="!hasActiveSelectedClientTicketFilters"
                  @click="clearSelectedClientTicketFilters"
                >
                  Clear Filters
                </button>
              </div>

              <TicketFilters
                class="support-dashboard__client-ticket-filter-bar"
                v-model:search="selectedClientTicketSearch"
                v-model:status="selectedClientTicketStatus"
                v-model:priority="selectedClientTicketPriority"
                v-model:category="selectedClientTicketCategory"
                v-model:agent="selectedClientTicketAgent"
              />

              <div class="support-dashboard__client-ticket-table-wrap">
                <SupportTicketTable
                  v-if="selectedClientTickets.length > 0"
                  :tickets="selectedClientTickets"
                  @view-ticket="handleViewTicket"
                />

                <p v-else class="support-dashboard__empty">
                  No tickets match the selected client ticket filters.
                </p>
              </div>
            </section>
          </section>

          <section v-else class="support-dashboard__client-empty-state">
            <div class="support-dashboard__client-empty-icon">
              <AppIcon name="user" :size="30" />
            </div>

            <h3>Select a client profile</h3>
            <p>
              Choose View Profile from the client directory to open a spacious profile view with
              ticket totals, account details, and a full ticket history table.
            </p>
          </section>
        </section>

        <section
          v-else-if="activeSection === 'notifications'"
          class="support-dashboard__notifications-page"
        >
          <section class="support-dashboard__full-page-header">
            <div>
              <h2>Notification Center</h2>
              <p>View all ticket updates, replies, and support activity.</p>
            </div>

            <AppButton :label="backButtonLabel" variant="secondary" @click="goBackToDashboard" />
          </section>

          <section class="support-dashboard__notification-center-card">
            <div class="support-dashboard__notification-center-header">
              <div>
                <h3>All Notifications</h3>
                <p>{{ unreadNotificationsCount }} unread notifications</p>
              </div>

              <button
                class="support-dashboard__mark-read-button"
                type="button"
                :disabled="unreadNotificationsCount === 0"
                @click="handleMarkAllNotificationsRead"
              >
                Mark all read
              </button>
            </div>

            <p v-if="notificationErrorMessage" class="support-dashboard__notification-error">
              {{ notificationErrorMessage }}
            </p>

            <p v-else-if="isLoadingNotifications" class="support-dashboard__empty">
              Loading notifications...
            </p>

            <div
              v-else-if="notifications.length > 0"
              class="support-dashboard__notification-center-list"
            >
              <button
                v-for="notification in notifications"
                :key="notification.id"
                class="support-dashboard__notification-center-item"
                :class="{
                  'support-dashboard__notification-center-item--unread': !notification.read_at,
                }"
                type="button"
                @click="handleNotificationClick(notification)"
              >
                <span class="support-dashboard__notification-center-dot"></span>

                <span class="support-dashboard__notification-center-content">
                  <span class="support-dashboard__notification-label">
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

            <p v-else class="support-dashboard__empty">No notifications yet.</p>
          </section>
        </section>

        <section v-else-if="activeSection === 'profile'" class="support-dashboard__page-section">
          <section class="support-dashboard__full-page-header">
            <div>
              <h2>Support Profile</h2>
              <p>View your support account and ticket activity.</p>
            </div>

            <button class="support-dashboard__back-button" type="button" @click="goBackToDashboard">
              {{ backButtonLabel }}
            </button>
          </section>

          <section class="support-dashboard__profile-grid">
            <article class="support-dashboard__profile-card support-dashboard__profile-card--main">
              <div class="support-dashboard__profile-avatar">
                {{ supportAgentName.charAt(0).toUpperCase() }}
              </div>

              <div>
                <h3>{{ supportAgentName }}</h3>
                <p>Support Agent</p>
                <span>Support Account</span>
              </div>
            </article>

            <article class="support-dashboard__profile-card">
              <span>Total Tickets</span>
              <strong>{{ supportTickets.length }}</strong>
            </article>

            <article class="support-dashboard__profile-card">
              <span>Assigned to Me</span>
              <strong>{{ assignedToMeCount }}</strong>
            </article>

            <article class="support-dashboard__profile-card">
              <span>Urgent Active</span>
              <strong>{{ urgentTicketsCount }}</strong>
            </article>

            <article class="support-dashboard__profile-card">
              <span>Resolved Tickets</span>
              <strong>{{ resolvedTicketsList.length }}</strong>
            </article>
          </section>
        </section>

        <section v-else class="support-dashboard__settings-page">
          <section class="support-dashboard__full-page-header">
            <div>
              <h2>Settings</h2>
              <p>Customize your dashboard preferences.</p>
            </div>

            <AppButton :label="backButtonLabel" variant="secondary" @click="goBackToDashboard" />
          </section>

          <section class="support-dashboard__settings-grid">
            <article class="support-dashboard__settings-card">
              <h3>Appearance</h3>

              <label class="support-dashboard__toggle-row">
                <span>Dark Mode</span>
                <input v-model="isDarkModeEnabled" type="checkbox" />
              </label>
            </article>

            <article class="support-dashboard__settings-card">
              <h3>Notifications</h3>

              <label class="support-dashboard__toggle-row">
                <span>Realtime Notifications</span>
                <input
                  v-model="realtimeNotificationsEnabled"
                  type="checkbox"
                  @change="handleRealtimeNotificationsChange"
                />
              </label>

              <p class="support-dashboard__settings-note">
                Turning this off disconnects realtime updates until you turn it back on.
              </p>
            </article>

            <article class="support-dashboard__settings-card">
              <h3>Security</h3>

              <p class="support-dashboard__settings-note support-dashboard__settings-note--first">
                Update your account password using your current password.
              </p>

              <button
                class="support-dashboard__settings-button support-dashboard__settings-button--small"
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
    </section>

    <div
      v-if="showExportModal"
      class="support-dashboard__export-modal-backdrop"
      @click.self="handleCancelExport"
    >
      <section class="support-dashboard__export-modal">
        <div class="support-dashboard__export-modal-icon">
          <AppIcon name="export" :size="26" />
        </div>

        <h3>Export support report?</h3>

        <p>
          {{ exportFilterMessage }}
        </p>

        <div class="support-dashboard__export-format-group">
          <button
            class="support-dashboard__export-format"
            :class="{ 'support-dashboard__export-format--active': selectedExportFormat === 'pdf' }"
            type="button"
            :disabled="isExportingReport"
            @click="selectedExportFormat = 'pdf'"
          >
            <strong>PDF</strong>
            <span>Clean A4 report</span>
          </button>

          <button
            class="support-dashboard__export-format"
            :class="{
              'support-dashboard__export-format--active': selectedExportFormat === 'excel',
            }"
            type="button"
            :disabled="isExportingReport"
            @click="selectedExportFormat = 'excel'"
          >
            <strong>Excel</strong>
            <span>Designed spreadsheet</span>
          </button>
        </div>

        <div class="support-dashboard__export-modal-summary">
          <span>Tickets to export</span>
          <strong>{{ exportTicketCount }}</strong>
        </div>

        <p v-if="exportError" class="support-dashboard__export-error">
          {{ exportError }}
        </p>

        <div class="support-dashboard__export-modal-actions">
          <button
            class="support-dashboard__export-cancel"
            type="button"
            :disabled="isExportingReport"
            @click="handleCancelExport"
          >
            Cancel
          </button>

          <button
            class="support-dashboard__export-confirm"
            type="button"
            :disabled="isExportingReport || exportTicketCount === 0"
            @click="handleConfirmExport"
          >
            {{ exportButtonText }}
          </button>
        </div>
      </section>
    </div>

    <PasswordConfirmationModal
      v-if="isPasswordModalOpen"
      v-model:current-password="currentPassword"
      v-model:new-password="newPassword"
      v-model:confirm-password="confirmNewPassword"
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
  </main>
</template>
<style scoped lang="scss">
@use "./SupportDashboardPage.scss";
</style>
