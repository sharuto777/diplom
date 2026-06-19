import React, { useEffect, useState } from "react";
import { SaveCheckIcon } from "../../components/common/Icons";
import { useAppTheme } from "../../hooks/useAppTheme";
import {
  canonicalGroupColor,
  getDefaultGroupColor,
  getGroupColors,
  resolveGroupColor,
} from "../../utils/groupColors";

function TaskGroupModal({ onClose, onSubmit, isSaving }) {
  const theme = useAppTheme();
  const groupColors = getGroupColors(theme);
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(() =>
    getDefaultGroupColor(theme)
  );

  useEffect(() => {
    setSelectedColor((current) => resolveGroupColor(current, theme));
  }, [theme]);

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
      color: canonicalGroupColor(selectedColor),
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
                style={{ background: color }}
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