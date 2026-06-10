import React, { useEffect, useRef, useState } from "react";

import PageHeader from "../../components/common/PageHeader";
import HeaderProgressBar from "../../components/common/HeaderProgressBar";
import TaskGroupTabs from "./TaskGroupTabs";
import TaskCard from "./TaskCard";
import TaskRightFilterPanel from "./TaskRightFilterPanel";

function TasksPage({
  tasks,
  filteredTasks,
  taskFilter,
  setTaskFilter,
  searchQuery,
  setSearchQuery,
  selectedPriorities,
setSelectedPriorities,
selectedTaskDate,
setSelectedTaskDate,
taskTimeSortDirection,
setTaskTimeSortDirection,
  markTaskDone,
  markWorkoutExerciseDone,
  deleteTask,
  deleteAllTasks,
  openEditTaskModal,
  openTaskModal,
  openWorkoutModal,
  taskGroups,
  activeTaskGroupId,
  setActiveTaskGroupId,
  openGroupModal,
  toggleSubtaskDone,
  deleteTaskGroup,
}) {
  const regularTasks = tasks.filter((task) => task.category !== "Тренировка");

  const today = new Date();
today.setHours(0, 0, 0, 0);

const oneMonthAgo = new Date(today);
oneMonthAgo.setMonth(today.getMonth() - 1);

const activeFilteredTasks = filteredTasks.filter((task) => {
  if (!task.rawDate || task.status === "Выполнена") {
    return true;
  }

  const taskDate = new Date(task.rawDate);
  taskDate.setHours(0, 0, 0, 0);

  return taskDate >= today;
});

const pastFilteredTasks = filteredTasks.filter((task) => {
  if (!task.rawDate || task.status === "Выполнена") {
    return false;
  }

  const taskDate = new Date(task.rawDate);
  taskDate.setHours(0, 0, 0, 0);

  return taskDate < today && taskDate >= oneMonthAgo;
});
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileTaskFilterOpen, setIsMobileTaskFilterOpen] = useState(false);
const searchRef = useRef(null);
const searchInputRef = useRef(null);

useEffect(() => {
  if (isSearchOpen) {
    searchInputRef.current?.focus();
  }
}, [isSearchOpen]);

useEffect(() => {
  function handleClickOutside(event) {
    if (!isSearchOpen) {
      return;
    }

    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setIsSearchOpen(false);
    }
  }

  function handleEscape(event) {
    if (event.key === "Escape") {
      setIsSearchOpen(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  document.addEventListener("keydown", handleEscape);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
    document.removeEventListener("keydown", handleEscape);
  };
}, [isSearchOpen]);

const completed = regularTasks.filter(
  (task) => task.status === "Выполнена"
).length;

const inProgress = regularTasks.filter(
  (task) => task.status === "В процессе"
).length;

  return (
    
    <section>
    <PageHeader
  title="Задачи"
  subtitle="Планируйте дела, тренировки и контролируйте выполнение задач."
  actions={
    <div className="page-header-actions">

    <div
      ref={searchRef}
      className={
        isSearchOpen
          ? "morph-search open"
          : searchQuery
            ? "morph-search has-value"
            : "morph-search"
      }
    >
  <button
    type="button"
    className="morph-search-icon"
    onClick={() => setIsSearchOpen(true)}
    title="Поиск"
    aria-label="Поиск"
  >
    <svg viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5L21 21" />
    </svg>
  </button>

  <input
    ref={searchInputRef}
    className="morph-search-input"
    placeholder="Поиск"
    value={searchQuery}
    onChange={(event) => setSearchQuery(event.target.value)}
  />

  {searchQuery && (
    <button
      type="button"
      className="morph-search-clear"
      onClick={() => setSearchQuery("")}
      title="Очистить поиск"
    >
      ×
    </button>
  )}
</div>
      <HeaderProgressBar
        total={filteredTasks.length}
        completed={filteredTasks.filter((task) => task.status === "Выполнена").length}
      />
    </div>
  }
/>

<TaskGroupTabs 
  groups={taskGroups}
  activeGroupId={activeTaskGroupId}
  setActiveGroupId={setActiveTaskGroupId}
  openGroupModal={openGroupModal}
  deleteTaskGroup={deleteTaskGroup}
/>
<div className="mobile-task-filter-faq">
  <button
    type="button"
    className={
      isMobileTaskFilterOpen
        ? "mobile-task-filter-toggle active"
        : "mobile-task-filter-toggle"
    }
    onClick={() => setIsMobileTaskFilterOpen((current) => !current)}
  >
    <span>Отбор задач</span>

    <strong>
      {isMobileTaskFilterOpen ? "Скрыть" : "Показать"}
    </strong>
  </button>

  <div
    className={
      isMobileTaskFilterOpen
        ? "mobile-task-filter-faq-body open"
        : "mobile-task-filter-faq-body"
    }
  >
    <TaskRightFilterPanel
      selectedPriorities={selectedPriorities}
      setSelectedPriorities={setSelectedPriorities}
      selectedTaskDate={selectedTaskDate}
      setSelectedTaskDate={setSelectedTaskDate}
      taskTimeSortDirection={taskTimeSortDirection}
      setTaskTimeSortDirection={setTaskTimeSortDirection}
      mobilePopover
    />
  </div>
</div>

      <div className="tasks-page-with-panel">
  <div className="tasks-main-column">
    {activeFilteredTasks.length === 0 && pastFilteredTasks.length === 0 ? (
      <button
        type="button"
        className="empty-state empty-state-clickable"
        onClick={openTaskModal}
        title="Создать задачу"
      >
        <span className="empty-state-plus">+</span>
        <h3>Задачи не найдены</h3>
        <p>Нажмите сюда, чтобы создать новую задачу.</p>
      </button>
    ) : (
      <>
        {activeFilteredTasks.length > 0 && (
          <div className="tasks-grid">
            {activeFilteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                markTaskDone={markTaskDone}
                markWorkoutExerciseDone={markWorkoutExerciseDone}
                toggleSubtaskDone={toggleSubtaskDone}
                openEditTaskModal={openEditTaskModal}
                deleteTask={deleteTask}
              />
            ))}
          </div>
        )}

        {pastFilteredTasks.length > 0 && (
          <div className="past-tasks-section">
            <div className="past-tasks-header">
              <span>Прошедшее</span>
              <p>Задачи, которые были запланированы раньше сегодняшнего дня.</p>
            </div>

            <div className="tasks-grid">
              {pastFilteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  markTaskDone={markTaskDone}
                  markWorkoutExerciseDone={markWorkoutExerciseDone}
                  toggleSubtaskDone={toggleSubtaskDone}
                  openEditTaskModal={openEditTaskModal}
                  deleteTask={deleteTask}
                />
              ))}
            </div>
          </div>
        )}
      </>
    )}
  </div>

  <TaskRightFilterPanel
  selectedPriorities={selectedPriorities}
  setSelectedPriorities={setSelectedPriorities}
  selectedTaskDate={selectedTaskDate}
  setSelectedTaskDate={setSelectedTaskDate}
  taskTimeSortDirection={taskTimeSortDirection}
  setTaskTimeSortDirection={setTaskTimeSortDirection}
/>
</div>

      <button
        className="fab-add-btn"
        onClick={openTaskModal}
        title="Добавить задачу"
      >
        +
      </button>
    </section>
  );
}

export default TasksPage;