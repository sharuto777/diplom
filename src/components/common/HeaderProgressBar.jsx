import React from "react";

function HeaderProgressBar({ total, completed }) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="header-progress-bar-card" title="Прогресс задач">
      <div className="header-progress-bar-top">
        <span>Прогресс</span>
        <strong>
          {completed}/{total}
        </strong>
      </div>

      <div className="header-progress-track">
        <div
          className="header-progress-fill"
          style={{
            width: `${percent}%`,
          }}
        />
      </div>

      <span className="header-progress-percent">{percent}%</span>
    </div>
  );
}

export default HeaderProgressBar;