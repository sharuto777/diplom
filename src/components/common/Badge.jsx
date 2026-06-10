import React from "react";

function Badge({ type = "gray", color, children, className = "" }) {
  const badgeColor = color || type || "gray";

  return (
    <span className={`badge ${badgeColor} ${className}`.trim()}>
      {children}
    </span>
  );
}

export default Badge;