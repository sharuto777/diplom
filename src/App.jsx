import React, { useEffect, useMemo, useRef, useState } from "react";
import "./styles/styles.css";
import AppLogo from "./components/AppLogo.jsx";

const API_URL = "http://localhost:5000/api";

const groupColors = [
  "#FEE2E2", // мягкий красный
  "#FFEDD5", // мягкий оранжевый
  "#FEF9C3", // мягкий жёлтый
  "#DCFCE7", // мягкий зелёный
  "#CCFBF1", // мягкий бирюзовый
  "#E6F8FA", // основной голубой
  "#DBEAFE", // мягкий синий
  "#EDE9FE", // мягкий фиолетовый
  "#FCE7F3", // мягкий розовый
  "#F1F5F9", // мягкий серый
];

const menuItems = [
  "Задачи",
  "Календарь",
  "Тренировки",
  "Статистика",
  "Профиль",
];

const menuIcons = {
  Задачи: (
    <svg viewBox="0 0 24 24" className="menu-icon-svg">
      <path d="M9 11L12 14L20 6" />
      <path d="M20 12V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V6C4 4.9 4.9 4 6 4H15" />
    </svg>
  ),

  Календарь: (
    <svg viewBox="0 0 24 24" className="menu-icon-svg">
      <path d="M7 3V6" />
      <path d="M17 3V6" />
      <path d="M4 9H20" />
      <path d="M6 5H18C19.1 5 20 5.9 20 7V19C20 20.1 19.1 21 18 21H6C4.9 21 4 20.1 4 19V7C4 5.9 4.9 5 6 5Z" />
    </svg>
  ),

  Тренировки: (
    <svg viewBox="0 0 24 24" className="menu-icon-svg">
      <path d="M7 8V16" />
      <path d="M17 8V16" />
      <path d="M3 10V14" />
      <path d="M21 10V14" />
      <path d="M7 12H17" />
      <path d="M5 9V15" />
      <path d="M19 9V15" />
    </svg>
  ),

  Статистика: (
    <svg viewBox="0 0 24 24" className="menu-icon-svg">
      <path d="M4 19H20" />
      <path d="M7 16V10" />
      <path d="M12 16V6" />
      <path d="M17 16V13" />
    </svg>
  ),

  Профиль: (
    <svg viewBox="0 0 24 24" className="menu-icon-svg">
      <path d="M12 12C14.2 12 16 10.2 16 8C16 5.8 14.2 4 12 4C9.8 4 8 5.8 8 8C8 10.2 9.8 12 12 12Z" />
      <path d="M5 20C5.7 16.6 8.4 15 12 15C15.6 15 18.3 16.6 19 20" />
    </svg>
  ),
};



function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem("activePage") || "Задачи";
  });
  const [tasks, setTasks] = useState([]);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  const [taskGroups, setTaskGroups] = useState([]);
  const [activeTaskGroupId, setActiveTaskGroupId] = useState("all");
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isSavingGroup, setIsSavingGroup] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [taskFilter, setTaskFilter] = useState("Все");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedMuscle, setSelectedMuscle] = useState("Спина");

  const [isSavingTask, setIsSavingTask] = useState(false);
  const [isSavingWorkout, setIsSavingWorkout] = useState(false);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);

  const [muscleGroups, setMuscleGroups] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [compatibleGroups, setCompatibleGroups] = useState([]);

  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [focusTask, setFocusTask] = useState(null);

  useEffect(() => {
  const savedToken = localStorage.getItem("token");

  loadMuscleGroups();
  loadExercises();

  if (savedToken) {
    checkAuth(savedToken);
  } else {
    setIsAuthChecking(false);
  }
}, []);

  const filteredTasks = useMemo(() => {
  const normalizedSearch = searchQuery.trim().toLowerCase();

  return tasks.filter((task) => {
    if (task.category === "Тренировка") {
      return false;
    }

    const matchesGroup =
      activeTaskGroupId === "all" || task.groupId === activeTaskGroupId;

    const exerciseNames = (task.exercises || []).map((exercise) =>
      typeof exercise === "string" ? exercise : exercise.name
    );

    const searchableText = [
      task.title,
      task.description,
      task.microStep,
      task.priority,
      task.status,
      task.date,
      task.muscle,
      task.groupName,
      ...exerciseNames,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      normalizedSearch === "" || searchableText.includes(normalizedSearch);

    return matchesGroup && matchesSearch;
  });
}, [tasks, taskFilter, searchQuery, activeTaskGroupId]);


function checkAuth(token) {
  fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setCurrentUser(null);
        setSubscription(null);
        setIsLoggedIn(false);
        setTasks([]);

        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));

      setCurrentUser(data.user);
      setSubscription(data.subscription);
      setIsLoggedIn(true);

      loadTasks(token);
      loadTaskGroups(token);
    })
    .catch((error) => {
      console.error("Ошибка проверки авторизации:", error);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setCurrentUser(null);
      setSubscription(null);
      setIsLoggedIn(false);
      setTasks([]);
    })
    .finally(() => {
      setIsAuthChecking(false);
    });
}

function registerUser(formData) {
  fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert(data.error);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setCurrentUser(data.user);
      setSubscription(data.subscription);
      setIsLoggedIn(true);

      loadTasks(data.token);
      loadTaskGroups(data.token);

    })
    .catch((error) => {
      console.error("Ошибка регистрации:", error);
      alert("Не удалось зарегистрироваться");
    });
}

function loginAsGuest() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  setCurrentUser({
    id: "guest",
    username: "Гость",
    email: null,
    role: "guest",
    is_guest: true,
  });

  setSubscription({
    name: "Гость",
    code: "guest",
    max_tasks: null,
    max_workouts: null,
    has_extended_stats: false,
    has_extended_exercises: false,
    has_ready_programs: false,
    has_progress_history: false,
    has_export: false,
    has_no_ads: false,
  });

  setTasks([]);
  setIsLoggedIn(true);
  setActivePage("Задачи");
}


function loginUser(formData) {
  fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert(data.error);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setCurrentUser(data.user);
      setSubscription(data.subscription);
      setIsLoggedIn(true);

      loadTasks(data.token);
      loadTaskGroups(data.token);
    })
    .catch((error) => {
      console.error("Ошибка входа:", error);
      alert("Не удалось войти");
    });
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("activePage");

  setCurrentUser(null);
  setSubscription(null);
  setIsLoggedIn(false);
  setTasks([]);
  setTaskGroups([]);
  setActivePage("Задачи");
}

  function loadMuscleGroups() {
    fetch(`${API_URL}/muscle-groups`)
      .then((response) => response.json())
      .then((data) => {
        setMuscleGroups(data);
      })
      .catch((error) => {
        console.error("Ошибка загрузки групп мышц:", error);
      });
  }

  function loadExercises() {
  fetch(`${API_URL}/exercises`)
    .then((response) => response.json())
    .then((data) => {
      if (!Array.isArray(data)) {
        console.error("Ошибка загрузки упражнений:", data);
        setAvailableExercises([]);
        return;
      }

      setAvailableExercises(data);
    })
    .catch((error) => {
      console.error("Ошибка загрузки упражнений:", error);
      setAvailableExercises([]);
    });
}

  function loadMuscleCombinations(muscle) {
    fetch(`${API_URL}/muscle-combinations?muscle=${encodeURIComponent(muscle)}`)
      .then((response) => response.json())
      .then((data) => {
        setCompatibleGroups(data.map((item) => item.recommended_muscle_group));
      })
      .catch((error) => {
        console.error("Ошибка загрузки совместимых групп:", error);
      });
  }

  useEffect(() => {
    if (selectedMuscle) {
      loadMuscleCombinations(selectedMuscle);
    }
  }, [selectedMuscle]);

  useEffect(() => {
      localStorage.setItem("activePage", activePage);
    }, [activePage]);

  function loadTasks(token = localStorage.getItem("token")) {
  if (!token) {
    return;
  }

  fetch(`${API_URL}/tasks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error(data.error);
        return;
      }

      setTasks(data.map(formatTaskFromApi));
    })
    .catch((error) => {
      console.error("Ошибка загрузки задач:", error);
    });
}

function loadTaskGroups(token = localStorage.getItem("token")) {
  if (!token || currentUser?.is_guest) {
    setTaskGroups([]);
    return;
  }

  fetch(`${API_URL}/task-groups`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (response) => {
      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Сервер вернул не JSON. Статус: ${response.status}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка загрузки групп задач");
      }

      return data;
    })
    .then((data) => {
      setTaskGroups(Array.isArray(data) ? data : []);
    })
    .catch((error) => {
      console.error("Ошибка загрузки групп задач:", error);
      setTaskGroups([]);
    });
}

function createTaskGroup(formData) {
  if (isSavingGroup) {
    return;
  }

  const token = localStorage.getItem("token");

  if (!token || currentUser?.is_guest) {
    alert("Группы задач доступны только зарегистрированным пользователям.");
    return;
  }

  setIsSavingGroup(true);

  fetch(`${API_URL}/task-groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Ошибка создания группы");
      }

      return response.json();
    })
    .then((group) => {
      setIsGroupModalOpen(false);
      setActiveTaskGroupId(group.id);
      loadTaskGroups(token);
    })
    .catch((error) => {
      console.error("Ошибка создания группы:", error);
    })
    .finally(() => {
      setIsSavingGroup(false);
    });
}

