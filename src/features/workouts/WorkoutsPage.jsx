import React, { useEffect, useState } from "react";

import CreateExerciseModal from "../workingWeights/CreateExerciseModal";
import CreateExerciseGroupModal from "../workingWeights/CreateExerciseGroupModal";
import WorkingWeightModal from "../workingWeights/WorkingWeightModal";
import ExerciseGuideModal from "./ExerciseGuideModal";
import MyWorkoutCreateModal from "./MyWorkoutCreateModal";
import PageHeader from "../../components/common/PageHeader";

import {
  getMinutesValue,
  getDefaultMeasureUnits,
  getMeasureTypeFromUnits,
  detectExerciseMeasureType,
  normalizeMeasureUnits,
} from "../workingWeights/workingWeightUtils";

import { SaveCheckIcon } from "../../components/common/Icons";
import { API_URL } from "../../api/apiClient";

function WorkoutsPage({
  activeSectionFromMenu = "weights",
  tasks,
  setTasks,
  availableExercises,
  setAvailableExercises,
  openExerciseGuide,
  exerciseGuides = [],
  workingWeights,
  setWorkingWeights,
  exerciseGroups,
  setExerciseGroups,
  muscleGroups = [],
  onWorkoutCreated,
    showToast,
  isPremiumUser = false,
  onOpenPremium,
}) {
  const workouts = tasks.filter((task) => task.category === "Тренировка");
const [activeExerciseGroupId, setActiveExerciseGroupId] = useState("all");
useEffect(() => {
  if (activeExerciseGroupId === "all") {
    return;
  }

  const groupExists = exerciseGroups.some(
    (group) => String(group.id) === String(activeExerciseGroupId)
  );

  if (!groupExists) {
    setActiveExerciseGroupId("all");
  }
}, [exerciseGroups, activeExerciseGroupId]);
const [isExerciseGroupModalOpen, setIsExerciseGroupModalOpen] = useState(false);
  const activeSection = activeSectionFromMenu;
  const [isWorkingWeightModalOpen, setIsWorkingWeightModalOpen] =
    useState(false);
  const [editingWorkingWeight, setEditingWorkingWeight] = useState(null);
  const [activeMetricCardKey, setActiveMetricCardKey] = useState(null);
  const [isExerciseCreateModalOpen, setIsExerciseCreateModalOpen] =
  useState(false);
  const [exerciseMetricSearch, setExerciseMetricSearch] = useState("");
  const [guideSearch, setGuideSearch] = useState("");
const [selectedGuideExercise, setSelectedGuideExercise] = useState(null);
const [isMyWorkoutModalOpen, setIsMyWorkoutModalOpen] = useState(false);
const [editingMyWorkout, setEditingMyWorkout] = useState(null);
const [openedExerciseMenu, setOpenedExerciseMenu] = useState(null);
  const sections = [
    {
      id: "weights",
      title: "Мой рабочий вес",
      subtitle: "Вес, подходы и повторения для каждого упражнения",
      count: workingWeights.length,
      countText: "упражнений",
    },
    {
      id: "plans",
      title: "Мои тренировки",
      subtitle: "Запланированные тренировки и будущий режим выполнения",
      count: workouts.length,
      countText: "запланировано",
    },
    {
      id: "guides",
      title: "Гайды",
      subtitle: "Техника выполнения упражнений и частые ошибки",
      count: availableExercises.length,
      countText: "гайдов",
    },
  ];

  function getMetricCardKey(item) {
  return `${item.exerciseId || "custom"}-${item.id}`;
}

function normalizeMeasureUnits(units = []) {
  if (!Array.isArray(units)) {
    return [];
  }

  return units.filter((unit) => unit !== "km");
}

function getExerciseGuide(exercise) {
  return {
    technique:
      Array.isArray(exercise?.technique) && exercise.technique.length > 0
        ? exercise.technique
        : ["Для этого упражнения пока не заполнена техника выполнения."],

    combinations:
      Array.isArray(exercise?.combinations) && exercise.combinations.length > 0
        ? exercise.combinations
        : ["Для этого упражнения пока не указаны рекомендуемые сочетания."],

    tips:
      Array.isArray(exercise?.tips) && exercise.tips.length > 0
        ? exercise.tips
        : ["Для этого упражнения пока не добавлены советы."],
  };
}

function getGuideCombinations(muscleName) {
  const normalizedMuscle = String(muscleName || "").toLowerCase();

  if (normalizedMuscle.includes("спина")) {
    return [
      "Бицепс — хорошо дополняет тяговые движения.",
      "Задняя дельта — помогает развивать верх спины и осанку.",
      "Пресс — можно добавить в конце тренировки для стабилизации корпуса.",
    ];
  }

  if (normalizedMuscle.includes("груд")) {
    return [
      "Трицепс — активно участвует в жимовых упражнениях.",
      "Плечи — особенно передняя дельта, но не перегружайте её.",
      "Пресс — можно добавить коротким блоком в конце тренировки.",
    ];
  }

  if (normalizedMuscle.includes("ног")) {
    return [
      "Ягодицы — хорошо сочетаются с упражнениями на ноги.",
      "Пресс — помогает стабилизировать корпус в базовых движениях.",
      "Кардио — можно добавить лёгким завершением после силовой части.",
    ];
  }

  if (normalizedMuscle.includes("плеч")) {
    return [
      "Трицепс — подходит для жимового тренировочного дня.",
      "Грудь — можно сочетать, если тренировка построена вокруг жимов.",
      "Задняя дельта — помогает сбалансировать развитие плеч.",
    ];
  }

  if (normalizedMuscle.includes("бицеп")) {
    return [
      "Спина — классическое сочетание после тяговых упражнений.",
      "Предплечья — можно добавить в конце тренировки.",
      "Пресс — лёгкий дополнительный блок без перегруза рук.",
    ];
  }

  if (normalizedMuscle.includes("трицеп")) {
    return [
      "Грудь — трицепс хорошо работает после жимовых движений.",
      "Плечи — подходит для жимового дня.",
      "Пресс — можно добавить как завершающий блок.",
    ];
  }

  if (normalizedMuscle.includes("пресс")) {
    return [
      "Ноги — пресс помогает стабилизировать корпус.",
      "Спина — важно укреплять корпус сбалансированно.",
      "Кардио — хорошо сочетается с упражнениями на пресс.",
    ];
  }

  if (normalizedMuscle.includes("кардио")) {
    return [
      "Пресс — можно добавить коротким блоком после кардио.",
      "Ноги — подходит для развития выносливости.",
      "Растяжка — хорошее завершение кардиотренировки.",
    ];
  }

  return [
    "Сочетайте с упражнениями на соседние мышечные группы.",
    "Не ставьте подряд слишком похожие упражнения.",
    "Оставляйте время на восстановление целевой мышцы.",
  ];
}

function getFilteredGuideExercises() {
  const searchValue = guideSearch.trim().toLowerCase();

  return exerciseGuides.filter((exercise) => {
    const exerciseName = String(exercise.name || "").trim().toLowerCase();

    if (exerciseName === "жим" || exerciseName === "авава" || exerciseName === "фывафыва") {
      return false;
    }

    if (!searchValue) {
      return true;
    }

    return [
      exercise.name,
      exercise.description,
      exercise.group_name,
      exercise.equipment,
      exercise.difficulty,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(searchValue);
  });
}

function createExerciseGroup(groupData) {
  const token = localStorage.getItem("token");

  if (!token) {
    return;
  }

  fetch(`${API_URL}/exercise-groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(groupData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        showToast?.(data.error, "error");
        return;
      }

      setExerciseGroups((current) => [...current, data]);
      setActiveExerciseGroupId(data.id);
      setIsExerciseGroupModalOpen(false);
    })
    .catch((error) => {
      console.error("Ошибка создания группы упражнений:", error);
    });
}

function deleteExerciseGroup(groupId) {
  if (!groupId || groupId === "all") {
    showToast?.("Группу «Все» удалить нельзя", "error");
    return;
  }

  const confirmed = window.confirm(
    "Удалить группу вместе со всеми упражнениями внутри неё?"
  );

  if (!confirmed) {
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    showToast?.("Необходимо войти в аккаунт", "error");
    return;
  }

  fetch(`${API_URL}/exercise-groups/${groupId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        showToast?.(data.error, "error");
        return;
      }

      setExerciseGroups((current) =>
        current.filter((group) => String(group.id) !== String(groupId))
      );

      setAvailableExercises((current) =>
  current.filter((exercise) => String(exercise.group_id) !== String(groupId))
);

setWorkingWeights((current) =>
  current.filter((weightItem) => {
    const exercise = availableExercises.find(
      (exerciseItem) =>
        String(exerciseItem.id) ===
        String(weightItem.sourceExerciseId || weightItem.exerciseId)
    );

    return String(exercise?.group_id) !== String(groupId);
  })
);

      if (String(activeExerciseGroupId) === String(groupId)) {
        setActiveExerciseGroupId("all");
      }

      showToast?.("Группа удалена", "success");
    })
    .catch((error) => {
      console.error("Ошибка удаления группы упражнений:", error);
      showToast?.("Не удалось удалить группу", "error");
    });
}

  function handleCreateExerciseClick() {
    if (!isPremiumUser) {
      onOpenPremium?.();
      return;
    }

    setIsExerciseCreateModalOpen(true);
  }

  function createCustomExercise(exerciseData) {
  const token = localStorage.getItem("token");

  if (!token) {
    return;
  }

  if (!isPremiumUser) {
    onOpenPremium?.();
    return;
  }

  const preparedExerciseData = {
    ...exerciseData,
    measureType:
      exerciseData.measureType ||
      exerciseData.measure_type ||
      getMeasureTypeFromUnits(exerciseData.measureUnits || exerciseData.measure_units),
    measure_type:
      exerciseData.measure_type ||
      exerciseData.measureType ||
      getMeasureTypeFromUnits(exerciseData.measureUnits || exerciseData.measure_units),
    measureUnits: normalizeMeasureUnits(
      exerciseData.measureUnits || exerciseData.measure_units
    ),
    measure_units: normalizeMeasureUnits(
      exerciseData.measure_units || exerciseData.measureUnits
    ),
    groupId: exerciseData.groupId || exerciseData.group_id || null,
    group_id: exerciseData.group_id || exerciseData.groupId || null,
  };

  fetch(`${API_URL}/exercises`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(preparedExerciseData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        showToast?.(data.error, "error");
        return;
      }

      if (typeof setAvailableExercises === "function") {
        const normalizedUnits = normalizeMeasureUnits(
          data.measure_units ||
            data.measureUnits ||
            preparedExerciseData.measure_units ||
            preparedExerciseData.measureUnits
        );

        const normalizedType =
          data.measure_type ||
          data.measureType ||
          preparedExerciseData.measure_type ||
          preparedExerciseData.measureType ||
          getMeasureTypeFromUnits(normalizedUnits);

        const normalizedExercise = {
          ...data,
          is_custom:
            data.is_custom === undefined ? true : Boolean(data.is_custom),
          measure_type: normalizedType,
          measureType: normalizedType,
          measure_units: normalizedUnits,
          measureUnits: normalizedUnits,
          group_id:
            data.group_id ||
            data.groupId ||
            preparedExerciseData.group_id ||
            preparedExerciseData.groupId ||
            null,
          groupId:
            data.groupId ||
            data.group_id ||
            preparedExerciseData.groupId ||
            preparedExerciseData.group_id ||
            null,
        };

        setAvailableExercises((current) => [...current, normalizedExercise]);
      }

      setIsExerciseCreateModalOpen(false);
    })
    .catch((error) => {
      console.error("Ошибка создания упражнения:", error);
    });
}
function getMetricRowValue(item) {
  const metric = item.metric;

  if (!metric) {
    return "—";
  }

  const exercise = availableExercises.find(
    (exerciseItem) =>
      String(exerciseItem.id) === String(item.sourceExerciseId || item.exerciseId)
  );

  const measureType =
    metric?.measureType ||
    item.measureType ||
    exercise?.measure_type ||
    exercise?.measureType ||
    detectExerciseMeasureType(item.exerciseName);

  const measureUnits = normalizeMeasureUnits(
    exercise?.measure_units ||
      exercise?.measureUnits ||
      item.measureUnits ||
      getDefaultMeasureUnits(measureType)
  );

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

 function formatWorkingWeightValue(item) {
  if (!item) {
    return "не заполнено";
  }

  if (item.measureType === "distance_time") {
    if (item.distance && item.time) {
      return `${item.distance} км / ${item.time}`;
    }

    if (item.time) {
      return item.time;
    }

    if (item.distance) {
      return `${item.distance} км`;
    }

    return "не заполнено";
  }

  if (item.measureType === "time_sets") {
    if (item.time) {
      return item.time;
    }

    return "не заполнено";
  }

  if (item.weight) {
    return `${item.weight} кг`;
  }

  return "не заполнено";
}

const filteredAvailableExercises =
  activeExerciseGroupId === "all"
    ? availableExercises
    : availableExercises.filter(
        (exercise) => String(exercise.group_id) === String(activeExerciseGroupId)
      );

function getGroupedExerciseMetrics() {
  const searchValue = exerciseMetricSearch.trim().toLowerCase();

  const orderedItems = getOrderedExerciseMetrics()
    .filter(Boolean)
    .filter((item) => {
      if (!searchValue) {
        return true;
      }

      return String(item.exerciseName || "")
        .toLowerCase()
        .includes(searchValue);
    });

  const groupOrder = [
    "Спина",
    "Грудь",
    "Ноги",
    "Плечи",
    "Бицепс",
    "Трицепс",
    "Пресс",
    "Ягодицы",
    "Кардио",
    "Без группы",
  ];

  const groupsMap = {};

  orderedItems.forEach((item) => {
    const exercise = availableExercises.find(
      (exerciseItem) =>
        String(exerciseItem.id) === String(item.sourceExerciseId || item.exerciseId)
    );

    const groupName =
      exercise?.group_name ||
      exercise?.muscle ||
      exercise?.muscle_group ||
      "Без группы";

    if (!groupsMap[groupName]) {
      groupsMap[groupName] = [];
    }

    groupsMap[groupName].push(item);
  });

  const sortedGroups = Object.keys(groupsMap).sort((firstGroup, secondGroup) => {
    const firstIndex = groupOrder.indexOf(firstGroup);
    const secondIndex = groupOrder.indexOf(secondGroup);

    if (firstIndex === -1 && secondIndex === -1) {
      return firstGroup.localeCompare(secondGroup);
    }

    if (firstIndex === -1) return 1;
    if (secondIndex === -1) return -1;

    return firstIndex - secondIndex;
  });

  return sortedGroups.map((groupName) => ({
    name: groupName,
    items: groupsMap[groupName],
  }));
}

function getOrderedExerciseMetrics() {
  const filteredAvailableExercises =
    activeExerciseGroupId === "all"
      ? availableExercises
      : availableExercises.filter((exercise) => {
          const exerciseGroupId = exercise.group_id || exercise.groupId;

          return String(exerciseGroupId) === String(activeExerciseGroupId);
        });

  return filteredAvailableExercises.map((exercise) => {
    const isCustomExercise = Boolean(exercise.is_custom || exercise.isCustom);
    const exerciseName = String(exercise.name || exercise.exerciseName || "");

    const metric = workingWeights.find((weightItem) => {
      const metricExerciseId =
        weightItem.exerciseId ||
        weightItem.exercise_id ||
        weightItem.sourceExerciseId;

      const metricName = String(
        weightItem.exerciseName || weightItem.exercise_name || ""
      )
        .trim()
        .toLowerCase();

      if (!isCustomExercise && metricExerciseId) {
        return String(metricExerciseId) === String(exercise.id);
      }

      return metricName === exerciseName.trim().toLowerCase();
    });

    const exerciseMeasureUnits = normalizeMeasureUnits(
      exercise.measure_units || exercise.measureUnits
    );

    const fallbackMeasureType =
      exercise.measure_type ||
      exercise.measureType ||
      metric?.measureType ||
      metric?.measure_type ||
      detectExerciseMeasureType(exerciseName);

    const finalMeasureUnits =
      exerciseMeasureUnits.length > 0
        ? exerciseMeasureUnits
        : getDefaultMeasureUnits(fallbackMeasureType);

    const finalMeasureType = getMeasureTypeFromUnits(finalMeasureUnits);

    return {
      id: exercise.id,
      sourceExerciseId: exercise.id,
      exerciseId: isCustomExercise ? null : exercise.id,
      exerciseName,
      measureType: finalMeasureType,
      measureUnits: finalMeasureUnits,
      metric,
      isCustom: isCustomExercise,
    };
  });
}

function openExerciseMetric(item) {
  setEditingWorkingWeight({
    ...(item.metric || {}),
    exerciseId: item.exerciseId,
    sourceExerciseId: item.sourceExerciseId,
    exerciseName: item.exerciseName,
    measureType: item.measureType,
    measureUnits: item.measureUnits,
  });

  setIsWorkingWeightModalOpen(true);
}

function openGuideFromWorkingWeight(item) {
  setOpenedExerciseMenu(null);

  const normalizedItemName = String(item.exerciseName || "")
    .trim()
    .toLowerCase();

  const guideExercise = exerciseGuides.find((exercise) => {
    const normalizedGuideName = String(exercise.name || "")
      .trim()
      .toLowerCase();

    return normalizedGuideName === normalizedItemName;
  });

  if (guideExercise) {
    setSelectedGuideExercise(guideExercise);
    return;
  }

  const availableExercise = availableExercises.find((exercise) => {
    const normalizedExerciseName = String(exercise.name || "")
      .trim()
      .toLowerCase();

    return normalizedExerciseName === normalizedItemName;
  });

  if (availableExercise) {
    setSelectedGuideExercise(availableExercise);
    return;
  }

  showToast?.("Гайд для этого упражнения не найден", "error");
}

  function openAddWorkingWeightModal() {
    setEditingWorkingWeight(null);
    setIsWorkingWeightModalOpen(true);
  }

  function openEditWorkingWeightModal(item) {
    setEditingWorkingWeight(item);
    setIsWorkingWeightModalOpen(true);
  }

  function closeWorkingWeightModal() {
    setEditingWorkingWeight(null);
    setIsWorkingWeightModalOpen(false);
  }

  function saveWorkingWeight(newItem) {
  const token = localStorage.getItem("token");

  if (!token) {
    showToast?.("Необходимо войти в аккаунт", "error");
    return;
  }

  const isEditing = Boolean(newItem.id && editingWorkingWeight);

  fetch(
    isEditing
      ? `${API_URL}/exercise-metrics/${newItem.id}`
      : `${API_URL}/exercise-metrics`,
    {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newItem),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        showToast?.(data.error, "error");
        return;
      }

      setWorkingWeights((current) => {
        const exists = current.some((item) => item.id === data.id);

        if (exists) {
          return current.map((item) => (item.id === data.id ? data : item));
        }

        return [data, ...current];
      });

      closeWorkingWeightModal();
    })
    .catch((error) => {
      console.error("Ошибка сохранения рабочего показателя:", error);
      alert("Не удалось сохранить показатель");
    });
}

