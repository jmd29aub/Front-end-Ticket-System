import { ref, watch } from "vue";

const THEME_STORAGE_KEY = "support-ticket-theme";

function getSavedDarkMode() {
  return localStorage.getItem(THEME_STORAGE_KEY) === "dark";
}

function applyDarkMode(isDark: boolean) {
  document.documentElement.classList.toggle("app-dark", isDark);
  localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
}

const isDarkModeEnabled = ref(getSavedDarkMode());

applyDarkMode(isDarkModeEnabled.value);

watch(isDarkModeEnabled, (isDark) => {
  applyDarkMode(isDark);
});

export function useAppTheme() {
  return {
    isDarkModeEnabled,
  };
}
