export function normalizePriority(priority) {
  const value = String(priority || "").trim().toLowerCase();

  if (
    value === "high" ||
    value === "высокий" ||
    value === "высокий приоритет"
  ) {
    return "high";
  }

  if (
    value === "low" ||
    value === "низкий" ||
    value === "низкий приоритет"
  ) {
    return "low";
  }

  return "medium";
}

export function getPriorityLabel(priority) {
  const normalizedPriority = normalizePriority(priority);

  const labels = {
    low: "Низкий приоритет",
    medium: "Средний приоритет",
    high: "Высокий приоритет",
  };

  return labels[normalizedPriority];
}

export function getPrioritySymbols(priority) {
  const normalizedPriority = normalizePriority(priority);

  const symbols = {
    low: "!",
    medium: "!!",
    high: "!!!",
  };

  return symbols[normalizedPriority];
}

export function formatTaskDate(date) {
  if (!date) {
    return "Без даты";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Без даты";
  }

  return parsedDate.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
  });
}

export function isTaskCompleted(task) {
  return (
    task?.status === "completed" ||
    task?.is_completed === true ||
    task?.isCompleted === true
  );
}

export function getTaskDate(task) {
  return (
    task?.start_datetime ||
    task?.startDatetime ||
    task?.rawDate ||
    task?.date ||
    null
  );
}

export function getTaskGroupId(task) {
  return task?.group_id || task?.groupId || null;
}