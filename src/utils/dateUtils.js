export function capitalizeFirstLetter(value) {
  const text = String(value || "");

  if (!text) {
    return "";
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatDateRu(date) {
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
    year: "numeric",
  });
}

export function formatShortDateRu(date) {
  if (!date) {
    return "Без даты";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Без даты";
  }

  return parsedDate.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
  });
}

export function toDateInputValue(date) {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function isSameDate(firstDate, secondDate) {
  if (!firstDate || !secondDate) {
    return false;
  }

  return toDateInputValue(firstDate) === toDateInputValue(secondDate);
}