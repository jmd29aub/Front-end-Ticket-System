<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppButton from "@/components/ui/AppButton/AppButton.vue";
import AppIcon from "@/components/ui/AppIcon/AppIcon.vue";
import AppInput from "@/components/ui/AppInput/AppInput.vue";
import AppSelect from "@/components/ui/AppSelect/AppSelect.vue";
import AppTextarea from "@/components/ui/AppTextarea/AppTextarea.vue";

const router = useRouter();

const ticketTitle = ref("");
const category = ref("");
const priority = ref("");
const description = ref("");
const selectedFileName = ref("");
const fileInput = ref<HTMLInputElement | null>(null);

const categories = ["Account", "Billing", "Bug Report", "Technical Issue"];
const priorities = ["High", "Medium", "Low"];

function goBackToDashboard() {
  router.push({ name: "client-dashboard" });
}

function openFilePicker() {
  fileInput.value?.click();
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    selectedFileName.value = file.name;
  }
}

function handleSubmitTicket() {
  console.log({
    title: ticketTitle.value,
    category: category.value,
    priority: priority.value,
    description: description.value,
    attachment: selectedFileName.value,
  });

  router.push({ name: "client-dashboard" });
}

function handleCancel() {
  router.push({ name: "client-dashboard" });
}

function handleSignOut() {
  router.push({ name: "login" });
}
</script>

<template>
  <main class="create-ticket">
    <section class="create-ticket__shell">
      <header class="create-ticket__navbar">
        <div class="create-ticket__brand-group">
          <div class="create-ticket__brand-icon">
            <AppIcon name="tickets" :size="20" />
          </div>

          <h1 class="create-ticket__brand">Support Ticket System</h1>
        </div>

        <nav class="create-ticket__nav">
          <button class="create-ticket__notification" type="button">
            <AppIcon name="notification" :size="22" />
            <span>2</span>
          </button>

          <a href="#" class="create-ticket__profile">Profile</a>

          <button class="create-ticket__sign-out" type="button" @click="handleSignOut">
            <AppIcon name="sign-out" :size="18" />
            Sign Out
          </button>
        </nav>
      </header>

      <div class="create-ticket__accent-line"></div>

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
              label="Ticket Title"
              v-model="ticketTitle"
              placeholder="Enter a short, descriptive title for your issue"
              required
            />

            <div class="create-ticket__form-grid">
              <AppSelect
                label="Category"
                v-model="category"
                :options="categories"
                placeholder="Select category"
                required
              />

              <AppSelect
                label="Priority"
                v-model="priority"
                :options="priorities"
                placeholder="Select priority"
                required
              />
            </div>

            <AppTextarea
              label="Description"
              v-model="description"
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

            <div class="create-ticket__actions">
              <AppButton label="Cancel" variant="secondary" @click="handleCancel" />

              <AppButton label="Submit Ticket" type="submit" />
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
              <li>Add a clear title so support can identify the problem quickly.</li>
              <li>Include screenshots if they help explain the issue.</li>
              <li>Select the right priority based on urgency.</li>
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
  </main>
</template>

<style scoped lang="scss">
@use "@/styles/variables" as *;

.create-ticket {
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
    height: $accent-line-height;
    background-color: $color-secondary;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $page-header-padding-top $page-padding-x $page-header-padding-bottom;
  }

  &__title {
    margin: 0;
    color: $color-main-text;
    font-size: $page-title-size;
    font-weight: 800;
  }

  &__subtitle {
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
  }

  &__form-card,
  &__info-card,
  &__response-card {
    background-color: $color-surface;
    border: $card-border;
    border-radius: $card-radius;
  }

  &__form-card {
    min-height: 552px;
    padding: 30px 34px 24px;
  }

  &__form-header {
    h3 {
      margin: 0;
      color: $color-main-text;
      font-size: 20px;
      font-weight: 800;
    }

    p {
      margin: $space-md 0 34px;
      color: $color-secondary-text;
      font-size: 12px;
      font-weight: 600;
    }
  }

  &__form-body {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $space-lg;
  }

  &__file-input {
    display: none;
  }

  &__attachment {
    width: 100%;
    height: 50px;
    border: 1px dashed #cbd5e1;
    border-radius: $radius-md;
    background-color: #f8fafc;
    display: flex;
    align-items: center;
    gap: $space-md;
    padding: 0 $space-md;
    text-align: left;
    cursor: pointer;
    transition: 0.2s ease;

    &:hover {
      border-color: $color-secondary;
      background-color: rgba($color-secondary, 0.04);
    }

    strong {
      display: block;
      color: $color-main-text;
      font-size: 11px;
      font-weight: 800;
      max-width: 430px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    span {
      display: block;
      margin-top: 2px;
      color: $color-secondary-text;
      font-size: 10px;
      font-weight: 600;
    }
  }

  &__attachment-icon {
    color: $color-secondary;
    display: grid;
    place-items: center;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: $space-lg;
    margin-top: 2px;
  }

  &__actions :deep(.app-button) {
    min-width: $button-small-min-width;
  }

  &__side {
    display: flex;
    flex-direction: column;
    gap: $space-md;
  }

  &__info-card {
    min-height: 252px;
    padding: 24px;
  }

  &__response-card {
    min-height: 284px;
    padding: 24px;
  }

  &__info-header {
    display: flex;
    align-items: center;
    gap: $space-sm;

    h3 {
      margin: 0;
      color: $color-main-text;
      font-size: 17px;
      font-weight: 800;
    }
  }

  &__info-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: rgba($color-secondary, 0.12);
    color: $color-secondary;
    display: grid;
    place-items: center;
  }

  &__tips {
    margin: 32px 0 0;
    padding-left: 18px;
    display: flex;
    flex-direction: column;
    gap: 18px;

    li {
      color: $color-secondary-text;
      font-size: 12px;
      font-weight: 600;

      &::marker {
        color: $color-secondary;
        font-size: 14px;
      }
    }
  }

  &__response-list {
    margin-top: 34px;
    display: flex;
    flex-direction: column;
    gap: 26px;
  }

  &__response-row {
    display: grid;
    grid-template-columns: 14px 1fr auto;
    align-items: center;
    gap: $space-sm;
    color: $color-secondary-text;
    font-size: 12px;
    font-weight: 600;

    strong {
      color: $color-secondary-text;
      font-size: 12px;
      font-weight: 800;
    }
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &--high {
      background-color: $color-danger;
    }

    &--medium {
      background-color: $color-warning;
    }

    &--low {
      background-color: $color-success;
    }
  }

  &__response-note {
    margin: 44px 0 0;
    text-align: center;
    color: $color-secondary-text;
    font-size: 10px;
    font-weight: 600;
  }
}

@media (max-width: 900px) {
  .create-ticket {
    padding: 0;

    &__navbar,
    &__header {
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

    &__form-grid {
      grid-template-columns: 1fr;
    }

    &__actions {
      flex-direction: column;
    }
  }
}
</style>
