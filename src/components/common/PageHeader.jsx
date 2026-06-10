import React from "react";

function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}
export default PageHeader;