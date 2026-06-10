import React from "react";

function DayProgressRing({ total, completed }) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const angle = Math.round((percent / 100) * 360);

  return (
    <div className="day-progress-card">
      <div
        className="day-progress-ring"
        style={{
          "--progress-angle": `${angle}deg`,
        }}
      >
        <div className="day-progress-inner">
          <strong>{percent}%</strong>
          <span>готово</span>
        </div>
      </div>

      <div className="day-progress-info">
        <span>Прогресс дня</span>
        <h3>
          {completed} / {total}
        </h3>
        <p>
          {total === 0
            ? "Создайте первую задачу на день"
            : "Выполнено задач"}
        </p>
      </div>
    </div>
  );
}

export default DayProgressRing;