export const BASE_RANK_LEVELS = [
  { minDays: 1, title: "Новичок порядка" },
  { minDays: 2, title: "На серии" },
  { minDays: 7, title: "Стабильный" },
  { minDays: 25, title: "Системный" },
  { minDays: 50, title: "Железный режим" },
  { minDays: 75, title: "Несгибаемый" },
  { minDays: 100, title: "Педант" },
];

export const RANK_STAR_NOTE =
  "После 100 дней: каждые 25 дней — новая звезда (до 8★)";

export const ACTIVITY_RANK_LEVELS = [
  { minDays: 1, title: "Новичок порядка" },
  { minDays: 2, title: "На серии" },
  { minDays: 7, title: "Стабильный" },
  { minDays: 25, title: "Системный" },
  { minDays: 50, title: "Железный режим" },
  { minDays: 75, title: "Несгибаемый" },
  { minDays: 100, title: "Педант" },
  { minDays: 125, title: "Педант", starTier: 1 },
  { minDays: 150, title: "Педант", starTier: 2 },
  { minDays: 175, title: "Педант", starTier: 3 },
  { minDays: 200, title: "Педант", starTier: 4 },
  { minDays: 225, title: "Педант", starTier: 5 },
  { minDays: 250, title: "Педант", starTier: 6 },
  { minDays: 275, title: "Педант", starTier: 7 },
  { minDays: 300, title: "Педант", starTier: 8 },
];

export function getActivityRank(activeDays) {
  const days = Number(activeDays || 0);

  if (days >= 300) {
    return { title: "", subtitle: "300 дней активности", starTier: 8 };
  }

  if (days >= 275) {
    return { title: "", subtitle: "275 дней активности", starTier: 7 };
  }

  if (days >= 250) {
    return { title: "", subtitle: "250 дней активности", starTier: 6 };
  }

  if (days >= 225) {
    return { title: "", subtitle: "225 дней активности", starTier: 5 };
  }

  if (days >= 200) {
    return { title: "", subtitle: "200 дней активности", starTier: 4 };
  }

  if (days >= 175) {
    return { title: "", subtitle: "175 дней активности", starTier: 3 };
  }

  if (days >= 150) {
    return { title: "", subtitle: "150 дней активности", starTier: 2 };
  }

  if (days >= 125) {
    return { title: "", subtitle: "125 дней активности", starTier: 1 };
  }

  if (days >= 100) {
    return { title: "Педант", subtitle: "100 дней активности", starTier: 0 };
  }

  if (days >= 75) {
    return { title: "Несгибаемый", subtitle: "75 дней активности", starTier: 0 };
  }

  if (days >= 50) {
    return { title: "Железный режим", subtitle: "50 дней активности", starTier: 0 };
  }

  if (days >= 25) {
    return { title: "Системный", subtitle: "25 дней активности", starTier: 0 };
  }

  if (days >= 7) {
    return { title: "Стабильный", subtitle: "7 дней активности", starTier: 0 };
  }

  if (days >= 2) {
    return { title: "На серии", subtitle: "2 дня активности", starTier: 0 };
  }

  return {
    title: "Новичок порядка",
    subtitle: "Первый день активности",
    starTier: 0,
  };
}

export function formatRankLevelLabel(level) {
  if (!level.starTier) {
    return level.title;
  }

  const stars = "★".repeat(level.starTier);
  return `${level.title} ${stars}`;
}

export function formatCompactDaysLabel(minDays) {
  return minDays === 1 ? "1" : `${minDays}+`;
}

export function formatRankDaysLabel(minDays) {
  if (minDays === 1) {
    return "1 день";
  }

  if (minDays === 2) {
    return "от 2 дней";
  }

  const lastDigit = minDays % 10;
  const lastTwoDigits = minDays % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `от ${minDays} дней`;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `от ${minDays} дней`;
  }

  return `от ${minDays} дней`;
}

export function getRankDisplayTitle(rank) {
  if (rank?.title) {
    return rank.title;
  }

  if (Number(rank?.starTier) > 0) {
    return `Педант ${"★".repeat(rank.starTier)}`;
  }

  return "Новичок порядка";
}