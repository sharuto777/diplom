export const LIGHT_GROUP_COLORS = [
  "#FEE2E2",
  "#FFEDD5",
  "#FEF9C3",
  "#DCFCE7",
  "#E6F8FA",
];

export const DARK_GROUP_COLORS = [
  "#e11d48",
  "#f59e0b",
  "#10b981",
  "#6366f1",
  "#22d3ee",
];

const LEGACY_DARK_GROUP_COLORS = [
  "#be123c",
  "#d97706",
  "#059669",
  "#4f46e5",
  "#0891b2",
];

export function getGroupColors(theme = "light") {
  return theme === "dark" ? DARK_GROUP_COLORS : LIGHT_GROUP_COLORS;
}

export function getDefaultGroupColor(theme = "light") {
  const colors = getGroupColors(theme);
  return colors[colors.length - 1];
}

export function getGroupColorIndex(color) {
  if (!color) {
    return LIGHT_GROUP_COLORS.length - 1;
  }

  const normalized = String(color).toLowerCase();
  const lightIndex = LIGHT_GROUP_COLORS.findIndex(
    (item) => item.toLowerCase() === normalized
  );

  if (lightIndex >= 0) {
    return lightIndex;
  }

  const darkIndex = DARK_GROUP_COLORS.findIndex(
    (item) => item.toLowerCase() === normalized
  );

  if (darkIndex >= 0) {
    return darkIndex;
  }

  const legacyDarkIndex = LEGACY_DARK_GROUP_COLORS.findIndex(
    (item) => item.toLowerCase() === normalized
  );

  if (legacyDarkIndex >= 0) {
    return legacyDarkIndex;
  }

  return LIGHT_GROUP_COLORS.length - 1;
}

/** Сохраняем в БД всегда светлый канонический оттенок слота. */
export function canonicalGroupColor(color) {
  return LIGHT_GROUP_COLORS[getGroupColorIndex(color)];
}

/** Показываем оттенок слота под текущую тему. */
export function resolveGroupColor(color, theme = "light") {
  return getGroupColors(theme)[getGroupColorIndex(color)];
}

function mixGroupColor(tone, amount, base) {
  return `color-mix(in srgb, ${tone} ${amount}%, ${base})`;
}

/** Стили вкладок/пилюль группы с насыщенным фоном в тёмной теме. */
export function getGroupSurfaceStyles(color, theme = "light") {
  const tone = resolveGroupColor(color, theme);

  if (theme !== "dark") {
    return { "--group-color": tone };
  }

  return {
    "--group-color": tone,
    "--group-tab-bg": mixGroupColor(tone, 76, "#0f172a"),
    "--group-tab-bg-hover": mixGroupColor(tone, 84, "#0f172a"),
    "--group-tab-bg-active": mixGroupColor(tone, 80, "#1e293b"),
    "--group-tab-border": mixGroupColor(tone, 62, "#334155"),
    "--group-tab-text": mixGroupColor(tone, 32, "#f8fafc"),
  };
}

/** Стили метки группы на карточках задач. */
export function getGroupLabelStyles(color, theme = "light") {
  const tone = resolveGroupColor(color, theme);

  if (theme !== "dark") {
    return { "--task-group-color": tone };
  }

  return {
    "--task-group-color": tone,
    "--task-group-label-bg": mixGroupColor(tone, 70, "#0f172a"),
    "--task-group-label-text": mixGroupColor(tone, 36, "#f8fafc"),
  };
}

export function mapGroupColorToTheme(color, theme) {
  return resolveGroupColor(color, theme);
}

export function normalizeGroupColor(color) {
  return color ? canonicalGroupColor(color) : color;
}

export function normalizeGroup(group) {
  if (!group) {
    return group;
  }

  return {
    ...group,
    color: normalizeGroupColor(group.color),
  };
}