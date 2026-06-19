export const THEME_STORAGE_KEY = "sunday-theme";

export function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyTheme(theme) {
  const normalizedTheme = theme === "dark" ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", normalizedTheme);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
  } catch {
    // ignore storage errors
  }

  return normalizedTheme;
}

export function toggleTheme(currentTheme) {
  return applyTheme(currentTheme === "dark" ? "light" : "dark");
}