function saveInlineWorkingWeight(item, values) {
  const token = localStorage.getItem("token");

  if (!token) {
    return;
  }

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

  const payload = {
  ...(metric?.id ? { id: metric.id } : {}),
  exerciseId: item.isCustom ? null : item.exerciseId,
  exerciseName: item.exerciseName,
  measureType,
};

  if (measureType === "distance_time") {
    payload.distance =
      values.distance === "" || values.distance === undefined
        ? null
        : normalizeMetricValue(values.distance)

    const normalizedMinutes = normalizeMetricValue(values.minutes);

payload.time = normalizedMinutes ? `${normalizedMinutes}:00` : "";
  } else if (measureType === "time_sets") {
    const normalizedMinutes = normalizeMetricValue(values.minutes);

payload.time = normalizedMinutes ? `${normalizedMinutes}:00` : "";
  } else {
  payload.weight = normalizeMetricValue(values.weight);
  payload.reps = normalizeMetricValue(values.reps);
}

  const isEditing = Boolean(metric?.id);

  fetch(
    isEditing
      ? `${API_URL}/exercise-metrics/${metric.id}`
      : `${API_URL}/exercise-metrics`,
    {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error(data.error);
        return;
      }

      setWorkingWeights((current) => {
        const exists = current.some((weightItem) => weightItem.id === data.id);

        if (exists) {
          return current.map((weightItem) =>
            weightItem.id === data.id ? data : weightItem
          );
        }

        return [data, ...current];
      });
    })
    .catch((error) => {
      console.error("Ошибка сохранения показателя:", error);
    });
}

