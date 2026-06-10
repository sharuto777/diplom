import React, { useEffect, useState } from "react";
import { SaveCheckIcon } from "../../components/common/Icons";
import { toDateInputValue } from "../../utils/dateUtils";

function TaskModal({
  initialDate = null,
  initialData = null,
  onClose,
  onSubmit,
  isSaving = false,
}) {
  const isDateLocked = Boolean(initialDate);

  const [hasDeadline, setHasDeadline] = useState(Boolean(initialDate));
  const isEditMode = Boolean(initialData?.id);
  const [deadlineMode, setDeadlineMode] = useState(
    initialDate ? "custom" : "today"
  );

  const [form, setForm] = useState({
  title: initialData?.title || "",
  description: initialData?.description || "",
  subtasks: Array.isArray(initialData?.subtasks)
    ? initialData.subtasks.map((subtask) => subtask.title || subtask)
    : [],
  priority:
  initialData?.priority === "high" ||
  initialData?.priority === "Высокий"
    ? "high"
    : initialData?.priority === "low" ||
        initialData?.priority === "Низкий"
      ? "low"
      : "medium",
  selected_date: initialDate || initialData?.rawDate?.slice(0, 10) || "",
  selected_time: initialData?.rawDate
    ? new Date(initialData.rawDate).toTimeString().slice(0, 5)
    : "",
});

  const todayString = new Date().toISOString().split("T")[0];

  function updateField(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function addSubtaskField() {
  setForm((currentForm) => {
    const currentSubtasks = currentForm.subtasks || [];

    if (currentSubtasks.length >= 7) {
      return currentForm;
    }

    return {
      ...currentForm,
      subtasks: [...currentSubtasks, ""],
    };
  });
}

function updateSubtask(index, value) {
  setForm((currentForm) => ({
    ...currentForm,
    subtasks: (currentForm.subtasks || []).map((subtask, subtaskIndex) =>
      subtaskIndex === index ? value : subtask
    ),
  }));
}

function removeSubtask(index) {
  setForm((currentForm) => ({
    ...currentForm,
    subtasks: (currentForm.subtasks || []).filter(
      (_, subtaskIndex) => subtaskIndex !== index
    ),
  }));
}

  function buildDateTime() {
    if (!hasDeadline) {
      return null;
    }

    const date = new Date();

    if (deadlineMode === "tomorrow") {
      date.setDate(date.getDate() + 1);
    }

    if (deadlineMode === "custom") {
      if (!form.selected_date) {
        return null;
      }

      if (!form.selected_time) {
        return `${form.selected_date}T12:00:00`;
      }

      return `${form.selected_date}T${form.selected_time}:00`;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    if (!form.selected_time) {
      return `${year}-${month}-${day}T12:00:00`;
    }

    return `${year}-${month}-${day}T${form.selected_time}:00`;
  }

  function handleSubmit(event) {
  event.preventDefault();

  if (isSaving) {
    return;
  }

  const trimmedTitle = form.title.trim();

  if (!trimmedTitle) {
    alert("Введите название задачи");
    return;
  }

  if (trimmedTitle.length > 60) {
    alert("Название задачи не должно быть длиннее 60 символов");
    return;
  }

  const selectedDate = buildDateTime();

  if (selectedDate && !isDateLocked) {
  const taskDate = new Date(selectedDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  taskDate.setHours(0, 0, 0, 0);

  if (taskDate < today) {
    alert("Нельзя создать задачу на прошедший день");
    return;
  }
}
    onSubmit({
      title: trimmedTitle,
      description: form.description,
      subtasks: (form.subtasks || [])
        .map((subtask) => subtask.trim())
        .filter(Boolean)
        .slice(0, 7),
      priority: form.priority,
      start_datetime: selectedDate,
      end_datetime: null,
    });
}

  return (
    <div className="modal-backdrop">
      <form className="simple-modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>{isEditMode ? "Изменить задачу" : "Новая задача"}</h2>

          <div className="modal-header-actions">
            <button
              type="submit"
              className="modal-save-icon-btn"
              disabled={isSaving}
              title={isEditMode ? "Сохранить изменения" : "Сохранить задачу"}
              aria-label={isEditMode ? "Сохранить изменения" : "Сохранить задачу"}
            >
              <SaveCheckIcon />
            </button>

            <button
              type="button"
              className="modal-close-icon-btn"
              onClick={onClose}
              title="Закрыть"
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>
        </div>

        <label className="field">
          <span>Название</span>
          <input
            value={form.title}
            maxLength={60}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Например: подготовить диплом"
            required
          />

          <div className="field-counter">
            {form.title.length}/60
          </div>
        </label>

        <label className="field">
          <span>Описание</span>
          <textarea
            className="task-description-input"
            value={form.description}
            onChange={(event) =>
              updateField("description", event.target.value)
            }
            placeholder="Добавьте описание задачи. Можно переносить строки через Enter."
            rows={4}
          />
        </label>

        <div className="field subtasks-field">
  <span className="subtasks-title">Подзадачи</span>

  {(form.subtasks || []).length === 0 ? (
    <p className="field-hint">
      Добавьте подзадачи, если задача состоит из нескольких шагов.
    </p>
  ) : (
    <div className="subtasks-input-list">
      {(form.subtasks || []).map((subtask, index) => (
        <div className="subtask-input-row" key={index}>
          <input
            value={subtask}
            onChange={(event) => updateSubtask(index, event.target.value)}
            placeholder={`Подзадача ${index + 1}`}
          />

          <button
            type="button"
            onClick={() => removeSubtask(index)}
            title="Удалить подзадачу"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )}

  {(form.subtasks || []).length < 7 && (
    <button
      type="button"
      className="subtask-add-minimal-btn"
      onClick={addSubtaskField}
    >
      + Подзадача
    </button>
  )}

  <div className="field-counter">
    {(form.subtasks || []).length}/7
  </div>
</div>

        <div className="field">
  <span>Приоритет</span>

  <div className="priority-picker">
    <button
      type="button"
      className={
        form.priority === "low"
          ? "priority-choice low active"
          : "priority-choice low"
      }
      onClick={() => updateField("priority", "low")}
      title="Низкий приоритет"
    >
      !
    </button>

    <button
      type="button"
      className={
        form.priority === "medium"
          ? "priority-choice medium active"
          : "priority-choice medium"
      }
      onClick={() => updateField("priority", "medium")}
      title="Средний приоритет"
    >
      !!
    </button>

    <button
      type="button"
      className={
        form.priority === "high"
          ? "priority-choice high active"
          : "priority-choice high"
      }
      onClick={() => updateField("priority", "high")}
      title="Высокий приоритет"
    >
      !!!
    </button>
  </div>
</div>

        {isDateLocked ? (
  <div className="deadline-box locked-date-box calendar-task-time-only">
    <label className="field">
      <span>Время</span>
      <input
        type="time"
        value={form.selected_time}
        onChange={(event) =>
          updateField("selected_time", event.target.value)
        }
      />
    </label>
  </div>
) : (
  <>
    <label className="deadline-toggle">
      <input
        type="checkbox"
        checked={hasDeadline}
        onChange={(event) => setHasDeadline(event.target.checked)}
      />
      <span>Добавить время выполнения</span>
    </label>

    {hasDeadline && (
      <div className="deadline-box">
        <div className="deadline-options">
          <button
            type="button"
            className={
              deadlineMode === "today"
                ? "deadline-option active"
                : "deadline-option"
            }
            onClick={() => setDeadlineMode("today")}
          >
            Сегодня
          </button>

          <button
            type="button"
            className={
              deadlineMode === "tomorrow"
                ? "deadline-option active"
                : "deadline-option"
            }
            onClick={() => setDeadlineMode("tomorrow")}
          >
            Завтра
          </button>

          <button
            type="button"
            className={
              deadlineMode === "custom"
                ? "deadline-option active"
                : "deadline-option"
            }
            onClick={() => setDeadlineMode("custom")}
          >
            Выбрать день
          </button>
        </div>

        {deadlineMode === "custom" && (
          <label className="field">
            <span>Дата</span>
            <input
              type="date"
              min={todayString}
              value={form.selected_date}
              onChange={(event) =>
                updateField("selected_date", event.target.value)
              }
              required={hasDeadline && deadlineMode === "custom"}
            />
          </label>
        )}

        <label className="field">
          <span>Время</span>
          <input
            type="time"
            value={form.selected_time}
            onChange={(event) =>
              updateField("selected_time", event.target.value)
            }
          />
        </label>
      </div>
    )}
  </>
)}

      </form>
    </div>
  );
}

export default TaskModal;