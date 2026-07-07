<template>
  <div class="password-confirmation-modal__overlay" @click.self="emit('close')">
    <section class="password-confirmation-modal__modal">
      <div class="password-confirmation-modal__header">
        <div class="password-confirmation-modal__title">
          <div class="password-confirmation-modal__icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12 17C13.1046 17 14 16.1046 14 15C14 13.8954 13.1046 13 12 13C10.8954 13 10 13.8954 10 15C10 16.1046 10.8954 17 12 17Z"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M7 11V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V11"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path
                d="M6 11H18C18.5523 11 19 11.4477 19 12V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V12C5 11.4477 5.44772 11 6 11Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <div>
            <h2>Change Password</h2>
            <p>Enter your current password and choose a new one.</p>
          </div>
        </div>

        <button
          class="password-confirmation-modal__close"
          type="button"
          aria-label="Close password modal"
          @click="emit('close')"
        >
          &times;
        </button>
      </div>

      <form class="password-confirmation-modal__form" @submit.prevent="emit('submit')">
        <label class="password-confirmation-modal__field-label">
          <span>Current Password</span>

          <div class="password-confirmation-modal__field">
            <input
              :value="currentPassword"
              :type="currentPasswordInputType"
              placeholder="Enter current password"
              autocomplete="current-password"
              @input="emit('update:currentPassword', getInputValue($event))"
            />

            <button
              class="password-confirmation-modal__toggle"
              type="button"
              :aria-label="currentPasswordToggleLabel"
              :title="currentPasswordToggleLabel"
              @click="emit('toggle-current-password')"
            >
              <svg
                v-if="!isCurrentPasswordVisible"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M2.25 12C3.75 7.5 7.35 5.25 12 5.25C16.65 5.25 20.25 7.5 21.75 12C20.25 16.5 16.65 18.75 12 18.75C7.35 18.75 3.75 16.5 2.25 12Z"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M12 15.25C13.7949 15.25 15.25 13.7949 15.25 12C15.25 10.2051 13.7949 8.75 12 8.75C10.2051 8.75 8.75 10.2051 8.75 12C8.75 13.7949 10.2051 15.25 12 15.25Z"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              <svg
                v-else
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M3 3L21 21"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M10.73 5.35C11.14 5.28 11.56 5.25 12 5.25C16.65 5.25 20.25 7.5 21.75 12C21.28 13.41 20.61 14.6 19.75 15.57"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M6.2 6.72C4.38 7.83 3.06 9.59 2.25 12C3.75 16.5 7.35 18.75 12 18.75C13.38 18.75 14.66 18.55 15.82 18.15"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M9.92 9.92C9.2 10.64 8.94 11.72 9.29 12.73C9.64 13.73 10.5 14.48 11.54 14.69"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M14.08 14.08C14.8 13.36 15.06 12.28 14.71 11.27C14.36 10.27 13.5 9.52 12.46 9.31"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </label>

        <label class="password-confirmation-modal__field-label">
          <span>New Password</span>

          <div class="password-confirmation-modal__field">
            <input
              :value="newPassword"
              :type="newPasswordInputType"
              placeholder="At least 8 characters"
              autocomplete="new-password"
              @input="emit('update:newPassword', getInputValue($event))"
            />

            <button
              class="password-confirmation-modal__toggle"
              type="button"
              :aria-label="newPasswordToggleLabel"
              :title="newPasswordToggleLabel"
              @click="emit('toggle-new-password')"
            >
              <svg
                v-if="!isNewPasswordVisible"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M2.25 12C3.75 7.5 7.35 5.25 12 5.25C16.65 5.25 20.25 7.5 21.75 12C20.25 16.5 16.65 18.75 12 18.75C7.35 18.75 3.75 16.5 2.25 12Z"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M12 15.25C13.7949 15.25 15.25 13.7949 15.25 12C15.25 10.2051 13.7949 8.75 12 8.75C10.2051 8.75 8.75 10.2051 8.75 12C8.75 13.7949 10.2051 15.25 12 15.25Z"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              <svg
                v-else
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M3 3L21 21"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M10.73 5.35C11.14 5.28 11.56 5.25 12 5.25C16.65 5.25 20.25 7.5 21.75 12C21.28 13.41 20.61 14.6 19.75 15.57"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M6.2 6.72C4.38 7.83 3.06 9.59 2.25 12C3.75 16.5 7.35 18.75 12 18.75C13.38 18.75 14.66 18.55 15.82 18.15"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M9.92 9.92C9.2 10.64 8.94 11.72 9.29 12.73C9.64 13.73 10.5 14.48 11.54 14.69"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M14.08 14.08C14.8 13.36 15.06 12.28 14.71 11.27C14.36 10.27 13.5 9.52 12.46 9.31"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </label>

        <label class="password-confirmation-modal__field-label">
          <span>Confirm New Password</span>

          <div class="password-confirmation-modal__field">
            <input
              :value="confirmPassword"
              :type="confirmPasswordInputType"
              placeholder="Confirm new password"
              autocomplete="new-password"
              @input="emit('update:confirmPassword', getInputValue($event))"
            />

            <button
              class="password-confirmation-modal__toggle"
              type="button"
              :aria-label="confirmPasswordToggleLabel"
              :title="confirmPasswordToggleLabel"
              @click="emit('toggle-confirm-password')"
            >
              <svg
                v-if="!isConfirmPasswordVisible"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M2.25 12C3.75 7.5 7.35 5.25 12 5.25C16.65 5.25 20.25 7.5 21.75 12C20.25 16.5 16.65 18.75 12 18.75C7.35 18.75 3.75 16.5 2.25 12Z"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M12 15.25C13.7949 15.25 15.25 13.7949 15.25 12C15.25 10.2051 13.7949 8.75 12 8.75C10.2051 8.75 8.75 10.2051 8.75 12C8.75 13.7949 10.2051 15.25 12 15.25Z"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              <svg
                v-else
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M3 3L21 21"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M10.73 5.35C11.14 5.28 11.56 5.25 12 5.25C16.65 5.25 20.25 7.5 21.75 12C21.28 13.41 20.61 14.6 19.75 15.57"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M6.2 6.72C4.38 7.83 3.06 9.59 2.25 12C3.75 16.5 7.35 18.75 12 18.75C13.38 18.75 14.66 18.55 15.82 18.15"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M9.92 9.92C9.2 10.64 8.94 11.72 9.29 12.73C9.64 13.73 10.5 14.48 11.54 14.69"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M14.08 14.08C14.8 13.36 15.06 12.28 14.71 11.27C14.36 10.27 13.5 9.52 12.46 9.31"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </label>

        <p
          v-if="successMessage"
          class="password-confirmation-modal__message password-confirmation-modal__message--success"
        >
          {{ successMessage }}
        </p>

        <p
          v-if="errorMessage"
          class="password-confirmation-modal__message password-confirmation-modal__message--error"
        >
          {{ errorMessage }}
        </p>

        <div class="password-confirmation-modal__actions">
          <button
            class="password-confirmation-modal__cancel"
            type="button"
            @click="emit('close')"
          >
            Cancel
          </button>

          <button
            class="password-confirmation-modal__save"
            type="submit"
            :disabled="isChangingPassword"
          >
            {{ buttonLabel }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  currentPasswordInputType: string;
  newPasswordInputType: string;
  confirmPasswordInputType: string;
  currentPasswordToggleLabel: string;
  newPasswordToggleLabel: string;
  confirmPasswordToggleLabel: string;
  isCurrentPasswordVisible: boolean;
  isNewPasswordVisible: boolean;
  isConfirmPasswordVisible: boolean;
  successMessage: string;
  errorMessage: string;
  isChangingPassword: boolean;
  buttonLabel: string;
}>();

const emit = defineEmits<{
  close: [];
  submit: [];
  "toggle-current-password": [];
  "toggle-new-password": [];
  "toggle-confirm-password": [];
  "update:currentPassword": [value: string];
  "update:newPassword": [value: string];
  "update:confirmPassword": [value: string];
}>();

function getInputValue(event: Event) {
  return (event.target as HTMLInputElement).value;
}
</script>

<style scoped lang="scss" src="./PasswordConfirmationModal.scss"></style>
