import React, { useEffect, useState } from "react";
import { SaveCheckIcon } from "../../components/common/Icons";
import { useAppTheme } from "../../hooks/useAppTheme";
import {
  canonicalGroupColor,
  getDefaultGroupColor,
  getGroupColors,
  resolveGroupColor,
} from "../../utils/groupColors";

function CreateExerciseGroupModal({ onClose, onSave }) {
  const theme = useAppTheme();
  const groupColors = getGroupColors(theme);
  const [name, setName] = useState("");
  const [color, setColor] = useState(() => getDefaultGroupColor(theme));

  useEffect(() => {
    setColor((current) => resolveGroupColor(current, theme));
  }, [theme]);

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    onSave({
      name: trimmedName,
      color: canonicalGroupColor(color),
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