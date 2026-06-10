import React, { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import { API_URL } from "../../api/apiClient";


function StatSvgIcon({ name }) {
  const icons = {
    target: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2V5" />
        <path d="M12 19V22" />
        <path d="M2 12H5" />
        <path d="M19 12H22" />
      </>
    ),

    checklist: (
      <>
        <path d="M9 6H20" />
        <path d="M9 12H20" />
        <path d="M9 18H20" />
        <path d="M4 6L5.3 7.3L7.5 4.8" />
        <path d="M4 12L5.3 13.3L7.5 10.8" />
        <path d="M4 18L5.3 19.3L7.5 16.8" />
      </>
    ),

    dumbbell: (
      <>
        <path d="M6 8V16" />
        <path d="M18 8V16" />
        <path d="M3.5 10V14" />
        <path d="M20.5 10V14" />
        <path d="M6 12H18" />
      </>
    ),

    flame: (
      <>
        <path d="M12 22C8.7 22 6 19.4 6 16.1C6 13.7 7.4 11.7 9.2 10.3C10.6 9.2 11.6 7.7 11.4 5.5C13.7 7 16 9.7 16 13C17 12.2 17.6 11.1 17.8 9.8C19.2 11.3 20 13.4 20 15.7C20 19.2 16.6 22 12 22Z" />
        <path d="M12 18.8C10.5 18.8 9.4 17.7 9.4 16.3C9.4 15.1 10.1 14.2 11.1 13.4C11.9 12.8 12.4 11.9 12.3 10.9C13.7 11.8 14.8 13.1 14.8 14.8C14.8 17 13.5 18.8 12 18.8Z" />
      </>
    ),

    weight: (
      <>
        <path d="M8 7H16" />
        <path d="M7 7L5.5 18H18.5L17 7" />
        <path d="M9 7C9 4.8 10.2 3.5 12 3.5C13.8 3.5 15 4.8 15 7" />
        <path d="M10 12H14" />
        <path d="M12 10V14" />
      </>
    ),

    trending: (
      <>
        <path d="M4 17L9 12L13 15L20 7" />
        <path d="M15 7H20V12" />
        <path d="M4 21H20" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {icons[name] || icons.target}
    </svg>
  );
}

function getActivityLevel(value) {
  const count = Number(value || 0);

  if (count >= 5) {
    return 4;
  }

  if (count >= 3) {
    return 3;
  }

  if (count >= 1) {
    return 2;
  }

  return 1;
}

function StatsBarRow({ label, value, caption, maxValue }) {
  const percent = maxValue === 0 ? 0 : Math.round((value / maxValue) * 100);

  return (
    <div className="stats-bar-row">
      <div className="stats-bar-row-top">
        <strong>{label}</strong>
        <span>{value}</span>
      </div>

      <div className="stats-bar-track">
        <div
          className="stats-bar-fill"
          style={{ width: `${Math.max(percent, 4)}%` }}
        />
      </div>

      <p>{caption}</p>
    </div>
  );
}

function StatsEmptyText({ text }) {
  return (
    <div className="stats-empty-text">
      <p>{text}</p>
    </div>
  );
}

function StatsMiniRow({ label, value }) {
  return (
    <div className="stats-mini-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getLocalStatsInsight(overview) {
  if (overview.totalTasks === 0) {
    return "Добавь задачи и тренировки, чтобы Sunday начал собирать твою статистику.";
  }

  if (overview.taskCompletionRate >= 80) {
    return `Отличный результат: выполнено ${overview.taskCompletionRate}% задач. Продолжай в том же темпе.`;
  }

  if (overview.taskCompletionRate >= 50) {
    return `Хорошая неделя: выполнено ${overview.taskCompletionRate}% задач. Можно усилить регулярность тренировок.`;
  }

  return "Неделя пока спокойная. Выбери 1–2 главные задачи и запланируй тренировку.";
}

function formatStatNumber(value) {
  const number = Number(value || 0);

  if (Number.isInteger(number)) {
    return String(number);
  }

  return number.toFixed(1);
}

function formatWeekDay(dateValue) {
  if (!dateValue) {
    return "";
  }

  return new Date(dateValue).toLocaleDateString("ru-RU", {
    weekday: "short",
  });
}

function formatShortDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  return new Date(dateValue).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatCompactNumber(value) {
  const number = Number(value || 0);

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}м`;
  }

  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}к`;
  }

  return formatStatNumber(number);
}

