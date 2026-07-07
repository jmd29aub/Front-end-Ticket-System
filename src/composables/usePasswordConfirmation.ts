import { computed, ref } from "vue";
import { apiJsonFetch } from "@/services/authHeaders";

interface PasswordChangeResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

interface PasswordConfirmationOptions {
  guardOpenWhileChanging?: boolean;
  useTrimmedEmptyValidation?: boolean;
  minLengthMessage?: string;
  confirmationMismatchMessage?: string;
  useResponseSuccessMessage?: boolean;
  successMessage?: string;
}

export function usePasswordConfirmation(options: PasswordConfirmationOptions = {}) {
  const {
    guardOpenWhileChanging = true,
    useTrimmedEmptyValidation = true,
    minLengthMessage = "New password must be at least 8 characters.",
    confirmationMismatchMessage = "New password and confirmation do not match.",
    useResponseSuccessMessage = true,
    successMessage = "Password changed successfully.",
  } = options;

  const isPasswordModalOpen = ref(false);
  const currentPassword = ref("");
  const newPassword = ref("");
  const confirmPassword = ref("");
  const passwordErrorMessage = ref("");
  const passwordSuccessMessage = ref("");
  const isChangingPassword = ref(false);
  const showCurrentPassword = ref(false);
  const showNewPassword = ref(false);
  const showConfirmPassword = ref(false);

  const passwordButtonLabel = computed(() => {
    return isChangingPassword.value ? "Saving..." : "Save Password";
  });

  const currentPasswordInputType = computed(() => {
    return showCurrentPassword.value ? "text" : "password";
  });

  const newPasswordInputType = computed(() => {
    return showNewPassword.value ? "text" : "password";
  });

  const confirmPasswordInputType = computed(() => {
    return showConfirmPassword.value ? "text" : "password";
  });

  const currentPasswordToggleLabel = computed(() => {
    return showCurrentPassword.value ? "Hide current password" : "Show current password";
  });

  const newPasswordToggleLabel = computed(() => {
    return showNewPassword.value ? "Hide new password" : "Show new password";
  });

  const confirmPasswordToggleLabel = computed(() => {
    return showConfirmPassword.value ? "Hide confirm new password" : "Show confirm new password";
  });

  function resetPasswordForm() {
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
    passwordSuccessMessage.value = "";
    passwordErrorMessage.value = "";
    showCurrentPassword.value = false;
    showNewPassword.value = false;
    showConfirmPassword.value = false;
  }

  function toggleCurrentPasswordVisibility() {
    showCurrentPassword.value = !showCurrentPassword.value;
  }

  function toggleNewPasswordVisibility() {
    showNewPassword.value = !showNewPassword.value;
  }

  function toggleConfirmPasswordVisibility() {
    showConfirmPassword.value = !showConfirmPassword.value;
  }

  function openPasswordModal() {
    if (guardOpenWhileChanging && isChangingPassword.value) {
      return;
    }

    resetPasswordForm();
    isPasswordModalOpen.value = true;
  }

  function closePasswordModal() {
    if (isChangingPassword.value) {
      return;
    }

    isPasswordModalOpen.value = false;
    resetPasswordForm();
  }

  async function handleChangePassword() {
    if (isChangingPassword.value) {
      return;
    }

    passwordSuccessMessage.value = "";
    passwordErrorMessage.value = "";

    const hasEmptyFields = useTrimmedEmptyValidation
      ? currentPassword.value.trim() === "" ||
        newPassword.value.trim() === "" ||
        confirmPassword.value.trim() === ""
      : !currentPassword.value || !newPassword.value || !confirmPassword.value;

    if (hasEmptyFields) {
      passwordErrorMessage.value = "Please fill in all password fields.";
      return;
    }

    if (newPassword.value.length < 8) {
      passwordErrorMessage.value = minLengthMessage;
      return;
    }

    if (newPassword.value !== confirmPassword.value) {
      passwordErrorMessage.value = confirmationMismatchMessage;
      return;
    }

    isChangingPassword.value = true;

    try {
      const response = await apiJsonFetch("/password", {
        method: "PUT",
        body: JSON.stringify({
          current_password: currentPassword.value,
          password: newPassword.value,
          password_confirmation: confirmPassword.value,
        }),
      });

      const result = (await response.json().catch(() => null)) as PasswordChangeResponse | null;

      if (!response.ok) {
        const validationErrors = result?.errors ? Object.values(result.errors).flat().join(" ") : "";

        throw new Error(validationErrors || result?.message || "Password could not be changed.");
      }

      currentPassword.value = "";
      newPassword.value = "";
      confirmPassword.value = "";
      passwordSuccessMessage.value = useResponseSuccessMessage
        ? result?.message || successMessage
        : successMessage;
    } catch (error) {
      passwordErrorMessage.value =
        error instanceof Error ? error.message : "Something went wrong while changing the password.";
    } finally {
      isChangingPassword.value = false;
    }
  }

  return {
    isPasswordModalOpen,
    currentPassword,
    newPassword,
    confirmPassword,
    passwordErrorMessage,
    passwordSuccessMessage,
    isChangingPassword,
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    passwordButtonLabel,
    currentPasswordInputType,
    newPasswordInputType,
    confirmPasswordInputType,
    currentPasswordToggleLabel,
    newPasswordToggleLabel,
    confirmPasswordToggleLabel,
    resetPasswordForm,
    openPasswordModal,
    closePasswordModal,
    toggleCurrentPasswordVisibility,
    toggleNewPasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleChangePassword,
  };
}
