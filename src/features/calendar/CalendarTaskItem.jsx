import React, { useState } from "react";
import PriorityIndicator from "../../components/common/PriorityIndicator";

function CalendarTaskItem({ task, deleteTask, markTaskDone }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isCompleted = task.status === "Выполнена";
  const hasMicroStep = Boolean(task.microStep && task.microStep.trim());
  const hasDescription = Boolean(task.description && task.description.trim());

  function stopClick(event) {
    event.stopPropagation();
  }

  return (
    <article
      className={
        isCompleted
          ? isExpanded
            ? "calendar-mini-task completed expanded"
            : "calendar-mini-task completed"
          : isExpanded
            ? "calendar-mini-task expanded"
            : "calendar-mini-task"
      }
      onClick={() => setIsExpanded((current) => !current)}
    >
      <div className="calendar-mini-task-row">
        <button
          type="button"
          className={
            isCompleted
              ? "calendar-mini-task-check done"
              : "calendar-mini-task-check"
          }
          onClick={(event) => {
            stopClick(event);
            markTaskDone(task.id);
          }}
          title="Отметить как выполнено"
        >
          {isCompleted ? "✓" : ""}
        </button>

        <div className="calendar-mini-task-content">
          <div className="calendar-mini-task-title">
            <h4>{task.title}</h4>
            <PriorityIndicator priority={task.priority} />
          </div>

          <div className="calendar-mini-task-meta">
            <span>{task.date || "Без срока"}</span>

            {task.groupName && (
              <span
                className="calendar-mini-task-group"
                style={{
                  "--task-group-color": task.groupColor || "#E6F8FA",
                }}
              >
                {task.groupName}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          className="calendar-mini-task-delete"
          onClick={(event) => {
            stopClick(event);
            deleteTask(task.id);
          }}
          title="Удалить задачу"
        >
          ×
        </button>
      </div>

      {isExpanded && (
        <div className="calendar-mini-task-expanded">
          {hasMicroStep && (
            <div className="calendar-mini-task-micro">
              <span>Микро-шаг</span>
              <p>{task.microStep}</p>
            </div>
          )}

          {hasDescription && (
            <p className="calendar-mini-task-description">
              {task.description}
            </p>
          )}

          {!hasMicroStep && !hasDescription && (
            <p className="calendar-mini-task-description muted">
              Описание не добавлено
            </p>
          )}
        </div>
      )}
    </article>
  );
}

export default CalendarTaskItem;