function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
      </div>

      <span className="stat-card-icon">
        <StatSvgIcon name={icon} />
      </span>
    </div>
  );
}

function buildLocalMuscleGroups(workoutTasks) {
  const map = {};

  workoutTasks.forEach((workout) => {
    const name = workout.muscle || "Без группы";

    if (!map[name]) {
      map[name] = {
        name,
        workoutsCount: 0,
        volume: 0,
      };
    }

    map[name].workoutsCount += 1;
  });

  return Object.values(map).slice(0, 6);
}

function buildLocalActivityMap(tasks) {
  const today = new Date();

  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - 29 + index);
    const dateKey = date.toISOString().slice(0, 10);

    const dayTasks = tasks.filter(
      (task) => task.rawDate && String(task.rawDate).startsWith(dateKey)
    );

    return {
      date: dateKey,
      totalItems: dayTasks.length,
      completedItems: dayTasks.filter((task) => task.status === "Выполнена").length,
    };
  });
}

function buildLocalWeekActivity(tasks) {
  const today = new Date();
  const monday = new Date(today);
  const day = monday.getDay() || 7;
  monday.setDate(today.getDate() - day + 1);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const dateKey = date.toISOString().slice(0, 10);

    const dayTasks = tasks.filter(
      (task) => task.rawDate && String(task.rawDate).startsWith(dateKey)
    );

    return {
      date: dateKey,
      tasksCount: dayTasks.filter((task) => task.category !== "Тренировка").length,
      completedTasksCount: dayTasks.filter(
        (task) => task.category !== "Тренировка" && task.status === "Выполнена"
      ).length,
      workoutsCount: dayTasks.filter((task) => task.category === "Тренировка").length,
      completedWorkoutsCount: dayTasks.filter(
        (task) => task.category === "Тренировка" && task.status === "Выполнена"
      ).length,
      volume: 0,
    };
  });
}

