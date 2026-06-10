export function formatPriority(priority) {
  const values = {
    low: "Низкий",
    medium: "Средний",
    high: "Высокий",
  };

  return values[priority] || priority;
}

export function formatStatus(status) {
  const values = {
    new: "Новая",
    in_progress: "В процессе",
    planned: "Запланирована",
    completed: "Выполнена",
    missed: "Пропущена",
    cancelled: "Отменена",
  };

  return values[status] || status;
}

export function formatDate(dateValue) {
  if (!dateValue) {
    return "Без срока";
  }

  const date = new Date(dateValue);

  const dateText = date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
  });

  const hours = date.getHours();
  const minutes = date.getMinutes();

  if ((hours === 0 && minutes === 0) || (hours === 12 && minutes === 0)) {
    return dateText;
  }

  const timeText = date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${dateText}, ${timeText}`;
}

export function formatTaskFromApi(task) {
  const repeatDays = task.repeat_days || [];

  return {
    id: task.id,
    title: task.title,
    description: task.description || "",
    subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
    category: task.category || "Личное",
    priority: formatPriority(task.priority),
    status: formatStatus(task.status),
    date:
      repeatDays.length > 0
        ? `${repeatDays.join(", ")}`
        : formatDate(task.start_datetime),
    rawDate: task.start_datetime,
    repeatDays,
    groupId: task.group_id,
    groupName: task.group_name,
    groupColor: task.group_color,
    muscle: task.muscle_group,
    exercises:
      task.exercises && task.exercises.length > 0
        ? task.exercises
        : null,
  };
}

export function getPriorityType(priority) {
  if (priority === "Высокий") {
    return "red";
  }

  if (priority === "Средний") {
    return "yellow";
  }

  return "blue";
}

export function getStatusType(status) {
  if (status === "Выполнена") {
    return "green";
  }

  if (status === "В процессе") {
    return "purple";
  }

  return "gray";
}