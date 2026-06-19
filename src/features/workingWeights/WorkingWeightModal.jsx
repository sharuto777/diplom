import React, { useState } from "react";
import { SaveCheckIcon } from "../../components/common/Icons";
import {
  getDefaultMeasureUnits,
  getMeasureTypeFromUnits,
  detectExerciseMeasureType,
} from "./workingWeightUtils";

function WorkingWeightModal({
  initialData,
  exercises,
  isPremiumUser = false,
  onOpenPremium,
  onClose,
  onSave,
  onDelete,
}) {
  const [exerciseId, setExerciseId] = useState(initialData?.exerciseId || null);

  const [exerciseName, setExerciseName] = useState(
    initialData?.exerciseName || ""
  );

  const [isExerciseListOpen, setIsExerciseListOpen] = useState(false);

  const [measureUnits, setMeasureUnits] = useState(
    Array.isArray(initialData?.measureUnits) && initialData.measureUnits.length > 0
      ? initialData.measureUnits.filter((unit) => unit !== "km")
      : getDefaultMeasureUnits(
          initialData?.measureType ||
            detectExerciseMeasureType(initialData?.exerciseName || "")
        )
  );

  const [measureType, setMeasureType] = useState(
    initialData?.measureType || getMeasureTypeFromUnits(measureUnits)
  );

  const [weight, setWeight] = useState(initialData?.weight || "");
  const [reps, setReps] = useState(initialData?.reps || "");
  const [time, setTime] = useState(initialData?.time || "");

  const exerciseOptions = Array.isArray(exercises) ? exercises : [];

  const filteredExercises = exerciseOptions
    .filter((exercise) => {
      const name = String(exercise.name || "").toLowerCase();
      const query = exerciseName.trim().toLowerCase();

      if (!query) {
        return true;
      }

      return name.includes(query);
    })
    .slice(0, 8);

  function normalizeMeasureUnits(units = []) {
    const safeUnits = Array.isArray(units) ? units : [];

    return safeUnits.filter((unit) => unit !== "km");
  }

  function selectExercise(exercise) {
    const selectedName = exercise.name;

    const selectedMeasureUnits = normalizeMeasureUnits(
      exercise.measure_units ||
        exercise.measureUnits ||
        getDefaultMeasureUnits(
          exercise.measure_type ||
            exercise.measureType ||
            detectExerciseMeasureType(selectedName)
        )
    );

    const selectedMeasureType =
      exercise.measure_type ||
      exercise.measureType ||
      getMeasureTypeFromUnits(selectedMeasureUnits);

    setExerciseId(exercise.is_custom ? null : exercise.id);
    setExerciseName(selectedName);
    setMeasureUnits(selectedMeasureUnits);
    setMeasureType(selectedMeasureType);
    setIsExerciseListOpen(false);
  }

  function handleExerciseNameChange(value) {
    const detectedMeasureType = detectExerciseMeasureType(value);
    const detectedMeasureUnits = getDefaultMeasureUnits(detectedMeasureType);

    setExerciseName(value);
    setExerciseId(null);
    setMeasureType(detectedMeasureType);
    setMeasureUnits(detectedMeasureUnits);
    setIsExerciseListOpen(true);
  }

  function findExerciseByName(name) {
    const normalizedName = String(name || "").trim().toLowerCase();

    if (!normalizedName) {
      return null;
    }

    return (
      exerciseOptions.find(
        (exercise) =>
          String(exercise.name || "").trim().toLowerCase() === normalizedName
      ) || null
    );
  }

  function handleSave(event) {
    event.preventDefault();

    const trimmedExerciseName = exerciseName.trim();

    if (!trimmedExerciseName) {
      return;
    }

    const isCreatingCustomExercise =
      exerciseId === null && !findExerciseByName(trimmedExerciseName);

    if (isCreatingCustomExercise && !isPremiumUser) {
      onOpenPremium?.();
      return;
    }

    const safeMeasureUnits = normalizeMeasureUnits(measureUnits);

    const hasKg = safeMeasureUnits.includes("kg");
    const hasReps = safeMeasureUnits.includes("reps");
    const hasMin = safeMeasureUnits.includes("min");

    const hasAnyValue =
      (hasKg && weight !== "") ||
      (hasReps && reps !== "") ||
      (hasMin && time !== "");

    if (!hasAnyValue) {
      return;
    }

    onSave({
      ...(initialData?.id ? { id: initialData.id } : {}),
      exerciseId,
      exerciseName: trimmedExerciseName,
      measureType: getMeasureTypeFromUnits(safeMeasureUnits),
      weight: hasKg ? Number(weight) : null,
      reps: hasReps ? Number(reps) : null,
      distance: null,
      time: hasMin
        ? String(time).includes(":")
          ? time
          : `${Number(time) || 0}:00`
        : null,
    });
  }

  return (
    <div className="modal-backdrop">
      <form className="simple-modal working-weight-modal" onSubmit={handleSave}>
        <div className="metric-modal-header">
          <div>
            <h2>
              {initialData?.id ? "Изменить показатель" : "Добавить показатель"}
            </h2>
          </div>

          <div className="metric-modal-actions">
            <button
              type="submit"
              className="metric-modal-save-icon-btn"
              title="Сохранить"
              aria-label="Сохранить"
            >
              <SaveCheckIcon />
            </button>

            <button
              type="button"
              className="metric-modal-close-btn modal-close-icon-btn"
              onClick={onClose}
              title="Закрыть"
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>
        </div>

        <label className="field exercise-autocomplete-field metric-modal-field">
          <span>Упражнение</span>

          <input
            type="text"
            value={exerciseName}
            onChange={(event) => handleExerciseNameChange(event.target.value)}
            onFocus={() => setIsExerciseListOpen(true)}
            placeholder="Начните вводить упражнение..."
            autoComplete="off"
          />

          {isExerciseListOpen && exerciseName.trim() && (
            <div className="exercise-autocomplete-list">
              {filteredExercises.length === 0 ? (
                <div className="exercise-autocomplete-empty">
                  {isPremiumUser
                    ? "Упражнение не найдено. Можно сохранить своё название."
                    : "Упражнение не найдено. Своё название доступно с Premium."}
                </div>
              ) : (
                filteredExercises.map((exercise) => (
                  <button
                    type="button"
                    key={`${exercise.is_custom ? "custom" : "base"}-${exercise.id}`}
                    className="exercise-autocomplete-item"
                    onClick={() => selectExercise(exercise)}
                  >
                    <strong>{exercise.name}</strong>

                    {(exercise.group_name ||
                      exercise.muscle ||
                      exercise.muscle_group) && (
                      <span>
                        {exercise.group_name ||
                          exercise.muscle ||
                          exercise.muscle_group}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </label>

        {(measureUnits.includes("kg") || measureUnits.includes("reps")) && (
          <div className="metric-modal-value-card metric-modal-value-grid">
            <div className="metric-modal-value-info">
              <strong>Показатель</strong>

              <span>
                {measureUnits.includes("kg") && measureUnits.includes("reps")
                  ? "Вес и повторения"
                  : measureUnits.includes("kg")
                    ? "Вес"
                    : "Повторения"}
              </span>
            </div>

            {measureUnits.includes("kg") && (
              <div className="metric-modal-input-wrap">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  placeholder="0"
                />

                <span>кг</span>
              </div>
            )}

            {measureUnits.includes("reps") && (
              <div className="metric-modal-input-wrap">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={reps}
                  onChange={(event) => setReps(event.target.value)}
                  placeholder="0"
                />

                <span>раз</span>
              </div>
            )}
          </div>
        )}

        {measureUnits.includes("min") && (
          <label className="field">
            <span>Время</span>

            <input
              type="number"
              min="0"
              step="1"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              placeholder="Минуты"
            />
          </label>
        )}

        {initialData?.id && (
          <button
            type="button"
            className="metric-modal-delete-btn"
            onClick={() => onDelete(initialData.id)}
          >
            Удалить показатель
          </button>
        )}
      </form>
    </div>
  );
}

export default WorkingWeightModal;