function StatsPage({ tasks, currentUser, isPremiumUser, onOpenPremium }) {
  const [statistics, setStatistics] = useState(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || currentUser?.is_guest || !isPremiumUser) {
      setStatistics(null);
      setIsStatsLoading(false);
      setStatsError("");
      return;
    }

    setIsStatsLoading(true);
    setStatsError("");

    fetch(`${API_URL}/statistics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }

        setStatistics(data);
      })
      .catch((error) => {
        console.error("Ошибка загрузки статистики:", error);
        setStatsError("Не удалось загрузить статистику");
      })
      .finally(() => {
        setIsStatsLoading(false);
      });
  }, [currentUser, isPremiumUser]);

  const regularTasks = tasks.filter((task) => task.category !== "Тренировка");
  const workoutTasks = tasks.filter((task) => task.category === "Тренировка");
  const localCompleted = regularTasks.filter(
    (task) => task.status === "Выполнена"
  ).length;
  const localTotal = regularTasks.length;
  const localPercent =
    localTotal === 0 ? 0 : Math.round((localCompleted / localTotal) * 100);

  const localCompletedWorkouts = workoutTasks.filter(
    (task) => task.status === "Выполнена"
  ).length;

  const overview = statistics?.overview || {
    completedTasks: localCompleted,
    totalTasks: localTotal,
    taskCompletionRate: localPercent,
    completedWorkouts: localCompletedWorkouts,
    activeDaysStreak: 0,
    trainingVolume: 0,
    bestProgress: null,
    weekDiffPercent: 0,
  };

  const weekActivity = statistics?.weekActivity || buildLocalWeekActivity(tasks);
  const activityMap = statistics?.activityMap || buildLocalActivityMap(tasks);
  const muscleGroups = statistics?.workouts?.byMuscleGroup || buildLocalMuscleGroups(workoutTasks);
  const progress = statistics?.progress || [];

  return (
    <section className="stats-page-premium-wrap">
      <PageHeader
        title="Статистика"
        subtitle="Прогресс задач, тренировок, активности и рабочих весов."
      />

      <div className="stats-premium-stage">
        {!isPremiumUser && (
          <div className="stats-premium-overlay" aria-hidden="false">
            <div className="stats-premium-lock-card">
              
              <span>Premium</span>

              <h2>Расширенная статистика доступна в Premium</h2>

              <p>
                Подключите Premium, чтобы видеть аналитику задач, тренировок,
                активности, рабочих весов и прогресса за неделю.
              </p>

              {!isPremiumUser && (
  <button type="button" onClick={onOpenPremium}>
    Подключить
  </button>
)}
            </div>
          </div>
        )}

        <div
          className={
            isPremiumUser
              ? "stats-premium-content"
              : "stats-premium-content locked"
          }
        >
          {isStatsLoading && (
            <div className="stats-loading-card">
              <strong>Загружаю статистику...</strong>
              <p>Собираю задачи, тренировки, объём нагрузки и историю рабочих весов.</p>
            </div>
          )}

          {statsError && (
            <div className="stats-error-card">
              <strong>{statsError}</strong>
              <p>Проверь, запущен ли сервер и доступен ли endpoint /api/statistics.</p>
            </div>
          )}

          <div className="stats-hero-grid">
            <StatCard
              title="Выполнение задач"
              value={`${overview.taskCompletionRate}%`}
              icon="target"
            />

            <StatCard
              title="Выполнено задач"
              value={`${overview.completedTasks}/${overview.totalTasks}`}
              icon="checklist"
            />

            <StatCard
              title="Тренировки"
              value={overview.completedWorkouts}
              icon="dumbbell"
            />

            <StatCard
              title="Серия активности"
              value={`${overview.activeDaysStreak} дн.`}
              icon="flame"
            />

            <StatCard
              title="Объём нагрузки"
              value={`${formatCompactNumber(overview.trainingVolume)} кг`}
              icon="weight"
            />

            <StatCard
              title="Лучший прогресс"
              value={
                overview.bestProgress
                  ? `+${formatStatNumber(overview.bestProgress.progress)} кг`
                  : "—"
              }
              icon="trending"
            />
          </div>

          <div className="stats-insight-card">
            <div>
              <span>Вывод недели</span>
              <h3>{statistics?.insight || getLocalStatsInsight(overview)}</h3>
            </div>

            <div className="stats-week-diff">
              <strong>
                {overview.weekDiffPercent > 0
                  ? `+${overview.weekDiffPercent}%`
                  : `${overview.weekDiffPercent}%`}
              </strong>
              <p>к прошлой неделе</p>
            </div>
          </div>

          <div className="stats-layout-grid">
            <article className="stats-panel large">
              <div className="stats-panel-header">
                <div>
                  <span>Обзор недели</span>
                  <h3>Задачи и тренировки по дням</h3>
                </div>
              </div>

              {weekActivity.length > 0 ? (
                <div className="stats-week-chart">
                  {weekActivity.map((day) => {
                    const maxValue = Math.max(
                      ...weekActivity.map(
                        (item) =>
                          item.completedTasksCount + item.completedWorkoutsCount
                      ),
                      1
                    );

                    const value =
                      day.completedTasksCount + day.completedWorkoutsCount;
                    const height = Math.max(
                      10,
                      Math.round((value / maxValue) * 100)
                    );

                    return (
                      <div className="stats-week-column" key={String(day.date)}>
                        <div className="stats-week-bars">
                          <span
                            className="stats-week-bar tasks"
                            style={{ height: `${height}%` }}
                          />
                        </div>

                        <strong>{value}</strong>
                        <p>{formatWeekDay(day.date)}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <StatsEmptyText text="За неделю пока нет данных для графика." />
              )}
            </article>

            <article className="stats-panel">
              <div className="stats-panel-header">
                <div>
                  <span>Задачи</span>
                  <h3>Статус выполнения</h3>
                </div>
              </div>

              <div className="stats-progress-ring-card">
                <div
                  className="stats-progress-ring"
                  style={{
                    "--progress": `${overview.taskCompletionRate}%`,
                  }}
                >
                  <strong>{overview.taskCompletionRate}%</strong>
                </div>

                <div>
                  <p>Выполнено</p>
                  <strong>
                    {statistics?.tasks?.completed || overview.completedTasks} из{" "}
                    {statistics?.tasks?.total || overview.totalTasks}
                  </strong>
                </div>
              </div>

              <div className="stats-mini-list">
                <StatsMiniRow
                  label="В процессе"
                  value={statistics?.tasks?.inProgress || 0}
                />
                <StatsMiniRow
                  label="Запланировано"
                  value={statistics?.tasks?.planned || 0}
                />
                <StatsMiniRow
                  label="Просрочено / отменено"
                  value={statistics?.tasks?.missed || 0}
                />
                <StatsMiniRow
                  label="Высокий приоритет"
                  value={statistics?.tasks?.highPriority || 0}
                />
              </div>
            </article>
          </div>

          <div className="stats-layout-grid">
            <article className="stats-panel">
              <div className="stats-panel-header">
                <div>
                  <span>Тренировки</span>
                  <h3>Самые активные группы мышц</h3>
                </div>
              </div>

              {muscleGroups.length > 0 ? (
                <div className="stats-muscle-list">
                  {muscleGroups.map((group) => (
                    <StatsBarRow
                      key={group.name}
                      label={group.name}
                      value={group.workoutsCount}
                      caption={`${formatCompactNumber(group.volume)} кг объёма`}
                      maxValue={Math.max(
                        ...muscleGroups.map((item) => item.workoutsCount),
                        1
                      )}
                    />
                  ))}
                </div>
              ) : (
                <StatsEmptyText text="Пока нет выполненных тренировок для анализа." />
              )}
            </article>

            <article className="stats-panel">
              <div className="stats-panel-header">
                <div>
                  <span>Рабочие веса</span>
                  <h3>Лучший прогресс</h3>
                </div>
              </div>

              {progress.length > 0 ? (
                <div className="stats-progress-list">
                  {progress.map((item) => (
                    <div className="stats-progress-item" key={item.exerciseName}>
                      <div>
                        <strong>{item.exerciseName}</strong>
                        <p>
                          {formatStatNumber(item.firstWeight)} кг →{" "}
                          {formatStatNumber(item.lastWeight)} кг
                        </p>
                      </div>

                      <span>+{formatStatNumber(item.progress)} кг</span>
                    </div>
                  ))}
                </div>
              ) : (
                <StatsEmptyText text="Добавь историю рабочих весов, чтобы увидеть прогресс." />
              )}
            </article>
          </div>

          <article className="stats-panel">
            <div className="stats-panel-header">
              <div>
                <span>Карта активности</span>
                <h3>Последние 30 дней</h3>
              </div>
            </div>

            {activityMap.length > 0 ? (
              <div className="stats-activity-map">
                {activityMap.map((day) => (
                  <div
                    key={String(day.date)}
                    className={`stats-activity-day level-${getActivityLevel(
                      day.completedItems
                    )}`}
                    title={`${formatShortDate(day.date)} · выполнено: ${day.completedItems}`}
                  />
                ))}
              </div>
            ) : (
              <StatsEmptyText text="Активность появится после выполнения задач или тренировок." />
            )}
          </article>
        </div>
      </div>
    </section>
  );
}

export default StatsPage;