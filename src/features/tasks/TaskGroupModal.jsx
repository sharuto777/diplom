import React, { useState } from "react";
import { SaveCheckIcon } from "../../components/common/Icons";

const groupColors = [
  "#FEE2E2",
  "#FFEDD5",
  "#FEF9C3",
  "#DCFCE7",
  "#CCFBF1",
  "#E6F8FA",
  "#DBEAFE",
  "#EDE9FE",
  "#FCE7F3",
  "#F1F5F9",
];

function TaskGroupModal({ onClose, onSubmit, isSaving }) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(groupColors[5]);

  const maxGroupNameLength = 20;

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName || isSaving) {
      return;
    }

    if (trimmedName.length > maxGroupNameLength) {
      alert(`Название группы не должно быть длиннее ${maxGroupNameLength} символов`);
      return;
    }

    onSubmit({
      name: trimmedName,
      color: selectedColor,
    });
  }

  return (
    <div className="modal-backdrop">
      <form className="simple-modal group-modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>Новая группа</h2>

          <div className="modal-header-actions">
            <button
              type="submit"
              className="modal-save-icon-btn"
              disabled={isSaving}
              title="Сохранить группу"
              aria-label="Сохранить группу"
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
          <span>Название группы</span>

          <input
            value={name}
            maxLength={maxGroupNameLength}
            onChange={(event) => setName(event.target.value)}
            placeholder="Например: Учёба"
          />

          <div className="field-counter">
            {name.length}/{maxGroupNameLength}
          </div>
        </label>

        <div className="group-color-field">
          <span>Цвет группы</span>

          <div className="group-color-palette">
            {groupColors.map((color) => (
              <button
                type="button"
                key={color}
                className={
                  selectedColor === color
                    ? "group-color-dot active"
                    : "group-color-dot"
                }
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
                aria-label="Выбрать цвет группы"
              />
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}

export default TaskGroupModal;