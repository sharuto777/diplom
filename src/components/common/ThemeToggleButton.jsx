import React from "react";

function ThemeToggleButton({
  theme = "light",
  onToggle,
  className = "",
  showLabel = false,
}) {
  const isDark = theme === "dark";
  const label = isDark ? "Светлая тема" : "Тёмная тема";

  return (
    <button
      type="button"
      className={["theme-toggle-btn", className].filter(Boolean).join(" ")}
      onClick={() => onToggle?.()}
      title={label}
      aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
    >
      <span className="theme-toggle-btn-icon" aria-hidden="true">
        {isDark ? (
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4.5" />
            <path d="M12 2V4" />
            <path d="M12 20V22" />
            <path d="M4.9 4.9L6.3 6.3" />
            <path d="M17.7 17.7L19.1 19.1" />
            <path d="M2 12H4" />
            <path d="M20 12H22" />
            <path d="M4.9 19.1L6.3 17.7" />
            <path d="M17.7 6.3L19.1 4.9" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24">
            <path d="M21 14.5A7.5 7.5 0 0 1 9.5 3 6.5 6.5 0 1 0 21 14.5Z" />
          </svg>
        )}
      </span>

      {showLabel && <span className="theme-toggle-btn-label">{label}</span>}
    </button>
  );
}

export default ThemeToggleButton;