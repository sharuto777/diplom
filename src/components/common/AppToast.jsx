import React, { useEffect } from "react";

function AppToast({ message, type = "info", onClose }) {
  useEffect(() => {
    if (!onClose) {
      return undefined;
    }

    const timer = setTimeout(onClose, 4000);

    return () => clearTimeout(timer);
  }, [message, type, onClose]);

  const icon = type === "success" ? "✓" : type === "error" ? "!" : "i";

  return (
    <div className={`app-toast ${type}`} role="status" aria-live="polite">
      <div className="app-toast-icon">{icon}</div>
      <p>{message}</p>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Закрыть">
          ×
        </button>
      )}
    </div>
  );
}

export default AppToast;