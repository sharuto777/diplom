import React, { useState } from "react";
import PriorityIndicator from "../../components/common/PriorityIndicator";

function TaskCard({
  task,
  markTaskDone,
  markWorkoutExerciseDone,
  toggleSubtaskDone,
  deleteTask,
  openEditTaskModal,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isCompleted = task.status === "Выполнена";
  const hasDescription = Boolean(task.description && task.description.trim());
  const hasSubtasks = Array.isArray(task.subtasks) && task.subtasks.length > 0;

  function handleCardClick() {
    setIsExpanded((current) => !current);
  }

  function stopClick(event) {
    event.stopPropagation();
  }

  return (
    <article
      className={
        isCompleted
          ? isExpanded
            ? "task-card mini-task-card completed expanded"
            : "task-card mini-task-card completed"
          : isExpanded
            ? "task-card mini-task-card expanded"
            : "task-card mini-task-card"
      }
      style={{
        "--task-group-color": task.groupColor || "rgba(255, 255, 255, 0.64)",
      }}
      onClick={handleCardClick}
    >
      <div className="mini-task-row">
        <button
          type="button"
          className={isCompleted ? "task-check done" : "task-check"}
          onClick={(event) => {
            stopClick(event);
            markTaskDone(task.id);
          }}
          title="Отметить как выполнено"
        >
          {isCompleted ? "✓" : ""}
        </button>

        <div className="mini-task-main">
          <div className="mini-task-title-line">
            <h3>{task.title}</h3>
            <PriorityIndicator priority={task.priority} />
          </div>

          <div className="mini-task-meta">
            <span
              className={
                task.date === "Без срока" ? "task-date no-date" : "task-date"
              }
            >
              ◷ {task.date}
            </span>

            {task.groupName && (
              <span
                className="task-group-label mini-task-group"
                style={{
                  "--task-group-color": task.groupColor || "#E6F8FA",
                }}
              >
                {task.groupName}
              </span>
            )}

            {isCompleted && (
              <span className="completed-label mini-completed-label">
                Выполнено
              </span>
            )}
          </div>
        </div>

        <div className="task-actions task-card-mini-actions" onClick={stopClick}>
  <button
  type="button"
  className="dots task-edit-icon-btn"
  onClick={() => openEditTaskModal(task)}
  title="Изменить задачу"
  aria-label="Изменить задачу"
>
  <svg viewBox="0 0 24 24">
    <path d="M4 20H8L18.5 9.5C19.3 8.7 19.3 7.4 18.5 6.6L17.4 5.5C16.6 4.7 15.3 4.7 14.5 5.5L4 16V20Z" />
    <path d="M13.5 6.5L17.5 10.5" />
  </svg>
</button>

  <button
    type="button"
    className="dots delete-btn"
    onClick={() => deleteTask(task.id)}
    title="Удалить задачу"
  >
    ×
  </button>
</div>
      </div>

      {isExpanded && (
        <div className="mini-task-expanded">
          {hasSubtasks && (
  <div className="subtasks-box" onClick={stopClick}>

    <div className="subtasks-list">
      {task.subtasks.map((subtask, index) => {
        const isDone = Boolean(subtask.is_completed);

        return (
          <button
            type="button"
            className={
              isDone
                ? "subtask-view-item completed"
                : "subtask-view-item"
            }
            key={subtask.id || index}
            onClick={() => toggleSubtaskDone(task.id, subtask.id)}
          >
            <span className="subtask-check">
              {isDone ? "✓" : ""}
            </span>

            <p>{subtask.title || subtask}</p>
          </button>
        );
      })}
    </div>
  </div>
)}

          {hasDescription ? (
            <p className="mini-task-description">{task.description}</p>
          ) : (
            <p className="mini-task-description empty-description">
              Описание не добавлено
            </p>
          )}

          {task.exercises && (
            <div className="exercise-box workout-subtasks" onClick={stopClick}>
              <strong>Упражнения</strong>

              <div className="workout-subtask-list">
                {task.exercises.map((exercise) => {
                  const exerciseName =
                    typeof exercise === "string" ? exercise : exercise.name;

                  const isExerciseCompleted =
                    typeof exercise === "string"
                      ? false
                      : exercise.is_completed;

                  return (
                    <div
                      key={
                        exercise.workout_exercise_id ||
                        exercise.id ||
                        exerciseName
                      }
                      className={
                        isExerciseCompleted
                          ? "workout-subtask completed"
                          : "workout-subtask"
                      }
                    >
                      <button
                        type="button"
                        className={
                          isExerciseCompleted
                            ? "workout-subtask-check done"
                            : "workout-subtask-check"
                        }
                        onClick={() => {
                          if (
                            !exercise.workout_exercise_id ||
                            isExerciseCompleted
                          ) {
                            return;
                          }

                          markWorkoutExerciseDone(exercise.workout_exercise_id);
                        }}
                        disabled={
                          isExerciseCompleted || !exercise.workout_exercise_id
                        }
                        title={
                          isExerciseCompleted
                            ? "Упражнение выполнено"
                            : "Отметить упражнение выполненным"
                        }
                      >
                        {isExerciseCompleted ? "✓" : ""}
                      </button>

                      <p>{exerciseName}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default TaskCard;