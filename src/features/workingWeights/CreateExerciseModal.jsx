import React, { useState } from "react";
import { SaveCheckIcon } from "../../components/common/Icons";
import { getMeasureTypeFromUnits } from "./workingWeightUtils";

function CreateExerciseModal({
  exerciseGroups = [],
  activeExerciseGroupId = "all",
  onClose,
  onSave,
}) {
  const [name, setName] = useState("");
  const [measureUnits, setMeasureUnits] = useState(["kg"]);
  const [groupId, setGroupId] = useState(
    activeExerciseGroupId === "all" ? "" : activeExerciseGroupId
  );

  const unitOptions = [
    {
      value: "kg",
      label: "кг",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 9V15" />
          <path d="M18 9V15" />
          <path d="M3 10.5V13.5" />
          <path d="M21 10.5V13.5" />
          <path d="M6 12H18" />
          <path d="M4.5 9.5V14.5" />
          <path d="M19.5 9.5V14.5" />
        </svg>
      ),
    },
    {
      value: "min",
      label: "мин",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="13" r="7" />
          <path d="M12 13V9" />
          <path d="M12 13L15 15" />
          <path d="M9 3H15" />
          <path d="M12 3V6" />
        </svg>
      ),
    },
    {
      value: "reps",
      label: "повторы",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 8H16C18.2 8 20 9.8 20 12C20 14.2 18.2 16 16 16H13" />
          <path d="M9 12L6 8L9 4" />
          <path d="M18 16H8C5.8 16 4 14.2 4 12C4 9.8 5.8 8 8 8H11" />
          <path d="M15 12L18 16L15 20" />
        </svg>
      ),
    },
  ];

  function toggleUnit(unit) {
    setMeasureUnits((current) => {
      if (current.includes(unit)) {
        return current.filter((item) => item !== unit);
      }

      return [...current, unit];
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    const safeMeasureUnits = measureUnits.filter((unit) => unit !== "km");

    if (safeMeasureUnits.length === 0) {
      return;
    }

    onSave({
      name: trimmedName,
      measureType: getMeasureTypeFromUnits(safeMeasureUnits),
      measure_type: getMeasureTypeFromUnits(safeMeasureUnits),
      measureUnits: safeMeasureUnits,
      measure_units: safeMeasureUnits,
      groupId: groupId || null,
      group_id: groupId || null,
    });
  }

  return (
    <div className="modal-backdrop">
      <form className="simple-modal create-exercise-modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <div>
            <h2>Новое упражнение</h2>
          </div>

          <div className="modal-header-actions">
            <button
              type="submit"
              className="modal-save-icon-btn"
              disabled={!name.trim() || measureUnits.length === 0}
              title="Создать упражнение"
              aria-label="Создать упражнение"
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
          <span>Название упражнения</span>

          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Например: Планка"
            autoFocus
          />
        </label>

        <div className="field">
          <span>Единица измерения</span>

          <div className="exercise-unit-checkboxes pretty">
            {unitOptions.map((unit) => {
              const isChecked = measureUnits.includes(unit.value);

              return (
                <label
                  key={unit.value}
                  className={
                    isChecked
                      ? "exercise-unit-checkbox pretty active"
                      : "exercise-unit-checkbox pretty"
                  }
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleUnit(unit.value)}
                  />

                  <span className="exercise-unit-icon">{unit.icon}</span>
                  <span className="exercise-unit-label">{unit.label}</span>

                  <span className="exercise-unit-check">
                    {isChecked ? "✓" : ""}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <label className="field">
          <span>Группа</span>

          <select value={groupId} onChange={(event) => setGroupId(event.target.value)}>
            <option value="">Без группы</option>

            {exerciseGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
      </form>
    </div>
  );
}

export default CreateExerciseModal;