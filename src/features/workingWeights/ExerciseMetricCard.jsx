import React from "react";

function ExerciseMetricCard({
  item,
  availableExercises,
  isOpen,
  onToggle,
  onSave,
}) {
  const metric = item.metric;

  const exercise = availableExercises.find(
  (exerciseItem) =>
    String(exerciseItem.id) === String(item.sourceExerciseId || item.exerciseId)
);

  const measureType =
    metric?.measureType ||
    exercise?.measure_type ||
    exercise?.measureType ||
    detectExerciseMeasureType(item.exerciseName);

  const measureUnits =
    exercise?.measure_units ||
    exercise?.measureUnits ||
    getDefaultMeasureUnits(measureType);

  const [weight, setWeight] = useState(metric?.weight ?? "");
  const [distance, setDistance] = useState(metric?.distance ?? "");
  const [minutes, setMinutes] = useState(getMinutesValue(metric?.time));
  const [reps, setReps] = useState(metric?.reps ?? "");

  useEffect(() => {
    setWeight(metric?.weight ?? "");
    setDistance(metric?.distance ?? "");
    setMinutes(getMinutesValue(metric?.time));
    setReps(metric?.reps ?? "");
  }, [metric?.weight, metric?.distance, metric?.time, metric?.reps]);

  function getVisibleValue() {
    if (!metric) {
      return "—";
    }

    const values = [];

    if (measureUnits.includes("kg") && metric.weight) {
      values.push(`${metric.weight} кг`);
    }

    if (measureUnits.includes("km") && metric.distance) {
      values.push(`${metric.distance} км`);
    }

    if (measureUnits.includes("min") && metric.time) {
      values.push(`${getMinutesValue(metric.time)} мин`);
    }

    if (measureUnits.includes("reps") && metric.reps) {
      values.push(`${metric.reps} повт.`);
    }

    return values.length > 0 ? values.join(" · ") : "—";
  }

  function handleSave(event) {
    event.stopPropagation();

    onSave(item, {
      weight: measureUnits.includes("kg") ? weight : undefined,
      distance: measureUnits.includes("km") ? distance : undefined,
      minutes: measureUnits.includes("min") ? minutes : undefined,
      reps: measureUnits.includes("reps") ? reps : undefined,
    });
  }

  return (
    <div className={isOpen ? "exercise-metric-card open" : "exercise-metric-card"}>
      <button
        type="button"
        className="exercise-metric-card-top"
        onClick={onToggle}
      >
        <span className="exercise-metric-name">{item.exerciseName}</span>

        <span className="exercise-metric-value">{getVisibleValue()}</span>
      </button>

      {isOpen && (
        <div className="exercise-metric-editor">
          {measureUnits.includes("kg") && (
            <label>
              <span>кг</span>

              <input
                type="number"
                min="0"
                max="999"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                placeholder="0"
              />
            </label>
          )}

          {measureUnits.includes("km") && (
  <div className="metric-stepper-row">
    <span className="metric-stepper-name">
      {exerciseName || "Дистанция"}
    </span>

    <div className="metric-stepper-control">
      <input
        type="number"
        min="0"
        step="0.1"
        value={distance}
        onChange={(event) => setDistance(event.target.value)}
        placeholder="0"
      />

      <span className="metric-stepper-unit">км</span>

      <div className="metric-stepper-buttons">
        <button
          type="button"
          onClick={() => changeNumberValue(setDistance, distance, 0.1)}
        >
          ↑
        </button>

        <button
          type="button"
          onClick={() => changeNumberValue(setDistance, distance, -0.1)}
        >
          ↓
        </button>
      </div>
    </div>
  </div>
)}

          {measureUnits.includes("min") && (
  <label className="field">
    <span>Время</span>

    <input
      type="text"
      value={time}
      onChange={(event) => setTime(event.target.value)}
      placeholder="25:00"
    />
  </label>
)}

          {measureUnits.includes("reps") && (
            <label>
              <span>повт.</span>

              <input
                type="number"
                min="0"
                max="999"
                value={reps}
                onChange={(event) => setReps(event.target.value)}
                placeholder="0"
              />
            </label>
          )}

          <button
            type="button"
            className="exercise-metric-save-btn icon-only"
            onClick={handleSave}
            title="Сохранить"
            aria-label="Сохранить"
          >
            <SaveCheckIcon />
          </button>
        </div>
      )}
    </div>
  );
}

export default ExerciseMetricCard;