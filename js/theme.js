const THEME_STORAGE_KEY = "coffee-house-theme";

function getInitialTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme, shouldSave = false) {
  document.documentElement.dataset.theme = theme;

  document.querySelectorAll("[data-theme-value]").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.themeValue === theme),
    );
  });

  if (shouldSave) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
}

applyTheme(getInitialTheme());

function initializeThemeSwitcher() {
  const currentTheme = document.documentElement.dataset.theme;
  const themeButtons = document.querySelectorAll("[data-theme-value]");

  themeButtons.forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.themeValue === currentTheme),
    );

    button.addEventListener("click", () => {
      applyTheme(button.dataset.themeValue, true);
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeThemeSwitcher, {
    once: true,
  });
} else {
  initializeThemeSwitcher();
}