function normalizeMetricValue(value) {
  if (value === "" || value === undefined || value === null) {
    return null;
  }

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return null;
  }

  return Math.min(999, Math.max(0, numberValue));
}

function deleteWorkingWeight(id) {
  const token = localStorage.getItem("token");

  if (!token) {
    showToast?.("Необходимо войти в аккаунт", "error");
    return;
  }

  fetch(`${API_URL}/exercise-metrics/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        showToast?.(data.error, "error");
        return;
      }

      setWorkingWeights((current) => current.filter((item) => item.id !== id));
      closeWorkingWeightModal();
    })
    .catch((error) => {
      console.error("Ошибка удаления рабочего показателя:", error);
      alert("Не удалось удалить показатель");
    });
}

function deleteCustomExercise(exercise) {
  const token = localStorage.getItem("token");

  if (!token) {
    showToast?.("Необходимо войти в аккаунт", "error");
    return;
  }

  if (!exercise?.isCustom) {
    showToast?.("Можно удалять только свои упражнения", "error");
    return;
  }

  const confirmed = window.confirm(
    `Удалить упражнение "${exercise.exerciseName}"?`
  );

  if (!confirmed) {
    return;
  }

  fetch(`${API_URL}/user-exercises/${exercise.sourceExerciseId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        showToast?.(data.error, "error");
        return;
      }

      setAvailableExercises((current) =>
        current.filter(
          (exerciseItem) =>
            !(
              exerciseItem.is_custom &&
              String(exerciseItem.id) === String(exercise.sourceExerciseId)
            )
        )
      );

      setWorkingWeights((current) =>
        current.filter(
          (weightItem) =>
            !(
              !weightItem.exerciseId &&
              weightItem.exerciseName === exercise.exerciseName
            )
        )
      );

      showToast?.("Упражнение удалено", "success");
    })
    .catch((error) => {
      console.error("Ошибка удаления упражнения:", error);
      showToast?.("Не удалось удалить упражнение", "error");
    });
}

