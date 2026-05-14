import React, { useEffect, useMemo, useRef, useState } from "react";
import "./styles/styles.css";
import AppLogo from "./components/AppLogo.jsx";

const API_URL = "http://localhost:5000/api"; //Для сервера пишем просто /api

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
  const [taskModalInitialDate, setTaskModalInitialDate] = useState(null);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [workoutModalInitialData, setWorkoutModalInitialData] = useState(null);

  const [muscleGroups, setMuscleGroups] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [compatibleGroups, setCompatibleGroups] = useState([]);

  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [focusTask, setFocusTask] = useState(null);

  const [workingWeights, setWorkingWeights] = useState([]);

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

    const now = new Date();
now.setHours(0, 0, 0, 0);

const oneMonthAgo = new Date(now);
oneMonthAgo.setMonth(now.getMonth() - 1);

if (task.rawDate) {
  const taskDate = new Date(task.rawDate);
  taskDate.setHours(0, 0, 0, 0);

  if (taskDate < oneMonthAgo && task.status !== "Выполнена") {
    return false;
  }
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

useEffect(() => {
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);

  tasks.forEach((task) => {
    if (!task.rawDate || task.status === "Выполнена") {
      return;
    }

    const taskDate = new Date(task.rawDate);

    if (taskDate < oneMonthAgo) {
      deleteTask(task.id);
    }
  });
}, [tasks]);

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
      loadExerciseMetrics(token);
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
      loadExerciseMetrics(data.token);
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
  setWorkingWeights([]);
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
      loadExerciseMetrics(data.token);
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
  setWorkingWeights([]);
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

