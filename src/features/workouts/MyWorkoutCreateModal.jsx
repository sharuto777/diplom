import React, { useState } from "react";
import { SaveCheckIcon, BackArrowIcon, NextArrowIcon } from "../../components/common/Icons";

function MyWorkoutCreateModal({
  muscleGroups = [],
  availableExercises = [],
  workingWeights = [],
  initialData = null,
  showToast,
  isPremiumUser = false,
  onOpenPremium,
  onClose,
  onSave,
}) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(initialData?.title || "");

  const [selectedMuscles, setSelectedMuscles] = useState(() => {
    if (!initialData?.muscle) {
      return [];
    }

    return String(initialData.muscle)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  });

  const [exerciseSearch, setExerciseSearch] = useState("");
  const [isExerciseSuggestOpen, setIsExerciseSuggestOpen] = useState(false);

  const [selectedExercises, setSelectedExercises] = useState(() => {
    if (!Array.isArray(initialData?.exercises)) {
      return [];
    }

    return initialData.exercises.map((exercise) => ({
      id: exercise.workout_exercise_id || exercise.id || crypto.randomUUID(),
      name: exercise.name,
      exercise_id: exercise.exercise_id || (!exercise.is_custom ? exercise.id : null),
      user_exercise_id: exercise.user_exercise_id || (exercise.is_custom ? exercise.id : null),
      measure_units:
        exercise.measure_units ||
        exercise.measureUnits ||
        getExerciseMeasureUnits(exercise),
      sets_count:
        exercise.sets_count === null || exercise.sets_count === undefined
          ? ""
          : String(exercise.sets_count),
      reps_count:
        exercise.reps_count === null || exercise.reps_count === undefined
          ? ""
          : String(exercise.reps_count),
      weight_kg:
        exercise.weight_kg === null || exercise.weight_kg === undefined
          ? ""
          : String(exercise.weight_kg),
      duration_min:
        exercise.duration_min === null || exercise.duration_min === undefined
          ? ""
          : String(exercise.duration_min || ""),
    }));
  });

  const normalizedSearch = exerciseSearch.trim().toLowerCase();

  const filteredExercises = normalizedSearch
    ? availableExercises
        .filter((exercise) =>
          String(exercise.name || "")
            .toLowerCase()
            .includes(normalizedSearch)
        )
        .slice(0, 8)
    : [];

  function getExerciseMeasureUnits(exercise) {
    if (!exercise) {
      return ["kg"];
    }

    const sourceExercise = availableExercises.find((item) => {
      if (exercise.exercise_id && String(item.id) === String(exercise.exercise_id)) {
        return true;
      }

      if (exercise.user_exercise_id && String(item.id) === String(exercise.user_exercise_id)) {
        return true;
      }

      return (
        String(item.name || "").trim().toLowerCase() ===
        String(exercise.name || "").trim().toLowerCase()
      );
    });

    const units =
      sourceExercise?.measure_units ||
      sourceExercise?.measureUnits ||
      exercise.measure_units ||
      exercise.measureUnits;

    if (Array.isArray(units) && units.length > 0) {
      return units.filter((unit) => unit !== "km");
    }

    const name = String(exercise.name || "").toLowerCase();

    if (
      name.includes("подтяг") ||
      name.includes("отжим") ||
      name.includes("скруч") ||
      name.includes("пресс")
    ) {
      return ["reps"];
    }

    if (
      name.includes("планка") ||
      name.includes("вис") ||
      name.includes("удержание")
    ) {
      return ["min"];
    }

    return ["kg", "reps"];
  }

  function getDefaultWeightForExercise(exercise) {
    if (!exercise) {
      return "";
    }

    const exerciseName = String(exercise.name || "").trim().toLowerCase();
    const exerciseId = exercise.id;

    const metric = workingWeights.find((item) => {
      const metricExerciseId = item.exerciseId || item.exercise_id;
      const metricName = String(item.exerciseName || item.exercise_name || "")
        .trim()
        .toLowerCase();

      if (metricExerciseId && exerciseId) {
        return String(metricExerciseId) === String(exerciseId);
      }

      return metricName && metricName === exerciseName;
    });

    if (!metric || metric.weight === null || metric.weight === undefined) {
      return "";
    }

    return String(metric.weight);
  }

  function getDefaultRepsForExercise(exercise) {
    if (!exercise) {
      return "";
    }

    const exerciseName = String(exercise.name || "").trim().toLowerCase();
    const exerciseId = exercise.id;

    const metric = workingWeights.find((item) => {
      const metricExerciseId = item.exerciseId || item.exercise_id;
      const metricName = String(item.exerciseName || item.exercise_name || "")
        .trim()
        .toLowerCase();

      if (metricExerciseId && exerciseId) {
        return String(metricExerciseId) === String(exerciseId);
      }

      return metricName && metricName === exerciseName;
    });

    if (!metric || metric.reps === null || metric.reps === undefined) {
      return "";
    }

    return String(metric.reps);
  }

  function updateSelectedExerciseField(id, field, value) {
    setSelectedExercises((current) =>
      current.map((exercise) =>
        exercise.id === id
          ? {
              ...exercise,
              [field]: value,
            }
          : exercise
      )
    );
  }

  function toggleMuscle(name) {
    setSelectedMuscles((current) => {
      if (current.includes(name)) {
        return current.filter((item) => item !== name);
      }

      return [...current, name];
    });
  }

  function goNext() {
    if (!title.trim()) {
      showToast?.("Введите название тренировки", "error");
      return;
    }

    if (selectedMuscles.length === 0) {
      showToast?.("Выберите хотя бы одну группу мышц", "error");
      return;
    }

    setStep(2);
  }

  function addExerciseFromBase(exercise) {
    const exerciseId = exercise.is_custom ? null : exercise.id;
    const userExerciseId = exercise.is_custom ? exercise.id : null;

    const alreadyAdded = selectedExercises.some((item) => {
      if (exerciseId && item.exercise_id === exerciseId) return true;
      if (userExerciseId && item.user_exercise_id === userExerciseId) return true;

      return item.name.toLowerCase() === String(exercise.name || "").toLowerCase();
    });

    if (alreadyAdded) {
      setExerciseSearch("");
      setIsExerciseSuggestOpen(false);
      showToast?.("Это упражнение уже добавлено", "info");
      return;
    }

    setSelectedExercises((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: exercise.name,
        exercise_id: exerciseId,
        user_exercise_id: userExerciseId,
        measure_units:
          exercise.measure_units ||
          exercise.measureUnits ||
          getExerciseMeasureUnits(exercise),
        sets_count: "",
        reps_count: getDefaultRepsForExercise(exercise),
        weight_kg: getDefaultWeightForExercise(exercise),
        duration_min: "",
      },
    ]);

    setExerciseSearch("");
    setIsExerciseSuggestOpen(false);
  }

  function selectExerciseSuggestion(exercise) {
    setExerciseSearch(exercise.name || "");
    setIsExerciseSuggestOpen(false);
  }

  function findExerciseByName(name) {
    const normalizedName = String(name || "").trim().toLowerCase();

    if (!normalizedName) {
      return null;
    }

    return (
      availableExercises.find(
        (exercise) =>
          String(exercise.name || "").trim().toLowerCase() === normalizedName
      ) || null
    );
  }

  const typedExerciseName = exerciseSearch.trim();
  const typedExistingExercise = findExerciseByName(typedExerciseName);
  const isCustomExercisePremiumLocked =
    !isPremiumUser && Boolean(typedExerciseName) && !typedExistingExercise;

  function addTypedExercise() {
    const exerciseName = exerciseSearch.trim();

    if (!exerciseName) {
      return;
    }

    const existingExercise = findExerciseByName(exerciseName);

    if (existingExercise) {
      addExerciseFromBase(existingExercise);
      return;
    }

    if (!isPremiumUser) {
      onOpenPremium?.();
      return;
    }

    const alreadyAdded = selectedExercises.some(
      (exercise) =>
        exercise.name.trim().toLowerCase() === exerciseName.toLowerCase()
    );

    if (alreadyAdded) {
      setExerciseSearch("");
      showToast?.("Это упражнение уже добавлено", "info");
      return;
    }

    setSelectedExercises((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: exerciseName,
        exercise_id: null,
        user_exercise_id: null,
        measure_units: getExerciseMeasureUnits({ name: exerciseName }),
        sets_count: "",
        reps_count: "",
        weight_kg: "",
        duration_min: "",
      },
    ]);

    setExerciseSearch("");
    setIsExerciseSuggestOpen(false);
  }

  function removeExercise(id) {
    setSelectedExercises((current) =>
      current.filter((exercise) => exercise.id !== id)
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    if (step !== 2) {
      return;
    }

    if (selectedExercises.length === 0) {
      showToast?.("Добавьте хотя бы одно упражнение", "error");
      return;
    }

    onSave({
      title: title.trim(),
      description: "",
      priority: "medium",
      muscle_groups: selectedMuscles,
      repeat_days: [],
      exercises: selectedExercises.map((exercise) => ({
        name: exercise.name,
        exercise_id: exercise.exercise_id,
        user_exercise_id: exercise.user_exercise_id,
        sets_count:
          exercise.sets_count === "" ||
          exercise.sets_count === null ||
          exercise.sets_count === undefined
            ? 0
            : Number(exercise.sets_count),
        reps_count:
          exercise.reps_count === "" ||
          exercise.reps_count === null ||
          exercise.reps_count === undefined
            ? null
            : Number(exercise.reps_count),
        weight_kg:
          exercise.weight_kg === "" ||
          exercise.weight_kg === null ||
          exercise.weight_kg === undefined
            ? null
            : Number(exercise.weight_kg),
      })),
    });
  }

  return (
    <div className="modal-backdrop">
      <form className="simple-modal my-workout-modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <div>
            <h2>
              {step === 1
                ? initialData
                  ? "Изменить тренировку"
                  : "Новая тренировка"
                : "Упражнения"}
            </h2>
            <p>Шаг {step} из 2</p>
          </div>

          <div className="modal-header-actions">
            {step === 2 && (
              <button
                type="button"
                className="modal-back-icon-btn"
                onClick={() => setStep(1)}
                title="Назад"
                aria-label="Назад"
              >
                <BackArrowIcon />
              </button>
            )}

            {step === 1 ? (
              <button
                type="button"
                className="modal-next-icon-btn"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  goNext();
                }}
                title="Далее"
                aria-label="Далее"
              >
                <NextArrowIcon />
              </button>
            ) : (
              <button
                type="submit"
                className="modal-save-icon-btn"
                title="Сохранить тренировку"
                aria-label="Сохранить тренировку"
              >
                <SaveCheckIcon />
              </button>
            )}

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

        {step === 1 && (
          <>
            <label className="field">
              <span>Название тренировки</span>

              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Например: Спина и бицепс"
                autoFocus
              />
            </label>

            <div className="field">
              <span>Группы мышц</span>

              <div className="my-workout-muscle-grid pretty">
                {muscleGroups.map((muscle) => {
                  const isSelected = selectedMuscles.includes(muscle.name);

                  return (
                    <button
                      type="button"
                      key={muscle.id}
                      className={
                        isSelected
                          ? "my-workout-muscle-chip active"
                          : "my-workout-muscle-chip"
                      }
                      onClick={() => toggleMuscle(muscle.name)}
                    >
                      <span className="my-workout-muscle-chip-dot">
                        {isSelected ? <SaveCheckIcon /> : ""}
                      </span>

                      <span>{muscle.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="my-workout-add-exercise">
              <label className="field">
                <span>Упражнение</span>

                <input
                  value={exerciseSearch}
                  onChange={(event) => {
                    setExerciseSearch(event.target.value);
                    setIsExerciseSuggestOpen(true);
                  }}
                  onFocus={() => setIsExerciseSuggestOpen(true)}
                  placeholder="Начните вводить упражнение..."
                  autoComplete="off"
                />
              </label>

              <button
                type="button"
                className={
                  isCustomExercisePremiumLocked
                    ? "subtask-add-minimal-btn my-workout-add-btn premium-locked"
                    : "subtask-add-minimal-btn my-workout-add-btn"
                }
                onClick={addTypedExercise}
              >
                + Упражнение
              </button>

              {isExerciseSuggestOpen && filteredExercises.length > 0 && (
                <div className="my-workout-exercise-suggest">
                  {filteredExercises.map((exercise) => (
                    <button
                      type="button"
                      key={`${exercise.is_custom ? "custom" : "base"}-${exercise.id}`}
                      onClick={() => selectExerciseSuggestion(exercise)}
                    >
                      <strong>{exercise.name}</strong>
                      <span>
                        {exercise.group_name ||
                          exercise.muscle ||
                          exercise.muscle_group ||
                          exercise.groupName ||
                          "Без группы"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="my-workout-selected-list">
              {selectedExercises.length === 0 ? (
                <p>Пока упражнения не добавлены.</p>
              ) : (
                selectedExercises.map((exercise, index) => {
                  const units = getExerciseMeasureUnits(exercise);

                  return (
                    <div className="my-workout-selected-item detailed" key={exercise.id}>
                      <div className="my-workout-selected-main">
                        <strong>
                          {index + 1}. {exercise.name}
                        </strong>

                        <div className="my-workout-selected-fields">
                          <label>
                            <span>Подходы</span>
                            <input
                              type="number"
                              min="0"
                              value={exercise.sets_count}
                              onChange={(event) =>
                                updateSelectedExerciseField(
                                  exercise.id,
                                  "sets_count",
                                  event.target.value
                                )
                              }
                              placeholder="0"
                            />
                          </label>

                          {units.includes("kg") && (
                            <label>
                              <span>Вес</span>
                              <div className="my-workout-weight-input">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={exercise.weight_kg}
                                  onChange={(event) =>
                                    updateSelectedExerciseField(
                                      exercise.id,
                                      "weight_kg",
                                      event.target.value
                                    )
                                  }
                                  placeholder="0"
                                />
                                <small>кг</small>
                              </div>
                            </label>
                          )}

                          {units.includes("reps") && (
                            <label>
                              <span>Повторы</span>
                              <div className="my-workout-weight-input">
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={exercise.reps_count}
                                  onChange={(event) =>
                                    updateSelectedExerciseField(
                                      exercise.id,
                                      "reps_count",
                                      event.target.value
                                    )
                                  }
                                  placeholder="0"
                                />
                                <small>раз</small>
                              </div>
                            </label>
                          )}

                          {units.includes("min") && (
                            <label>
                              <span>Время</span>
                              <div className="my-workout-weight-input">
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={exercise.duration_min || ""}
                                  onChange={(event) =>
                                    updateSelectedExerciseField(
                                      exercise.id,
                                      "duration_min",
                                      event.target.value
                                    )
                                  }
                                  placeholder="0"
                                />
                                <small>мин</small>
                              </div>
                            </label>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeExercise(exercise.id)}
                        title="Удалить упражнение"
                      >
                        ×
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </form>
    </div>
  );
}

export default MyWorkoutCreateModal;