function toggleWorkoutExercise(workoutExerciseId) {
  if (!workoutExerciseId) {
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    showToast?.("Необходимо войти в аккаунт", "error");
    return;
  }

  setTasks((currentTasks) =>
    currentTasks.map((task) => {
      if (task.category !== "Тренировка" || !Array.isArray(task.exercises)) {
        return task;
      }

      const updatedExercises = task.exercises.map((exercise) => {
        if (String(exercise.workout_exercise_id) !== String(workoutExerciseId)) {
          return exercise;
        }

        return {
          ...exercise,
          is_completed: !Boolean(exercise.is_completed),
        };
      });

      const wasChanged = updatedExercises.some((exercise, index) => {
        return exercise.is_completed !== task.exercises[index].is_completed;
      });

      if (!wasChanged) {
        return task;
      }

      const allCompleted =
        updatedExercises.length > 0 &&
        updatedExercises.every((exercise) => exercise.is_completed);

      const hasCompleted = updatedExercises.some(
        (exercise) => exercise.is_completed
      );

      return {
        ...task,
        exercises: updatedExercises,
        status: allCompleted
          ? "Выполнена"
          : hasCompleted
            ? "В процессе"
            : "Запланирована",
      };
    })
  );

  fetch(`${API_URL}/workout-exercises/${workoutExerciseId}/complete`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        showToast?.(data.error, "error");

        if (typeof onWorkoutCreated === "function") {
          onWorkoutCreated();
        }
      }
    })
    .catch((error) => {
      console.error("Ошибка выполнения упражнения:", error);
      alert("Не удалось обновить упражнение");

      if (typeof onWorkoutCreated === "function") {
        onWorkoutCreated();
      }
    });
}