function loadExerciseMetrics(token = localStorage.getItem("token")) {
  if (!token || currentUser?.is_guest) {
    setWorkingWeights([]);
    return;
  }

  fetch(`${API_URL}/exercise-metrics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (!Array.isArray(data)) {
        console.error("Ошибка загрузки рабочих показателей:", data);
        setWorkingWeights([]);
        return;
      }

      setWorkingWeights(data);
    })
    .catch((error) => {
      console.error("Ошибка загрузки рабочих показателей:", error);
      setWorkingWeights([]);
    });
}

  function loadTasks(token = localStorage.getItem("token")) {
  if (!token) {
    return;
  }

  function loadExerciseMetrics(token = localStorage.getItem("token")) {
  if (!token || currentUser?.is_guest) {
    setWorkingWeights([]);
    return;
  }

  fetch(`${API_URL}/exercise-metrics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (!Array.isArray(data)) {
        console.error("Ошибка загрузки рабочих показателей:", data);
        setWorkingWeights([]);
        return;
      }

      setWorkingWeights(data);
    })
    .catch((error) => {
      console.error("Ошибка загрузки рабочих показателей:", error);
      setWorkingWeights([]);
    });
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
            deleteTask={deleteTask}
            markTaskDone={markTaskDone}
            openTaskModal={(dateString) => {
              setTaskModalInitialDate(dateString);
              setIsTaskModalOpen(true);
            }}
          />
        );

      case "Тренировки":
        return (
          <WorkoutsPage
            tasks={tasks}
            openWorkoutModal={(initialData = null) => {
              setWorkoutModalInitialData(initialData);
              setIsWorkoutModalOpen(true);
            }}
            markWorkoutExerciseDone={markWorkoutExerciseDone}
            muscleGroups={muscleGroups}
            availableExercises={availableExercises}
            compatibleGroups={compatibleGroups}
            workingWeights={workingWeights}
            setWorkingWeights={setWorkingWeights}
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
            openTaskModal={() => {
              setTaskModalInitialDate(null);
              setIsTaskModalOpen(true);
            }}
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
        {isMobileMenuOpen && (
          <div
            className="mobile-menu-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          tasks={tasks}
          currentUser={currentUser}
          subscription={subscription}
          isMobileMenuOpen={isMobileMenuOpen}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          closeMobileMenu={() => setIsMobileMenuOpen(false)}
        />

        <main className="content">{renderPage()}</main>
      </div>

      {isTaskModalOpen && (
        <TaskModal
          initialDate={taskModalInitialDate}
          onClose={() => {
            setIsTaskModalOpen(false);
            setTaskModalInitialDate(null);
          }}
          onSubmit={createTask}
          isSaving={isSavingTask}
        />
      )}



      {isWorkoutModalOpen && (
        <WorkoutModal
          initialData={workoutModalInitialData}
          onClose={() => {
            setWorkoutModalInitialData(null);
            setIsWorkoutModalOpen(false);
          }}
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


function TaskModal({ initialDate, onClose, onSubmit, isSaving }) {
  const [hasDeadline, setHasDeadline] = useState(Boolean(initialDate));
  const [deadlineMode, setDeadlineMode] = useState(
    initialDate ? "custom" : "today"
  );

  const [form, setForm] = useState({
    title: "",
    description: "",
    micro_step: "",
    priority: "medium",
    selected_date: initialDate || "",
    selected_time: "",
  });

  const todayString = new Date().toISOString().split("T")[0];

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

  const selectedDate = buildDateTime();

  if (selectedDate) {
    const taskDate = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);

    if (taskDate < today) {
      alert("Нельзя создать задачу на прошедший день");
      return;
    }
  }
    onSubmit({
    title: trimmedTitle,
    description: form.description,
    micro_step: form.micro_step.trim(),
    priority: form.priority,
    start_datetime: selectedDate,
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
                  min={todayString}
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
  initialData,
  onClose,
  onSubmit,
  muscleGroups,
  availableExercises,
  compatibleGroups,
  isSaving,
}) {
  const weekDays = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

  const [title, setTitle] = useState(
  initialData?.title || "Тренировка"
  );

  const [selectedMuscles, setSelectedMuscles] = useState(
    initialData?.muscle_groups || []
  );

  const [selectedExercises, setSelectedExercises] = useState(
    initialData?.exercises || []
  );
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
  tasks,
  currentUser,
  subscription,
  isMobileMenuOpen,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  closeMobileMenu,
}) {
  const todayString = new Date().toISOString().split("T")[0];

  const todayTasks = tasks.filter((task) => {
    if (!task.rawDate) {
      return false;
    }

    return task.rawDate.startsWith(todayString);
  });

  const todayRegularTasks = todayTasks.filter(
    (task) => task.category !== "Тренировка" && task.status !== "Выполнена"
  );

  const todayWorkouts = todayTasks.filter(
    (task) => task.category === "Тренировка"
  );

  const isPremium = subscription?.code === "premium";

  const navGroups = [
  {
    title: "Планирование",
    items: ["Задачи", "Календарь", "Тренировки", "Статистика"],
  },
  {
    title: "Аккаунт",
    items: ["Профиль"],
  },
];

  function openPage(page) {
    setActivePage(page);
    closeMobileMenu();
  }

  function renderMenuButton(item, className = "sidebar-nav-item") {
    return (
      <button
        key={item}
        type="button"
        className={activePage === item ? `${className} active` : className}
        onClick={() => openPage(item)}
        title={item}
      >
        <span className="sidebar-nav-icon">{getMenuIcon(item)}</span>
        <span className="sidebar-nav-text">{item}</span>
      </button>
    );
  }

  return (
    <>
      <aside
        className={
          isSidebarCollapsed
            ? "sidebar sunday-sidebar desktop-collapsed"
            : "sidebar sunday-sidebar"
        }
      >
        <button
  type="button"
  className="sidebar-wall-toggle"
  onClick={() => setIsSidebarCollapsed((current) => !current)}
  title={isSidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
  aria-label={isSidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
/>
        <div className="sidebar-brand-new">
          
  <button
    type="button"
    className="sidebar-logo-button"
    onClick={() => openPage("Задачи")}
    title="На главную"
  >
    <AppLogo size={42} />
  </button>

  <div className="sidebar-brand-text">
    <h1>Sunday</h1>
    <p>Личный органайзер</p>
  </div>
  <button
  type="button"
  className="sidebar-inner-toggle"
  onClick={() => setIsSidebarCollapsed((current) => !current)}
  title={isSidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
  aria-label={isSidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
>
  <svg
    className="sidebar-inner-toggle-icon"
    viewBox="0 0 24 24"
    fill="none"
  >
    {isSidebarCollapsed ? (
      <path
        d="M10 7L15 12L10 17"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <path
        d="M14 7L9 12L14 17"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
</button>
</div>

        <nav className="sidebar-nav-new">
          {navGroups.map((group) => (
            <div className="sidebar-nav-group" key={group.title}>
              <span className="sidebar-nav-title">{group.title}</span>

              <div className="sidebar-nav-list">
                {group.items.map((item) => renderMenuButton(item))}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-today-card">
          <span>Сегодня</span>

          <div className="sidebar-today-grid">
            <div>
              <strong>{todayRegularTasks.length}</strong>
              <p>задачи</p>
            </div>

            <div>
              <strong>{todayWorkouts.length}</strong>
              <p>тренировки</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className={isPremium ? "sidebar-premium-new active" : "sidebar-premium-new"}
          onClick={() => openPage("Профиль")}
        >
          <span>✦ Premium</span>

          <strong>
            {isPremium ? "Активен" : "Больше возможностей"}
          </strong>

          <p>
            {isPremium
              ? "Расширенные функции доступны"
              : "Статистика, программы и расширенные тренировки"}
          </p>
        </button>

        <div className="sidebar-user-new">
          <div className="sidebar-user-avatar">
            {(currentUser?.username || currentUser?.name || "Г")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="sidebar-user-info">
            <strong>
              {currentUser?.username || currentUser?.name || "Гость"}
            </strong>
            <p>{currentUser?.is_guest ? "Гостевой режим" : "Аккаунт активен"}</p>
          </div>
        </div>
      </aside>

      <div
        className={
          isMobileMenuOpen
            ? "mobile-top-menu sunday-mobile-menu open"
            : "mobile-top-menu sunday-mobile-menu"
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
              onClick={() => openPage(item)}
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
            deleteTask={deleteTask}
            openFocusMode={openFocusMode}
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
              deleteTask={deleteTask}
              openFocusMode={openFocusMode}
            />
          ))}
        </div>
      </div>
    )}
  </>
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

  if (isPastDate(date)) {
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

  {!selectedDateIsPast && (
    <button
      className="day-panel-add-btn"
      type="button"
      onClick={() => openTaskModal(getDateString(selectedDate))}
    >
      + Задача
    </button>
  )}
</div>

<DayPanelProgressBar
  total={selectedTasks.length}
  completed={selectedCompletedTasks}
/>

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
  <button
    type="button"
    className="day-empty day-empty-beauty"
    onClick={() => {
      if (!selectedDateIsPast) {
        openTaskModal(getDateString(selectedDate));
      }
    }}
    disabled={selectedDateIsPast}
  >
    <span className="day-empty-icon">+</span>

    <strong>
      {selectedDateIsPast ? "День уже прошёл" : "День свободен"}
    </strong>

    <p>
      {selectedDateIsPast
        ? "На этот день задач не было."
        : "Можно оставить его для отдыха или запланировать что-то полезное."}
    </p>

    {!selectedDateIsPast && (
      <span className="day-empty-action">Запланировать день</span>
    )}
  </button>
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
        const currentToday = isTodayDate(cellDate);
        const selected = isSelectedDate(cellDate);

        const dayClassName = [
          "calendar-day",
          selected ? "selected" : "",
          past ? "past" : "",
          currentToday ? "today" : "",
          dayTasks.length > 0 ? "has-tasks" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <React.Fragment key={`${year}-${month}-${index}`}>
            <button
  type="button"
  className={dayClassName}
  onClick={() => {
    if (!past) {
      selectDay(day, monthDate);
    }
  }}
  disabled={past}
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

            {selected && isMobileDayPanelOpen && !previousVisibleDate && (
              <div className="day-panel mobile-inline-day-panel">
                {renderDayPanelContent()}
              </div>
            )}
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

        <aside className="day-panel desktop-day-panel">
          {renderDayPanelContent()}
        </aside>
      </div>
    </section>
  );
}

function CalendarTaskItem({ task, deleteTask, markTaskDone }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isCompleted = task.status === "Выполнена";
  const hasMicroStep = Boolean(task.microStep && task.microStep.trim());
  const hasDescription = Boolean(task.description && task.description.trim());

  function stopClick(event) {
    event.stopPropagation();
  }

  return (
    <article
      className={
        isCompleted
          ? isExpanded
            ? "calendar-mini-task completed expanded"
            : "calendar-mini-task completed"
          : isExpanded
            ? "calendar-mini-task expanded"
            : "calendar-mini-task"
      }
      onClick={() => setIsExpanded((current) => !current)}
    >
      <div className="calendar-mini-task-row">
        <button
          type="button"
          className={
            isCompleted
              ? "calendar-mini-task-check done"
              : "calendar-mini-task-check"
          }
          onClick={(event) => {
            stopClick(event);
            markTaskDone(task.id);
          }}
          title="Отметить как выполнено"
        >
          {isCompleted ? "✓" : ""}
        </button>

        <div className="calendar-mini-task-content">
          <div className="calendar-mini-task-title">
            <h4>{task.title}</h4>
            <PriorityIndicator priority={task.priority} />
          </div>

          <div className="calendar-mini-task-meta">
            <span>{task.date || "Без срока"}</span>

            {task.groupName && (
              <span
                className="calendar-mini-task-group"
                style={{
                  "--task-group-color": task.groupColor || "#E6F8FA",
                }}
              >
                {task.groupName}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          className="calendar-mini-task-delete"
          onClick={(event) => {
            stopClick(event);
            deleteTask(task.id);
          }}
          title="Удалить задачу"
        >
          ×
        </button>
      </div>

      {isExpanded && (
        <div className="calendar-mini-task-expanded">
          {hasMicroStep && (
            <div className="calendar-mini-task-micro">
              <span>Микро-шаг</span>
              <p>{task.microStep}</p>
            </div>
          )}

          {hasDescription && (
            <p className="calendar-mini-task-description">
              {task.description}
            </p>
          )}

          {!hasMicroStep && !hasDescription && (
            <p className="calendar-mini-task-description muted">
              Описание не добавлено
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function WorkoutsPage({
  tasks = [],
  availableExercises = [],
  workingWeights = [],
  setWorkingWeights,
}) {
  const workouts = tasks.filter((task) => task.category === "Тренировка");

  const [activeSection, setActiveSection] = useState("weights");
  const [isWorkingWeightModalOpen, setIsWorkingWeightModalOpen] =
    useState(false);
  const [editingWorkingWeight, setEditingWorkingWeight] = useState(null);

  const sections = [
    {
      id: "weights",
      title: "Мой рабочий вес",
      subtitle: "Вес, подходы и повторения для каждого упражнения",
      count: workingWeights.length,
      countText: "упражнений",
    },
    {
      id: "plans",
      title: "Мои тренировки",
      subtitle: "Запланированные тренировки и будущий режим выполнения",
      count: workouts.length,
      countText: "запланировано",
    },
    {
      id: "guides",
      title: "Гайды",
      subtitle: "Техника выполнения упражнений и частые ошибки",
      count: availableExercises.length,
      countText: "гайдов",
    },
  ];

  function openAddWorkingWeightModal() {
    setEditingWorkingWeight(null);
    setIsWorkingWeightModalOpen(true);
  }

  function openEditWorkingWeightModal(item) {
    setEditingWorkingWeight(item);
    setIsWorkingWeightModalOpen(true);
  }

  function closeWorkingWeightModal() {
    setEditingWorkingWeight(null);
    setIsWorkingWeightModalOpen(false);
  }

  function saveWorkingWeight(newItem) {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Необходимо войти в аккаунт");
    return;
  }

  const isEditing = Boolean(newItem.id && editingWorkingWeight);

  fetch(
    isEditing
      ? `${API_URL}/exercise-metrics/${newItem.id}`
      : `${API_URL}/exercise-metrics`,
    {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newItem),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert(data.error);
        return;
      }

      setWorkingWeights((current) => {
        const exists = current.some((item) => item.id === data.id);

        if (exists) {
          return current.map((item) => (item.id === data.id ? data : item));
        }

        return [data, ...current];
      });

      closeWorkingWeightModal();
    })
    .catch((error) => {
      console.error("Ошибка сохранения рабочего показателя:", error);
      alert("Не удалось сохранить показатель");
    });
}

function deleteWorkingWeight(id) {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Необходимо войти в аккаунт");
    return;
  }

  fetch(`${API_URL}/exercise-metrics/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert(data.error);
        return;
      }

      setWorkingWeights((current) => current.filter((item) => item.id !== id));
      closeWorkingWeightModal();
    })
    .catch((error) => {
      console.error("Ошибка удаления рабочего показателя:", error);
      alert("Не удалось удалить показатель");
    });
}

  return (
    <section>
      <PageHeader
        title="Тренировки"
        subtitle="Рабочие веса, запланированные тренировки и гайды по упражнениям."
      />

      <div className="training-page-clean">
        <div className="training-section-grid">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={
                activeSection === section.id
                  ? "training-section-card active"
                  : "training-section-card"
              }
              onClick={() => setActiveSection(section.id)}
            >
              <div>
                <span>{section.title}</span>
                <p>{section.subtitle}</p>
              </div>

              <strong>
                {section.count}
                <small>{section.countText}</small>
              </strong>
            </button>
          ))}
        </div>

        <div className="training-active-panel">
          {activeSection === "weights" && (
            <section className="training-panel-section">
              <div className="training-panel-header">
                <div>
                  <span>Мой рабочий вес</span>
                  <h3>Рабочие веса по упражнениям</h3>
                  <p>
                    Храни вес, повторения и подходы для каждого упражнения.
                    Потом эти данные пойдут в статистику прогресса.
                  </p>
                </div>

                <button
                  type="button"
                  className="training-action-btn"
                  onClick={openAddWorkingWeightModal}
                >
                  Добавить упражнение
                </button>
              </div>

              {workingWeights.length === 0 ? (
                <button
                  type="button"
                  className="training-empty-block training-empty-button"
                  onClick={openAddWorkingWeightModal}
                >
                  <strong>Пока нет рабочих весов</strong>
                  <p>
                    Нажми сюда, чтобы добавить первое упражнение: вес,
                    повторения и подходы.
                  </p>
                </button>
              ) : (
                <div className="training-weight-list">
                  {workingWeights.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="training-weight-item"
                      onClick={() => openEditWorkingWeightModal(item)}
                    >
                      <div>
                        <strong>{item.exerciseName}</strong>
                        <p>
                          {item.weight} кг × {item.reps} повторений ×{" "}
                          {item.sets} подхода
                        </p>
                      </div>

                      <span>Изменить</span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeSection === "plans" && (
            <section className="training-panel-section">
              <div className="training-panel-header">
                <div>
                  <span>Мои тренировки</span>
                  <h3>Запланированные тренировки</h3>
                  <p>
                    Здесь будут тренировки по дням: грудь, спина, ноги, кардио
                    и другие планы.
                  </p>
                </div>

                <button type="button" className="training-action-btn">
                  Создать тренировку
                </button>
              </div>

              <div className="training-empty-block">
                <strong>Пока нет новой структуры тренировок</strong>
                <p>
                  Старый конструктор убрали. Следующим шагом сделаем новый
                  список запланированных тренировок.
                </p>
              </div>
            </section>
          )}

          {activeSection === "guides" && (
            <section className="training-panel-section">
              <div className="training-panel-header">
                <div>
                  <span>Гайды</span>
                  <h3>Гайды по упражнениям</h3>
                  <p>
                    Здесь будут инструкции по технике выполнения, ошибкам и
                    целевым мышцам.
                  </p>
                </div>

                <button type="button" className="training-action-btn">
                  Открыть гайды
                </button>
              </div>

              <div className="training-empty-block">
                <strong>Гайды подготовим отдельным блоком</strong>
                <p>
                  Потом добавим поиск упражнения и карточку с техникой
                  выполнения.
                </p>
              </div>
            </section>
          )}
        </div>
      </div>

      {isWorkingWeightModalOpen && (
        <WorkingWeightModal
          initialData={editingWorkingWeight}
          exercises={availableExercises}
          onClose={closeWorkingWeightModal}
          onSave={saveWorkingWeight}
          onDelete={deleteWorkingWeight}
        />
      )}
    </section>
  );
}

function WorkingWeightsBlock({
  workingWeights,
  exercises,
  onAdd,
  onEdit,
}) {
  const latestItems = workingWeights.slice(0, 4);

  return (
    <section className="working-weights-card">
      <div className="working-weights-head">
        <div>
          <span>Мой рабочий вес</span>
          <h3>Вес и повторения по упражнениям</h3>
          <p>
            Сохраняй рабочий вес, подходы и повторения. Эти данные потом пойдут
            в статистику прогресса.
          </p>
        </div>

        <button
          type="button"
          className="working-weights-add-btn"
          onClick={onAdd}
        >
          + Добавить
        </button>
      </div>

      {workingWeights.length === 0 ? (
        <button
          type="button"
          className="working-weights-empty"
          onClick={onAdd}
        >
          <strong>Пока нет рабочих весов</strong>
          <p>
            Добавь первое упражнение, например жим лёжа, присед или тягу.
          </p>
        </button>
      ) : (
        <div className="working-weights-list">
          {latestItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="working-weight-item"
              onClick={() => onEdit(item)}
            >
              <div>
                <strong>{item.exerciseName}</strong>
                <p>
                  {item.weight} кг × {item.reps} повторений × {item.sets} подхода
                </p>
              </div>

              <span>Изменить</span>
            </button>
          ))}

          {workingWeights.length > 4 && (
            <div className="working-weights-more">
              Ещё упражнений: {workingWeights.length - 4}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function WorkingWeightModal({
  initialData,
  exercises,
  onClose,
  onSave,
  onDelete,
}) {
  const [exerciseId, setExerciseId] = useState(initialData?.exerciseId || null);
  const [exerciseName, setExerciseName] = useState(
    initialData?.exerciseName || ""
  );
  const [isExerciseListOpen, setIsExerciseListOpen] = useState(false);

  const [weight, setWeight] = useState(initialData?.weight || "");
  const [reps, setReps] = useState(initialData?.reps || "");
  const [sets, setSets] = useState(initialData?.sets || 3);

  const exerciseOptions = Array.isArray(exercises) ? exercises : [];

  const filteredExercises = exerciseOptions
    .filter((exercise) => {
      const name = String(exercise.name || "").toLowerCase();
      const query = exerciseName.trim().toLowerCase();

      if (!query) {
        return true;
      }

      return name.includes(query);
    })
    .slice(0, 8);

  function selectExercise(exercise) {
    setExerciseId(exercise.id);
    setExerciseName(exercise.name);
    setIsExerciseListOpen(false);
  }

  function handleExerciseNameChange(value) {
    setExerciseName(value);
    setExerciseId(null);
    setIsExerciseListOpen(true);
  }

  function handleSave(event) {
    event.preventDefault();

    const trimmedExerciseName = exerciseName.trim();

    if (!trimmedExerciseName || !weight || !reps || !sets) {
      return;
    }

    const item = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      exerciseId,
      exerciseName: trimmedExerciseName,
      weight: Number(weight),
      reps: Number(reps),
      sets: Number(sets),
      updatedAt: new Date().toISOString(),
    };

    onSave(item);
  }

  return (
    <div className="modal-backdrop">
      <form className="simple-modal working-weight-modal" onSubmit={handleSave}>
        <div className="modal-header">
          <div>
            <h2>
              {initialData ? "Изменить рабочий вес" : "Добавить рабочий вес"}
            </h2>
          </div>

          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <label className="field exercise-autocomplete-field">
          <span>Упражнение</span>

          <input
            type="text"
            value={exerciseName}
            onChange={(event) => handleExerciseNameChange(event.target.value)}
            onFocus={() => setIsExerciseListOpen(true)}
            placeholder="Начните вводить упражнение..."
            autoComplete="off"
          />

          {isExerciseListOpen && exerciseName.trim() && (
            <div className="exercise-autocomplete-list">
              {filteredExercises.length === 0 ? (
                <div className="exercise-autocomplete-empty">
                  Упражнение не найдено. Можно сохранить своё название.
                </div>
              ) : (
                filteredExercises.map((exercise) => (
                  <button
                    type="button"
                    key={exercise.id}
                    className="exercise-autocomplete-item"
                    onClick={() => selectExercise(exercise)}
                  >
                    <strong>{exercise.name}</strong>

                    {(exercise.muscle || exercise.muscle_group) && (
                      <span>{exercise.muscle || exercise.muscle_group}</span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}

          {exerciseId && (
            <div className="field-hint">
              Упражнение выбрано из базы
            </div>
          )}
        </label>

        <div className="form-grid">
          <label className="field">
            <span>Рабочий вес, кг</span>

            <input
              type="number"
              min="0"
              step="0.5"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder="60"
            />
          </label>

          <label className="field">
            <span>Повторения</span>

            <input
              type="number"
              min="1"
              value={reps}
              onChange={(event) => setReps(event.target.value)}
              placeholder="8"
            />
          </label>
        </div>

        <label className="field">
          <span>Подходы</span>

          <input
            type="number"
            min="1"
            value={sets}
            onChange={(event) => setSets(event.target.value)}
            placeholder="3"
          />
        </label>

        <button type="submit" className="primary-btn full">
          Сохранить
        </button>

        {initialData && (
          <button
            type="button"
            className="danger-btn full working-weight-delete-btn"
            onClick={() => onDelete(initialData.id)}
          >
            Удалить упражнение
          </button>
        )}
      </form>
    </div>
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