import React, { useState } from "react";
import { SaveCheckIcon } from "../../components/common/Icons";

function WorkoutModal({
  initialData,
  onClose,
  onSubmit,
  muscleGroups,
  availableExercises,
  compatibleGroups,
  isSaving,
}) {
  const weekDays = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

  const [title, setTitle] = useState(
  initialData?.title || "Тренировка"
  );

  const [selectedMuscles, setSelectedMuscles] = useState(
    initialData?.muscle_groups || []
  );

  const [selectedExercises, setSelectedExercises] = useState(
    initialData?.exercises || []
  );
  const [selectedDays, setSelectedDays] = useState([]);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const exercises = Array.isArray(availableExercises)
  ? availableExercises
  : [];

  const filteredExercises = exercises.filter((exercise) => {
  const name = String(exercise.name || "").toLowerCase();
  const muscle = exercise.muscle || exercise.muscle_group || "";

  const matchesSearch =
    exerciseSearch.trim() === "" ||
    name.includes(exerciseSearch.trim().toLowerCase());

  const matchesMuscle =
    selectedMuscles.length === 0 || selectedMuscles.includes(muscle);

  const notSelected = !selectedExercises.some(
    (selectedExercise) => selectedExercise.id === exercise.id
  );

  return matchesSearch && matchesMuscle && notSelected;
});

  function toggleMuscle(muscle) {
    setSelectedMuscles((currentMuscles) => {
      if (currentMuscles.includes(muscle)) {
        return currentMuscles.filter((item) => item !== muscle);
      }

      return [...currentMuscles, muscle];
    });
  }

  function toggleDay(day) {
    setSelectedDays((currentDays) => {
      if (currentDays.includes(day)) {
        return currentDays.filter((item) => item !== day);
      }

      return [...currentDays, day];
    });
  }

  function addExercise(exercise) {
  setSelectedExercises((currentExercises) => [
    ...currentExercises,
    {
      id: exercise.id,
      name: exercise.name,
      muscle: exercise.muscle || exercise.muscle_group || "Без группы",
    },
  ]);

  setExerciseSearch("");
}

  function removeExercise(exerciseName) {
    setSelectedExercises((currentExercises) =>
      currentExercises.filter((exercise) => exercise.name !== exerciseName)
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (selectedExercises.length === 0) {
      alert("Добавьте хотя бы одно упражнение.");
      return;
    }

    if (selectedDays.length === 0) {
      alert("Выберите хотя бы один день недели.");
      return;
    }

    onSubmit({
      title,
      description: "",
      priority: "medium",
      muscle_groups: selectedMuscles,
      repeat_days: selectedDays,
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
      <form className="simple-modal wide workout-builder" onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>Новая тренировка</h2>

          <div className="modal-header-actions">
            <button
              type="submit"
              className="modal-save-icon-btn"
              disabled={isSaving}
              title="Сохранить тренировку"
              aria-label="Сохранить тренировку"
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
          <span>Название тренировки</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Например: Тренировка спины и бицепса"
            required
          />
        </label>

        <div className="workout-section">
          <h3>Группы мышц</h3>

          <div className="chip-grid">
            {muscleGroups.map((muscle) => (
              <button
                type="button"
                key={muscle.id}
                className={
                  selectedMuscles.includes(muscle.name)
                    ? "choice-chip active"
                    : "choice-chip"
                }
                onClick={() => toggleMuscle(muscle.name)}
              >
                {muscle.name}
              </button>
            ))}
          </div>
        </div>

        <div className="workout-section">
          <h3>Упражнения</h3>

          <input
            className="exercise-search"
            value={exerciseSearch}
            onChange={(event) => setExerciseSearch(event.target.value)}
            placeholder="Начните вводить название упражнения..."
          />

          {(exerciseSearch || selectedMuscles.length > 0) && (
            <div className="exercise-dropdown">
              {filteredExercises.length === 0 ? (
                <div className="exercise-dropdown-empty">
                  Упражнения не найдены
                </div>
              ) : (
                filteredExercises.slice(0, 8).map((exercise) => (
                  <button
                    type="button"
                    key={`${exercise.id}-${exercise.name}`}
                    className="exercise-dropdown-item"
                    onClick={() => addExercise(exercise)}
                  >
                    <span>{exercise.name}</span>
                    <small>{exercise.muscle || exercise.muscle_group}</small>
                  </button>
                ))
              )}
            </div>
          )}

          <div className="selected-exercises">
            {selectedExercises.length === 0 ? (
              <div className="selected-empty">
                Пока упражнения не добавлены
              </div>
            ) : (
              selectedExercises.map((exercise, index) => (
                <div className="selected-exercise-item" key={exercise.name}>
                  <div>
                    <strong>{index + 1}. {exercise.name}</strong>
                    <span>{exercise.muscle}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeExercise(exercise.name)}
                    title="Убрать упражнение"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="workout-section">
          <h3>Повторять по дням</h3>

          <div className="weekday-grid">
            {weekDays.map((day) => (
              <button
                type="button"
                key={day}
                className={
                  selectedDays.includes(day)
                    ? "weekday-chip active"
                    : "weekday-chip"
                }
                onClick={() => toggleDay(day)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

      </form>
    </div>
  );
}

export default WorkoutModal;