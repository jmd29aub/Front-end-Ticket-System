<script setup lang="ts">
import { computed, ref } from "vue";
import AppButton from "@/components/ui/AppButton/AppButton.vue";
import AppCard from "@/components/ui/AppCard/AppCard.vue";
import AppIcon from "@/components/ui/AppIcon/AppIcon.vue";
import AppInput from "@/components/ui/AppInput/AppInput.vue";
import AppSelect from "@/components/ui/AppSelect/AppSelect.vue";
import AppTextarea from "@/components/ui/AppTextarea/AppTextarea.vue";

const props = withDefaults(
  defineProps<{
    title: string;
    category: string;
    priority: string;
    description: string;
    attachmentName?: string;
  }>(),
  {
    attachmentName: "",
  },
);

const emit = defineEmits<{
  (event: "update:title", value: string): void;
  (event: "update:category", value: string): void;
  (event: "update:priority", value: string): void;
  (event: "update:description", value: string): void;
  (event: "update:attachmentName", value: string): void;
  (event: "fileSelected", value: File): void;
  (event: "submit"): void;
  (event: "cancel"): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);

const categories = ["Account", "Billing", "Bug Report", "Technical Issue"];
const priorities = ["High", "Medium", "Low"];

const ticketTitleModel = computed({
  get: () => props.title,
  set: (value: string) => emit("update:title", value),
});

const categoryModel = computed({
  get: () => props.category,
  set: (value: string) => emit("update:category", value),
});

const priorityModel = computed({
  get: () => props.priority,
  set: (value: string) => emit("update:priority", value),
});

const descriptionModel = computed({
  get: () => props.description,
  set: (value: string) => emit("update:description", value),
});

function openFilePicker() {
  fileInput.value?.click();
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) {
    return;
  }

  emit("update:attachmentName", file.name);
  emit("fileSelected", file);
}

function handleSubmit() {
  emit("submit");
}

function handleCancel() {
  emit("cancel");
}
</script>

<template>
  <AppCard class="ticket-form" padding="xl" min-height="552px">
    <form class="ticket-form__form" @submit.prevent="handleSubmit">
      <div class="ticket-form__header">
        <h3>Ticket Information</h3>

        <p>Provide the details below so support can understand and prioritize your issue.</p>
      </div>

      <div class="ticket-form__body">
        <AppInput
          v-model="ticketTitleModel"
          label="Ticket Title"
          placeholder="Enter a short, descriptive title for your issue"
          required
        />

        <div class="ticket-form__grid">
          <AppSelect
            v-model="categoryModel"
            label="Category"
            :options="categories"
            placeholder="Select category"
            required
          />

          <AppSelect
            v-model="priorityModel"
            label="Priority"
            :options="priorities"
            placeholder="Select priority"
            required
          />
        </div>

        <AppTextarea
          v-model="descriptionModel"
          label="Description"
          placeholder="Describe your issue in detail."
          required
        />

        <input
          ref="fileInput"
          class="ticket-form__file-input"
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          @change="handleFileChange"
        />

        <button class="ticket-form__attachment" type="button" @click="openFilePicker">
          <div class="ticket-form__attachment-icon">
            <AppIcon name="attachment" :size="28" />
          </div>

          <div>
            <strong>
              {{ attachmentName || "Upload screenshot or file" }}
            </strong>

            <span>
              {{ attachmentName ? "File selected" : "JPG, PNG, PDF" }}
            </span>
          </div>
        </button>

        <div class="ticket-form__actions">
          <AppButton label="Cancel" variant="secondary" type="button" @click="handleCancel" />

          <AppButton label="Submit Ticket" type="submit" />
        </div>
      </div>
    </form>
  </AppCard>
</template>

<style scoped lang="scss" src="./TicketForm.scss"></style>
