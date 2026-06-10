import React from "react";

function AppToast({ toast }) {
  if (!toast) {
    return null;
  }

  return (
    <div className={`app-toast ${toast.type || "info"}`}>
      {toast.message}
    </div>
  );
}

export default AppToast;