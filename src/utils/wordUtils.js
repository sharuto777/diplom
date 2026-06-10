export function getDaysLabel(value) {
  const number = Math.abs(Number(value || 0));
  const lastTwo = number % 100;
  const lastOne = number % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return "дней";
  }

  if (lastOne === 1) {
    return "день";
  }

  if (lastOne >= 2 && lastOne <= 4) {
    return "дня";
  }

  return "дней";
}