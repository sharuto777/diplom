export function getMinutesValue(time) {
  if (!time) {
    return "";
  }

  const parts = String(time).split(":");

  return String(Number(parts[0]) || 0);
}

export function getDefaultMeasureUnits(measureType) {
  if (measureType === "time_sets") {
    return ["min"];
  }

  if (measureType === "reps") {
    return ["reps"];
  }

  if (measureType === "weight") {
    return ["kg"];
  }

  return ["kg", "reps"];
}

export function getMeasureTypeFromUnits(units = []) {
  const safeUnits = Array.isArray(units)
    ? units.filter((unit) => unit !== "km")
    : [];

  if (
    safeUnits.includes("min") &&
    !safeUnits.includes("kg") &&
    !safeUnits.includes("reps")
  ) {
    return "time_sets";
  }

  return "weight_reps";
}

export function detectExerciseMeasureType(exerciseName) {
  const name = String(exerciseName || "").toLowerCase();

  const timeKeywords = ["планка", "вис", "удержание", "статик"];

  if (timeKeywords.some((keyword) => name.includes(keyword))) {
    return "time_sets";
  }

  return "weight_reps";
}

export function normalizeMeasureUnits(units = []) {
  const allowedUnits = ["kg", "min", "reps"];

  let preparedUnits = units;

  if (typeof preparedUnits === "string") {
    try {
      preparedUnits = JSON.parse(preparedUnits);
    } catch (error) {
      preparedUnits = preparedUnits
        .split(",")
        .map((unit) => unit.trim())
        .filter(Boolean);
    }
  }

  if (!Array.isArray(preparedUnits)) {
    return [];
  }

  return preparedUnits.filter((unit, index, array) => {
    return allowedUnits.includes(unit) && array.indexOf(unit) === index;
  });
}