function markWorkoutExerciseDone(workoutExerciseId) {
  if (currentUser?.is_guest) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.category !== "Тренировка" || !task.exercises) {
          return task;
        }

        return {
          ...task,
          exercises: task.exercises.map((exercise) =>
            exercise.id === workoutExerciseId
              ? { ...exercise, is_completed: true }
              : exercise
          ),
        };
      })
    );

    return;
  }

  const token = localStorage.getItem("token");

  fetch(`${API_URL}/workout-exercises/${workoutExerciseId}/complete`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then(() => loadTasks(token))
    .catch((error) => {
      console.error("Ошибка обновления упражнения:", error);
    });
}

function markTaskDone(id) {
  if (currentUser?.is_guest) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status: task.status === "Выполнена" ? "В процессе" : "Выполнена",
            }
          : task
      )
    );

    return;
  }

  const token = localStorage.getItem("token");

  fetch(`${API_URL}/tasks/${id}/complete`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then(() => loadTasks(token))
    .catch((error) => {
      console.error("Ошибка обновления задачи:", error);
    });
}

  function deleteAllTasks() {
    fetch(`${API_URL}/tasks`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then(loadTasks)
      .catch((error) => {
        console.error("Ошибка удаления всех задач:", error);
      });
  }

function deleteTaskGroup(groupId) {
  const confirmed = window.confirm(
    "Удалить группу? Задачи из неё останутся и перейдут во «Все задачи»."
  );

  if (!confirmed) {
    return;
  }

  const token = localStorage.getItem("token");

  fetch(`${API_URL}/task-groups/${groupId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Ошибка удаления группы");
      }

      return response.json();
    })
    .then(() => {
      if (activeTaskGroupId === groupId) {
        setActiveTaskGroupId("all");
      }

      loadTaskGroups(token);
      loadTasks(token);
    })
    .catch((error) => {
      console.error("Ошибка удаления группы:", error);
    });
}

 function deleteTask(id) {
  if (!id) {
    return;
  }

  if (currentUser?.is_guest) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== id)
    );

    return;
  }

  const token = localStorage.getItem("token");

  fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then(() => loadTasks(token))
    .catch((error) => {
      console.error("Ошибка удаления задачи:", error);
    });
}

function createTask(formData) {
  const taskPayload = {
    ...formData,
    group_id: activeTaskGroupId !== "all" ? activeTaskGroupId : null,
  };

  if (currentUser?.is_guest) {
    const selectedGroup = taskGroups.find(
      (group) => group.id === taskPayload.group_id
    );

    const guestTask = {
      id: crypto.randomUUID(),
      title: taskPayload.title,
      description: taskPayload.description || "",
      microStep: taskPayload.micro_step || "",
      category: taskPayload.category || "Личное",
      priority: formatPriority(taskPayload.priority || "medium"),
      status: "Новая",
      date: formatDate(taskPayload.start_datetime),
      rawDate: taskPayload.start_datetime,
      groupId: selectedGroup?.id || null,
      groupName: selectedGroup?.name || null,
      groupColor: selectedGroup?.color || null,
      exercises: null,
    };

    setTasks((currentTasks) => [guestTask, ...currentTasks]);
    setIsTaskModalOpen(false);

    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Необходимо войти в аккаунт");
    return;
  }

  setIsSavingTask(true);

  fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(taskPayload),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert(data.error);
        return;
      }

      loadTasks(token);
      setIsTaskModalOpen(false);
    })
    .catch((error) => {
      console.error("Ошибка создания задачи:", error);
      alert("Не удалось создать задачу");
    })
    .finally(() => {
      setIsSavingTask(false);
    });
}

 function createWorkout(formData) {
  if (currentUser?.is_guest) {
    const guestWorkout = {
      id: crypto.randomUUID(),
      title: formData.title,
      description: formData.description || "",
      category: "Тренировка",
      priority: "Средний",
      status: "Запланирована",
      date:
        formData.repeat_days && formData.repeat_days.length > 0
          ? formData.repeat_days.join(", ")
          : "Без срока",
      rawDate: null,
      repeatDays: formData.repeat_days || [],
      muscle: formData.muscle_groups?.join(", ") || "",
      exercises: (formData.exercises || []).map((exercise) => ({
        id: exercise.exercise_id,
        name: exercise.name,
        is_completed: false,
      })),
    };

    setTasks((currentTasks) => [guestWorkout, ...currentTasks]);
    setIsWorkoutModalOpen(false);
    setActivePage("Тренировки");

    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Необходимо войти в аккаунт");
    return;
  }

  setIsSavingWorkout(true);

  fetch(`${API_URL}/workouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert(data.error);
        return;
      }

      loadTasks(token);
      setIsWorkoutModalOpen(false);
      setActivePage("Тренировки");
    })
    .catch((error) => {
      console.error("Ошибка создания тренировки:", error);
      alert("Не удалось создать тренировку");
    })
    .finally(() => {
      setIsSavingWorkout(false);
    });
}

  function renderPage() {
    switch (activePage) {
      case "Календарь":
        return (
          <CalendarPage
            tasks={tasks}
            createTask={createTask}
            deleteTask={deleteTask}
            markTaskDone={markTaskDone}
          />
        );

      case "Тренировки":
        return (
          <WorkoutsPage
            tasks={tasks}
            openWorkoutModal={() => setIsWorkoutModalOpen(true)}
          />
        );

      case "Статистика":
        return <StatsPage tasks={tasks} />;

      case "Профиль":
        return (
          <ProfilePage
            currentUser={currentUser}
            subscription={subscription}
            logout={logout}
          />
        );

      default:
        return (
          <TasksPage
            tasks={tasks}
            filteredTasks={filteredTasks}
            taskFilter={taskFilter}
            setTaskFilter={setTaskFilter}
            markTaskDone={markTaskDone}
            markWorkoutExerciseDone={markWorkoutExerciseDone}
            deleteTask={deleteTask}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            deleteAllTasks={deleteAllTasks}
            openTaskModal={() => setIsTaskModalOpen(true)}
            openWorkoutModal={() => setIsWorkoutModalOpen(true)}
            taskGroups={taskGroups}
            activeTaskGroupId={activeTaskGroupId}
            setActiveTaskGroupId={setActiveTaskGroupId}
            openGroupModal={() => setIsGroupModalOpen(true)}
            deleteTaskGroup={deleteTaskGroup}
            openFocusMode={(task) => setFocusTask(task)}
          />
        );
    }
  }

  return (
    <div className="app">
      <div
        className={
          isLoggedIn
            ? isSidebarCollapsed
              ? "layout sidebar-collapsed"
              : "layout"
            : isSidebarCollapsed
              ? "layout sidebar-collapsed blurred"
              : "layout blurred"
        }
      >
        <button
  className={isMobileMenuOpen ? "mobile-menu-btn active" : "mobile-menu-btn"}
  onClick={() => setIsMobileMenuOpen((current) => !current)}
  aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
>
  {isMobileMenuOpen ? "×" : "☰"}
</button>

        <button
          className={
            isSidebarCollapsed
              ? "desktop-sidebar-toggle collapsed"
              : "desktop-sidebar-toggle"
          }
          onClick={() => setIsSidebarCollapsed((current) => !current)}
          title={
            isSidebarCollapsed
              ? "Показать боковую панель"
              : "Скрыть боковую панель"
          }
          aria-label={
            isSidebarCollapsed
              ? "Показать боковую панель"
              : "Скрыть боковую панель"
          }
        >
          <svg viewBox="0 0 24 24" className="sidebar-toggle-icon">
            <rect x="4" y="5" width="16" height="14" rx="3" />
            <path d="M9 5V19" />
            <path
              className="sidebar-toggle-arrow-open"
              d="M15 10L13 12L15 14"
            />
            <path
              className="sidebar-toggle-arrow-closed"
              d="M13 10L15 12L13 14"
            />
          </svg>
        </button>

        {isMobileMenuOpen && (
          <div
            className="mobile-menu-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          isMobileMenuOpen={isMobileMenuOpen}
          isSidebarCollapsed={isSidebarCollapsed}
          closeMobileMenu={() => setIsMobileMenuOpen(false)}
        />

        <main className="content">{renderPage()}</main>
      </div>

      {isTaskModalOpen && (
        <TaskModal
          onClose={() => setIsTaskModalOpen(false)}
          onSubmit={createTask}
          isSaving={isSavingTask}
        />
      )}



      {isWorkoutModalOpen && (
        <WorkoutModal
          onClose={() => setIsWorkoutModalOpen(false)}
          onSubmit={createWorkout}
          muscleGroups={muscleGroups}
          availableExercises={availableExercises}
          compatibleGroups={compatibleGroups}
          isSaving={isSavingWorkout}
        />
      )}

      {isGroupModalOpen && (
        <TaskGroupModal
          onClose={() => setIsGroupModalOpen(false)}
          onSubmit={createTaskGroup}
          isSaving={isSavingGroup}
        />
      )}

      {!isAuthChecking && !isLoggedIn && (
      <AuthModal
        onLogin={loginUser}
        onRegister={registerUser}
        onGuestLogin={loginAsGuest}
      />
    )}

    {focusTask && (
      <FocusMode
        task={focusTask}
        markTaskDone={markTaskDone}
        onClose={() => setFocusTask(null)}
      />
    )}
    </div>
  );

  
}

function FocusMode({ task, markTaskDone, onClose }) {
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    if (!isTimerRunning) {
      return;
    }

    if (secondsLeft <= 0) {
      setIsTimerRunning(false);
      return;
    }

    const timerId = setInterval(() => {
      setSecondsLeft((currentSeconds) => currentSeconds - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [isTimerRunning, secondsLeft]);

  function formatTimer(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  function getPrioritySymbols(priority) {
    if (priority === "high" || priority === "Высокий") {
      return "!!!";
    }

    if (priority === "medium" || priority === "Средний") {
      return "!!";
    }

    return "!";
  }

  function changeFocusMinutes(value) {
    const minutes = Number(value);

    if (!minutes || minutes < 1) {
      setFocusMinutes(1);
      setSecondsLeft(60);
      setIsTimerRunning(false);
      return;
    }

    if (minutes > 180) {
      setFocusMinutes(180);
      setSecondsLeft(180 * 60);
      setIsTimerRunning(false);
      return;
    }

    setFocusMinutes(minutes);
    setSecondsLeft(minutes * 60);
    setIsTimerRunning(false);
  }

  function resetTimer() {
    setSecondsLeft(focusMinutes * 60);
    setIsTimerRunning(false);
  }

  function completeTask() {
    markTaskDone(task.id);
    onClose();
  }

  return (
    <div className="focus-backdrop">
      <div className="focus-mode">
        <div className="focus-top">
          <div>
            <span className="focus-label">Режим концентрации</span>
            <h2>Работайте только над одной задачей</h2>
          </div>

          <button type="button" className="focus-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="focus-time-control">
          <span>Время фокуса</span>

          <div className="focus-time-options">
            {[15, 25, 45, 60].map((minutes) => (
              <button
                type="button"
                key={minutes}
                className={
                  focusMinutes === minutes
                    ? "focus-time-chip active"
                    : "focus-time-chip"
                }
                onClick={() => changeFocusMinutes(minutes)}
              >
                {minutes} мин
              </button>
            ))}

            <label className="focus-custom-time">
              <input
                type="number"
                min="1"
                max="180"
                value={focusMinutes}
                onChange={(event) => changeFocusMinutes(event.target.value)}
              />
              <span>мин</span>
            </label>
          </div>
        </div>

        <div className="focus-timer-card">
          <div className="focus-timer-ring">
            <span>{formatTimer(secondsLeft)}</span>
          </div>

          <div className="focus-timer-actions">
            <button
              type="button"
              className="focus-start-btn"
              onClick={() => setIsTimerRunning((current) => !current)}
            >
              {isTimerRunning ? "Пауза" : "Старт"}
            </button>

            <button
              type="button"
              className="focus-secondary-btn"
              onClick={resetTimer}
            >
              Сбросить
            </button>
          </div>
        </div>

        <div
          className="focus-task-card"
          style={{
            "--task-group-color": task.groupColor || "#E6F8FA",
          }}
        >
          <div className="focus-task-head">
            <div>
              <div className="focus-task-priority">
                {getPrioritySymbols(task.priority)}
              </div>

              <h3>{task.title}</h3>
            </div>

            {task.groupName && (
              <span className="focus-task-group">{task.groupName}</span>
            )}
          </div>

          {task.description && (
            <p className="focus-task-description">{task.description}</p>
          )}

          <div className="focus-task-meta">
            <span>{task.date || "Без срока"}</span>
          </div>
        </div>

        <div className="focus-bottom-actions">
          <button
            type="button"
            className="focus-complete-btn"
            onClick={completeTask}
          >
            Выполнить задачу
          </button>

          <button type="button" className="focus-secondary-btn" onClick={onClose}>
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}

function AuthModal({ onLogin, onRegister, onGuestLogin }) {
  
  const [authMode, setAuthMode] = useState("login");

  const isRegisterMode = authMode === "register";

  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    if (isRegisterMode) {
      onRegister({
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
      });
    } else {
      onLogin({
        email: formData.get("email"),
        password: formData.get("password"),
      });
    }
  }

  return (
    <div className="modal-backdrop auth-backdrop">
      <div className="auth-window">
        <section className="auth-login-side">
          <div className="auth-brand compact">
            <AppLogo size={52} />

            <div>
              <h1>Sunday</h1>
              <p>Ваш личный планировщик</p>
            </div>
          </div>

          <div className="auth-main">
            <div className="auth-title compact">
              <h2>{isRegisterMode ? "Регистрация" : "Вход"}</h2>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
  {isRegisterMode && (
    <label>
      Логин
      <input
        name="username"
        type="text"
        placeholder="Введите логин"
        minLength="3"
        required
      />
    </label>
  )}

  <label>
    Email
    <input
      name="email"
      type="email"
      placeholder="Введите email"
      required
    />
  </label>

  <label>
    Пароль
    <input
      name="password"
      type="password"
      placeholder="Введите пароль"
      minLength="6"
      required
    />
  </label>

  <button type="submit" className="primary-btn">
    {isRegisterMode ? "Зарегистрироваться" : "Войти"}
  </button>

  <button
    type="button"
    className="auth-guest-btn"
    onClick={onGuestLogin}
  >
    Продолжить как гость
  </button>
</form>

            <div className="auth-divider">
  <span>или</span>
</div>

{isRegisterMode ? (
  <p className="auth-register-text">
    Уже есть аккаунт?{" "}
    <button type="button" onClick={() => setAuthMode("login")}>
      Войти
    </button>
  </p>
) : (
  <p className="auth-register-text">
    Нет аккаунта?{" "}
    <button type="button" onClick={() => setAuthMode("register")}>
      Создать аккаунт
    </button>
  </p>
)}
          </div>
        </section>

        <AuthInfoSide isRegisterMode={isRegisterMode} />
      </div>
    </div>
  );
}

function AuthInfoSide({ isRegisterMode }) {
  return (
    <section className="auth-info-side">
      {isRegisterMode ? <RegisterInfo /> : <LoginInfo />}
    </section>
  );
}

function RegisterInfo() {
  return (
    <div className="auth-info-card selling auth-info-animated">
      <span className="auth-info-label">Почему Sunday?</span>

      <h2>Всё для планирования дня — в одном месте</h2>

      <p>
        Sunday помогает не просто записывать задачи, а удобно связывать дела,
        календарь и тренировки в единую систему.
      </p>

      <div className="auth-benefits">
        <BenefitCard
          number="01"
          title="Меньше хаоса"
          text="Задачи, календарь и тренировки не разбросаны по разным приложениям."
        />
        <BenefitCard
          number="02"
          title="Понятный день"
          text="Вы сразу видите, что запланировано на выбранную дату."
        />
        <BenefitCard
          number="03"
          title="ЗОЖ без перегруза"
          text="Тренировки встроены в обычный планировщик, а не живут отдельно."
        />
      </div>

      <div className="auth-result-box">
        <span>Результат</span>
        <p>
          Один сервис вместо списка дел, календаря и отдельного фитнес-планера.
        </p>
      </div>

      <SocialLinks />
    </div>
  );
}

function LoginInfo() {
  return (
    <div className="auth-info-card login-info auth-info-animated">
      <span className="auth-info-label">Sunday</span>

      <h2>Планируйте день без лишнего хаоса</h2>

      <p>
        Sunday объединяет задачи, календарь и тренировки в одном простом
        интерфейсе.
      </p>

      <div className="auth-feature-list">
        <AuthFeature
          icon={getMenuIcon("Задачи")}
          title="Задачи"
          text="Создавайте дела и отслеживайте выполнение."
        />
        <AuthFeature
          icon={getMenuIcon("Календарь")}
          title="Календарь"
          text="Планируйте день и смотрите задачи по датам."
        />
        <AuthFeature
          icon={getMenuIcon("Тренировки")}
          title="Тренировки"
          text="Добавляйте тренировки и упражнения в расписание."
        />
      </div>

      <SocialLinks />
    </div>
  );
}

function BenefitCard({ number, title, text }) {
  return (
    <div className="auth-benefit-card">
      <strong>{number}</strong>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

function AuthFeature({ icon, title, text }) {
  return (
    <div className="auth-feature">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}

function SocialLinks() {
  return (
    <div className="auth-socials">
      <a href="https://vk.com/" target="_blank" rel="noreferrer">
        VK
      </a>

      <a href="https://t.me/" target="_blank" rel="noreferrer">
        Telegram
      </a>
    </div>
  );
}


function TaskModal({ onClose, onSubmit, isSaving }) {
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadlineMode, setDeadlineMode] = useState("today");

  const [form, setForm] = useState({
    title: "",
    description: "",
    micro_step: "",
    priority: "medium",
    selected_date: "",
    selected_time: "",
  });

  function updateField(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function buildDateTime() {
    if (!hasDeadline) {
      return null;
    }

    const date = new Date();

    if (deadlineMode === "tomorrow") {
      date.setDate(date.getDate() + 1);
    }

    if (deadlineMode === "custom") {
      if (!form.selected_date) {
        return null;
      }

      if (!form.selected_time) {
        return `${form.selected_date}T12:00:00`;
      }

      return `${form.selected_date}T${form.selected_time}:00`;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    if (!form.selected_time) {
      return `${year}-${month}-${day}T12:00:00`;
    }

    return `${year}-${month}-${day}T${form.selected_time}:00`;
  }

  function handleSubmit(event) {
  event.preventDefault();

  if (isSaving) {
    return;
  }

  const trimmedTitle = form.title.trim();

  if (!trimmedTitle) {
    alert("Введите название задачи");
    return;
  }

  if (trimmedTitle.length > 60) {
    alert("Название задачи не должно быть длиннее 60 символов");
    return;
  }

    onSubmit({
    title: trimmedTitle,
    description: form.description,
    micro_step: form.micro_step.trim(),
    priority: form.priority,
    start_datetime: buildDateTime(),
    end_datetime: null,
  });
}

  return (
    <div className="modal-backdrop">
      <form className="simple-modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>Новая задача</h2>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <label className="field">
          <span>Название</span>
          <input
            value={form.title}
            maxLength={60}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Например: подготовить диплом"
            required
          />

          <div className="field-counter">
            {form.title.length}/60
          </div>
        </label>

        <label className="field">
          <span>Описание</span>
          <textarea
            className="task-description-input"
            value={form.description}
            onChange={(event) =>
              updateField("description", event.target.value)
            }
            placeholder="Добавьте описание задачи. Можно переносить строки через Enter."
            rows={4}
          />
        </label>

        <label className="field">
        <span>Первый маленький шаг</span>

        <input
          value={form.micro_step}
          maxLength={80}
          onChange={(event) => updateField("micro_step", event.target.value)}
          placeholder="Например: открыть документ и перечитать введение"
        />

        <div className="field-hint">
          Помогает быстрее начать задачу, даже если она кажется большой.
        </div>

        <div className="field-counter">
          {form.micro_step.length}/80
        </div>
      </label>

        <div className="field">
  <span>Приоритет</span>

  <div className="priority-picker">
    <button
      type="button"
      className={
        form.priority === "low"
          ? "priority-choice low active"
          : "priority-choice low"
      }
      onClick={() => setForm({ ...form, priority: "low" })}
      title="Низкий приоритет"
    >
      !
    </button>

    <button
      type="button"
      className={
        form.priority === "medium"
          ? "priority-choice medium active"
          : "priority-choice medium"
      }
      onClick={() => setForm({ ...form, priority: "medium" })}
      title="Средний приоритет"
    >
      !!
    </button>

    <button
      type="button"
      className={
        form.priority === "high"
          ? "priority-choice high active"
          : "priority-choice high"
      }
      onClick={() => setForm({ ...form, priority: "high" })}
      title="Высокий приоритет"
    >
      !!!
    </button>
  </div>
</div>

        <label className="deadline-toggle">
          <input
            type="checkbox"
            checked={hasDeadline}
            onChange={(event) => setHasDeadline(event.target.checked)}
          />
          <span>Добавить время выполнения</span>
        </label>

        {hasDeadline && (
          <div className="deadline-box">
            <div className="deadline-options">
              <button
                type="button"
                className={
                  deadlineMode === "today"
                    ? "deadline-option active"
                    : "deadline-option"
                }
                onClick={() => setDeadlineMode("today")}
              >
                Сегодня
              </button>

              <button
                type="button"
                className={
                  deadlineMode === "tomorrow"
                    ? "deadline-option active"
                    : "deadline-option"
                }
                onClick={() => setDeadlineMode("tomorrow")}
              >
                Завтра
              </button>

              <button
                type="button"
                className={
                  deadlineMode === "custom"
                    ? "deadline-option active"
                    : "deadline-option"
                }
                onClick={() => setDeadlineMode("custom")}
              >
                Выбрать день
              </button>
            </div>

            {deadlineMode === "custom" && (
              <label className="field">
                <span>Дата</span>
                <input
                  type="date"
                  value={form.selected_date}
                  onChange={(event) =>
                    updateField("selected_date", event.target.value)
                  }
                  required={hasDeadline && deadlineMode === "custom"}
                />
              </label>
            )}

            <label className="field">
              <span>Время</span>
              <input
                type="time"
                value={form.selected_time}
                onChange={(event) =>
                  updateField("selected_time", event.target.value)
                }
              />
            </label>
          </div>
        )}

        <button className="primary-btn full" type="submit" disabled={isSaving}>
          {isSaving ? "Сохранение..." : "Сохранить задачу"}
        </button>
      </form>
    </div>
  );
}


function WorkoutModal({
  onClose,
  onSubmit,
  muscleGroups,
  availableExercises,
  compatibleGroups,
  isSaving,
}) {
  const weekDays = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

  const [title, setTitle] = useState("Тренировка");
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [exerciseSearch, setExerciseSearch] = useState("");

  const exercises = Array.isArray(availableExercises)
  ? availableExercises
  : [];

  const filteredExercises = exercises.filter((exercise) => {
  const name = String(exercise.name || "").toLowerCase();
  const muscle = exercise.muscle || exercise.muscle_group || "";

  const matchesSearch =
    exerciseSearch.trim() === "" ||
    name.includes(exerciseSearch.trim().toLowerCase());

  const matchesMuscle =
    selectedMuscles.length === 0 || selectedMuscles.includes(muscle);

  const notSelected = !selectedExercises.some(
    (selectedExercise) => selectedExercise.id === exercise.id
  );

  return matchesSearch && matchesMuscle && notSelected;
});

  function toggleMuscle(muscle) {
    setSelectedMuscles((currentMuscles) => {
      if (currentMuscles.includes(muscle)) {
        return currentMuscles.filter((item) => item !== muscle);
      }

      return [...currentMuscles, muscle];
    });
  }

  function toggleDay(day) {
    setSelectedDays((currentDays) => {
      if (currentDays.includes(day)) {
        return currentDays.filter((item) => item !== day);
      }

      return [...currentDays, day];
    });
  }

  function addExercise(exercise) {
  setSelectedExercises((currentExercises) => [
    ...currentExercises,
    {
      id: exercise.id,
      name: exercise.name,
      muscle: exercise.muscle || exercise.muscle_group || "Без группы",
    },
  ]);

  setExerciseSearch("");
}

  function removeExercise(exerciseName) {
    setSelectedExercises((currentExercises) =>
      currentExercises.filter((exercise) => exercise.name !== exerciseName)
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (selectedExercises.length === 0) {
      alert("Добавьте хотя бы одно упражнение.");
      return;
    }

    if (selectedDays.length === 0) {
      alert("Выберите хотя бы один день недели.");
      return;
    }

    onSubmit({
      title,
      description: "",
      priority: "medium",
      muscle_groups: selectedMuscles,
      repeat_days: selectedDays,
      exercises: selectedExercises.map((exercise) => ({
        exercise_id: exercise.id,
        name: exercise.name,
        muscle_group: exercise.muscle,
        sets_count: 3,
        reps_count: 10,
        weight_kg: null,
      })),
    });
  }

  return (
    <div className="modal-backdrop">
      <form className="simple-modal wide workout-builder" onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>Новая тренировка</h2>

          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <label className="field">
          <span>Название тренировки</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Например: Тренировка спины и бицепса"
            required
          />
        </label>

        <div className="workout-section">
          <h3>Группы мышц</h3>

          <div className="chip-grid">
            {muscleGroups.map((muscle) => (
              <button
                type="button"
                key={muscle.id}
                className={
                  selectedMuscles.includes(muscle.name)
                    ? "choice-chip active"
                    : "choice-chip"
                }
                onClick={() => toggleMuscle(muscle.name)}
              >
                {muscle.name}
              </button>
            ))}
          </div>
        </div>

        <div className="workout-section">
          <h3>Упражнения</h3>

          <input
            className="exercise-search"
            value={exerciseSearch}
            onChange={(event) => setExerciseSearch(event.target.value)}
            placeholder="Начните вводить название упражнения..."
          />

          {(exerciseSearch || selectedMuscles.length > 0) && (
            <div className="exercise-dropdown">
              {filteredExercises.length === 0 ? (
                <div className="exercise-dropdown-empty">
                  Упражнения не найдены
                </div>
              ) : (
                filteredExercises.slice(0, 8).map((exercise) => (
                  <button
                    type="button"
                    key={`${exercise.id}-${exercise.name}`}
                    className="exercise-dropdown-item"
                    onClick={() => addExercise(exercise)}
                  >
                    <span>{exercise.name}</span>
                    <small>{exercise.muscle || exercise.muscle_group}</small>
                  </button>
                ))
              )}
            </div>
          )}

          <div className="selected-exercises">
            {selectedExercises.length === 0 ? (
              <div className="selected-empty">
                Пока упражнения не добавлены
              </div>
            ) : (
              selectedExercises.map((exercise, index) => (
                <div className="selected-exercise-item" key={exercise.name}>
                  <div>
                    <strong>{index + 1}. {exercise.name}</strong>
                    <span>{exercise.muscle}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeExercise(exercise.name)}
                    title="Убрать упражнение"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="workout-section">
          <h3>Повторять по дням</h3>

          <div className="weekday-grid">
            {weekDays.map((day) => (
              <button
                type="button"
                key={day}
                className={
                  selectedDays.includes(day)
                    ? "weekday-chip active"
                    : "weekday-chip"
                }
                onClick={() => toggleDay(day)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <button className="primary-btn full" type="submit" disabled={isSaving}>
          {isSaving ? "Сохранение..." : "Сохранить тренировку"}
        </button>
      </form>
    </div>
  );
}

function Sidebar({
  activePage,
  setActivePage,
  isMobileMenuOpen,
  isSidebarCollapsed,
  closeMobileMenu,
}) {
  return (
    <>
      <aside
        className={
          isSidebarCollapsed
            ? "sidebar desktop-collapsed"
            : "sidebar"
        }
      >
        <div className="brand-row sidebar-brand">
          <AppLogo size={48} />

          <div>
            <h1>Sunday</h1>
            <p>Задачи · Календарь · ЗОЖ</p>
          </div>
        </div>

        <nav className="menu">
          {menuItems.map((item) => (
            <button
              key={item}
              className={activePage === item ? "menu-btn active" : "menu-btn"}
              onClick={() => {
                setActivePage(item);
                closeMobileMenu();
              }}
            >
              <span>{getMenuIcon(item)}</span>
              {item}
            </button>
          ))}
        </nav>

        <div className="premium-card dark">
          <h3>✦ Premium</h3>
          <p>
            Расширенная статистика, готовые программы и неограниченные тренировки.
          </p>
          <button>Подробнее</button>
        </div>
      </aside>

      <div
        className={
          isMobileMenuOpen
            ? "mobile-top-menu open"
            : "mobile-top-menu"
        }
      >
        <div className="mobile-top-menu-header">
          <div className="brand-row">
            <AppLogo size={38} />

            <div>
              <h1>Sunday</h1>
              <p>Ваш планировщик</p>
            </div>
          </div>
        </div>

        <nav className="mobile-top-menu-list">
          {menuItems.map((item) => (
            <button
              key={item}
              className={
                activePage === item
                  ? "mobile-top-menu-item active"
                  : "mobile-top-menu-item"
              }
              onClick={() => {
                setActivePage(item);
                closeMobileMenu();
              }}
            >
              <span>{getMenuIcon(item)}</span>
              {item}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

function TasksPage({
  tasks,
  filteredTasks,
  taskFilter,
  setTaskFilter,
  searchQuery,
  setSearchQuery,
  markTaskDone,
  markWorkoutExerciseDone,
  deleteTask,
  deleteAllTasks,
  openTaskModal,
  openWorkoutModal,
  taskGroups,
  activeTaskGroupId,
  setActiveTaskGroupId,
  openGroupModal,
  openFocusMode,
  deleteTaskGroup,
}) {
  const regularTasks = tasks.filter((task) => task.category !== "Тренировка");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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


      {filteredTasks.length === 0 ? (
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
  <div className="tasks-grid">
    {filteredTasks.map((task) => (
      <TaskCard
        key={task.id}
        task={task}
        markTaskDone={markTaskDone}
        markWorkoutExerciseDone={markWorkoutExerciseDone}
        deleteTask={deleteTask}
        openFocusMode={openFocusMode}
      />
    ))}
  </div>
)}

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

function TaskGroupTabs({
  groups,
  activeGroupId,
  setActiveGroupId,
  openGroupModal,
  deleteTaskGroup,
}) {
  function handleWheel(event) {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.currentTarget.scrollLeft += event.deltaY;
    }
  }

  return (
    <div className="task-groups-bar" onWheel={handleWheel}>
      <button
        type="button"
        className={
          activeGroupId === "all"
            ? "task-group-tab active"
            : "task-group-tab"
        }
        onClick={() => setActiveGroupId("all")}
      >
        Все задачи
      </button>

      {groups.map((group) => (
        <div
  key={group.id}
  className={
    activeGroupId === group.id
      ? "task-group-tab task-group-tab-with-delete active"
      : "task-group-tab task-group-tab-with-delete"
  }
  style={{
    "--group-color": group.color || "#E6F8FA",
  }}
>
  <button
  type="button"
  className="task-group-name-btn"
  onClick={() => setActiveGroupId(group.id)}
  title={group.name}
>
  {group.name}
</button>

  <button
    type="button"
    className="task-group-delete-btn"
    onClick={(event) => {
      event.stopPropagation();
      deleteTaskGroup(group.id);
    }}
    title="Удалить группу"
  >
    ×
  </button>
</div>
      ))}

      <button
        type="button"
        className="task-group-add"
        onClick={openGroupModal}
      >
        + Группа
      </button>
    </div>
  );
}

function TaskGroupModal({ onClose, onSubmit, isSaving }) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(groupColors[5]);

  const maxGroupNameLength = 20;

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName || isSaving) {
      return;
    }

    if (trimmedName.length > maxGroupNameLength) {
      alert(`Название группы не должно быть длиннее ${maxGroupNameLength} символов`);
      return;
    }

    onSubmit({
      name: trimmedName,
      color: selectedColor,
    });
  }

  return (
    <div className="modal-backdrop">
      <form className="simple-modal group-modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>Новая группа</h2>

          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <label className="field">
          <span>Название группы</span>

          <input
            value={name}
            maxLength={maxGroupNameLength}
            onChange={(event) => setName(event.target.value)}
            placeholder="Например: Учёба"
          />

          <div className="field-counter">
            {name.length}/{maxGroupNameLength}
          </div>
        </label>

        <div className="group-color-field">
          <span>Цвет группы</span>

          <div className="group-color-palette">
            {groupColors.map((color) => (
              <button
                type="button"
                key={color}
                className={
                  selectedColor === color
                    ? "group-color-dot active"
                    : "group-color-dot"
                }
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
                aria-label="Выбрать цвет группы"
              />
            ))}
          </div>
        </div>

        <button className="primary-btn full" type="submit" disabled={isSaving}>
          {isSaving ? "Сохранение..." : "Сохранить группу"}
        </button>
      </form>
    </div>
  );
}


function TaskCard({
  task,
  markTaskDone,
  markWorkoutExerciseDone,
  deleteTask,
  openFocusMode,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isCompleted = task.status === "Выполнена";
  const hasDescription = Boolean(task.description && task.description.trim());
  const hasMicroStep = Boolean(task.microStep && task.microStep.trim());

  function handleCardClick() {
    setIsExpanded((current) => !current);
  }

  function stopClick(event) {
    event.stopPropagation();
  }

  return (
    <article
      className={
        isCompleted
          ? isExpanded
            ? "task-card mini-task-card completed expanded"
            : "task-card mini-task-card completed"
          : isExpanded
            ? "task-card mini-task-card expanded"
            : "task-card mini-task-card"
      }
      style={{
        "--task-group-color": task.groupColor || "rgba(255, 255, 255, 0.64)",
      }}
      onClick={handleCardClick}
    >
      <div className="mini-task-row">
        <button
          type="button"
          className={isCompleted ? "task-check done" : "task-check"}
          onClick={(event) => {
            stopClick(event);
            markTaskDone(task.id);
          }}
          title="Отметить как выполнено"
        >
          {isCompleted ? "✓" : ""}
        </button>

        <div className="mini-task-main">
          <div className="mini-task-title-line">
            <h3>{task.title}</h3>
            <PriorityIndicator priority={task.priority} />
          </div>

          <div className="mini-task-meta">
            <span
              className={
                task.date === "Без срока" ? "task-date no-date" : "task-date"
              }
            >
              ◷ {task.date}
            </span>

            {task.groupName && (
              <span
                className="task-group-label mini-task-group"
                style={{
                  "--task-group-color": task.groupColor || "#E6F8FA",
                }}
              >
                {task.groupName}
              </span>
            )}

            {isCompleted && (
              <span className="completed-label mini-completed-label">
                Выполнено
              </span>
            )}
          </div>
        </div>

        <div className="task-actions" onClick={stopClick}>
          <button
            type="button"
            className="task-focus-btn"
            title="Режим концентрации"
            onClick={() => openFocusMode(task)}
          >
            ◎
          </button>

          <button
            type="button"
            className="dots delete-btn"
            onClick={() => deleteTask(task.id)}
            title="Удалить задачу"
          >
            ×
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mini-task-expanded">
          {hasMicroStep && (
            <div className="micro-step-box">
              <span>Микро-шаг</span>
              <p>{task.microStep}</p>
            </div>
          )}

          {hasDescription ? (
            <p className="mini-task-description">{task.description}</p>
          ) : (
            <p className="mini-task-description empty-description">
              Описание не добавлено
            </p>
          )}

          {task.exercises && (
            <div className="exercise-box workout-subtasks" onClick={stopClick}>
              <strong>Упражнения</strong>

              <div className="workout-subtask-list">
                {task.exercises.map((exercise) => {
                  const exerciseName =
                    typeof exercise === "string" ? exercise : exercise.name;

                  const isExerciseCompleted =
                    typeof exercise === "string"
                      ? false
                      : exercise.is_completed;

                  return (
                    <div
                      key={
                        exercise.workout_exercise_id ||
                        exercise.id ||
                        exerciseName
                      }
                      className={
                        isExerciseCompleted
                          ? "workout-subtask completed"
                          : "workout-subtask"
                      }
                    >
                      <button
                        type="button"
                        className={
                          isExerciseCompleted
                            ? "workout-subtask-check done"
                            : "workout-subtask-check"
                        }
                        onClick={() => {
                          if (
                            !exercise.workout_exercise_id ||
                            isExerciseCompleted
                          ) {
                            return;
                          }

                          markWorkoutExerciseDone(exercise.workout_exercise_id);
                        }}
                        disabled={
                          isExerciseCompleted || !exercise.workout_exercise_id
                        }
                        title={
                          isExerciseCompleted
                            ? "Упражнение выполнено"
                            : "Отметить упражнение выполненным"
                        }
                      >
                        {isExerciseCompleted ? "✓" : ""}
                      </button>

                      <p>{exerciseName}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function CalendarPage({ tasks, createTask, deleteTask, markTaskDone }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [visibleDate, setVisibleDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [isMobileDayPanelOpen, setIsMobileDayPanelOpen] = useState(true);

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskCategory, setTaskCategory] = useState("Личное");

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

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const emptyDaysBefore = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const calendarCells = [
    ...Array.from({ length: emptyDaysBefore }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const selectedTasks = getTasksForDate(selectedDate);
  const selectedDateIsPast = isPastDate(selectedDate);

  function goToPreviousMonth() {
    setVisibleDate(new Date(currentYear, currentMonth - 1, 1));
  }

  function goToNextMonth() {
    setVisibleDate(new Date(currentYear, currentMonth + 1, 1));
  }

  function goToCurrentMonth() {
    setVisibleDate(new Date());
    setSelectedDate(today);
    setIsMobileDayPanelOpen(true);
  }

  function getDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function getCellDate(day) {
    const cellDate = new Date(currentYear, currentMonth, day);
    cellDate.setHours(0, 0, 0, 0);

    return cellDate;
  }

  function isPastDate(date) {
    return date < today;
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

  function selectDay(day) {
    if (!day) {
      return;
    }

    const date = getCellDate(day);
    const isSameDay = date.getTime() === selectedDate.getTime();

    if (isSameDay) {
      setIsMobileDayPanelOpen((current) => !current);
    } else {
      setSelectedDate(date);
      setIsMobileDayPanelOpen(true);
    }

    setIsAddingTask(false);
    setTaskTitle("");
    setTaskTime("");
    setTaskPriority("medium");
    setTaskCategory("Личное");
  }

  function handleCreateTask(event) {
    event.preventDefault();

    if (isPastDate(selectedDate)) {
      return;
    }

    const dateString = getDateString(selectedDate);

    createTask({
      title: taskTitle,
      description: "",
      category: taskCategory,
      priority: taskPriority,
      start_datetime: taskTime
        ? `${dateString}T${taskTime}:00`
        : `${dateString}T12:00:00`,
      end_datetime: null,
    });

    setTaskTitle("");
    setTaskTime("");
    setTaskPriority("medium");
    setTaskCategory("Личное");
    setIsAddingTask(false);
  }

  function renderDayPanelContent() {
    return (
      <>
        <div className="day-panel-header">
          <div>
            <span className="day-panel-label">Выбранный день</span>
            <h3>{selectedDateText}</h3>

            {isTodayDate(selectedDate) && (
              <p className="day-panel-today">Сегодня</p>
            )}

            {selectedDateIsPast && (
              <p className="day-panel-past">
                Прошедший день — добавление задач недоступно
              </p>
            )}
          </div>

          {!selectedDateIsPast && (
            <button
              className="primary-btn"
              type="button"
              onClick={() => setIsAddingTask((current) => !current)}
            >
              {isAddingTask ? "Отмена" : "+ Задача"}
            </button>
          )}
        </div>

        {isAddingTask && !selectedDateIsPast && (
          <form className="day-task-form" onSubmit={handleCreateTask}>
            <label className="field">
              <span>Название задачи</span>
              <input
                value={taskTitle}
                onChange={(event) => setTaskTitle(event.target.value)}
                placeholder="Например: подготовить отчёт"
                required
              />
            </label>

            <div className="form-grid">
              <label className="field">
                <span>Категория</span>
                <select
                  value={taskCategory}
                  onChange={(event) => setTaskCategory(event.target.value)}
                >
                  <option>Личное</option>
                  <option>Учёба</option>
                  <option>Работа</option>
                  <option>Здоровье</option>
                </select>
              </label>

              <label className="field">
                <span>Приоритет</span>
                <select
                  value={taskPriority}
                  onChange={(event) => setTaskPriority(event.target.value)}
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
              </label>
            </div>

            <label className="field">
              <span>Время, необязательно</span>
              <input
                type="time"
                value={taskTime}
                onChange={(event) => setTaskTime(event.target.value)}
              />
            </label>

            <button className="primary-btn full" type="submit">
              Добавить
            </button>
          </form>
        )}

        <div className="day-tasks-list">
          {selectedTasks.length === 0 ? (
            <div className="day-empty">
              <strong>Задач нет</strong>
              <p>На этот день пока ничего не запланировано.</p>
            </div>
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
              aria-label="Предыдущий месяц"
            >
              ←
            </button>

            <div className="calendar-title">
              <h3>{capitalizeFirstLetter(monthName)}</h3>
              <button type="button" onClick={goToCurrentMonth}>
                Сегодня
              </button>
            </div>

            <button
              type="button"
              className="calendar-nav-btn"
              onClick={goToNextMonth}
              aria-label="Следующий месяц"
            >
              →
            </button>
          </div>

          <div className="calendar">
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
              <div className="week-day" key={day}>
                {day}
              </div>
            ))}

            {calendarCells.map((day, index) => {
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

              const cellDate = getCellDate(day);
              const dayTasks = getTasksForDate(cellDate);
              const past = isPastDate(cellDate);
              const currentToday = isTodayDate(cellDate);
              const selected = isSelectedDate(cellDate);

              return (
                <React.Fragment key={index}>
                  <button
                    type="button"
                    className={
                      selected
                        ? "calendar-day selected"
                        : past
                          ? "calendar-day past"
                          : currentToday
                            ? "calendar-day today"
                            : "calendar-day"
                    }
                    onClick={() => selectDay(day)}
                  >
                    <div className="calendar-day-top">
                      <strong>{day}</strong>

                      {dayTasks.length > 0 && (
                        <span className="calendar-task-dot">
                          {dayTasks.length}
                        </span>
                      )}
                    </div>

                    <div className="calendar-day-events">
                      {dayTasks.slice(0, 2).map((task) => (
  <span key={task.id} className="calendar-event blue">
    {task.title}
  </span>
))}

                      {dayTasks.length > 2 && (
                        <span className="calendar-more">
                          + ещё {dayTasks.length - 2}
                        </span>
                      )}
                    </div>
                  </button>

                  {selected && isMobileDayPanelOpen && (
                    <div className="day-panel mobile-inline-day-panel">
                      {renderDayPanelContent()}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <aside className="day-panel desktop-day-panel">
          {renderDayPanelContent()}
        </aside>
      </div>
    </section>
  );
}

function CalendarTaskItem({ task, deleteTask, markTaskDone }) {
  const isCompleted = task.status === "Выполнена";

  return (
    <div className={isCompleted ? "day-task-item completed" : "day-task-item"}>
      <div className="day-task-main">
        <h4>{task.title}</h4>
        <p>{task.date}</p>

        <div className="badges">
          <Badge type={getStatusType(task.status)}>{task.status}</Badge>
        </div>
      </div>

      <div className="day-task-actions">
        {!isCompleted && (
          <button
            type="button"
            className="day-task-complete"
            onClick={() => markTaskDone(task.id)}
            title="Завершить задачу"
          >
            ✓
          </button>
        )}

        <button
          type="button"
          className="day-task-delete"
          onClick={() => deleteTask(task.id)}
          title="Удалить задачу"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function WorkoutsPage({ tasks, openWorkoutModal, markWorkoutExerciseDone }) {
  const workouts = tasks.filter((task) => task.category === "Тренировка");

  return (
    <section>
      <PageHeader
        title="Тренировки"
        subtitle="Планируйте повторяющиеся тренировки и отмечайте упражнения."
        actions={
          <button className="primary-btn" onClick={openWorkoutModal}>
            + Добавить тренировку
          </button>
        }
      />

      {workouts.length === 0 ? (
        <div className="empty-state">
          <h3>Тренировок пока нет</h3>
          <p>Создайте первую тренировку и выберите упражнения.</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              markWorkoutExerciseDone={markWorkoutExerciseDone}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function WorkoutCard({ workout, markWorkoutExerciseDone }) {
  return (
    <article className="task-card workout-card">
      <div className="task-top">
        <div>
          <div className="task-title-row">
            <span className="task-check">🏋</span>
            <h3>{workout.title}</h3>
          </div>

          <p>{workout.description || "Повторяющаяся тренировка"}</p>
        </div>
      </div>

      <div className="badges">
        <Badge type="green">Тренировка</Badge>

        {workout.muscle && (
          <Badge type="purple">{workout.muscle}</Badge>
        )}

        {workout.repeatDays?.length > 0 && (
          <Badge type="blue">{workout.repeatDays.join(", ")}</Badge>
        )}
      </div>

      {workout.exercises && workout.exercises.length > 0 && (
        <div className="exercise-box workout-subtasks">
          <strong>Упражнения</strong>

          <div className="workout-subtask-list">
            {workout.exercises && workout.exercises.length > 0 && (
  <div className="exercise-box workout-subtasks">
    <strong>Упражнения</strong>

    <div className="workout-subtask-list">
      {workout.exercises.map((exercise) => {
        const exerciseName =
          typeof exercise === "string" ? exercise : exercise.name;

        const isExerciseCompleted =
          typeof exercise === "string" ? false : exercise.is_completed;

        return (
          <div
            key={exercise.workout_exercise_id || exercise.id || exerciseName}
            className={
              isExerciseCompleted
                ? "workout-subtask completed"
                : "workout-subtask"
            }
          >
            <button
              type="button"
              className={
                isExerciseCompleted
                  ? "workout-subtask-check done"
                  : "workout-subtask-check"
              }
              onClick={() => {
                if (!exercise.workout_exercise_id || isExerciseCompleted) {
                  return;
                }

                markWorkoutExerciseDone(exercise.workout_exercise_id);
              }}
              disabled={isExerciseCompleted || !exercise.workout_exercise_id}
            >
              {isExerciseCompleted ? "✓" : ""}
            </button>

            <p>{exerciseName}</p>
          </div>
        );
      })}
    </div>
  </div>
)}
          </div>
        </div>
      )}
    </article>
  );
}

function StatsPage({ tasks }) {
  const completed = tasks.filter((task) => task.status === "Выполнена").length;

  const percentage =
    tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

  return (
    <section>
      <PageHeader
        title="Статистика"
        subtitle="Контроль активности и выполнения задач."
      />

      <div className="stats-grid three">
        <StatCard title="Выполнение задач" value={`${percentage}%`} icon="✓" />
        <StatCard title="Тренировки" value="3" icon="🏋" />
        <StatCard title="Серия активности" value="5 дней" icon="↗" />
      </div>

      <div className="premium-wide">
        <h3>🔒 Premium-аналитика</h3>
        <p>
          Подробная история прогресса, экспорт данных, готовые тренировочные
          программы и расширенная библиотека упражнений доступны в
          Premium-подписке.
        </p>
      </div>
    </section>
  );
}

function ProfilePage({ currentUser, subscription, logout }) {
  const isPremium = subscription?.code === "premium";
  const isGuest = currentUser?.is_guest;

  return (
    <section>
      <PageHeader
        title="Профиль"
        subtitle="Информация об аккаунте и подписке."
      />

      <div className="profile-card">
        <div className="avatar">👤</div>

        <div>
          <h3>{currentUser?.username || "Пользователь"}</h3>
          <p>{currentUser?.email || "Гостевой режим"}</p>

          <div className="badges">
            <Badge type={isPremium ? "purple" : isGuest ? "gray" : "blue"}>
              {subscription?.name || "Free"}
            </Badge>
          </div>
        </div>
      </div>

      {isGuest ? (
        <div className="premium-card light">
          <h3>Гостевой режим</h3>
          <p>
            В гостевом режиме задачи и тренировки не сохраняются после выхода.
            Зарегистрируйтесь, чтобы хранить данные в личном аккаунте.
          </p>
        </div>
      ) : isPremium ? (
        <div className="premium-card light">
          <h3>Premium активен</h3>
          <p>
            Вам доступны неограниченные задачи и тренировки, расширенная
            статистика, история прогресса и расширенная библиотека упражнений.
          </p>
        </div>
      ) : (
        <div className="premium-card light">
          <h3>Перейти на Premium</h3>
          <p>
            Premium откроет неограниченные задачи, расширенную статистику,
            готовые программы тренировок и расширенную библиотеку упражнений.
          </p>
        </div>
      )}

      <button className="danger-btn" onClick={logout}>
        Выйти
      </button>
    </section>
  );
}

function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
      </div>

      <span>{icon}</span>
    </div>
  );
}

function HeaderProgressBar({ total, completed }) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="header-progress-bar-card" title="Прогресс задач">
      <div className="header-progress-bar-top">
        <span>Прогресс</span>
        <strong>
          {completed}/{total}
        </strong>
      </div>

      <div className="header-progress-track">
        <div
          className="header-progress-fill"
          style={{
            width: `${percent}%`,
          }}
        />
      </div>

      <span className="header-progress-percent">{percent}%</span>
    </div>
  );
}

function DayProgressRing({ total, completed }) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const angle = Math.round((percent / 100) * 360);

  return (
    <div className="day-progress-card">
      <div
        className="day-progress-ring"
        style={{
          "--progress-angle": `${angle}deg`,
        }}
      >
        <div className="day-progress-inner">
          <strong>{percent}%</strong>
          <span>готово</span>
        </div>
      </div>

      <div className="day-progress-info">
        <span>Прогресс дня</span>
        <h3>
          {completed} / {total}
        </h3>
        <p>
          {total === 0
            ? "Создайте первую задачу на день"
            : "Выполнено задач"}
        </p>
      </div>
    </div>
  );
}

function PriorityIndicator({ priority }) {
  const priorityConfig = {
    Высокий: {
      className: "high",
      label: "Высокий приоритет",
      icon: "!!!",
    },
    Средний: {
      className: "medium",
      label: "Средний приоритет",
      icon: "!!",
    },
    Низкий: {
      className: "low",
      label: "Низкий приоритет",
      icon: "!",
    },
  };

  const config = priorityConfig[priority] || priorityConfig["Средний"];

  return (
    <span
      className={`priority-indicator ${config.className}`}
      data-tooltip={config.label}
      aria-label={config.label}
    >
      {config.icon}
    </span>
  );
}

function Badge({ children, type }) {
  return <span className={`badge ${type}`}>{children}</span>;
}

function LoaderIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="menu-icon-svg"
    >
      <path d="M12 2v4" />
      <path d="m16.2 7.8 2.9-2.9" />
      <path d="M18 12h4" />
      <path d="m16.2 16.2 2.9 2.9" />
      <path d="M12 18v4" />
      <path d="m4.9 19.1 2.9-2.9" />
      <path d="M2 12h4" />
      <path d="m4.9 4.9 2.9 2.9" />
    </svg>
  );
}

function getMenuIcon(item) {
  return menuIcons[item] || "•";
}

function getPriorityType(priority) {
  if (priority === "Высокий") {
    return "red";
  }

  if (priority === "Средний") {
    return "yellow";
  }

  return "blue";
}

function getStatusType(status) {
  if (status === "Выполнена") {
    return "green";
  }

  if (status === "В процессе") {
    return "purple";
  }

  return "gray";
}

function formatTaskFromApi(task) {
  const repeatDays = task.repeat_days || [];

  return {
    id: task.id,
    title: task.title,
    description: task.description || "",
    microStep: task.micro_step || "",
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

function formatPriority(priority) {
  const values = {
    low: "Низкий",
    medium: "Средний",
    high: "Высокий",
  };

  return values[priority] || priority;
}

function formatStatus(status) {
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

function capitalizeFirstLetter(text) {
  if (!text) {
    return "";
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatDate(dateValue) {
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

export default App;