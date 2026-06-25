<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppButton from "@/components/ui/AppButton/AppButton.vue";
import AppCard from "@/components/ui/AppCard/AppCard.vue";
import AppInput from "@/components/ui/AppInput/AppInput.vue";

type UserRole = "client" | "support";

const router = useRouter();

const email = ref("");
const password = ref("");
const selectedRole = ref<UserRole>("client");

function handleLogin() {
  console.log({
    email: email.value,
    password: password.value,
    role: selectedRole.value,
  });

  if (selectedRole.value === "client") {
    router.push({ name: "client-dashboard" });
  } else {
    router.push({ name: "support-dashboard" });
  }
}

function handleForgotPassword() {
  console.log("Forgot password clicked");
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

          <div class="login-page__role-selector">
            <button
              class="login-page__role-button"
              :class="{ 'login-page__role-button--active': selectedRole === 'client' }"
              type="button"
              @click="selectedRole = 'client'"
            >
              Client
            </button>

            <button
              class="login-page__role-button"
              :class="{ 'login-page__role-button--active': selectedRole === 'support' }"
              type="button"
              @click="selectedRole = 'support'"
            >
              Support
            </button>
          </div>

          <div class="login-page__form">
            <AppInput
              v-model="email"
              label="Email address"
              type="email"
              placeholder="Enter your email"
            />

            <div class="login-page__password-group">
              <AppInput
                v-model="password"
                label="Password"
                type="password"
                placeholder="Password"
              />

              <button class="login-page__forgot" type="button" @click="handleForgotPassword">
                Forgot Password?
              </button>
            </div>

            <AppButton
              :label="selectedRole === 'client' ? 'Login as Client' : 'Login as Support'"
              type="submit"
            />
          </div>
        </form>
      </AppCard>
    </section>
  </main>
</template>

<style scoped lang="scss">
@use "@/styles/variables" as *;

.login-page {
  min-height: 100vh;
  background-color: $color-background;
  padding: 0;
  display: block;
  box-sizing: border-box;

  &__shell {
    width: 100%;
    min-height: 100vh;
    background-color: $color-background;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: $space-lg;
    box-sizing: border-box;
  }

  &__card {
    width: 340px;
  }

  &__form-card {
    width: 100%;
    min-height: 420px;
    padding: 38px 30px 26px;
    box-sizing: border-box;
  }

  &__brand {
    margin: 0;
    text-align: center;
    color: $color-main-text;
    font-size: $font-size-md;
    font-weight: 800;
  }

  &__title {
    margin: 22px 0 0;
    text-align: center;
    color: $color-main-text;
    font-size: 26px;
    font-weight: 800;
  }

  &__subtitle {
    margin: $space-sm 0 0;
    text-align: center;
    color: $color-secondary-text;
    font-size: $font-size-xs;
    font-weight: 600;
  }

  &__role-selector {
    margin-top: $space-lg;
    height: $field-height;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    background-color: $color-background;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    padding: $space-xs;
    gap: $space-xs;
    box-sizing: border-box;
  }

  &__role-button {
    border: none;
    border-radius: $radius-sm;
    background-color: transparent;
    color: $color-secondary-text;
    font-size: $font-size-xs;
    font-weight: 800;
    cursor: pointer;
    transition: 0.2s ease;

    &--active {
      background-color: $color-secondary;
      color: $color-primary;
    }
  }

  &__form {
    margin-top: 22px;
    display: flex;
    flex-direction: column;
    gap: $space-md;
  }

  &__password-group {
    display: flex;
    flex-direction: column;
  }

  &__forgot {
    align-self: flex-end;
    margin-top: 9px;
    border: none;
    background: transparent;
    color: $color-secondary;
    font-size: $font-size-xs;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
  }

  &__form :deep(.app-button) {
    width: 100%;
    min-width: 100%;
    margin-top: $space-sm;
  }
}

@media (max-width: 600px) {
  .login-page {
    &__shell {
      padding: $space-lg;
    }

    &__card {
      width: 100%;
      max-width: 340px;
    }
  }
}
</style>
