<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import AppButton from "@/components/ui/AppButton/AppButton.vue";
import AppCard from "@/components/ui/AppCard/AppCard.vue";
import AppInput from "@/components/ui/AppInput/AppInput.vue";
import { loginUser } from "@/services/authHeaders";

const router = useRouter();

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const isLoggingIn = ref(false);
const isPasswordVisible = ref(false);

const loginButtonLabel = computed(() => {
  return isLoggingIn.value ? "Logging in..." : "Login";
});

const passwordInputType = computed(() => {
  return isPasswordVisible.value ? "text" : "password";
});

function togglePasswordVisibility() {
  isPasswordVisible.value = !isPasswordVisible.value;
}

function normalizeRole(role: unknown) {
  return String(role ?? "")
    .trim()
    .toLowerCase();
}

function validateLoginForm() {
  if (email.value.trim() === "" || password.value.trim() === "") {
    errorMessage.value = "Please enter your email and password.";
    return false;
  }

  errorMessage.value = "";
  return true;
}

async function handleLogin() {
  if (isLoggingIn.value) {
    return;
  }

  if (!validateLoginForm()) {
    return;
  }

  isLoggingIn.value = true;
  errorMessage.value = "";

  try {
    const user = await loginUser(email.value.trim(), password.value);
    const userRole = normalizeRole(user.role);

    if (userRole === "client") {
      await router.replace({ name: "client-dashboard" });
      return;
    }

    if (userRole === "support") {
      await router.replace({ name: "support-dashboard" });
      return;
    }

    throw new Error("This account role is not supported.");
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Something went wrong while logging in.";
  } finally {
    isLoggingIn.value = false;
  }
}

function handleForgotPassword() {
  errorMessage.value = "Password reset is not available in this demo.";
}
</script>

<template>
  <main class="login-page">
    <section class="login-page__shell">
      <AppCard class="login-page__card" padding="none">
        <form class="login-page__form-card" @submit.prevent="handleLogin">
          <h1 class="login-page__brand">Support Ticket System</h1>

          <h2 class="login-page__title">Login</h2>

          <p class="login-page__subtitle">Welcome back, please enter your details</p>

          <div class="login-page__form">
            <AppInput
              v-model="email"
              label="Email address"
              type="email"
              placeholder="Enter your email"
            />

            <div class="login-page__password-group">
              <div class="login-page__password-field">
                <AppInput
                  v-model="password"
                  label="Password"
                  :type="passwordInputType"
                  placeholder="Password"
                />

                <button
                  class="login-page__password-toggle"
                  type="button"
                  :aria-label="isPasswordVisible ? 'Hide password' : 'Show password'"
                  @click="togglePasswordVisibility"
                >
                  <svg v-if="!isPasswordVisible" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M2.5 12C4.2 7.8 7.7 5.5 12 5.5C16.3 5.5 19.8 7.8 21.5 12C19.8 16.2 16.3 18.5 12 18.5C7.7 18.5 4.2 16.2 2.5 12Z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M12 15.2C13.7673 15.2 15.2 13.7673 15.2 12C15.2 10.2327 13.7673 8.8 12 8.8C10.2327 8.8 8.8 10.2327 8.8 12C8.8 13.7673 10.2327 15.2 12 15.2Z"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                  </svg>

                  <svg v-else viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M3 3L21 21"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                    <path
                      d="M10.6 5.7C11.1 5.6 11.5 5.5 12 5.5C16.3 5.5 19.8 7.8 21.5 12C20.9 13.4 20.1 14.6 19.1 15.6"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M16.2 17.4C14.9 18.1 13.5 18.5 12 18.5C7.7 18.5 4.2 16.2 2.5 12C3.3 10.1 4.5 8.6 6 7.5"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M9.9 9.9C9.2 10.5 8.8 11.2 8.8 12C8.8 13.7673 10.2327 15.2 12 15.2C12.8 15.2 13.5 14.8 14.1 14.1"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
              </div>

              <button class="login-page__forgot" type="button" @click="handleForgotPassword">
                Forgot Password?
              </button>
            </div>

            <p
              class="login-page__error-message"
              :class="{ 'login-page__error-message--hidden': !errorMessage }"
            >
              {{ errorMessage || "Error placeholder" }}
            </p>

            <AppButton :label="loginButtonLabel" type="submit" />
          </div>
        </form>
      </AppCard>
    </section>
  </main>
</template>

<style scoped lang="scss">
@use "./LoginPage.scss";
</style>
