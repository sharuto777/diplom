import React, { useState } from "react";

function TaskRightFilterPanel({
  selectedPriorities,
  setSelectedPriorities,
  selectedTaskDate,
  setSelectedTaskDate,
  taskTimeSortDirection,
  setTaskTimeSortDirection,
  isMobileOpen = false,
  mobilePopover = false,
}) {
  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);

  const priorityOptions = [
    { value: "Высокий", label: "Высокий приоритет", className: "high" },
    { value: "Средний", label: "Средний приоритет", className: "medium" },
    { value: "Низкий", label: "Низкий приоритет", className: "low" },
  ];

  function addPriority(priority) {
    setSelectedPriorities((current) => {
      if (current.includes(priority)) return current;
      return [...current, priority];
    });

    setIsPriorityMenuOpen(false);
  }

  function removePriority(priority) {
    setSelectedPriorities((current) =>
      current.filter((item) => item !== priority)
    );
  }

  function formatSelectedDate(dateValue) {
    if (!dateValue) return "";

    return new Date(`${dateValue}T12:00:00`).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
    });
  }

  const hasFilters = selectedPriorities.length > 0 || Boolean(selectedTaskDate);

  return (
    <aside
      className={[
        "task-right-filter-panel",
        isMobileOpen ? "mobile-open" : "",
        mobilePopover ? "mobile-popover" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="task-filter-panel-head">
        <span>Отбор задач</span>
        <p>Настройте список по приоритету и дате.</p>
      </div>

      <div className="task-filter-panel-section">
        <label>Приоритет</label>

        <div className="task-priority-panel-select">
          <button
            type="button"
            onClick={() => setIsPriorityMenuOpen((current) => !current)}
          >
            Выбрать приоритет
            <span>⌄</span>
          </button>

          {isPriorityMenuOpen && (
            <div className="task-priority-panel-dropdown">
              {priorityOptions.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  className={`task-priority-panel-option ${priority.className}`}
                  disabled={selectedPriorities.includes(priority.value)}
                  onClick={() => addPriority(priority.value)}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="task-filter-panel-section">
        <label>Дата</label>

        <input
          type="date"
          className="task-filter-panel-date"
          value={selectedTaskDate}
          onChange={(event) => setSelectedTaskDate(event.target.value)}
        />
      </div>

      <div className="task-filter-panel-section">
        <label>Сортировка по времени</label>

        <div className="task-filter-panel-arrows">
          <button
            type="button"
            className={taskTimeSortDirection === "asc" ? "active" : ""}
            onClick={() => setTaskTimeSortDirection("asc")}
            title="Сначала ближайшие"
          >
            ↑
          </button>

          <button
            type="button"
            className={taskTimeSortDirection === "desc" ? "active" : ""}
            onClick={() => setTaskTimeSortDirection("desc")}
            title="Сначала поздние"
          >
            ↓
          </button>
        </div>
      </div>

      <div className="task-filter-panel-selected">
        <div className="task-filter-panel-selected-title">
          <span>Выбрано</span>

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setSelectedPriorities([]);
                setSelectedTaskDate("");
              }}
            >
              Сбросить
            </button>
          )}
        </div>

        {!hasFilters ? (
          <p className="task-filter-panel-empty">Пока условия не выбраны.</p>
        ) : (
          <div className="task-filter-panel-tags">
            {selectedPriorities.map((priority) => {
              const option = priorityOptions.find(
                (item) => item.value === priority
              );

              return (
                <button
                  key={priority}
                  type="button"
                  className={`task-filter-panel-tag ${option?.className || ""}`}
                  onClick={() => removePriority(priority)}
                >
                  {priority}
                  <span>×</span>
                </button>
              );
            })}

            {selectedTaskDate && (
              <button
                type="button"
                className="task-filter-panel-tag date"
                onClick={() => setSelectedTaskDate("")}
              >
                {formatSelectedDate(selectedTaskDate)}
                <span>×</span>
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

export default TaskRightFilterPanel;