function deleteMyWorkout(workoutId) {
  const confirmed = window.confirm("Удалить тренировку?");

  if (!confirmed) {
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    showToast?.("Необходимо войти в аккаунт", "error");
    return;
  }

  fetch(`${API_URL}/workouts/${workoutId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        showToast?.(data.error, "error");
        return;
      }

      if (typeof onWorkoutCreated === "function") {
        onWorkoutCreated();
      }
    })
    .catch((error) => {
      console.error("Ошибка удаления тренировки:", error);
      showToast?.("Не удалось удалить тренировку", "error");
    });
    showToast?.("Тренировка удалена", "success");
}



  function saveMyWorkout(workoutData) {
  const token = localStorage.getItem("token");

  if (!token) {
  showToast?.("Необходимо войти в аккаунт", "error");
  return;
}

  const isEditing = Boolean(editingMyWorkout?.id);

  fetch(
    isEditing
      ? `${API_URL}/workouts/${editingMyWorkout.id}`
      : `${API_URL}/workouts`,
    {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(workoutData),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
  showToast?.(data.error, "error");
  return;
}

      setIsMyWorkoutModalOpen(false);
      setEditingMyWorkout(null);

      showToast?.(
  isEditing ? "Тренировка обновлена" : "Тренировка создана",
  "success"
      );

      if (typeof onWorkoutCreated === "function") {
        onWorkoutCreated();
      }

      if (typeof setAvailableExercises === "function") {
        loadUserExercisesForWorkout(setAvailableExercises);
      }
    })
    .catch((error) => {
      console.error("Ошибка сохранения тренировки:", error);
      showToast?.("Не удалось сохранить тренировку", "error");
    });
}

function loadUserExercisesForWorkout(setAvailableExercises) {
  const token = localStorage.getItem("token");

  if (!token) {
    return;
  }

  fetch(`${API_URL}/user-exercises`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (!Array.isArray(data)) {
        return;
      }

      setAvailableExercises((current) => {
        const baseExercises = current.filter((exercise) => !exercise.is_custom);

        return [...baseExercises, ...data];
      });
    })
    .catch((error) => {
      console.error("Ошибка обновления пользовательских упражнений:", error);
    });
}

  return (
    <section>
      <PageHeader
  title={
    activeSection === "weights"
      ? "Рабочие веса"
      : activeSection === "guides"
        ? "Гайды"
        : "Моя тренировка"
  }
  subtitle={
    activeSection === "weights"
      ? "Сохраняйте рабочие показатели по упражнениям."
      : activeSection === "guides"
        ? "Изучайте технику выполнения упражнений."
        : "Планируйте свои тренировки и упражнения."
  }
/>

      <div className="training-page-clean">
        <div className="training-active-panel">
          {activeSection === "weights" && (
            <section className="training-panel-section">

             <div className="working-weights-layout">
  <aside className="exercise-groups-sidebar">
    <button
      type="button"
      className={
        activeExerciseGroupId === "all"
          ? "exercise-group-tab active"
          : "exercise-group-tab"
      }
      onClick={() => setActiveExerciseGroupId("all")}
    >
      Все
    </button>

    {exerciseGroups.map((group) => (
      <div
        key={group.id}
        className={
          String(activeExerciseGroupId) === String(group.id)
            ? "exercise-group-tab exercise-group-tab-with-delete active"
            : "exercise-group-tab exercise-group-tab-with-delete"
        }
        style={{
          "--group-color": group.color || "#E6F8FA",
        }}
      >
        <button
          type="button"
          className="exercise-group-name-btn"
          onClick={() => setActiveExerciseGroupId(group.id)}
          title={group.name}
        >
          {group.name}
        </button>

        <button
          type="button"
          className="exercise-group-delete-btn"
          onClick={(event) => {
            event.stopPropagation();
            deleteExerciseGroup(group.id);
          }}
          title="Удалить группу"
          aria-label="Удалить группу"
        >
          ×
        </button>
      </div>
    ))}

    <button
      type="button"
      className="exercise-group-add-btn"
      onClick={() => setIsExerciseGroupModalOpen(true)}
    >
      + Группа
    </button>
  </aside>

  <div className="working-weights-list-panel">
  <div className="working-weights-list-toolbar">
    <div className="working-weights-search">
      <svg viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="7" />
        <path d="M16.5 16.5L21 21" />
      </svg>

      <input
        type="text"
        value={exerciseMetricSearch}
        onChange={(event) => setExerciseMetricSearch(event.target.value)}
        placeholder="Поиск упражнения..."
      />
    </div>

    <button
      type="button"
      className={
        isPremiumUser
          ? "training-action-btn"
          : "training-action-btn premium-locked"
      }
      onClick={handleCreateExerciseClick}
    >
      + Упражнение
    </button>
  </div>

  <div className="working-weights-list-content">
    {getGroupedExerciseMetrics().length === 0 ? (
      <button
        type="button"
        className="working-weights-list-empty"
        onClick={handleCreateExerciseClick}
      >
        <strong>Упражнения не найдены</strong>
        <span>Создайте своё упражнение или измените поиск.</span>
      </button>
    ) : (
      getGroupedExerciseMetrics().map((group) => (
        <section key={group.name} className="working-weights-row-group">
          <h3>{group.name}</h3>

          <div className="working-weights-row-list">
            {group.items.map((item) => {
  const menuKey = getMetricCardKey(item);

  return (
    <div
      key={menuKey}
      className="working-weight-row"
      onClick={() => openExerciseMetric(item)}
      role="button"
      tabIndex={0}
    >
      <div className="working-weight-row-main">
        <strong>{item.exerciseName}</strong>
        <span>{group.name}</span>
      </div>

      <div className="working-weight-row-value">
        {getMetricRowValue(item)}
      </div>

      <div className="working-weight-row-menu-wrap">
        <button
          type="button"
          className="working-weight-row-menu-btn"
          onClick={(event) => {
            event.stopPropagation();
            setOpenedExerciseMenu((current) =>
              current === menuKey ? null : menuKey
            );
          }}
          aria-label="Открыть меню упражнения"
          title="Меню"
        >
          ⋯
        </button>

        {openedExerciseMenu === menuKey && (
          <div
            className="working-weight-row-menu"
            onClick={(event) => event.stopPropagation()}
          >
            <button
  type="button"
  onClick={() => openGuideFromWorkingWeight(item)}
>
  Гайд
</button>

            {item.isCustom && (
              <button
                type="button"
                className="danger"
                onClick={() => deleteCustomExercise(item)}
              >
                Удалить
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
})}
          </div>
        </section>
      ))
    )}
  </div>
</div>
</div>
            </section>
          )}

          {activeSection === "plans" && (
  <section className="my-workouts-section">
    <div className="my-workouts-toolbar">
      <button
        type="button"
        className="training-action-btn"
        onClick={() => setIsMyWorkoutModalOpen(true)}
      >
        + Тренировка
      </button>
    </div>

    {workouts.length === 0 ? (
      <button
        type="button"
        className="my-workouts-empty"
        onClick={() => setIsMyWorkoutModalOpen(true)}
      >
        <strong>Тренировок пока нет</strong>
        <span>Нажмите сюда, чтобы создать первую тренировку.</span>
      </button>
    ) : (
      <div className="my-workouts-grid">
        {workouts.map((workout) => (
          <article className="my-workout-card" key={workout.id}>
            <div>
  <h3>{workout.title}</h3>
  <p>{workout.muscle || "Без группы мышц"}</p>
</div>

<div className="my-workout-card-actions">
  <span>{workout.exercises?.length || 0} упр.</span>

  <button
    type="button"
    className="dots task-edit-icon-btn"
    onClick={() => {
      setEditingMyWorkout(workout);
      setIsMyWorkoutModalOpen(true);
    }}
    title="Изменить тренировку"
    aria-label="Изменить тренировку"
  >
    <svg viewBox="0 0 24 24">
      <path d="M4 20H8L18.5 9.5C19.3 8.7 19.3 7.4 18.5 6.6L17.4 5.5C16.6 4.7 15.3 4.7 14.5 5.5L4 16V20Z" />
      <path d="M13.5 6.5L17.5 10.5" />
    </svg>
  </button>

  <button
    type="button"
    className="dots delete-btn"
    onClick={() => deleteMyWorkout(workout.id)}
    title="Удалить тренировку"
    aria-label="Удалить тренировку"
  >
    ×
  </button>
</div>

            {Array.isArray(workout.exercises) && workout.exercises.length > 0 && (
              <div className="my-workout-exercises">
  {workout.exercises.map((exercise) => (
    <button
      type="button"
      className={
        exercise.is_completed
          ? "my-workout-exercise completed"
          : "my-workout-exercise"
      }
      key={exercise.workout_exercise_id || exercise.id || exercise.name}
      onClick={() => toggleWorkoutExercise(exercise.workout_exercise_id)}
    >
      <span className="my-workout-exercise-check">
        {exercise.is_completed && <SaveCheckIcon />}
      </span>

      <span className="my-workout-exercise-name">
        {exercise.name}
      </span>

<small>
  {Number(exercise.sets_count || 0)} подх.
  {exercise.weight_kg ? ` · ${exercise.weight_kg} кг` : ""}
  {exercise.reps_count ? ` · ${exercise.reps_count} повт.` : ""}
</small>
    </button>
  ))}
</div>
            )}
          </article>
        ))}
      </div>
    )}

    {isMyWorkoutModalOpen && (
      <MyWorkoutCreateModal
  muscleGroups={muscleGroups}
  availableExercises={availableExercises}
  workingWeights={workingWeights}
  initialData={editingMyWorkout}
  showToast={showToast}
  isPremiumUser={isPremiumUser}
  onOpenPremium={onOpenPremium}
  onClose={() => {
    setIsMyWorkoutModalOpen(false);
    setEditingMyWorkout(null);
  }}
  onSave={saveMyWorkout}
/>
    )}
  </section>
)}

          {activeSection === "guides" && (
  <section className="training-panel-section">
    <div className="guides-panel">
      <div className="guides-header">
        <div className="guides-search">
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" />
            <path d="M16.5 16.5L21 21" />
          </svg>

          <input
            type="text"
            value={guideSearch}
            onChange={(event) => setGuideSearch(event.target.value)}
            placeholder="Найти упражнение..."
          />
        </div>
      </div>

      {getFilteredGuideExercises().length === 0 ? (
        <div className="guides-empty">
          <strong>Упражнения не найдены</strong>
          <p>Попробуйте изменить поиск или добавьте упражнение в разделе рабочих весов.</p>
        </div>
      ) : (
        <div className="guides-grid">
          {getFilteredGuideExercises().map((exercise) => (
            <button
              key={`${exercise.is_custom ? "custom" : "base"}-${exercise.id}`}
              type="button"
              className="guide-card"
              onClick={() => setSelectedGuideExercise(exercise)}
            >
              <div className="guide-card-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M7 8V16" />
                  <path d="M17 8V16" />
                  <path d="M3 10V14" />
                  <path d="M21 10V14" />
                  <path d="M7 12H17" />
                </svg>
              </div>

              <div className="guide-card-content">
                <strong>{exercise.name}</strong>

                <p>
                  {exercise.description ||
                    "Краткий гайд по технике выполнения упражнения."}
                </p>

                <div className="guide-card-tags">
                  <span>
                    {exercise.group_name ||
                      exercise.muscle ||
                      exercise.muscle_group ||
                      "Без группы"}
                  </span>

                  <span>{exercise.difficulty || "Средняя"}</span>

                  {exercise.equipment && <span>{exercise.equipment}</span>}
                </div>
              </div>

              <div className="guide-card-arrow">
                <svg viewBox="0 0 24 24">
                  <path d="M9 6L15 12L9 18" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  </section>
)}
        </div>
        {isExerciseCreateModalOpen && (
  <CreateExerciseModal
    exerciseGroups={exerciseGroups}
  activeExerciseGroupId={activeExerciseGroupId}
  onClose={() => setIsExerciseCreateModalOpen(false)}
  onSave={createCustomExercise}
  />
)}
{isExerciseGroupModalOpen && (
  <CreateExerciseGroupModal
    onClose={() => setIsExerciseGroupModalOpen(false)}
    onSave={createExerciseGroup}
  />
)}

{selectedGuideExercise && (
  <ExerciseGuideModal
    exercise={selectedGuideExercise}
    guide={getExerciseGuide(selectedGuideExercise)}
    onClose={() => setSelectedGuideExercise(null)}
  />
)}
      </div>

      {isWorkingWeightModalOpen && (
        <WorkingWeightModal
          initialData={editingWorkingWeight}
          exercises={availableExercises}
          isPremiumUser={isPremiumUser}
          onOpenPremium={onOpenPremium}
          onClose={closeWorkingWeightModal}
          onSave={saveWorkingWeight}
          onDelete={deleteWorkingWeight}
        />
      )}
    </section>
  );
}

export default WorkoutsPage;