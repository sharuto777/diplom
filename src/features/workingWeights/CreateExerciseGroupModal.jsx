import React, { useState } from "react";
import { SaveCheckIcon } from "../../components/common/Icons";

const groupColors = [
  "#FEE2E2",
  "#FFEDD5",
  "#FEF9C3",
  "#DCFCE7",
  "#E6F8FA",
];

function CreateExerciseGroupModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(groupColors[4]);

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    onSave({
      name: trimmedName,
      color,
    });
  }

  return (
    <div className="modal-backdrop">
      <form className="simple-modal group-modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <div>
            <h2>Новая группа</h2>
          </div>

          <div className="modal-header-actions">
            <button
              type="submit"
              className="modal-save-icon-btn"
              title="Создать группу"
              aria-label="Создать группу"
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
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Например: Кардио"
            autoFocus
          />
        </label>

        <div className="group-color-field">
          <span>Цвет группы</span>

          <div className="group-color-palette">
            {groupColors.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  color === item ? "group-color-dot active" : "group-color-dot"
                }
                style={{ background: item }}
                onClick={() => setColor(item)}
              />
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateExerciseGroupModal;