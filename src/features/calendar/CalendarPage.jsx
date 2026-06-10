import React, { useEffect, useMemo, useRef, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import CalendarTaskItem from "./CalendarTaskItem";
import PriorityIndicator from "../../components/common/PriorityIndicator";
import { API_URL } from "../../api/apiClient";
import {
  capitalizeFirstLetter,
  formatDateRu,
  formatShortDateRu,
  toDateInputValue,
  isSameDate,
} from "../../utils/dateUtils";

function DayPanelProgressBar({ total, completed }) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="day-panel-progress-card" title="Прогресс дня">
      <div className="day-panel-progress-top">
        <span>Прогресс дня</span>
        <strong>
          {completed}/{total}
        </strong>
      </div>

      <div className="day-panel-progress-track">
        <div
          className="day-panel-progress-fill"
          style={{
            width: `${percent}%`,
          }}
        />
      </div>

      <span className="day-panel-progress-percent">{percent}%</span>
    </div>
  );
}

function CalendarPage({ tasks, deleteTask, markTaskDone, openTaskModal }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [visibleDate, setVisibleDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [isMobileDayPanelOpen, setIsMobileDayPanelOpen] = useState(false);

  const [previousVisibleDate, setPreviousVisibleDate] = useState(null);
  const [monthDirection, setMonthDirection] = useState(null);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  const monthAnimationTimerRef = useRef(null);
  const monthWheelLockRef = useRef(false);
  const calendarMonthFrameRef = useRef(null);
  const [dayNotes, setDayNotes] = useState(() => {
  const savedNotes = localStorage.getItem("dayNotes");

  return savedNotes ? JSON.parse(savedNotes) : {};
});

const [dayImportance, setDayImportance] = useState(() => {
  const savedImportance = localStorage.getItem("dayImportance");

  return savedImportance ? JSON.parse(savedImportance) : {};
});
const [holidayDates, setHolidayDates] = useState({});
useEffect(() => {
  const year = visibleDate.getFullYear();
  const token = localStorage.getItem("token");

  fetch(`${API_URL}/calendar/${year}/holidays`, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  })
    .then((response) => response.json())
    .then((data) => {
      const preparedDates = {};

      if (Array.isArray(data?.days)) {
        data.days.forEach((day) => {
          const rawDate = day.date || day.day || day.value || day;

          if (!rawDate) {
            return;
          }

          const date = String(rawDate).slice(0, 10);
          preparedDates[date] = true;
        });
      }

      if (Array.isArray(data?.months)) {
        data.months.forEach((monthInfo) => {
          const monthIndex = monthInfo.id;
          const neededNotWorkingDays = Number(monthInfo.notWorkingDays || 0);

          if (!Number.isInteger(monthIndex) || neededNotWorkingDays <= 0) {
            return;
          }

          const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
          const monthDates = [];

          for (let day = 1; day <= daysInMonth; day += 1) {
            const date = new Date(year, monthIndex, day);
            const dayOfWeek = date.getDay();
            const dateKey = getDateString(date);

            monthDates.push({
              date,
              dateKey,
              isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
            });
          }

          const weekendDates = monthDates.filter((item) => item.isWeekend);

          weekendDates.forEach((item) => {
            preparedDates[item.dateKey] = true;
          });

          const extraHolidayCount =
            neededNotWorkingDays - weekendDates.length;

          if (extraHolidayCount <= 0) {
            return;
          }

          monthDates
            .filter((item) => !item.isWeekend)
            .slice(0, extraHolidayCount)
            .forEach((item) => {
              preparedDates[item.dateKey] = true;
            });
        });
      }

      setHolidayDates((current) => ({
        ...current,
        [year]: preparedDates,
      }));
    })
    .catch((error) => {
      console.error("Ошибка загрузки праздничных и выходных дней:", error);
    });
}, [visibleDate]);

useEffect(() => {
  localStorage.setItem("dayImportance", JSON.stringify(dayImportance));
}, [dayImportance]);

  const currentYear = visibleDate.getFullYear();
  const currentMonth = visibleDate.getMonth();

  const monthName = visibleDate.toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });

  const selectedDateText = selectedDate.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const selectedTasks = getTasksForDate(selectedDate);
  const selectedCompletedTasks = selectedTasks.filter(
    (task) => task.status === "Выполнена"
  ).length;

  const selectedActiveTasks = selectedTasks.length - selectedCompletedTasks;

  const selectedDateKey = getDateString(selectedDate);
  const selectedDayNote = dayNotes[selectedDateKey] || "";
  const selectedDateIsPast = isPastDate(selectedDate);

  const canAddTaskToSelectedDate = !selectedDateIsPast && !isTooOldDate(selectedDate);
const shouldShowDayProgress = !selectedDateIsPast && selectedTasks.length > 0;

  

  useEffect(() => {
    localStorage.setItem("dayNotes", JSON.stringify(dayNotes));
  }, [dayNotes]);
  function animateToMonth(nextDate, direction) {
    if (isPastMonth(nextDate)) {
  return;
}

  if (
    visibleDate.getFullYear() === nextDate.getFullYear() &&
    visibleDate.getMonth() === nextDate.getMonth()
  ) {
    setIsMonthPickerOpen(false);
    return;
  }

  clearTimeout(monthAnimationTimerRef.current);

  setPreviousVisibleDate(visibleDate);
  setMonthDirection(direction > 0 ? "next" : "prev");
  setVisibleDate(nextDate);
  setIsMonthPickerOpen(false);

  monthAnimationTimerRef.current = setTimeout(() => {
    setPreviousVisibleDate(null);
    setMonthDirection(null);
  }, 360);
}

function changeMonth(direction) {
  const nextDate = new Date(
    visibleDate.getFullYear(),
    visibleDate.getMonth() + direction,
    1
  );

  animateToMonth(nextDate, direction);
}

function goToPreviousMonth() {
  changeMonth(-1);
}

function goToNextMonth() {
  changeMonth(1);
}

function isPastMonth(date) {
  const currentMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const checkedMonthDate = new Date(date.getFullYear(), date.getMonth(), 1);

  return checkedMonthDate < currentMonthDate;
}

function goToCurrentMonth() {
  const currentMonthDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  const direction = currentMonthDate > visibleDate ? 1 : -1;

  animateToMonth(currentMonthDate, direction);
  setSelectedDate(today);
  setIsMobileDayPanelOpen(false);
}

function handleCalendarWheel(event) {
  event.preventDefault();

  if (monthWheelLockRef.current) {
    return;
  }

  const direction = event.deltaY > 0 ? 1 : -1;

  monthWheelLockRef.current = true;
  changeMonth(direction);

  setTimeout(() => {
    monthWheelLockRef.current = false;
  }, 520);
}

useEffect(() => {
  const calendarElement = calendarMonthFrameRef.current;

  if (!calendarElement) {
    return;
  }

  calendarElement.addEventListener("wheel", handleCalendarWheel, {
    passive: false,
  });

  return () => {
    calendarElement.removeEventListener("wheel", handleCalendarWheel);
  };
}, [visibleDate]);

function pickMonth(monthIndex) {
  const nextDate = new Date(visibleDate.getFullYear(), monthIndex, 1);
  const direction = monthIndex > visibleDate.getMonth() ? 1 : -1;

  animateToMonth(nextDate, direction || 1);
}

useEffect(() => {
  return () => {
    clearTimeout(monthAnimationTimerRef.current);
  };
}, []);



  function getDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function getCellDate(day, monthDate = visibleDate) {
  const cellDate = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth(),
    day
  );

  cellDate.setHours(0, 0, 0, 0);

  return cellDate;
}

  function isPastDate(date) {
  return date < today;
}

function isTooOldDate(date) {
  const minDate = new Date(today);
  minDate.setMonth(today.getMonth() - 1);
  minDate.setHours(0, 0, 0, 0);

  return date < minDate;
}

function isWeekendDate(date) {
  const dayOfWeek = date.getDay();
  const isRegularWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const year = date.getFullYear();
  const dateKey = getDateString(date);
  const isHolidayFromApi = Boolean(holidayDates[year]?.[dateKey]);

  return isRegularWeekend || isHolidayFromApi;
}

  function isTodayDate(date) {
    return date.getTime() === today.getTime();
  }

  function isSelectedDate(date) {
    return date.getTime() === selectedDate.getTime();
  }

  function getTasksForDate(date) {
  const targetDate = getDateString(date);

  return tasks.filter((task) => {
    if (task.category === "Тренировка") {
      return false;
    }

    return task.rawDate && task.rawDate.startsWith(targetDate);
  });
}

  function selectDay(day, monthDate = visibleDate) {
  if (!day) {
    return;
  }

  const date = getCellDate(day, monthDate);

  if (isTooOldDate(date)) {
  return;
}

  const isSameDay = date.getTime() === selectedDate.getTime();

  if (isSameDay) {
    setIsMobileDayPanelOpen((current) => !current);
  } else {
    setSelectedDate(date);
    setIsMobileDayPanelOpen(true);
  }
}


  function renderDayPanelContent() {
    return (
      <>
        <div className="day-panel-header redesigned">
  <div className="day-panel-title-block">
    <div className="day-panel-date-row">
      <h3>{selectedDateText}</h3>

      {isTodayDate(selectedDate) && (
        <span className="day-panel-tag today">Сегодня</span>
      )}

      {selectedDateIsPast && (
        <span className="day-panel-tag past">Прошедший день</span>
      )}
    </div>
  </div>

  <div className="day-panel-actions">
    <div className="day-importance-inline">
      {[
        { value: "normal", label: "!" },
        { value: "yellow", label: "!!" },
        { value: "red", label: "!!!" },
      ].map((item) => (
        <button
          key={item.value}
          type="button"
          className={
            dayImportance[selectedDateKey] === item.value
              ? `day-importance-mini ${item.value} active`
              : `day-importance-mini ${item.value}`
          }
          onClick={() =>
            setDayImportance((current) => ({
              ...current,
              [selectedDateKey]:
                current[selectedDateKey] === item.value ? null : item.value,
            }))
          }
          title={
            item.value === "normal"
              ? "Обычная важность"
              : item.value === "yellow"
                ? "Повышенная важность"
                : "Высокая важность"
          }
        >
          {item.label}
        </button>
      ))}
    </div>

    {canAddTaskToSelectedDate && (
  <button
    className="day-panel-add-btn"
    type="button"
    onClick={() => openTaskModal(getDateString(selectedDate))}
  >
    + Задача
  </button>
)}
  </div>
</div>

{shouldShowDayProgress && (
  <DayPanelProgressBar
    total={selectedTasks.length}
    completed={selectedCompletedTasks}
  />
)}

<div className="day-note-card">
  <div className="day-note-header">
    <span>Заметка дня</span>
  </div>

  <textarea
    value={selectedDayNote}
    onChange={(event) =>
      setDayNotes((currentNotes) => ({
        ...currentNotes,
        [selectedDateKey]: event.target.value,
      }))
    }
    placeholder="Например: сегодня доделать визуальную часть диплома..."
  />
</div>
        <div className="day-tasks-list">
          {selectedTasks.length === 0 ? (
  canAddTaskToSelectedDate ? (
    <button
      type="button"
      className="day-empty day-empty-beauty"
      onClick={() => openTaskModal(getDateString(selectedDate))}
    >
      <span className="day-empty-icon">+</span>

      <strong>День свободен</strong>

      <p>
        Можно оставить его для отдыха или запланировать что-то полезное.
      </p>

      <span className="day-empty-action">Запланировать день</span>
    </button>
  ) : (
    <div className="day-empty day-empty-beauty day-empty-readonly">
      <strong>День уже прошёл</strong>

      <p>На этот день задач не было.</p>
    </div>
  )
) : (
  selectedTasks.map((task) => (
    <CalendarTaskItem
      key={task.id}
      task={task}
      deleteTask={deleteTask}
      markTaskDone={markTaskDone}
    />
  ))
)}
        </div>
      </>
    );
  }

function renderCalendarGrid(monthDate, extraClassName = "") {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const daysInSelectedMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfSelectedMonth = new Date(year, month, 1).getDay();
  const emptyDaysBeforeSelectedMonth =
    firstDayOfSelectedMonth === 0 ? 6 : firstDayOfSelectedMonth - 1;

  const cells = [
    ...Array.from({ length: emptyDaysBeforeSelectedMonth }, () => null),
    ...Array.from({ length: daysInSelectedMonth }, (_, index) => index + 1),
  ];

  return (
    <div className={`calendar ${extraClassName}`}>
      {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
        <div className="week-day" key={day}>
          {day}
        </div>
      ))}

      {cells.map((day, index) => {
        if (!day) {
          return (
            <button
              type="button"
              key={index}
              className="calendar-day empty"
              disabled
            />
          );
        }

        const cellDate = getCellDate(day, monthDate);
        const dayTasks = getTasksForDate(cellDate);
        const past = isPastDate(cellDate);
        const tooOld = isTooOldDate(cellDate);
        const weekend = isWeekendDate(cellDate);
        const currentToday = isTodayDate(cellDate);
        const selected = isSelectedDate(cellDate);
        const importance = dayImportance[getDateString(cellDate)];

        const dayClassName = [
          "calendar-day",
          selected ? "selected" : "",
          past ? "past" : "",
          tooOld ? "too-old" : "",
          weekend ? "weekend" : "",
          currentToday ? "today" : "",
          dayTasks.length > 0 ? "has-tasks" : "",
          importance === "normal" ? "important-normal" : "",
          importance === "yellow" ? "important-yellow" : "",
          importance === "red" ? "important-red" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <React.Fragment key={`${year}-${month}-${index}`}>
            <button
  type="button"
  className={dayClassName}
  onClick={() => {
    if (!tooOld) {
      selectDay(day, monthDate);
    }
  }}
  disabled={tooOld}
>
  <div className="calendar-day-top">
  <strong>{day}</strong>

  {dayTasks.length > 0 && (
    <span className="calendar-task-count">
      {dayTasks.length}
    </span>
  )}
</div>
</button>
          </React.Fragment>
        );
      })}
    </div>
  );
}



  return (
    <section>
      <PageHeader
        title="Календарь"
        subtitle="Выберите день в календаре, чтобы посмотреть задачи и добавить новые."
      />

      <div className="calendar-page-layout">
  <div className="calendar-left">
    <div className="calendar-header">
      <button
        type="button"
        className="calendar-nav-btn"
        onClick={goToPreviousMonth}
        disabled={isPastMonth(
          new Date(visibleDate.getFullYear(), visibleDate.getMonth() - 1, 1)
        )}
        aria-label="Предыдущий месяц"
      >
        {"<"}
      </button>

      <div className="calendar-title">
        <h3>
          <button
            type="button"
            className="calendar-month-name-btn"
            onClick={() => setIsMonthPickerOpen((current) => !current)}
            title="Выбрать месяц"
          >
            {capitalizeFirstLetter(monthName)}
          </button>
        </h3>
      </div>

      <button
        type="button"
        className="calendar-nav-btn"
        onClick={goToNextMonth}
        aria-label="Следующий месяц"
      >
        {">"}
      </button>
    </div>

    {isMonthPickerOpen && (
      <div className="month-picker-inline">
        {[
          "Январь",
          "Февраль",
          "Март",
          "Апрель",
          "Май",
          "Июнь",
          "Июль",
          "Август",
          "Сентябрь",
          "Октябрь",
          "Ноябрь",
          "Декабрь",
        ].map((month, index) => (
          <button
            type="button"
            key={month}
            className={
              index === visibleDate.getMonth()
                ? "month-picker-inline-item active"
                : isPastMonth(new Date(visibleDate.getFullYear(), index, 1))
                  ? "month-picker-inline-item disabled"
                  : "month-picker-inline-item"
            }
            onClick={() => {
              if (!isPastMonth(new Date(visibleDate.getFullYear(), index, 1))) {
                pickMonth(index);
              }
            }}
            disabled={isPastMonth(new Date(visibleDate.getFullYear(), index, 1))}
          >
            {month}
          </button>
        ))}
      </div>
    )}

    <div
      ref={calendarMonthFrameRef}
      className={
        monthDirection
          ? `calendar-month-frame ${monthDirection}`
          : "calendar-month-frame"
      }
    >
      {previousVisibleDate &&
        renderCalendarGrid(previousVisibleDate, "calendar-layer calendar-old")}

      {renderCalendarGrid(visibleDate, "calendar-layer calendar-current")}
    </div>
  </div>

  {isMobileDayPanelOpen && !previousVisibleDate && (
    <div className="day-panel mobile-bottom-day-panel">
      {renderDayPanelContent()}
    </div>
  )}

  <aside className="day-panel desktop-day-panel">
    {renderDayPanelContent()}
  </aside>
</div>
    </section>
  );
}

export default CalendarPage;