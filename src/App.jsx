import React, { useEffect, useMemo, useRef, useState } from "react";
import "./styles/styles.css";
import AppLogo from "./components/AppLogo.jsx";

const API_URL = "http://localhost:5000/api"; //Для сервера пишем просто /api для локалки http://localhost:5000/api

function SaveCheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M5 12.5L9.3 16.8L19 7.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NextArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M5 12H18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.7"
        strokeLinecap="round"
      />
      <path
        d="M13 7L18 12L13 17"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoutSvgIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M10 6H6.8C5.8 6 5 6.8 5 7.8V16.2C5 17.2 5.8 18 6.8 18H10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 8L17 12L13 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 12H9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M19 12H6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.7"
        strokeLinecap="round"
      />
      <path
        d="M11 7L6 12L11 17"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PremiumCrownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 14 14"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M6.87347 2.31807c0.0426 -0.05315 0.0893 -0.06807 0.12629 -0.06807 0.03699 0 0.08369 0.01492 0.12628 0.06807 0.79057 0.98651 1.85748 2.70386 2.44001 4.61119 0.06277 0.20553 0.22673 0.3644 0.43415 0.42065 0.2074 0.05625 0.4292 0.00199 0.5872 -0.14366l2.0219 -1.86372c0.2762 1.60637 0.0979 3.35192 -0.1252 4.60771 -0.1375 0.77426 -0.7611 1.36906 -1.5702 1.49396 -2.64021 0.4077 -5.18761 0.4077 -7.82778 0.0001 -0.80915 -0.1249 -1.43276 -0.7197 -1.57029 -1.49397 -0.22306 -1.25578 -0.4014 -3.00131 -0.12518 -4.60766l2.02153 1.86338c0.15802 0.14566 0.37978 0.19991 0.58719 0.14366 0.20741 -0.05624 0.37138 -0.21511 0.43416 -0.42064 0.58253 -1.90725 1.6494 -3.62452 2.43994 -4.611Zm3.56833 3.32234c-0.65875 -1.70586 -1.60327 -3.18428 -2.34033 -4.10402 -0.57312 -0.715186 -1.6303 -0.715186 -2.20343 0 -0.73703 0.91971 -1.68151 2.39805 -2.34027 4.10383l-1.5344 -1.41436C1.44528 3.693 0.412771 3.89828 0.226577 4.77681c-0.40725 1.92156 -0.1888222 3.99964 0.058519 5.39209 0.236012 1.3287 1.301334 2.3087 2.610314 2.5108 2.76657 0.4271 5.44263 0.4271 8.20919 -0.0001 1.3089 -0.2021 2.3742 -1.1821 2.6102 -2.5108 0.2474 -1.39244 0.4658 -3.47054 0.0586 -5.39213 -0.1862 -0.87853 -1.2187 -1.08381 -1.7968 -0.55095l-1.5348 1.41469Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

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
  "Рабочие веса",
  "Гайды",
  "Моя тренировка",
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

  "Рабочие веса": (
  <svg viewBox="0 0 24 24" className="menu-icon-svg">
    <path d="M7 8V16" />
    <path d="M17 8V16" />
    <path d="M3 10V14" />
    <path d="M21 10V14" />
    <path d="M7 12H17" />
  </svg>
),

Гайды: (
  <svg viewBox="0 0 24 24" className="menu-icon-svg">
    <path d="M5 5H19V19H5Z" />
    <path d="M8 9H16" />
    <path d="M8 13H14" />
    <path d="M8 17H12" />
  </svg>
),

"Моя тренировка": (
  <svg viewBox="0 0 24 24" className="menu-icon-svg">
    <path d="M7 4V20" />
    <path d="M17 4V20" />
    <path d="M4 8H7" />
    <path d="M17 8H20" />
    <path d="M4 16H7" />
    <path d="M17 16H20" />
    <path d="M7 12H17" />
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
  const [selectedPriorities, setSelectedPriorities] = useState([]);
const [selectedTaskDate, setSelectedTaskDate] = useState("");
const [taskTimeSortDirection, setTaskTimeSortDirection] = useState("asc");
  const [taskSortType, setTaskSortType] = useState("time");
const [taskSortDirection, setTaskSortDirection] = useState("asc");

  const [selectedMuscle, setSelectedMuscle] = useState("Спина");

  const [isSavingTask, setIsSavingTask] = useState(false);
  const [isSavingWorkout, setIsSavingWorkout] = useState(false);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalInitialDate, setTaskModalInitialDate] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [workoutModalInitialData, setWorkoutModalInitialData] = useState(null);

  const [muscleGroups, setMuscleGroups] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [exerciseGuides, setExerciseGuides] = useState([]);
  const [exerciseGroups, setExerciseGroups] = useState([]);
  const [compatibleGroups, setCompatibleGroups] = useState([]);

  const [workingWeights, setWorkingWeights] = useState([]);

  const [toast, setToast] = useState(null);

  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
const [isBuyingPremium, setIsBuyingPremium] = useState(false);

const hasGuestUnsavedData =
  Boolean(currentUser?.is_guest) &&
  (tasks.length > 0 || workingWeights.length > 0 || taskGroups.length > 0);

  const isPremiumUser =
  subscription?.code === "premium" ||
  currentUser?.subscription === "premium";

function showToast(message, type = "info") {
  setToast({
    id: crypto.randomUUID(),
    message,
    type,
  });
}

function buyPremium(planCode) {
  const token = localStorage.getItem("token");

  if (!token || currentUser?.is_guest) {
    showToast("Сначала войдите в аккаунт, чтобы подключить Premium", "error");
    return;
  }

  if (isBuyingPremium) {
    return;
  }

  setIsBuyingPremium(true);

  fetch(`${API_URL}/payments/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      plan: planCode,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        showToast(data.error, "error");
        return;
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      if (data.subscription) {
        setSubscription(data.subscription);

        setCurrentUser((currentUserData) => ({
          ...currentUserData,
          subscription: data.subscription.code,
        }));

        const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...savedUser,
            subscription: data.subscription.code,
          })
        );

        setIsPremiumModalOpen(false);
        showToast("Premium успешно подключён", "success");
      }
    })
    .catch((error) => {
      console.error("Ошибка покупки Premium:", error);
      showToast("Не удалось подключить Premium", "error");
    })
    .finally(() => {
      setIsBuyingPremium(false);
    });
}

useEffect(() => {
  function handleBeforeUnload(event) {
    if (!hasGuestUnsavedData) {
      return;
    }

    event.preventDefault();
    event.returnValue = "";
  }

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, [hasGuestUnsavedData]);

useEffect(() => {
  const savedToken = localStorage.getItem("token");

  loadMuscleGroups();
  loadExercises();
  loadExerciseGuides();

  if (savedToken) {
    checkAuth(savedToken);
  } else {
    setIsAuthChecking(false);
  }
}, []);

  const filteredTasks = useMemo(() => {
  const normalizedSearch = searchQuery.trim().toLowerCase();


  const filtered = tasks.filter((task) => {
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

    const matchesPriority =
      selectedPriorities.length === 0 ||
      selectedPriorities.includes(task.priority);

    const matchesDate =
      !selectedTaskDate ||
      (task.rawDate && task.rawDate.startsWith(selectedTaskDate));

    const exerciseNames = (task.exercises || []).map((exercise) =>
      typeof exercise === "string" ? exercise : exercise.name
    );

    const subtaskNames = (task.subtasks || []).map((subtask) =>
      typeof subtask === "string" ? subtask : subtask.title
    );

    const searchableText = [
      task.title,
      task.description,
      task.priority,
      task.status,
      task.date,
      task.muscle,
      task.groupName,
      ...exerciseNames,
      ...subtaskNames,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      normalizedSearch === "" || searchableText.includes(normalizedSearch);

    return matchesGroup && matchesSearch && matchesPriority && matchesDate;
  });

  return [...filtered].sort((firstTask, secondTask) => {
    const firstCompleted = firstTask.status === "Выполнена";
    const secondCompleted = secondTask.status === "Выполнена";

    if (firstCompleted !== secondCompleted) {
      return firstCompleted ? 1 : -1;
    }

    const firstHasDate = Boolean(firstTask.rawDate);
    const secondHasDate = Boolean(secondTask.rawDate);

    if (firstHasDate !== secondHasDate) {
      return firstHasDate ? -1 : 1;
    }

    if (!firstHasDate && !secondHasDate) {
      return 0;
    }

    const firstTime = new Date(firstTask.rawDate).getTime();
    const secondTime = new Date(secondTask.rawDate).getTime();

    return taskTimeSortDirection === "asc"
      ? firstTime - secondTime
      : secondTime - firstTime;
  });
}, [
  tasks,
  searchQuery,
  activeTaskGroupId,
  selectedPriorities,
  selectedTaskDate,
  taskTimeSortDirection,
]);

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

function openEditTaskModal(task) {
  setEditingTask(task);
  setTaskModalInitialDate(null);
  setIsTaskModalOpen(true);
}

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
      setAvailableExercises([]);
setExerciseGroups([]);
setWorkingWeights([]);

      loadTasks(token);
      loadTaskGroups(token);
      loadExerciseMetrics(token);
      loadExerciseGroups(token);
      loadExercises(token);
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
        showToast?.(data.error, "error");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setCurrentUser(data.user);
      setSubscription(data.subscription);
      setIsLoggedIn(true);
      setAvailableExercises([]);
setExerciseGroups([]);
setWorkingWeights([]);

      loadTasks(data.token);
loadTaskGroups(data.token);
loadExerciseMetrics(data.token);
loadExerciseGroups(data.token);
loadExercises(data.token);
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
        showToast?.(data.error, "error");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setCurrentUser(data.user);
      setSubscription(data.subscription);
      setIsLoggedIn(true);
      setAvailableExercises([]);
setExerciseGroups([]);
setWorkingWeights([]);

      loadTasks(data.token);
loadTaskGroups(data.token);
loadExerciseMetrics(data.token);
loadExerciseGroups(data.token);
loadExercises(data.token);
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
  setAvailableExercises([]);
setExerciseGroups([]);
setWorkingWeights([]);
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

  function loadExerciseGuides() {
  fetch(`${API_URL}/exercise-guides`)
    .then((response) => response.json())
    .then((data) => {
      if (!Array.isArray(data)) {
        console.error("Ошибка загрузки гайдов:", data);
        setExerciseGuides([]);
        return;
      }

      setExerciseGuides(data);
    })
    .catch((error) => {
      console.error("Ошибка загрузки гайдов:", error);
      setExerciseGuides([]);
    });
}

 function loadExercises(token = localStorage.getItem("token")) {
  fetch(`${API_URL}/exercises`)
    .then((response) => response.json())
    .then((baseExercises) => {
      if (!Array.isArray(baseExercises)) {
        console.error("Ошибка загрузки базовых упражнений:", baseExercises);
        setAvailableExercises([]);
        return;
      }

      if (!token) {
  setAvailableExercises(baseExercises);
  return;
}

      fetch(`${API_URL}/user-exercises`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((userExercises) => {
          if (!Array.isArray(userExercises)) {
            console.error(
              "Ошибка загрузки пользовательских упражнений:",
              userExercises
            );

            setAvailableExercises(baseExercises);
            return;
          }

          setAvailableExercises([...baseExercises, ...userExercises]);
        })
        .catch((error) => {
          console.error("Ошибка загрузки пользовательских упражнений:", error);
          setAvailableExercises(baseExercises);
        });
    })
    .catch((error) => {
      console.error("Ошибка загрузки упражнений:", error);
      setAvailableExercises([]);
    });
}
function loadUserExercises(token = localStorage.getItem("token")) {
  if (!token || currentUser?.is_guest) {
    return;
  }

  fetch(`${API_URL}/user-exercises`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (!Array.isArray(data)) {
        console.error("Ошибка загрузки пользовательских упражнений:", data);
        return;
      }

      setAvailableExercises((current) => {
        const constExercises = current.filter((exercise) => !exercise.is_custom);

        return [...constExercises, ...data];
      });
    })
    .catch((error) => {
      console.error("Ошибка загрузки пользовательских упражнений:", error);
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

function loadExerciseGroups(token = localStorage.getItem("token")) {
  if (!token || currentUser?.is_guest) {
    setExerciseGroups([]);
    return;
  }

  fetch(`${API_URL}/exercise-groups`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (!Array.isArray(data)) {
        setExerciseGroups([]);
        return;
      }

      setExerciseGroups(data);
    })
    .catch((error) => {
      console.error("Ошибка загрузки групп упражнений:", error);
      setExerciseGroups([]);
    });
}

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

function toggleSubtaskDone(taskId, subtaskId) {
  if (currentUser?.is_guest) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        const updatedSubtasks = (task.subtasks || []).map((subtask) =>
          String(subtask.id) === String(subtaskId)
            ? {
                ...subtask,
                is_completed: !Boolean(subtask.is_completed),
              }
            : subtask
        );

        const allSubtasksCompleted =
          updatedSubtasks.length > 0 &&
          updatedSubtasks.every((subtask) => subtask.is_completed);

        return {
          ...task,
          subtasks: updatedSubtasks,
          status: allSubtasksCompleted ? "Выполнена" : task.status,
        };
      })
    );

    return;
  }

  const token = localStorage.getItem("token");

  fetch(`${API_URL}/tasks/${taskId}/subtasks/${subtaskId}/toggle`, {
    method: "PATCH",
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

      loadTasks(token);
    })
    .catch((error) => {
      console.error("Ошибка обновления подзадачи:", error);
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
subtasks:
  task.status === "Выполнена"
    ? task.subtasks || []
    : (task.subtasks || []).map((subtask) => ({
        ...subtask,
        is_completed: true,
      })),
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

  const isEditingTask = Boolean(editingTask?.id);

  if (currentUser?.is_guest) {
  const selectedGroup = taskGroups.find(
    (group) => group.id === taskPayload.group_id
  );

  if (isEditingTask) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === editingTask.id
          ? {
              ...task,
              title: taskPayload.title,
              description: taskPayload.description || "",
              priority: formatPriority(taskPayload.priority || "medium"),
              date: formatDate(taskPayload.start_datetime),
              rawDate: taskPayload.start_datetime,
              groupId: selectedGroup?.id || null,
              groupName: selectedGroup?.name || null,
              groupColor: selectedGroup?.color || null,
              subtasks: (taskPayload.subtasks || []).map((subtask) =>
                typeof subtask === "string"
                  ? {
                      id: crypto.randomUUID(),
                      title: subtask,
                      is_completed: false,
                    }
                  : subtask
              ),
            }
          : task
      )
    );

    setEditingTask(null);
    setIsTaskModalOpen(false);
    return;
  }

  const guestTask = {
    id: crypto.randomUUID(),
    title: taskPayload.title,
    description: taskPayload.description || "",
    category: taskPayload.category || "Личное",
    priority: formatPriority(taskPayload.priority || "medium"),
    status: "Новая",
    date: formatDate(taskPayload.start_datetime),
    rawDate: taskPayload.start_datetime,
    groupId: selectedGroup?.id || null,
    groupName: selectedGroup?.name || null,
    groupColor: selectedGroup?.color || null,
    subtasks: (taskPayload.subtasks || []).map((title) => ({
      id: crypto.randomUUID(),
      title,
      is_completed: false,
    })),
    exercises: null,
  };

  setTasks((currentTasks) => [guestTask, ...currentTasks]);
  setIsTaskModalOpen(false);

  return;
}

  const token = localStorage.getItem("token");

  if (!token) {
    showToast?.("Необходимо войти в аккаунт", "error");
    return;
  }

  setIsSavingTask(true);

  fetch(isEditingTask ? `${API_URL}/tasks/${editingTask.id}` : `${API_URL}/tasks`, {
  method: isEditingTask ? "PUT" : "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(taskPayload),
})
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        showToast?.(data.error, "error");
        return;
      }

      loadTasks(token);
      setEditingTask(null);
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
    showToast?.("Необходимо войти в аккаунт", "error");
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
        showToast?.(data.error, "error");
        return;
      }

      loadTasks(token);
      setIsWorkoutModalOpen(false);
      setActivePage("Моя тренировка");
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

      case "Рабочие веса":
  return (
    <WorkoutsPage
      exerciseGroups={exerciseGroups}
      setExerciseGroups={setExerciseGroups}
      activeSectionFromMenu="weights"
      tasks={tasks}
      availableExercises={availableExercises}
      setAvailableExercises={setAvailableExercises}
      exerciseGuides={exerciseGuides}
      workingWeights={workingWeights}
      setWorkingWeights={setWorkingWeights}
      showToast={showToast}
    />
  );

case "Гайды":
  return (
    <WorkoutsPage
      exerciseGroups={exerciseGroups}
      setExerciseGroups={setExerciseGroups}
      activeSectionFromMenu="guides"
      tasks={tasks}
      showToast={showToast}
      setTasks={setTasks}
      availableExercises={availableExercises}
      setAvailableExercises={setAvailableExercises}
      exerciseGuides={exerciseGuides}
      workingWeights={workingWeights}
      setWorkingWeights={setWorkingWeights}
      muscleGroups={muscleGroups}
      onWorkoutCreated={() => loadTasks(localStorage.getItem("token"))}
    />
  );

case "Моя тренировка":
  return (
    <WorkoutsPage
    showToast={showToast}
      exerciseGroups={exerciseGroups}
      setExerciseGroups={setExerciseGroups}
      activeSectionFromMenu="plans"
      tasks={tasks}
      setTasks={setTasks}
      availableExercises={availableExercises}
      setAvailableExercises={setAvailableExercises}
      workingWeights={workingWeights}
      setWorkingWeights={setWorkingWeights}
      muscleGroups={muscleGroups}
      onWorkoutCreated={() => loadTasks(localStorage.getItem("token"))}
    />
  );

      case "Статистика":
  return (
    <StatsPage
  tasks={tasks}
  currentUser={currentUser}
  isPremiumUser={isPremiumUser}
  onOpenPremium={() => setIsPremiumModalOpen(true)}
/>
  );

      case "Профиль":
  return (
    <ProfilePage
      currentUser={currentUser}
      setCurrentUser={setCurrentUser}
      subscription={subscription}
      isPremiumUser={isPremiumUser}
      logout={logout}
      showToast={showToast}
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
            toggleSubtaskDone={toggleSubtaskDone}
            deleteTask={deleteTask}
            openEditTaskModal={openEditTaskModal}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedPriorities={selectedPriorities}
setSelectedPriorities={setSelectedPriorities}
selectedTaskDate={selectedTaskDate}
setSelectedTaskDate={setSelectedTaskDate}
taskTimeSortDirection={taskTimeSortDirection}
setTaskTimeSortDirection={setTaskTimeSortDirection}
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
  isPremiumUser={isPremiumUser}
  onOpenPremium={() => setIsPremiumModalOpen(true)}
  isMobileMenuOpen={isMobileMenuOpen}
  isSidebarCollapsed={isSidebarCollapsed}
  setIsSidebarCollapsed={setIsSidebarCollapsed}
  closeMobileMenu={() => setIsMobileMenuOpen(false)}
/>

        <main className="content">
  {hasGuestUnsavedData && (
    <div className="guest-save-warning">
      <div>
        <strong>Гостевой режим</strong>
        <p>Авторизуйтесь, чтобы сохранить задачи и тренировки после обновления страницы.</p>
      </div>

      <button
        type="button"
        onClick={() => {
          logout();
        }}
      >
        Войти
      </button>
    </div>
  )}

  {renderPage()}
</main>
      </div>

      {isTaskModalOpen && (
        <TaskModal
  initialDate={taskModalInitialDate}
  initialData={editingTask}
  onClose={() => {
    setIsTaskModalOpen(false);
    setTaskModalInitialDate(null);
    setEditingTask(null);
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

      {isPremiumModalOpen && (
  <PremiumModal
    onClose={() => setIsPremiumModalOpen(false)}
    onBuy={buyPremium}
    isBuying={isBuyingPremium}
  />
)}

      {isGroupModalOpen && (
        <TaskGroupModal
          onClose={() => setIsGroupModalOpen(false)}
          onSubmit={createTaskGroup}
          isSaving={isSavingGroup}
        />
      )}

      {toast && (
  <AppToast
    key={toast.id}
    message={toast.message}
    type={toast.type}
    onClose={() => setToast(null)}
  />
)}

      {!isAuthChecking && !isLoggedIn && (
      <AuthModal
        onLogin={loginUser}
        onRegister={registerUser}
        onGuestLogin={loginAsGuest}
      />
    )}
    </div>
  );

  
}

function AppToast({ message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2800);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`app-toast ${type}`}>
      <div className="app-toast-icon">
        {type === "success" ? (
          <SaveCheckIcon />
        ) : type === "error" ? (
          "!"
        ) : (
          "i"
        )}
      </div>

      <p>{message}</p>

      <button type="button" onClick={onClose} aria-label="Закрыть уведомление">
        ×
      </button>
    </div>
  );
}

function PremiumModal({ onClose, onBuy, isBuying }) {
  const [selectedPlan, setSelectedPlan] = useState("premium_month");
  const [openedFaq, setOpenedFaq] = useState("stats");

  const plans = [
    {
      code: "premium_month",
      title: "Месяц",
      price: "199 ₽",
      description: "30 дней Premium",
    },
    {
      code: "premium_year",
      title: "Год",
      price: "1490 ₽",
      description: "Выгоднее на долгий срок",
      badge: "выгодно",
    },
  ];

  const faqItems = [
    {
      id: "stats",
      title: "Расширенная статистика",
      text:
        "Открывает подробную аналитику задач, тренировок, активности за месяц, процента выполнения и прогресса.",
    },
    {
      id: "limits",
      title: "Больше задач и тренировок",
      text:
        "Premium снимает ограничения бесплатного тарифа и позволяет свободнее планировать день, неделю и тренировки.",
    },
    {
      id: "progress",
      title: "История рабочих весов",
      text:
        "Можно отслеживать изменения рабочих весов, повторений и результатов по упражнениям.",
    },
    {
      id: "programs",
      title: "Готовые программы",
      text:
        "Основа для готовых тренировочных планов, которые можно будет быстро добавлять в своё расписание.",
    },
  ];

  return (
    <div className="modal-backdrop premium-payment-backdrop">
      <section className="premium-payment-modal premium-payment-modal-clean">
        <button
          type="button"
          className="premium-payment-close"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>

        <div className="premium-payment-top">
          <span className="premium-payment-mark">✦ Premium</span>

          <h2>Больше возможностей</h2>

          <p>
            Расширенная статистика, больше лимитов и контроль прогресса в одном тарифе.
          </p>
        </div>

        <div className="premium-payment-plans clean">
          {plans.map((plan) => (
            <button
              key={plan.code}
              type="button"
              className={
                selectedPlan === plan.code
                  ? "premium-payment-plan clean active"
                  : "premium-payment-plan clean"
              }
              onClick={() => setSelectedPlan(plan.code)}
            >
              <div className="premium-plan-row">
                <strong>{plan.title}</strong>

                {plan.badge && (
                  <span className="premium-payment-plan-badge">
                    {plan.badge}
                  </span>
                )}
              </div>

              <b>{plan.price}</b>
              <small>{plan.description}</small>
            </button>
          ))}
        </div>

        <div className="premium-faq-block">
          <div className="premium-faq-title">
            Что входит в Premium
          </div>

          <div className="premium-faq-list">
            {faqItems.map((item) => {
              const isOpen = openedFaq === item.id;

              return (
                <div
                  key={item.id}
                  className={isOpen ? "premium-faq-item open" : "premium-faq-item"}
                >
                  <button
                    type="button"
                    className="premium-faq-question"
                    onClick={() =>
                      setOpenedFaq((current) =>
                        current === item.id ? null : item.id
                      )
                    }
                  >
                    <span>{item.title}</span>
                    <strong>{isOpen ? "−" : "+"}</strong>
                  </button>

                  <div className="premium-faq-answer">
                    <p>{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="premium-payment-buy-btn clean"
          onClick={() => onBuy(selectedPlan)}
          disabled={isBuying}
        >
          {isBuying ? "Подключаем..." : "Подключить Premium"}
        </button>
      </section>
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


function TaskModal({ initialDate, initialData, onClose, onSubmit, isSaving }) {
  const isDateLocked = Boolean(initialDate);

  const [hasDeadline, setHasDeadline] = useState(Boolean(initialDate));
  const isEditMode = Boolean(initialData?.id);
  const [deadlineMode, setDeadlineMode] = useState(
    initialDate ? "custom" : "today"
  );

  const [form, setForm] = useState({
  title: initialData?.title || "",
  description: initialData?.description || "",
  subtasks: Array.isArray(initialData?.subtasks)
    ? initialData.subtasks.map((subtask) => subtask.title || subtask)
    : [],
  priority:
    initialData?.priority === "Высокий"
      ? "high"
      : initialData?.priority === "Низкий"
        ? "low"
        : "medium",
  selected_date: initialDate || initialData?.rawDate?.slice(0, 10) || "",
  selected_time: initialData?.rawDate
    ? new Date(initialData.rawDate).toTimeString().slice(0, 5)
    : "",
});

  const todayString = new Date().toISOString().split("T")[0];

  function updateField(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function addSubtaskField() {
  setForm((currentForm) => {
    const currentSubtasks = currentForm.subtasks || [];

    if (currentSubtasks.length >= 7) {
      return currentForm;
    }

    return {
      ...currentForm,
      subtasks: [...currentSubtasks, ""],
    };
  });
}

function updateSubtask(index, value) {
  setForm((currentForm) => ({
    ...currentForm,
    subtasks: (currentForm.subtasks || []).map((subtask, subtaskIndex) =>
      subtaskIndex === index ? value : subtask
    ),
  }));
}

function removeSubtask(index) {
  setForm((currentForm) => ({
    ...currentForm,
    subtasks: (currentForm.subtasks || []).filter(
      (_, subtaskIndex) => subtaskIndex !== index
    ),
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

  if (selectedDate && !isDateLocked) {
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
      subtasks: (form.subtasks || [])
        .map((subtask) => subtask.trim())
        .filter(Boolean)
        .slice(0, 7),
      priority: form.priority,
      start_datetime: selectedDate,
      end_datetime: null,
    });
}

  return (
    <div className="modal-backdrop">
      <form className="simple-modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>{isEditMode ? "Изменить задачу" : "Новая задача"}</h2>

          <div className="modal-header-actions">
            <button
              type="submit"
              className="modal-save-icon-btn"
              disabled={isSaving}
              title={isEditMode ? "Сохранить изменения" : "Сохранить задачу"}
              aria-label={isEditMode ? "Сохранить изменения" : "Сохранить задачу"}
            >
              <SaveCheckIcon />
            </button>

            <button
              type="button"
              className="modal-close-icon-btn"
              onClick={onClose}
              title="Закрыть"
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>
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

        <div className="field subtasks-field">
  <span className="subtasks-title">Подзадачи</span>

  {(form.subtasks || []).length === 0 ? (
    <p className="field-hint">
      Добавьте подзадачи, если задача состоит из нескольких шагов.
    </p>
  ) : (
    <div className="subtasks-input-list">
      {(form.subtasks || []).map((subtask, index) => (
        <div className="subtask-input-row" key={index}>
          <input
            value={subtask}
            onChange={(event) => updateSubtask(index, event.target.value)}
            placeholder={`Подзадача ${index + 1}`}
          />

          <button
            type="button"
            onClick={() => removeSubtask(index)}
            title="Удалить подзадачу"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )}

  {(form.subtasks || []).length < 7 && (
    <button
      type="button"
      className="subtask-add-minimal-btn"
      onClick={addSubtaskField}
    >
      + Подзадача
    </button>
  )}

  <div className="field-counter">
    {(form.subtasks || []).length}/7
  </div>
</div>

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

        {isDateLocked ? (
  <div className="deadline-box locked-date-box calendar-task-time-only">
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
) : (
  <>
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
  </>
)}

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
  name: exercise.name,
  exercise_id: exercise.exercise_id,
  user_exercise_id: exercise.user_exercise_id,
  sets_count:
    exercise.sets_count === "" ||
    exercise.sets_count === null ||
    exercise.sets_count === undefined
      ? 0
      : Number(exercise.sets_count),
  reps_count:
    exercise.reps_count === "" ||
    exercise.reps_count === null ||
    exercise.reps_count === undefined
      ? null
      : Number(exercise.reps_count),
  weight_kg:
    exercise.weight_kg === "" ||
    exercise.weight_kg === null ||
    exercise.weight_kg === undefined
      ? null
      : Number(exercise.weight_kg),
})),
    });
  }

  return (
    <div className="modal-backdrop">
      <form className="simple-modal wide workout-builder" onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>Новая тренировка</h2>

          <div className="modal-header-actions">
            <button
              type="submit"
              className="modal-save-icon-btn"
              disabled={isSaving}
              title="Сохранить тренировку"
              aria-label="Сохранить тренировку"
            >
              <SaveCheckIcon />
            </button>

            <button
              type="button"
              className="modal-close-icon-btn"
              onClick={onClose}
              title="Закрыть"
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>
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
  isPremiumUser,
  onOpenPremium,
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

  const isPremium = isPremiumUser;

  const navGroups = [
  {
    title: "Планирование",
    items: ["Задачи", "Календарь"],
  },
  {
    title: "Тренировки",
    items: ["Рабочие веса", "Гайды", "Моя тренировка"],
  },
  {
  title: "Аккаунт",
  items: ["Статистика", "Профиль"],
},
];

  function openPage(page) {
    setActivePage(page);
    closeMobileMenu();
  }

  function renderMenuButton(item, className = "sidebar-nav-item") {
  const isLockedPremiumItem = item === "Статистика" && !isPremiumUser;

  return (
    <button
      key={item}
      type="button"
      className={activePage === item ? `${className} active` : className}
      onClick={() => openPage(item)}
      title={isLockedPremiumItem ? `${item} · Premium` : item}
    >
      <span className="sidebar-nav-icon">{getMenuIcon(item)}</span>

      <span className="sidebar-nav-text">
        <span className="sidebar-nav-label">{item}</span>

        {isLockedPremiumItem && (
          <span className="premium-menu-badge">PRO</span>
        )}
      </span>
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

        {isPremium ? (
  <div className="sidebar-premium-new active">
    <span>✦ Premium</span>

    <strong>Активен</strong>

    <p>Расширенные функции доступны</p>
  </div>
) : (
  <button
    type="button"
    className="sidebar-premium-new"
    onClick={onOpenPremium}
  >
    <span>✦ Premium</span>

    <strong>Больше возможностей</strong>

    <p>Статистика, программы и расширенные тренировки</p>
  </button>
)}

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
          {menuItems.map((item) => {
            const isLockedPremiumItem = item === "Статистика" && !isPremiumUser;

            return (
              <button
                key={item}
                className={
                  activePage === item
                    ? "mobile-top-menu-item active"
                    : "mobile-top-menu-item"
                }
                onClick={() => openPage(item)}
              >
                <span className="mobile-menu-icon">{getMenuIcon(item)}</span>

                <span className="mobile-menu-item-text">
                  <span className="mobile-menu-item-label">{item}</span>

                  {isLockedPremiumItem && (
                    <span className="premium-menu-badge">PRO</span>
                  )}
                </span>
              </button>
            );
          })}
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

function TaskSmartFilter({
  selectedPriorities,
  setSelectedPriorities,
  selectedTaskDate,
  setSelectedTaskDate,
  taskTimeSortDirection,
  setTaskTimeSortDirection,
}) {
  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);

  const priorityOptions = [
    { value: "Высокий", label: "Высокий приоритет", className: "high" },
    { value: "Средний", label: "Средний приоритет", className: "medium" },
    { value: "Низкий", label: "Низкий приоритет", className: "low" },
  ];

  function togglePriority(priority) {
    setSelectedPriorities((current) => {
      if (current.includes(priority)) {
        return current;
      }

      return [...current, priority];
    });

    setIsPriorityMenuOpen(false);
  }

  function removePriority(priority) {
    setSelectedPriorities((current) =>
      current.filter((item) => item !== priority)
    );
  }

  function formatSelectedDate(dateValue) {
    if (!dateValue) {
      return "";
    }

    return new Date(`${dateValue}T12:00:00`).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
    });
  }

  const hasSelectedFilters =
    selectedPriorities.length > 0 || Boolean(selectedTaskDate);

  return (
    <div className="task-smart-filter">
      <div className="task-smart-filter-controls">
        <div className="task-priority-select-wrap">
          <button
            type="button"
            className="task-priority-select-btn"
            onClick={() => setIsPriorityMenuOpen((current) => !current)}
          >
            Приоритет
            <span>⌄</span>
          </button>

          {isPriorityMenuOpen && (
            <div className="task-priority-dropdown">
              {priorityOptions.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  className={`task-priority-dropdown-item ${priority.className}`}
                  onClick={() => togglePriority(priority.value)}
                  disabled={selectedPriorities.includes(priority.value)}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="date"
          className="task-date-filter-input"
          value={selectedTaskDate}
          onChange={(event) => setSelectedTaskDate(event.target.value)}
        />

        <div className="task-time-sort-buttons">
          <button
            type="button"
            className={
              taskTimeSortDirection === "asc"
                ? "task-time-sort-btn active"
                : "task-time-sort-btn"
            }
            onClick={() => setTaskTimeSortDirection("asc")}
            title="Сначала ближайшие"
          >
            ↑
          </button>

          <button
            type="button"
            className={
              taskTimeSortDirection === "desc"
                ? "task-time-sort-btn active"
                : "task-time-sort-btn"
            }
            onClick={() => setTaskTimeSortDirection("desc")}
            title="Сначала поздние"
          >
            ↓
          </button>
        </div>
      </div>

      {hasSelectedFilters && (
        <div className="task-selected-filter-tags">
          {selectedPriorities.map((priority) => {
            const priorityConfig = priorityOptions.find(
              (item) => item.value === priority
            );

            return (
              <button
                key={priority}
                type="button"
                className={`task-filter-tag ${priorityConfig?.className || ""}`}
                onClick={() => removePriority(priority)}
                title="Убрать приоритет"
              >
                {priority}
                <span>×</span>
              </button>
            );
          })}

          {selectedTaskDate && (
            <button
              type="button"
              className="task-filter-tag date"
              onClick={() => setSelectedTaskDate("")}
              title="Убрать дату"
            >
              {formatSelectedDate(selectedTaskDate)}
              <span>×</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function TaskRightFilterPanel({
  selectedPriorities,
  setSelectedPriorities,
  selectedTaskDate,
  setSelectedTaskDate,
  taskTimeSortDirection,
  setTaskTimeSortDirection,
  isMobileOpen = false,
  mobilePopover = false,
}) {
  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);

  const priorityOptions = [
    { value: "Высокий", label: "Высокий приоритет", className: "high" },
    { value: "Средний", label: "Средний приоритет", className: "medium" },
    { value: "Низкий", label: "Низкий приоритет", className: "low" },
  ];

  function addPriority(priority) {
    setSelectedPriorities((current) => {
      if (current.includes(priority)) return current;
      return [...current, priority];
    });

    setIsPriorityMenuOpen(false);
  }

  function removePriority(priority) {
    setSelectedPriorities((current) =>
      current.filter((item) => item !== priority)
    );
  }

  function formatSelectedDate(dateValue) {
    if (!dateValue) return "";

    return new Date(`${dateValue}T12:00:00`).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
    });
  }

  const hasFilters = selectedPriorities.length > 0 || Boolean(selectedTaskDate);

  return (
    <aside
  className={[
    "task-right-filter-panel",
    isMobileOpen ? "mobile-open" : "",
    mobilePopover ? "mobile-popover" : "",
  ]
    .filter(Boolean)
    .join(" ")}
>
      <div className="task-filter-panel-head">
        <span>Отбор задач</span>
        <p>Настройте список по приоритету и дате.</p>
      </div>

      <div className="task-filter-panel-section">
        <label>Приоритет</label>

        <div className="task-priority-panel-select">
          <button
            type="button"
            onClick={() => setIsPriorityMenuOpen((current) => !current)}
          >
            Выбрать приоритет
            <span>⌄</span>
          </button>

          {isPriorityMenuOpen && (
            <div className="task-priority-panel-dropdown">
              {priorityOptions.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  className={`task-priority-panel-option ${priority.className}`}
                  disabled={selectedPriorities.includes(priority.value)}
                  onClick={() => addPriority(priority.value)}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="task-filter-panel-section">
        <label>Дата</label>

        <input
          type="date"
          className="task-filter-panel-date"
          value={selectedTaskDate}
          onChange={(event) => setSelectedTaskDate(event.target.value)}
        />
      </div>

      <div className="task-filter-panel-section">
        <label>Сортировка по времени</label>

        <div className="task-filter-panel-arrows">
          <button
            type="button"
            className={taskTimeSortDirection === "asc" ? "active" : ""}
            onClick={() => setTaskTimeSortDirection("asc")}
            title="Сначала ближайшие"
          >
            ↑
          </button>

          <button
            type="button"
            className={taskTimeSortDirection === "desc" ? "active" : ""}
            onClick={() => setTaskTimeSortDirection("desc")}
            title="Сначала поздние"
          >
            ↓
          </button>
        </div>
      </div>

      <div className="task-filter-panel-selected">
        <div className="task-filter-panel-selected-title">
          <span>Выбрано</span>

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setSelectedPriorities([]);
                setSelectedTaskDate("");
              }}
            >
              Сбросить
            </button>
          )}
        </div>

        {!hasFilters ? (
          <p className="task-filter-panel-empty">
            Пока условия не выбраны.
          </p>
        ) : (
          <div className="task-filter-panel-tags">
            {selectedPriorities.map((priority) => {
              const option = priorityOptions.find(
                (item) => item.value === priority
              );

              return (
                <button
                  key={priority}
                  type="button"
                  className={`task-filter-panel-tag ${option?.className || ""}`}
                  onClick={() => removePriority(priority)}
                >
                  {priority}
                  <span>×</span>
                </button>
              );
            })}

            {selectedTaskDate && (
              <button
                type="button"
                className="task-filter-panel-tag date"
                onClick={() => setSelectedTaskDate("")}
              >
                {formatSelectedDate(selectedTaskDate)}
                <span>×</span>
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
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

          <div className="modal-header-actions">
            <button
              type="submit"
              className="modal-save-icon-btn"
              disabled={isSaving}
              title="Сохранить группу"
              aria-label="Сохранить группу"
            >
              <SaveCheckIcon />
            </button>

            <button
              type="button"
              className="modal-close-icon-btn"
              onClick={onClose}
              title="Закрыть"
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>
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

      </form>
    </div>
  );
}


function TaskCard({
  task,
  markTaskDone,
  markWorkoutExerciseDone,
  toggleSubtaskDone,
  deleteTask,
  openEditTaskModal,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isCompleted = task.status === "Выполнена";
  const hasDescription = Boolean(task.description && task.description.trim());
  const hasSubtasks = Array.isArray(task.subtasks) && task.subtasks.length > 0;

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

        <div className="task-actions task-card-mini-actions" onClick={stopClick}>
  <button
  type="button"
  className="dots task-edit-icon-btn"
  onClick={() => openEditTaskModal(task)}
  title="Изменить задачу"
  aria-label="Изменить задачу"
>
  <svg viewBox="0 0 24 24">
    <path d="M4 20H8L18.5 9.5C19.3 8.7 19.3 7.4 18.5 6.6L17.4 5.5C16.6 4.7 15.3 4.7 14.5 5.5L4 16V20Z" />
    <path d="M13.5 6.5L17.5 10.5" />
  </svg>
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
          {hasSubtasks && (
  <div className="subtasks-box" onClick={stopClick}>

    <div className="subtasks-list">
      {task.subtasks.map((subtask, index) => {
        const isDone = Boolean(subtask.is_completed);

        return (
          <button
            type="button"
            className={
              isDone
                ? "subtask-view-item completed"
                : "subtask-view-item"
            }
            key={subtask.id || index}
            onClick={() => toggleSubtaskDone(task.id, subtask.id)}
          >
            <span className="subtask-check">
              {isDone ? "✓" : ""}
            </span>

            <p>{subtask.title || subtask}</p>
          </button>
        );
      })}
    </div>
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
  activeSectionFromMenu = "weights",
  tasks,
  setTasks,
  availableExercises,
  setAvailableExercises,
  openExerciseGuide,
  exerciseGuides = [],
  workingWeights,
  setWorkingWeights,
  exerciseGroups,
  setExerciseGroups,
  muscleGroups = [],
  onWorkoutCreated,
    showToast,
}) {
  const workouts = tasks.filter((task) => task.category === "Тренировка");
const [activeExerciseGroupId, setActiveExerciseGroupId] = useState("all");
useEffect(() => {
  if (activeExerciseGroupId === "all") {
    return;
  }

  const groupExists = exerciseGroups.some(
    (group) => String(group.id) === String(activeExerciseGroupId)
  );

  if (!groupExists) {
    setActiveExerciseGroupId("all");
  }
}, [exerciseGroups, activeExerciseGroupId]);
const [isExerciseGroupModalOpen, setIsExerciseGroupModalOpen] = useState(false);
  const activeSection = activeSectionFromMenu;
  const [isWorkingWeightModalOpen, setIsWorkingWeightModalOpen] =
    useState(false);
  const [editingWorkingWeight, setEditingWorkingWeight] = useState(null);
  const [activeMetricCardKey, setActiveMetricCardKey] = useState(null);
  const [isExerciseCreateModalOpen, setIsExerciseCreateModalOpen] =
  useState(false);
  const [exerciseMetricSearch, setExerciseMetricSearch] = useState("");
  const [guideSearch, setGuideSearch] = useState("");
const [selectedGuideExercise, setSelectedGuideExercise] = useState(null);
const [isMyWorkoutModalOpen, setIsMyWorkoutModalOpen] = useState(false);
const [editingMyWorkout, setEditingMyWorkout] = useState(null);
const [openedExerciseMenu, setOpenedExerciseMenu] = useState(null);
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

  function getMetricCardKey(item) {
  return `${item.exerciseId || "custom"}-${item.id}`;
}

function getExerciseGuide(exercise) {
  return {
    technique:
      Array.isArray(exercise?.technique) && exercise.technique.length > 0
        ? exercise.technique
        : ["Для этого упражнения пока не заполнена техника выполнения."],

    combinations:
      Array.isArray(exercise?.combinations) && exercise.combinations.length > 0
        ? exercise.combinations
        : ["Для этого упражнения пока не указаны рекомендуемые сочетания."],

    tips:
      Array.isArray(exercise?.tips) && exercise.tips.length > 0
        ? exercise.tips
        : ["Для этого упражнения пока не добавлены советы."],
  };
}

function getGuideCombinations(muscleName) {
  const normalizedMuscle = String(muscleName || "").toLowerCase();

  if (normalizedMuscle.includes("спина")) {
    return [
      "Бицепс — хорошо дополняет тяговые движения.",
      "Задняя дельта — помогает развивать верх спины и осанку.",
      "Пресс — можно добавить в конце тренировки для стабилизации корпуса.",
    ];
  }

  if (normalizedMuscle.includes("груд")) {
    return [
      "Трицепс — активно участвует в жимовых упражнениях.",
      "Плечи — особенно передняя дельта, но не перегружайте её.",
      "Пресс — можно добавить коротким блоком в конце тренировки.",
    ];
  }

  if (normalizedMuscle.includes("ног")) {
    return [
      "Ягодицы — хорошо сочетаются с упражнениями на ноги.",
      "Пресс — помогает стабилизировать корпус в базовых движениях.",
      "Кардио — можно добавить лёгким завершением после силовой части.",
    ];
  }

  if (normalizedMuscle.includes("плеч")) {
    return [
      "Трицепс — подходит для жимового тренировочного дня.",
      "Грудь — можно сочетать, если тренировка построена вокруг жимов.",
      "Задняя дельта — помогает сбалансировать развитие плеч.",
    ];
  }

  if (normalizedMuscle.includes("бицеп")) {
    return [
      "Спина — классическое сочетание после тяговых упражнений.",
      "Предплечья — можно добавить в конце тренировки.",
      "Пресс — лёгкий дополнительный блок без перегруза рук.",
    ];
  }

  if (normalizedMuscle.includes("трицеп")) {
    return [
      "Грудь — трицепс хорошо работает после жимовых движений.",
      "Плечи — подходит для жимового дня.",
      "Пресс — можно добавить как завершающий блок.",
    ];
  }

  if (normalizedMuscle.includes("пресс")) {
    return [
      "Ноги — пресс помогает стабилизировать корпус.",
      "Спина — важно укреплять корпус сбалансированно.",
      "Кардио — хорошо сочетается с упражнениями на пресс.",
    ];
  }

  if (normalizedMuscle.includes("кардио")) {
    return [
      "Пресс — можно добавить коротким блоком после кардио.",
      "Ноги — подходит для развития выносливости.",
      "Растяжка — хорошее завершение кардиотренировки.",
    ];
  }

  return [
    "Сочетайте с упражнениями на соседние мышечные группы.",
    "Не ставьте подряд слишком похожие упражнения.",
    "Оставляйте время на восстановление целевой мышцы.",
  ];
}

function getFilteredGuideExercises() {
  const searchValue = guideSearch.trim().toLowerCase();

  return exerciseGuides.filter((exercise) => {
    const exerciseName = String(exercise.name || "").trim().toLowerCase();

    if (exerciseName === "жим" || exerciseName === "авава" || exerciseName === "фывафыва") {
      return false;
    }

    if (!searchValue) {
      return true;
    }

    return [
      exercise.name,
      exercise.description,
      exercise.group_name,
      exercise.equipment,
      exercise.difficulty,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(searchValue);
  });
}

function createExerciseGroup(groupData) {
  const token = localStorage.getItem("token");

  if (!token) {
    return;
  }

  fetch(`${API_URL}/exercise-groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(groupData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        showToast?.(data.error, "error");
        return;
      }

      setExerciseGroups((current) => [...current, data]);
      setActiveExerciseGroupId(data.id);
      setIsExerciseGroupModalOpen(false);
    })
    .catch((error) => {
      console.error("Ошибка создания группы упражнений:", error);
    });
}

function deleteExerciseGroup(groupId) {
  if (!groupId || groupId === "all") {
    showToast?.("Группу «Все» удалить нельзя", "error");
    return;
  }

  const confirmed = window.confirm(
    "Удалить группу вместе со всеми упражнениями внутри неё?"
  );

  if (!confirmed) {
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    showToast?.("Необходимо войти в аккаунт", "error");
    return;
  }

  fetch(`${API_URL}/exercise-groups/${groupId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        showToast?.(data.error, "error");
        return;
      }

      setExerciseGroups((current) =>
        current.filter((group) => String(group.id) !== String(groupId))
      );

      setAvailableExercises((current) =>
  current.filter((exercise) => String(exercise.group_id) !== String(groupId))
);

setWorkingWeights((current) =>
  current.filter((weightItem) => {
    const exercise = availableExercises.find(
      (exerciseItem) =>
        String(exerciseItem.id) ===
        String(weightItem.sourceExerciseId || weightItem.exerciseId)
    );

    return String(exercise?.group_id) !== String(groupId);
  })
);

      if (String(activeExerciseGroupId) === String(groupId)) {
        setActiveExerciseGroupId("all");
      }

      showToast?.("Группа удалена", "success");
    })
    .catch((error) => {
      console.error("Ошибка удаления группы упражнений:", error);
      showToast?.("Не удалось удалить группу", "error");
    });
}

  function createCustomExercise(exerciseData) {
  const token = localStorage.getItem("token");

  if (!token) {
    return;
  }

  const preparedExerciseData = {
    ...exerciseData,
    measureType:
      exerciseData.measureType ||
      exerciseData.measure_type ||
      getMeasureTypeFromUnits(exerciseData.measureUnits || exerciseData.measure_units),
    measure_type:
      exerciseData.measure_type ||
      exerciseData.measureType ||
      getMeasureTypeFromUnits(exerciseData.measureUnits || exerciseData.measure_units),
    measureUnits: normalizeMeasureUnits(
      exerciseData.measureUnits || exerciseData.measure_units
    ),
    measure_units: normalizeMeasureUnits(
      exerciseData.measure_units || exerciseData.measureUnits
    ),
    groupId: exerciseData.groupId || exerciseData.group_id || null,
    group_id: exerciseData.group_id || exerciseData.groupId || null,
  };

  fetch(`${API_URL}/exercises`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(preparedExerciseData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        showToast?.(data.error, "error");
        return;
      }

      if (typeof setAvailableExercises === "function") {
        const normalizedUnits = normalizeMeasureUnits(
          data.measure_units ||
            data.measureUnits ||
            preparedExerciseData.measure_units ||
            preparedExerciseData.measureUnits
        );

        const normalizedType =
          data.measure_type ||
          data.measureType ||
          preparedExerciseData.measure_type ||
          preparedExerciseData.measureType ||
          getMeasureTypeFromUnits(normalizedUnits);

        const normalizedExercise = {
          ...data,
          is_custom:
            data.is_custom === undefined ? true : Boolean(data.is_custom),
          measure_type: normalizedType,
          measureType: normalizedType,
          measure_units: normalizedUnits,
          measureUnits: normalizedUnits,
          group_id:
            data.group_id ||
            data.groupId ||
            preparedExerciseData.group_id ||
            preparedExerciseData.groupId ||
            null,
          groupId:
            data.groupId ||
            data.group_id ||
            preparedExerciseData.groupId ||
            preparedExerciseData.group_id ||
            null,
        };

        setAvailableExercises((current) => [...current, normalizedExercise]);
      }

      setIsExerciseCreateModalOpen(false);
    })
    .catch((error) => {
      console.error("Ошибка создания упражнения:", error);
    });
}
function getMetricRowValue(item) {
  const metric = item.metric;

  if (!metric) {
    return "—";
  }

  const exercise = availableExercises.find(
    (exerciseItem) =>
      String(exerciseItem.id) === String(item.sourceExerciseId || item.exerciseId)
  );

  const measureType =
    metric?.measureType ||
    item.measureType ||
    exercise?.measure_type ||
    exercise?.measureType ||
    detectExerciseMeasureType(item.exerciseName);

  const measureUnits = normalizeMeasureUnits(
    exercise?.measure_units ||
      exercise?.measureUnits ||
      item.measureUnits ||
      getDefaultMeasureUnits(measureType)
  );

  const values = [];

  if (measureUnits.includes("kg") && metric.weight) {
    values.push(`${metric.weight} кг`);
  }

  if (measureUnits.includes("km") && metric.distance) {
    values.push(`${metric.distance} км`);
  }

  if (measureUnits.includes("min") && metric.time) {
    values.push(`${getMinutesValue(metric.time)} мин`);
  }

  if (measureUnits.includes("reps") && metric.reps) {
    values.push(`${metric.reps} повт.`);
  }

  return values.length > 0 ? values.join(" · ") : "—";
}

 function formatWorkingWeightValue(item) {
  if (!item) {
    return "не заполнено";
  }

  if (item.measureType === "distance_time") {
    if (item.distance && item.time) {
      return `${item.distance} км / ${item.time}`;
    }

    if (item.time) {
      return item.time;
    }

    if (item.distance) {
      return `${item.distance} км`;
    }

    return "не заполнено";
  }

  if (item.measureType === "time_sets") {
    if (item.time) {
      return item.time;
    }

    return "не заполнено";
  }

  if (item.weight) {
    return `${item.weight} кг`;
  }

  return "не заполнено";
}

const filteredAvailableExercises =
  activeExerciseGroupId === "all"
    ? availableExercises
    : availableExercises.filter(
        (exercise) => String(exercise.group_id) === String(activeExerciseGroupId)
      );

function getGroupedExerciseMetrics() {
  const searchValue = exerciseMetricSearch.trim().toLowerCase();

  const orderedItems = getOrderedExerciseMetrics()
    .filter(Boolean)
    .filter((item) => {
      if (!searchValue) {
        return true;
      }

      return String(item.exerciseName || "")
        .toLowerCase()
        .includes(searchValue);
    });

  const groupOrder = [
    "Спина",
    "Грудь",
    "Ноги",
    "Плечи",
    "Бицепс",
    "Трицепс",
    "Пресс",
    "Ягодицы",
    "Кардио",
    "Без группы",
  ];

  const groupsMap = {};

  orderedItems.forEach((item) => {
    const exercise = availableExercises.find(
      (exerciseItem) =>
        String(exerciseItem.id) === String(item.sourceExerciseId || item.exerciseId)
    );

    const groupName =
      exercise?.group_name ||
      exercise?.muscle ||
      exercise?.muscle_group ||
      "Без группы";

    if (!groupsMap[groupName]) {
      groupsMap[groupName] = [];
    }

    groupsMap[groupName].push(item);
  });

  const sortedGroups = Object.keys(groupsMap).sort((firstGroup, secondGroup) => {
    const firstIndex = groupOrder.indexOf(firstGroup);
    const secondIndex = groupOrder.indexOf(secondGroup);

    if (firstIndex === -1 && secondIndex === -1) {
      return firstGroup.localeCompare(secondGroup);
    }

    if (firstIndex === -1) return 1;
    if (secondIndex === -1) return -1;

    return firstIndex - secondIndex;
  });

  return sortedGroups.map((groupName) => ({
    name: groupName,
    items: groupsMap[groupName],
  }));
}

function getOrderedExerciseMetrics() {
  const filteredAvailableExercises =
    activeExerciseGroupId === "all"
      ? availableExercises
      : availableExercises.filter((exercise) => {
          const exerciseGroupId = exercise.group_id || exercise.groupId;

          return String(exerciseGroupId) === String(activeExerciseGroupId);
        });

  return filteredAvailableExercises.map((exercise) => {
    const isCustomExercise = Boolean(exercise.is_custom || exercise.isCustom);
    const exerciseName = String(exercise.name || exercise.exerciseName || "");

    const metric = workingWeights.find((weightItem) => {
      const metricExerciseId =
        weightItem.exerciseId ||
        weightItem.exercise_id ||
        weightItem.sourceExerciseId;

      const metricName = String(
        weightItem.exerciseName || weightItem.exercise_name || ""
      )
        .trim()
        .toLowerCase();

      if (!isCustomExercise && metricExerciseId) {
        return String(metricExerciseId) === String(exercise.id);
      }

      return metricName === exerciseName.trim().toLowerCase();
    });

    const exerciseMeasureUnits = normalizeMeasureUnits(
      exercise.measure_units || exercise.measureUnits
    );

    const fallbackMeasureType =
      exercise.measure_type ||
      exercise.measureType ||
      metric?.measureType ||
      metric?.measure_type ||
      detectExerciseMeasureType(exerciseName);

    const finalMeasureUnits =
      exerciseMeasureUnits.length > 0
        ? exerciseMeasureUnits
        : getDefaultMeasureUnits(fallbackMeasureType);

    const finalMeasureType = getMeasureTypeFromUnits(finalMeasureUnits);

    return {
      id: exercise.id,
      sourceExerciseId: exercise.id,
      exerciseId: isCustomExercise ? null : exercise.id,
      exerciseName,
      measureType: finalMeasureType,
      measureUnits: finalMeasureUnits,
      metric,
      isCustom: isCustomExercise,
    };
  });
}

function openExerciseMetric(item) {
  setEditingWorkingWeight({
    ...(item.metric || {}),
    exerciseId: item.exerciseId,
    sourceExerciseId: item.sourceExerciseId,
    exerciseName: item.exerciseName,
    measureType: item.measureType,
    measureUnits: item.measureUnits,
  });

  setIsWorkingWeightModalOpen(true);
}

function openGuideFromWorkingWeight(item) {
  setOpenedExerciseMenu(null);

  const normalizedItemName = String(item.exerciseName || "")
    .trim()
    .toLowerCase();

  const guideExercise = exerciseGuides.find((exercise) => {
    const normalizedGuideName = String(exercise.name || "")
      .trim()
      .toLowerCase();

    return normalizedGuideName === normalizedItemName;
  });

  if (guideExercise) {
    setSelectedGuideExercise(guideExercise);
    return;
  }

  const availableExercise = availableExercises.find((exercise) => {
    const normalizedExerciseName = String(exercise.name || "")
      .trim()
      .toLowerCase();

    return normalizedExerciseName === normalizedItemName;
  });

  if (availableExercise) {
    setSelectedGuideExercise(availableExercise);
    return;
  }

  showToast?.("Гайд для этого упражнения не найден", "error");
}

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
    showToast?.("Необходимо войти в аккаунт", "error");
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
        showToast?.(data.error, "error");
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

function saveInlineWorkingWeight(item, values) {
  const token = localStorage.getItem("token");

  if (!token) {
    return;
  }

  const metric = item.metric;

  const exercise = availableExercises.find(
  (exerciseItem) =>
    String(exerciseItem.id) === String(item.sourceExerciseId || item.exerciseId)
);

  const measureType =
    metric?.measureType ||
    exercise?.measure_type ||
    exercise?.measureType ||
    detectExerciseMeasureType(item.exerciseName);

  const payload = {
  ...(metric?.id ? { id: metric.id } : {}),
  exerciseId: item.isCustom ? null : item.exerciseId,
  exerciseName: item.exerciseName,
  measureType,
};

  if (measureType === "distance_time") {
    payload.distance =
      values.distance === "" || values.distance === undefined
        ? null
        : normalizeMetricValue(values.distance)

    const normalizedMinutes = normalizeMetricValue(values.minutes);

payload.time = normalizedMinutes ? `${normalizedMinutes}:00` : "";
  } else if (measureType === "time_sets") {
    const normalizedMinutes = normalizeMetricValue(values.minutes);

payload.time = normalizedMinutes ? `${normalizedMinutes}:00` : "";
  } else {
  payload.weight = normalizeMetricValue(values.weight);
  payload.reps = normalizeMetricValue(values.reps);
}

  const isEditing = Boolean(metric?.id);

  fetch(
    isEditing
      ? `${API_URL}/exercise-metrics/${metric.id}`
      : `${API_URL}/exercise-metrics`,
    {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error(data.error);
        return;
      }

      setWorkingWeights((current) => {
        const exists = current.some((weightItem) => weightItem.id === data.id);

        if (exists) {
          return current.map((weightItem) =>
            weightItem.id === data.id ? data : weightItem
          );
        }

        return [data, ...current];
      });
    })
    .catch((error) => {
      console.error("Ошибка сохранения показателя:", error);
    });
}

function normalizeMetricValue(value) {
  if (value === "" || value === undefined || value === null) {
    return null;
  }

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return null;
  }

  return Math.min(999, Math.max(0, numberValue));
}

function deleteWorkingWeight(id) {
  const token = localStorage.getItem("token");

  if (!token) {
    showToast?.("Необходимо войти в аккаунт", "error");
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
        showToast?.(data.error, "error");
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

function deleteCustomExercise(exercise) {
  const token = localStorage.getItem("token");

  if (!token) {
    showToast?.("Необходимо войти в аккаунт", "error");
    return;
  }

  if (!exercise?.isCustom) {
    showToast?.("Можно удалять только свои упражнения", "error");
    return;
  }

  const confirmed = window.confirm(
    `Удалить упражнение "${exercise.exerciseName}"?`
  );

  if (!confirmed) {
    return;
  }

  fetch(`${API_URL}/user-exercises/${exercise.sourceExerciseId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        showToast?.(data.error, "error");
        return;
      }

      setAvailableExercises((current) =>
        current.filter(
          (exerciseItem) =>
            !(
              exerciseItem.is_custom &&
              String(exerciseItem.id) === String(exercise.sourceExerciseId)
            )
        )
      );

      setWorkingWeights((current) =>
        current.filter(
          (weightItem) =>
            !(
              !weightItem.exerciseId &&
              weightItem.exerciseName === exercise.exerciseName
            )
        )
      );

      showToast?.("Упражнение удалено", "success");
    })
    .catch((error) => {
      console.error("Ошибка удаления упражнения:", error);
      showToast?.("Не удалось удалить упражнение", "error");
    });
}

function toggleWorkoutExercise(workoutExerciseId) {
  if (!workoutExerciseId) {
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    showToast?.("Необходимо войти в аккаунт", "error");
    return;
  }

  setTasks((currentTasks) =>
    currentTasks.map((task) => {
      if (task.category !== "Тренировка" || !Array.isArray(task.exercises)) {
        return task;
      }

      const updatedExercises = task.exercises.map((exercise) => {
        if (String(exercise.workout_exercise_id) !== String(workoutExerciseId)) {
          return exercise;
        }

        return {
          ...exercise,
          is_completed: !Boolean(exercise.is_completed),
        };
      });

      const wasChanged = updatedExercises.some((exercise, index) => {
        return exercise.is_completed !== task.exercises[index].is_completed;
      });

      if (!wasChanged) {
        return task;
      }

      const allCompleted =
        updatedExercises.length > 0 &&
        updatedExercises.every((exercise) => exercise.is_completed);

      const hasCompleted = updatedExercises.some(
        (exercise) => exercise.is_completed
      );

      return {
        ...task,
        exercises: updatedExercises,
        status: allCompleted
          ? "Выполнена"
          : hasCompleted
            ? "В процессе"
            : "Запланирована",
      };
    })
  );

  fetch(`${API_URL}/workout-exercises/${workoutExerciseId}/complete`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        showToast?.(data.error, "error");

        if (typeof onWorkoutCreated === "function") {
          onWorkoutCreated();
        }
      }
    })
    .catch((error) => {
      console.error("Ошибка выполнения упражнения:", error);
      alert("Не удалось обновить упражнение");

      if (typeof onWorkoutCreated === "function") {
        onWorkoutCreated();
      }
    });
}

function deleteMyWorkout(workoutId) {
  const confirmed = window.confirm("Удалить тренировку?");

  if (!confirmed) {
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    showToast?.("Необходимо войти в аккаунт", "error");
    return;
  }

  fetch(`${API_URL}/workouts/${workoutId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        showToast?.(data.error, "error");
        return;
      }

      if (typeof onWorkoutCreated === "function") {
        onWorkoutCreated();
      }
    })
    .catch((error) => {
      console.error("Ошибка удаления тренировки:", error);
      showToast?.("Не удалось удалить тренировку", "error");
    });
    showToast?.("Тренировка удалена", "success");
}



  function saveMyWorkout(workoutData) {
  const token = localStorage.getItem("token");

  if (!token) {
  showToast?.("Необходимо войти в аккаунт", "error");
  return;
}

  const isEditing = Boolean(editingMyWorkout?.id);

  fetch(
    isEditing
      ? `${API_URL}/workouts/${editingMyWorkout.id}`
      : `${API_URL}/workouts`,
    {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(workoutData),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
  showToast?.(data.error, "error");
  return;
}

      setIsMyWorkoutModalOpen(false);
      setEditingMyWorkout(null);

      showToast?.(
  isEditing ? "Тренировка обновлена" : "Тренировка создана",
  "success"
      );

      if (typeof onWorkoutCreated === "function") {
        onWorkoutCreated();
      }

      if (typeof setAvailableExercises === "function") {
        loadUserExercisesForWorkout(setAvailableExercises);
      }
    })
    .catch((error) => {
      console.error("Ошибка сохранения тренировки:", error);
      showToast?.("Не удалось сохранить тренировку", "error");
    });
}

function loadUserExercisesForWorkout(setAvailableExercises) {
  const token = localStorage.getItem("token");

  if (!token) {
    return;
  }

  fetch(`${API_URL}/user-exercises`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (!Array.isArray(data)) {
        return;
      }

      setAvailableExercises((current) => {
        const baseExercises = current.filter((exercise) => !exercise.is_custom);

        return [...baseExercises, ...data];
      });
    })
    .catch((error) => {
      console.error("Ошибка обновления пользовательских упражнений:", error);
    });
}

  return (
    <section>
      <PageHeader
  title={
    activeSection === "weights"
      ? "Рабочие веса"
      : activeSection === "guides"
        ? "Гайды"
        : "Моя тренировка"
  }
  subtitle={
    activeSection === "weights"
      ? "Сохраняйте рабочие показатели по упражнениям."
      : activeSection === "guides"
        ? "Изучайте технику выполнения упражнений."
        : "Планируйте свои тренировки и упражнения."
  }
/>

      <div className="training-page-clean">
        <div className="training-active-panel">
          {activeSection === "weights" && (
            <section className="training-panel-section">

             <div className="working-weights-layout">
  <aside className="exercise-groups-sidebar">
    <button
      type="button"
      className={
        activeExerciseGroupId === "all"
          ? "exercise-group-tab active"
          : "exercise-group-tab"
      }
      onClick={() => setActiveExerciseGroupId("all")}
    >
      Все
    </button>

    {exerciseGroups.map((group) => (
      <div
        key={group.id}
        className={
          String(activeExerciseGroupId) === String(group.id)
            ? "exercise-group-tab exercise-group-tab-with-delete active"
            : "exercise-group-tab exercise-group-tab-with-delete"
        }
        style={{
          "--group-color": group.color || "#E6F8FA",
        }}
      >
        <button
          type="button"
          className="exercise-group-name-btn"
          onClick={() => setActiveExerciseGroupId(group.id)}
          title={group.name}
        >
          {group.name}
        </button>

        <button
          type="button"
          className="exercise-group-delete-btn"
          onClick={(event) => {
            event.stopPropagation();
            deleteExerciseGroup(group.id);
          }}
          title="Удалить группу"
          aria-label="Удалить группу"
        >
          ×
        </button>
      </div>
    ))}

    <button
      type="button"
      className="exercise-group-add-btn"
      onClick={() => setIsExerciseGroupModalOpen(true)}
    >
      + Группа
    </button>
  </aside>

  <div className="working-weights-list-panel">
  <div className="working-weights-list-toolbar">
    <div className="working-weights-search">
      <svg viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="7" />
        <path d="M16.5 16.5L21 21" />
      </svg>

      <input
        type="text"
        value={exerciseMetricSearch}
        onChange={(event) => setExerciseMetricSearch(event.target.value)}
        placeholder="Поиск упражнения..."
      />
    </div>

    <button
      type="button"
      className="training-action-btn"
      onClick={() => setIsExerciseCreateModalOpen(true)}
    >
      + Упражнение
    </button>
  </div>

  <div className="working-weights-list-content">
    {getGroupedExerciseMetrics().length === 0 ? (
      <button
        type="button"
        className="working-weights-list-empty"
        onClick={() => setIsExerciseCreateModalOpen(true)}
      >
        <strong>Упражнения не найдены</strong>
        <span>Создайте своё упражнение или измените поиск.</span>
      </button>
    ) : (
      getGroupedExerciseMetrics().map((group) => (
        <section key={group.name} className="working-weights-row-group">
          <h3>{group.name}</h3>

          <div className="working-weights-row-list">
            {group.items.map((item) => {
  const menuKey = getMetricCardKey(item);

  return (
    <div
      key={menuKey}
      className="working-weight-row"
      onClick={() => openExerciseMetric(item)}
      role="button"
      tabIndex={0}
    >
      <div className="working-weight-row-main">
        <strong>{item.exerciseName}</strong>
        <span>{group.name}</span>
      </div>

      <div className="working-weight-row-value">
        {getMetricRowValue(item)}
      </div>

      <div className="working-weight-row-menu-wrap">
        <button
          type="button"
          className="working-weight-row-menu-btn"
          onClick={(event) => {
            event.stopPropagation();
            setOpenedExerciseMenu((current) =>
              current === menuKey ? null : menuKey
            );
          }}
          aria-label="Открыть меню упражнения"
          title="Меню"
        >
          ⋯
        </button>

        {openedExerciseMenu === menuKey && (
          <div
            className="working-weight-row-menu"
            onClick={(event) => event.stopPropagation()}
          >
            <button
  type="button"
  onClick={() => openGuideFromWorkingWeight(item)}
>
  Гайд
</button>

            {item.isCustom && (
              <button
                type="button"
                className="danger"
                onClick={() => deleteCustomExercise(item)}
              >
                Удалить
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
})}
          </div>
        </section>
      ))
    )}
  </div>
</div>
</div>
            </section>
          )}

          {activeSection === "plans" && (
  <section className="my-workouts-section">
    <div className="my-workouts-toolbar">
      <button
        type="button"
        className="training-action-btn"
        onClick={() => setIsMyWorkoutModalOpen(true)}
      >
        + Тренировка
      </button>
    </div>

    {workouts.length === 0 ? (
      <button
        type="button"
        className="my-workouts-empty"
        onClick={() => setIsMyWorkoutModalOpen(true)}
      >
        <strong>Тренировок пока нет</strong>
        <span>Нажмите сюда, чтобы создать первую тренировку.</span>
      </button>
    ) : (
      <div className="my-workouts-grid">
        {workouts.map((workout) => (
          <article className="my-workout-card" key={workout.id}>
            <div>
  <h3>{workout.title}</h3>
  <p>{workout.muscle || "Без группы мышц"}</p>
</div>

<div className="my-workout-card-actions">
  <span>{workout.exercises?.length || 0} упр.</span>

  <button
    type="button"
    className="dots task-edit-icon-btn"
    onClick={() => {
      setEditingMyWorkout(workout);
      setIsMyWorkoutModalOpen(true);
    }}
    title="Изменить тренировку"
    aria-label="Изменить тренировку"
  >
    <svg viewBox="0 0 24 24">
      <path d="M4 20H8L18.5 9.5C19.3 8.7 19.3 7.4 18.5 6.6L17.4 5.5C16.6 4.7 15.3 4.7 14.5 5.5L4 16V20Z" />
      <path d="M13.5 6.5L17.5 10.5" />
    </svg>
  </button>

  <button
    type="button"
    className="dots delete-btn"
    onClick={() => deleteMyWorkout(workout.id)}
    title="Удалить тренировку"
    aria-label="Удалить тренировку"
  >
    ×
  </button>
</div>

            {Array.isArray(workout.exercises) && workout.exercises.length > 0 && (
              <div className="my-workout-exercises">
  {workout.exercises.map((exercise) => (
    <button
      type="button"
      className={
        exercise.is_completed
          ? "my-workout-exercise completed"
          : "my-workout-exercise"
      }
      key={exercise.workout_exercise_id || exercise.id || exercise.name}
      onClick={() => toggleWorkoutExercise(exercise.workout_exercise_id)}
    >
      <span className="my-workout-exercise-check">
        {exercise.is_completed && <SaveCheckIcon />}
      </span>

      <span className="my-workout-exercise-name">
        {exercise.name}
      </span>

<small>
  {Number(exercise.sets_count || 0)} подх.
  {exercise.weight_kg ? ` · ${exercise.weight_kg} кг` : ""}
  {exercise.reps_count ? ` · ${exercise.reps_count} повт.` : ""}
</small>
    </button>
  ))}
</div>
            )}
          </article>
        ))}
      </div>
    )}

    {isMyWorkoutModalOpen && (
      <MyWorkoutCreateModal
  muscleGroups={muscleGroups}
  availableExercises={availableExercises}
  workingWeights={workingWeights}
  initialData={editingMyWorkout}
  showToast={showToast}
  onClose={() => {
    setIsMyWorkoutModalOpen(false);
    setEditingMyWorkout(null);
  }}
  onSave={saveMyWorkout}
/>
    )}
  </section>
)}

          {activeSection === "guides" && (
  <section className="training-panel-section">
    <div className="guides-panel">
      <div className="guides-header">
        <div className="guides-search">
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" />
            <path d="M16.5 16.5L21 21" />
          </svg>

          <input
            type="text"
            value={guideSearch}
            onChange={(event) => setGuideSearch(event.target.value)}
            placeholder="Найти упражнение..."
          />
        </div>
      </div>

      {getFilteredGuideExercises().length === 0 ? (
        <div className="guides-empty">
          <strong>Упражнения не найдены</strong>
          <p>Попробуйте изменить поиск или добавьте упражнение в разделе рабочих весов.</p>
        </div>
      ) : (
        <div className="guides-grid">
          {getFilteredGuideExercises().map((exercise) => (
            <button
              key={`${exercise.is_custom ? "custom" : "base"}-${exercise.id}`}
              type="button"
              className="guide-card"
              onClick={() => setSelectedGuideExercise(exercise)}
            >
              <div className="guide-card-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M7 8V16" />
                  <path d="M17 8V16" />
                  <path d="M3 10V14" />
                  <path d="M21 10V14" />
                  <path d="M7 12H17" />
                </svg>
              </div>

              <div className="guide-card-content">
                <strong>{exercise.name}</strong>

                <p>
                  {exercise.description ||
                    "Краткий гайд по технике выполнения упражнения."}
                </p>

                <div className="guide-card-tags">
                  <span>
                    {exercise.group_name ||
                      exercise.muscle ||
                      exercise.muscle_group ||
                      "Без группы"}
                  </span>

                  <span>{exercise.difficulty || "Средняя"}</span>

                  {exercise.equipment && <span>{exercise.equipment}</span>}
                </div>
              </div>

              <div className="guide-card-arrow">
                <svg viewBox="0 0 24 24">
                  <path d="M9 6L15 12L9 18" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  </section>
)}
        </div>
        {isExerciseCreateModalOpen && (
  <CreateExerciseModal
    exerciseGroups={exerciseGroups}
  activeExerciseGroupId={activeExerciseGroupId}
  onClose={() => setIsExerciseCreateModalOpen(false)}
  onSave={createCustomExercise}
  />
)}
{isExerciseGroupModalOpen && (
  <CreateExerciseGroupModal
    onClose={() => setIsExerciseGroupModalOpen(false)}
    onSave={createExerciseGroup}
  />
)}

{selectedGuideExercise && (
  <ExerciseGuideModal
    exercise={selectedGuideExercise}
    guide={getExerciseGuide(selectedGuideExercise)}
    onClose={() => setSelectedGuideExercise(null)}
  />
)}
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

function MyWorkoutCreateModal({
  muscleGroups = [],
  availableExercises = [],
  workingWeights = [],
  initialData = null,
   showToast,
  onClose,
  onSave,
}) {
  const [step, setStep] = useState(1);
const [title, setTitle] = useState(initialData?.title || "");
const [selectedMuscles, setSelectedMuscles] = useState(() => {
  if (!initialData?.muscle) {
    return [];
  }

  return String(initialData.muscle)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
});
const [exerciseSearch, setExerciseSearch] = useState("");
const [isExerciseSuggestOpen, setIsExerciseSuggestOpen] = useState(false);
const [selectedExercises, setSelectedExercises] = useState(() => {
  if (!Array.isArray(initialData?.exercises)) {
    return [];
  }

  return initialData.exercises.map((exercise) => ({
  id:
    exercise.workout_exercise_id ||
    exercise.id ||
    crypto.randomUUID(),
  name: exercise.name,
  exercise_id: exercise.exercise_id || (!exercise.is_custom ? exercise.id : null),
  user_exercise_id: exercise.user_exercise_id || (exercise.is_custom ? exercise.id : null),
  measure_units:
    exercise.measure_units ||
    exercise.measureUnits ||
    getExerciseMeasureUnits(exercise),
  sets_count:
    exercise.sets_count === null || exercise.sets_count === undefined
      ? ""
      : String(exercise.sets_count),
  reps_count:
    exercise.reps_count === null || exercise.reps_count === undefined
      ? ""
      : String(exercise.reps_count),
  weight_kg:
    exercise.weight_kg === null || exercise.weight_kg === undefined
      ? ""
      : String(exercise.weight_kg),
}));
});

  const normalizedSearch = exerciseSearch.trim().toLowerCase();

  const filteredExercises = normalizedSearch
    ? availableExercises
        .filter((exercise) =>
          String(exercise.name || "")
            .toLowerCase()
            .includes(normalizedSearch)
        )
        .slice(0, 8)
  : [];

  function getExerciseMeasureUnits(exercise) {
  if (!exercise) {
    return ["kg"];
  }

  const sourceExercise = availableExercises.find((item) => {
    if (exercise.exercise_id && String(item.id) === String(exercise.exercise_id)) {
      return true;
    }

    if (exercise.user_exercise_id && String(item.id) === String(exercise.user_exercise_id)) {
      return true;
    }

    return (
      String(item.name || "").trim().toLowerCase() ===
      String(exercise.name || "").trim().toLowerCase()
    );
  });

  const units =
    sourceExercise?.measure_units ||
    sourceExercise?.measureUnits ||
    exercise.measure_units ||
    exercise.measureUnits;

  if (Array.isArray(units) && units.length > 0) {
    return units;
  }

  const name = String(exercise.name || "").toLowerCase();

  if (
    name.includes("подтяг") ||
    name.includes("отжим") ||
    name.includes("скруч") ||
    name.includes("пресс")
  ) {
    return ["reps"];
  }

  if (
    name.includes("бег") ||
    name.includes("ходьб") ||
    name.includes("велосипед") ||
    name.includes("кардио")
  ) {
    return ["km", "min"];
  }

  if (
    name.includes("планка") ||
    name.includes("вис") ||
    name.includes("удержание")
  ) {
    return ["min"];
  }

  return ["kg", "reps"];
}

    function getDefaultWeightForExercise(exercise) {
  if (!exercise) {
    return "";
  }

  const exerciseName = String(exercise.name || "").trim().toLowerCase();
  const exerciseId = exercise.id;

  const metric = workingWeights.find((item) => {
    const metricExerciseId = item.exerciseId || item.exercise_id;
    const metricName = String(item.exerciseName || item.exercise_name || "")
      .trim()
      .toLowerCase();

    if (metricExerciseId && exerciseId) {
      return String(metricExerciseId) === String(exerciseId);
    }

    return metricName && metricName === exerciseName;
  });

  if (!metric || metric.weight === null || metric.weight === undefined) {
    return "";
  }

  return String(metric.weight);
}

function getDefaultRepsForExercise(exercise) {
  if (!exercise) {
    return "";
  }

  const exerciseName = String(exercise.name || "").trim().toLowerCase();
  const exerciseId = exercise.id;

  const metric = workingWeights.find((item) => {
    const metricExerciseId = item.exerciseId || item.exercise_id;
    const metricName = String(item.exerciseName || item.exercise_name || "")
      .trim()
      .toLowerCase();

    if (metricExerciseId && exerciseId) {
      return String(metricExerciseId) === String(exerciseId);
    }

    return metricName && metricName === exerciseName;
  });

  if (!metric || metric.reps === null || metric.reps === undefined) {
    return "";
  }

  return String(metric.reps);
}

function updateSelectedExerciseField(id, field, value) {
  setSelectedExercises((current) =>
    current.map((exercise) =>
      exercise.id === id
        ? {
            ...exercise,
            [field]: value,
          }
        : exercise
    )
  );
}

  function toggleMuscle(name) {
    setSelectedMuscles((current) => {
      if (current.includes(name)) {
        return current.filter((item) => item !== name);
      }

      return [...current, name];
    });
  }

  function goNext() {
    if (!title.trim()) {
      showToast?.("Введите название тренировки", "error");
      return;
    }

    if (selectedMuscles.length === 0) {
      showToast?.("Выберите хотя бы одну группу мышц", "error");
      return;
    }

    setStep(2);
  }

  function addExerciseFromBase(exercise) {
    const exerciseId = exercise.is_custom ? null : exercise.id;
    const userExerciseId = exercise.is_custom ? exercise.id : null;

    const alreadyAdded = selectedExercises.some((item) => {
      if (exerciseId && item.exercise_id === exerciseId) return true;
      if (userExerciseId && item.user_exercise_id === userExerciseId) return true;

      return item.name.toLowerCase() === String(exercise.name || "").toLowerCase();
    });

    if (alreadyAdded) {
      setExerciseSearch("");
      setIsExerciseSuggestOpen(false);
        showToast?.("Это упражнение уже добавлено", "info");
      return;
    }

    setSelectedExercises((current) => [
  ...current,
  {
    id: crypto.randomUUID(),
    name: exercise.name,
    exercise_id: exerciseId,
    user_exercise_id: userExerciseId,
    measure_units:
      exercise.measure_units ||
      exercise.measureUnits ||
      getExerciseMeasureUnits(exercise),
    sets_count: "",
    reps_count: getDefaultRepsForExercise(exercise),
    weight_kg: getDefaultWeightForExercise(exercise),
  },
]);

setExerciseSearch("");
  }

  function selectExerciseSuggestion(exercise) {
  setExerciseSearch(exercise.name || "");
  setIsExerciseSuggestOpen(false);
}

  function addTypedExercise() {
    const exerciseName = exerciseSearch.trim();

    if (!exerciseName) {
      return;
    }

    const existingExercise = availableExercises.find(
      (exercise) =>
        String(exercise.name || "").trim().toLowerCase() ===
        exerciseName.toLowerCase()
    );

    if (existingExercise) {
      addExerciseFromBase(existingExercise);
      return;
    }

    const alreadyAdded = selectedExercises.some(
      (exercise) =>
        exercise.name.trim().toLowerCase() === exerciseName.toLowerCase()
    );

    if (alreadyAdded) {
      setExerciseSearch("");
        showToast?.("Это упражнение уже добавлено", "info");
      return;
    }

    setSelectedExercises((current) => [
  ...current,
  {
    id: crypto.randomUUID(),
    name: exerciseName,
    exercise_id: null,
    user_exercise_id: null,
    measure_units: getExerciseMeasureUnits({ name: exerciseName }),
    sets_count: "",
    reps_count: "",
    weight_kg: "",
  },
]);

setExerciseSearch("");
  }

  function removeExercise(id) {
    setSelectedExercises((current) =>
      current.filter((exercise) => exercise.id !== id)
    );
  }

  function handleSubmit(event) {
  event.preventDefault();
  event.stopPropagation();

  if (step !== 2) {
    return;
  }

  if (selectedExercises.length === 0) {
    showToast?.("Добавьте хотя бы одно упражнение", "error");
    return;
  }

  onSave({
    title: title.trim(),
    description: "",
    priority: "medium",
    muscle_groups: selectedMuscles,
    repeat_days: [],
    exercises: selectedExercises.map((exercise) => ({
      name: exercise.name,
      exercise_id: exercise.exercise_id,
      user_exercise_id: exercise.user_exercise_id,
      sets_count:
        exercise.sets_count === "" ||
        exercise.sets_count === null ||
        exercise.sets_count === undefined
          ? 0
          : Number(exercise.sets_count),
      reps_count:
  exercise.reps_count === "" ||
  exercise.reps_count === null ||
  exercise.reps_count === undefined
    ? null
    : Number(exercise.reps_count),

weight_kg:
  exercise.weight_kg === "" ||
  exercise.weight_kg === null ||
  exercise.weight_kg === undefined
    ? null
    : Number(exercise.weight_kg),
    })),
  });
}

  return (
    <div className="modal-backdrop">
      <form className="simple-modal my-workout-modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <div>
            <h2>
  {step === 1
    ? initialData
      ? "Изменить тренировку"
      : "Новая тренировка"
    : "Упражнения"}
</h2>
            <p>Шаг {step} из 2</p>
          </div>

          <div className="modal-header-actions">
            {step === 2 && (
  <button
    type="button"
    className="modal-back-icon-btn"
    onClick={() => setStep(1)}
    title="Назад"
    aria-label="Назад"
  >
    <BackArrowIcon />
  </button>
)}

            {step === 1 ? (
  <button
    type="button"
    className="modal-next-icon-btn"
    onClick={(event) => {
      event.preventDefault();
      event.stopPropagation();
      goNext();
    }}
    title="Далее"
    aria-label="Далее"
  >
    <NextArrowIcon />
  </button>
) : (
  <button
    type="submit"
    className="modal-save-icon-btn"
    title="Сохранить тренировку"
    aria-label="Сохранить тренировку"
  >
    <SaveCheckIcon />
  </button>
)}

            <button
              type="button"
              className="modal-close-icon-btn"
              onClick={onClose}
              title="Закрыть"
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>
        </div>

        {step === 1 && (
          <>
            <label className="field">
              <span>Название тренировки</span>

              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Например: Спина и бицепс"
                autoFocus
              />
            </label>

            <div className="field">
              <span>Группы мышц</span>

              <div className="my-workout-muscle-grid pretty">
  {muscleGroups.map((muscle) => {
    const isSelected = selectedMuscles.includes(muscle.name);

    return (
      <button
        type="button"
        key={muscle.id}
        className={
          isSelected
            ? "my-workout-muscle-chip active"
            : "my-workout-muscle-chip"
        }
        onClick={() => toggleMuscle(muscle.name)}
      >
        <span className="my-workout-muscle-chip-dot">
          {isSelected ? <SaveCheckIcon /> : ""}
        </span>

        <span>{muscle.name}</span>
      </button>
    );
  })}
</div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="my-workout-add-exercise">
              <label className="field">
                <span>Упражнение</span>

                <input
  value={exerciseSearch}
  onChange={(event) => {
    setExerciseSearch(event.target.value);
    setIsExerciseSuggestOpen(true);
  }}
  onFocus={() => setIsExerciseSuggestOpen(true)}
  placeholder="Начните вводить упражнение..."
  autoComplete="off"
/>
              </label>

              <button
                type="button"
                className="subtask-add-minimal-btn my-workout-add-btn"
                onClick={addTypedExercise}
              >
                + Упражнение
              </button>

              {isExerciseSuggestOpen && filteredExercises.length > 0 && (
                <div className="my-workout-exercise-suggest">
                  {filteredExercises.map((exercise) => (
                    <button
                      type="button"
                      key={`${exercise.is_custom ? "custom" : "base"}-${exercise.id}`}
                      onClick={() => selectExerciseSuggestion(exercise)}
                    >
                      <strong>{exercise.name}</strong>
                      <span>
                        {exercise.group_name ||
                          exercise.muscle ||
                          exercise.muscle_group ||
                          exercise.groupName ||
                          "Без группы"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="my-workout-selected-list">
  {selectedExercises.length === 0 ? (
    <p>Пока упражнения не добавлены.</p>
  ) : (
    selectedExercises.map((exercise, index) => (
      <div className="my-workout-selected-item detailed" key={exercise.id}>
        <div className="my-workout-selected-main">
          <strong>
            {index + 1}. {exercise.name}
          </strong>

          <div className="my-workout-selected-fields">
  <label>
    <span>Подходы</span>
    <input
      type="number"
      min="0"
      value={exercise.sets_count}
      onChange={(event) =>
        updateSelectedExerciseField(
          exercise.id,
          "sets_count",
          event.target.value
        )
      }
      placeholder="0"
    />
  </label>

  {getExerciseMeasureUnits(exercise).includes("kg") && (
    <label>
      <span>Вес</span>
      <div className="my-workout-weight-input">
        <input
          type="number"
          min="0"
          step="0.5"
          value={exercise.weight_kg}
          onChange={(event) =>
            updateSelectedExerciseField(
              exercise.id,
              "weight_kg",
              event.target.value
            )
          }
          placeholder="0"
        />
        <small>кг</small>
      </div>
    </label>
  )}

  {getExerciseMeasureUnits(exercise).includes("reps") && (
    <label>
      <span>Повторы</span>
      <div className="my-workout-weight-input">
        <input
          type="number"
          min="0"
          step="1"
          value={exercise.reps_count}
          onChange={(event) =>
            updateSelectedExerciseField(
              exercise.id,
              "reps_count",
              event.target.value
            )
          }
          placeholder="0"
        />
        <small>раз</small>
      </div>
    </label>
  )}

  {getExerciseMeasureUnits(exercise).includes("km") && (
    <label>
      <span>Дистанция</span>
      <div className="my-workout-weight-input">
        <input
          type="number"
          min="0"
          step="0.1"
          value={exercise.distance_km || ""}
          onChange={(event) =>
            updateSelectedExerciseField(
              exercise.id,
              "distance_km",
              event.target.value
            )
          }
          placeholder="0"
        />
        <small>км</small>
      </div>
    </label>
  )}

  {getExerciseMeasureUnits(exercise).includes("min") && (
    <label>
      <span>Время</span>
      <div className="my-workout-weight-input">
        <input
          type="number"
          min="0"
          step="1"
          value={exercise.duration_min || ""}
          onChange={(event) =>
            updateSelectedExerciseField(
              exercise.id,
              "duration_min",
              event.target.value
            )
          }
          placeholder="0"
        />
        <small>мин</small>
      </div>
    </label>
  )}
</div>
        </div>

        <button
          type="button"
          onClick={() => removeExercise(exercise.id)}
          title="Удалить упражнение"
        >
          ×
        </button>
      </div>
    ))
  )}
</div>
          </>
        )}
      </form>
    </div>
  );
}

function ExerciseGuideModal({ exercise, guide, onClose }) {
  const muscleName =
    exercise?.group_name ||
    exercise?.muscle ||
    exercise?.muscle_group ||
    "Без группы";

  return (
  <div className="modal-backdrop">
    <article className="simple-modal guide-modal">
        <div className="modal-header guide-modal-header">
          <div>
            <span>Гайд по упражнению</span>
            <h3>{exercise.name}</h3>
            <p>
              {muscleName}
              {exercise.equipment ? ` · ${exercise.equipment}` : ""}
              {exercise.difficulty ? ` · ${exercise.difficulty}` : ""}
            </p>
          </div>

          <button
            type="button"
            className="modal-close-icon-btn"
            onClick={onClose}
            aria-label="Закрыть"
            title="Закрыть"
          >
            ×
          </button>
        </div>

        <div className="guide-modal-body">
          <section className="guide-detail-section">
            <div className="guide-detail-number">1</div>

            <div>
              <h4>Техника</h4>

              <ul>
                {guide.technique.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="guide-detail-section">
            <div className="guide-detail-number">2</div>

            <div>
              <h4>С чем лучше сочетать</h4>

              <ul>
                {guide.combinations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="guide-detail-section">
            <div className="guide-detail-number">3</div>

            <div>
              <h4>Советы</h4>

              <ul>
                {guide.tips.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}

function ExerciseMetricCard({
  item,
  availableExercises,
  isOpen,
  onToggle,
  onSave,
}) {
  const metric = item.metric;

  const exercise = availableExercises.find(
  (exerciseItem) =>
    String(exerciseItem.id) === String(item.sourceExerciseId || item.exerciseId)
);

  const measureType =
    metric?.measureType ||
    exercise?.measure_type ||
    exercise?.measureType ||
    detectExerciseMeasureType(item.exerciseName);

  const measureUnits =
    exercise?.measure_units ||
    exercise?.measureUnits ||
    getDefaultMeasureUnits(measureType);

  const [weight, setWeight] = useState(metric?.weight ?? "");
  const [distance, setDistance] = useState(metric?.distance ?? "");
  const [minutes, setMinutes] = useState(getMinutesValue(metric?.time));
  const [reps, setReps] = useState(metric?.reps ?? "");

  useEffect(() => {
    setWeight(metric?.weight ?? "");
    setDistance(metric?.distance ?? "");
    setMinutes(getMinutesValue(metric?.time));
    setReps(metric?.reps ?? "");
  }, [metric?.weight, metric?.distance, metric?.time, metric?.reps]);

  function getVisibleValue() {
    if (!metric) {
      return "—";
    }

    const values = [];

    if (measureUnits.includes("kg") && metric.weight) {
      values.push(`${metric.weight} кг`);
    }

    if (measureUnits.includes("km") && metric.distance) {
      values.push(`${metric.distance} км`);
    }

    if (measureUnits.includes("min") && metric.time) {
      values.push(`${getMinutesValue(metric.time)} мин`);
    }

    if (measureUnits.includes("reps") && metric.reps) {
      values.push(`${metric.reps} повт.`);
    }

    return values.length > 0 ? values.join(" · ") : "—";
  }

  function handleSave(event) {
    event.stopPropagation();

    onSave(item, {
      weight: measureUnits.includes("kg") ? weight : undefined,
      distance: measureUnits.includes("km") ? distance : undefined,
      minutes: measureUnits.includes("min") ? minutes : undefined,
      reps: measureUnits.includes("reps") ? reps : undefined,
    });
  }

  return (
    <div className={isOpen ? "exercise-metric-card open" : "exercise-metric-card"}>
      <button
        type="button"
        className="exercise-metric-card-top"
        onClick={onToggle}
      >
        <span className="exercise-metric-name">{item.exerciseName}</span>

        <span className="exercise-metric-value">{getVisibleValue()}</span>
      </button>

      {isOpen && (
        <div className="exercise-metric-editor">
          {measureUnits.includes("kg") && (
            <label>
              <span>кг</span>

              <input
                type="number"
                min="0"
                max="999"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                placeholder="0"
              />
            </label>
          )}

          {measureUnits.includes("km") && (
  <div className="metric-stepper-row">
    <span className="metric-stepper-name">
      {exerciseName || "Дистанция"}
    </span>

    <div className="metric-stepper-control">
      <input
        type="number"
        min="0"
        step="0.1"
        value={distance}
        onChange={(event) => setDistance(event.target.value)}
        placeholder="0"
      />

      <span className="metric-stepper-unit">км</span>

      <div className="metric-stepper-buttons">
        <button
          type="button"
          onClick={() => changeNumberValue(setDistance, distance, 0.1)}
        >
          ↑
        </button>

        <button
          type="button"
          onClick={() => changeNumberValue(setDistance, distance, -0.1)}
        >
          ↓
        </button>
      </div>
    </div>
  </div>
)}

          {measureUnits.includes("min") && (
  <label className="field">
    <span>Время</span>

    <input
      type="text"
      value={time}
      onChange={(event) => setTime(event.target.value)}
      placeholder="25:00"
    />
  </label>
)}

          {measureUnits.includes("reps") && (
            <label>
              <span>повт.</span>

              <input
                type="number"
                min="0"
                max="999"
                value={reps}
                onChange={(event) => setReps(event.target.value)}
                placeholder="0"
              />
            </label>
          )}

          <button
            type="button"
            className="exercise-metric-save-btn icon-only"
            onClick={handleSave}
            title="Сохранить"
            aria-label="Сохранить"
          >
            <SaveCheckIcon />
          </button>
        </div>
      )}
    </div>
  );
}

function getMinutesValue(time) {
  if (!time) {
    return "";
  }

  const parts = String(time).split(":");

  return String(Number(parts[0]) || 0);
}

function normalizeMeasureUnits(units = []) {
  const allowedUnits = ["kg", "km", "min", "reps"];

  let preparedUnits = units;

  if (typeof preparedUnits === "string") {
    try {
      preparedUnits = JSON.parse(preparedUnits);
    } catch (error) {
      preparedUnits = preparedUnits
        .split(",")
        .map((unit) => unit.trim())
        .filter(Boolean);
    }
  }

  if (!Array.isArray(preparedUnits)) {
    return [];
  }

  return preparedUnits.filter((unit, index, array) => {
    return allowedUnits.includes(unit) && array.indexOf(unit) === index;
  });
}

function getDefaultMeasureUnits(measureType) {
  if (measureType === "time_sets") {
    return ["min"];
  }

  if (measureType === "reps") {
    return ["reps"];
  }

  if (measureType === "weight") {
    return ["kg"];
  }

  return ["kg", "reps"];
}

function getMeasureTypeFromUnits(units = []) {
  const safeUnits = units.filter((unit) => unit !== "km");

  if (safeUnits.includes("min") && !safeUnits.includes("kg") && !safeUnits.includes("reps")) {
    return "time_sets";
  }

  if (safeUnits.includes("reps") && !safeUnits.includes("kg")) {
    return "reps";
  }

  if (safeUnits.includes("kg") && !safeUnits.includes("reps")) {
    return "weight";
  }

  return "weight_reps";
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

function CreateExerciseModal({
  exerciseGroups = [],
  activeExerciseGroupId = "all",
  onClose,
  onSave,
}) {
  const [name, setName] = useState("");
  const [measureUnits, setMeasureUnits] = useState(["kg"]);
  const [groupId, setGroupId] = useState(
  activeExerciseGroupId === "all" ? "" : activeExerciseGroupId
);

  const unitOptions = [
  {
    value: "kg",
    label: "кг",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 9V15" />
        <path d="M18 9V15" />
        <path d="M3 10.5V13.5" />
        <path d="M21 10.5V13.5" />
        <path d="M6 12H18" />
        <path d="M4.5 9.5V14.5" />
        <path d="M19.5 9.5V14.5" />
      </svg>
    ),
  },
  {
    value: "min",
    label: "мин",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="13" r="7" />
        <path d="M12 13V9" />
        <path d="M12 13L15 15" />
        <path d="M9 3H15" />
        <path d="M12 3V6" />
      </svg>
    ),
  },
  {
    value: "reps",
    label: "повторы",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 8H16C18.2 8 20 9.8 20 12C20 14.2 18.2 16 16 16H13" />
        <path d="M9 12L6 8L9 4" />
        <path d="M18 16H8C5.8 16 4 14.2 4 12C4 9.8 5.8 8 8 8H11" />
        <path d="M15 12L18 16L15 20" />
      </svg>
    ),
  },
];

  function toggleUnit(unit) {
    setMeasureUnits((current) => {
      if (current.includes(unit)) {
        return current.filter((item) => item !== unit);
      }

      return [...current, unit];
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    if (measureUnits.length === 0) {
      return;
    }

    const normalizedUnits = normalizeMeasureUnits(measureUnits);
    const measureType = getMeasureTypeFromUnits(normalizedUnits);

    const safeMeasureUnits = measureUnits.filter((unit) => unit !== "km");

onSave({
  name: trimmedName,
  measureType: getMeasureTypeFromUnits(safeMeasureUnits),
  measure_type: getMeasureTypeFromUnits(safeMeasureUnits),
  measureUnits: safeMeasureUnits,
  measure_units: safeMeasureUnits,
  groupId: groupId || null,
  group_id: groupId || null,
});
  }

  return (
    <div className="modal-backdrop">
      <form className="simple-modal create-exercise-modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <div>
            <h2>Новое упражнение</h2>
          </div>

          <div className="modal-header-actions">
            <button
              type="submit"
              className="modal-save-icon-btn"
              disabled={!name.trim() || measureUnits.length === 0}
              title="Создать упражнение"
              aria-label="Создать упражнение"
            >
              <SaveCheckIcon />
            </button>

            <button
              type="button"
              className="modal-close-icon-btn"
              onClick={onClose}
              title="Закрыть"
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>
        </div>

        <label className="field">
          <span>Название упражнения</span>

          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Например: Бег в гору"
            autoFocus
          />
        </label>

        <div className="field">
          <span>Единица измерения</span>

          <div className="exercise-unit-checkboxes pretty">
  {unitOptions.map((unit) => {
    const isChecked = measureUnits.includes(unit.value);

    return (
      <label
        key={unit.value}
        className={
          isChecked
            ? "exercise-unit-checkbox pretty active"
            : "exercise-unit-checkbox pretty"
        }
      >
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => toggleUnit(unit.value)}
        />

        <span className="exercise-unit-icon">{unit.icon}</span>

        <span className="exercise-unit-label">{unit.label}</span>

        <span className="exercise-unit-check">
          {isChecked ? "✓" : ""}
        </span>
      </label>
    );
  })}
</div>
        </div>

<label className="field">
  <span>Группа</span>

  <select value={groupId} onChange={(event) => setGroupId(event.target.value)}>
    <option value="">Без группы</option>

    {exerciseGroups.map((group) => (
      <option key={group.id} value={group.id}>
        {group.name}
      </option>
    ))}
  </select>
</label>

      </form>
    </div>
  );
}

function CreateExerciseGroupModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#E6F8FA");

  const colors = [
    "#E6F8FA",
    "#ECFDF5",
    "#FFFBEB",
    "#F5F3FF",
    "#FEF2F2",
    "#EFF6FF",
  ];

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    onSave({
      name: trimmedName,
      color,
    });
  }

  return (
    <div className="modal-backdrop">
      <form className="simple-modal group-modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <div>
            <h2>Новая группа</h2>
          </div>

          <div className="modal-header-actions">
            <button
              type="submit"
              className="modal-save-icon-btn"
              title="Создать группу"
              aria-label="Создать группу"
            >
              <SaveCheckIcon />
            </button>

            <button
              type="button"
              className="modal-close-icon-btn"
              onClick={onClose}
              title="Закрыть"
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>
        </div>

        <label className="field">
          <span>Название группы</span>

          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Например: Кардио"
            autoFocus
          />
        </label>

        <div className="group-color-field">
          <span>Цвет группы</span>

          <div className="group-color-palette">
            {colors.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  color === item ? "group-color-dot active" : "group-color-dot"
                }
                style={{ background: item }}
                onClick={() => setColor(item)}
              />
            ))}
          </div>
        </div>

      </form>
    </div>
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

const initialMeasureUnits = normalizeMeasureUnits(
  initialData?.measureUnits || initialData?.measure_units
);

const [measureUnits, setMeasureUnits] = useState(
  initialMeasureUnits.length > 0
    ? initialMeasureUnits
    : getDefaultMeasureUnits(
        initialData?.measureType ||
          initialData?.measure_type ||
          detectExerciseMeasureType(initialData?.exerciseName || "")
      )
);

const [measureType, setMeasureType] = useState(
  getMeasureTypeFromUnits(
    initialMeasureUnits.length > 0
      ? initialMeasureUnits
      : getDefaultMeasureUnits(
          initialData?.measureType ||
            initialData?.measure_type ||
            detectExerciseMeasureType(initialData?.exerciseName || "")
        )
  )
);

  const [weight, setWeight] = useState(initialData?.weight || "");
  const [reps, setReps] = useState(initialData?.reps || "");
  const [distance, setDistance] = useState(initialData?.distance || "");
  const [time, setTime] = useState(initialData?.time || "");

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
  const selectedName = exercise.name;

  const selectedMeasureUnits = normalizeMeasureUnits(
    exercise.measure_units || exercise.measureUnits
  );

  const finalMeasureUnits =
    selectedMeasureUnits.length > 0
      ? selectedMeasureUnits
      : getDefaultMeasureUnits(
          exercise.measure_type ||
            exercise.measureType ||
            detectExerciseMeasureType(selectedName)
        );

  const selectedMeasureType = getMeasureTypeFromUnits(finalMeasureUnits);

  setExerciseId(exercise.is_custom || exercise.isCustom ? null : exercise.id);
  setExerciseName(selectedName);
  setMeasureUnits(finalMeasureUnits);
  setMeasureType(selectedMeasureType);
  setIsExerciseListOpen(false);
}

  function handleExerciseNameChange(value) {
    const detectedMeasureType = detectExerciseMeasureType(value);
    const detectedMeasureUnits = getDefaultMeasureUnits(detectedMeasureType);

    setExerciseName(value);
    setExerciseId(null);
    setMeasureUnits(detectedMeasureUnits);
    setMeasureType(getMeasureTypeFromUnits(detectedMeasureUnits));
    setIsExerciseListOpen(true);
  }

  function changeNumberValue(setter, currentValue, step) {
    const currentNumber = Number(currentValue || 0);
    const nextNumber = Math.max(0, currentNumber + step);

    setter(String(nextNumber));
  }

  function handleSave(event) {
  event.preventDefault();

  const trimmedExerciseName = exerciseName.trim();

  if (!trimmedExerciseName) {
    return;
  }

  const normalizedUnits = normalizeMeasureUnits(measureUnits);

  const hasKg = normalizedUnits.includes("kg");
  const hasReps = normalizedUnits.includes("reps");
  const hasKm = normalizedUnits.includes("km");
  const hasMin = normalizedUnits.includes("min");

  const normalizedType = getMeasureTypeFromUnits(normalizedUnits);

  const normalizedWeight = hasKg && weight !== "" ? Number(weight) : null;
  const normalizedReps = hasReps && reps !== "" ? Number(reps) : null;
  const normalizedDistance = hasKm && distance !== "" ? Number(distance) : null;
  const normalizedTime = hasMin && String(time || "").trim()
    ? String(time).includes(":")
      ? time
      : `${Number(time) || 0}:00`
    : null;

  const hasAnyValue =
    normalizedWeight !== null ||
    normalizedReps !== null ||
    normalizedDistance !== null ||
    normalizedTime !== null;

  if (!hasAnyValue) {
    alert("Введите показатель упражнения");
    return;
  }

  onSave({
    ...(initialData?.id ? { id: initialData.id } : {}),
    exerciseId,
    exerciseName: trimmedExerciseName,
    measureType: normalizedType,
    measure_type: normalizedType,
    measureUnits: normalizedUnits,
    measure_units: normalizedUnits,
    weight: normalizedWeight,
    reps: normalizedReps,
    distance: normalizedDistance,
    time: normalizedTime,
  });
}

  return (
    <div className="modal-backdrop">
      <form className="simple-modal working-weight-modal" onSubmit={handleSave}>
        <div className="metric-modal-header">
  <div>
    <h2>
      {initialData?.id ? "Изменить показатель" : "Добавить показатель"}
    </h2>
  </div>

  <div className="metric-modal-actions">
    <button
      type="submit"
      className="metric-modal-save-icon-btn"
      title="Сохранить"
      aria-label="Сохранить"
    >
      <SaveCheckIcon />
    </button>

    <button
  type="button"
  className="metric-modal-close-btn modal-close-icon-btn"
  onClick={onClose}
  title="Закрыть"
  aria-label="Закрыть"
>
  ×
</button>
  </div>
</div>

        <label className="field exercise-autocomplete-field metric-modal-field">
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
        </label>
          {(measureUnits.includes("kg") || measureUnits.includes("reps")) && (
  <div className="metric-modal-value-card metric-modal-value-grid">
    <div className="metric-modal-value-info">
      <strong>Показатель</strong>
      <span>
        {measureUnits.includes("kg") && measureUnits.includes("reps")
          ? "Вес и повторения"
          : measureUnits.includes("kg")
            ? "Вес"
            : "Повторения"}
      </span>
    </div>

    {measureUnits.includes("kg") && (
      <div className="metric-modal-input-wrap">
        <input
          type="number"
          min="0"
          step="1"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
          placeholder="0"
        />
        <span>кг</span>
      </div>
    )}

    {measureUnits.includes("reps") && (
      <div className="metric-modal-input-wrap">
        <input
          type="number"
          min="0"
          step="1"
          value={reps}
          onChange={(event) => setReps(event.target.value)}
          placeholder="0"
        />
        <span>раз</span>
      </div>
    )}
  </div>
)}

{measureUnits.includes("km") && (
  <div className="metric-stepper-row">
    <span className="metric-stepper-name">
      {exerciseName || "Дистанция"}
    </span>

    <div className="metric-stepper-control">
      <input
        type="number"
        min="0"
        step="0.1"
        value={distance}
        onChange={(event) => setDistance(event.target.value)}
        placeholder="0"
      />

      <span className="metric-stepper-unit">км</span>

      <div className="metric-stepper-buttons">
        <button
          type="button"
          onClick={() => changeNumberValue(setDistance, distance, 0.1)}
        >
          ↑
        </button>

        <button
          type="button"
          onClick={() => changeNumberValue(setDistance, distance, -0.1)}
        >
          ↓
        </button>
      </div>
    </div>
  </div>
)}

{measureUnits.includes("min") && (
  <label className="field">
    <span>Время</span>

    <input
      type="text"
      value={time}
      onChange={(event) => setTime(event.target.value)}
      placeholder="25:00"
    />
  </label>
)}
      </form>
    </div>
  );
}

function detectExerciseMeasureType(exerciseName) {
  const name = String(exerciseName || "").toLowerCase();

  const distanceKeywords = [
    "бег",
    "пробеж",
    "ходьб",
    "велосипед",
    "велотренаж",
    "кардио",
    "плаван",
    "эллипс",
    "дорожк",
    "скакалк",
    "гребн",
  ];

  const timeKeywords = ["планка", "вис", "удержание", "статик"];

  if (distanceKeywords.some((keyword) => name.includes(keyword))) {
    return "distance_time";
  }

  if (timeKeywords.some((keyword) => name.includes(keyword))) {
    return "time_sets";
  }

  return "weight_reps";
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

function StatsMiniRow({ label, value }) {
  return (
    <div className="stats-mini-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
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

function formatStatNumber(value) {
  const number = Number(value || 0);

  if (Number.isInteger(number)) {
    return String(number);
  }

  return number.toFixed(1);
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

function ProfilePage({
  currentUser,
  setCurrentUser,
  subscription,
  isPremiumUser,
  logout,
  showToast,
}) {
  const serverUrl = API_URL.replace("/api", "");

const [avatarPreview, setAvatarPreview] = useState("");
const [securityModal, setSecurityModal] = useState(null);
const [viewedProfile, setViewedProfile] = useState(null);

useEffect(() => {
  if (currentUser?.avatar_url) {
    setAvatarPreview(`${serverUrl}${currentUser.avatar_url}`);
  } else {
    setAvatarPreview("");
  }
}, [currentUser?.avatar_url, serverUrl]);

  const [pedantTracker, setPedantTracker] = useState(null);

  const displayName = currentUser?.username || "Пользователь";
  const initials = getProfileInitials(displayName);

const registrationDate = formatProfileJoinDate(
  currentUser?.created_at || currentUser?.createdAt || currentUser?.registered_at
);

const profileOwner = viewedProfile?.user || currentUser;
const profileTracker = viewedProfile?.pedantTracker || pedantTracker;
const isViewingFriendProfile = Boolean(viewedProfile?.user?.id);

const visibleDisplayName =
  profileOwner?.username ||
  profileOwner?.name ||
  profileOwner?.email ||
  "Пользователь";

const rawVisibleAvatar =
  profileOwner?.avatar_url ||
  profileOwner?.avatarUrl ||
  "";

const visibleAvatar =
  rawVisibleAvatar && rawVisibleAvatar.startsWith("/uploads")
    ? `${serverUrl}${rawVisibleAvatar}`
    : rawVisibleAvatar || avatarPreview;

const visibleInitials = getProfileInitials(visibleDisplayName);

const visibleRegistrationDate = profileOwner?.created_at
  ? new Date(profileOwner.created_at).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  : registrationDate;

  const visibleProfileIsPremium =
  profileOwner?.subscription?.code === "premium" ||
  profileOwner?.subscription === "premium" ||
  profileOwner?.subscription_code === "premium" ||
  profileOwner?.subscriptionCode === "premium" ||
  profileOwner?.is_premium === true ||
  profileOwner?.isPremium === true ||
  (!isViewingFriendProfile && isPremiumUser);

async function removeAvatar() {
  const token = localStorage.getItem("token");

  if (!token || currentUser?.is_guest) {
    setAvatarPreview("");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/profile/avatar`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || "Ошибка удаления аватарки");
    }

    setAvatarPreview("");
  } catch (error) {
    console.error("Ошибка удаления аватарки:", error);
    alert("Не удалось удалить аватарку.");
  }
}

  async function handleAvatarChange(event) {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("Выберите изображение для аватарки.");
    return;
  }

  const token = localStorage.getItem("token");

  if (!token || currentUser?.is_guest) {
    alert("Аватарку можно загрузить только в аккаунте.");
    return;
  }

  const formData = new FormData();
  formData.append("avatar", file);

  try {
    const response = await fetch(`${API_URL}/profile/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || "Ошибка загрузки аватарки");
    }

    setAvatarPreview(`${serverUrl}${data.avatar_url}`);
  } catch (error) {
    console.error("Ошибка загрузки аватарки:", error);
    alert("Не удалось загрузить аватарку.");
  }
}

  useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token || currentUser?.is_guest) {
    setPedantTracker({
      activeDays: 1,
      totalActiveDays: 1,
      rank: {
        title: "Новичок порядка",
        subtitle: "Гостевой режим",
        starTier: 0,
      },
      nextMilestone: 2,
      daysToNextMilestone: 1,
      progressPercent: 50,
    });

    return;
  }

  fetch(`${API_URL}/user-activity/today`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        throw new Error(data.error);
      }

      setPedantTracker(data);
    })
    .catch((error) => {
      console.error("Ошибка загрузки трекера активности:", error);
    });
}, [currentUser]);

  return (
  <section className="profile-custom-page">
    <div className="profile-page-layout">
      <div className="profile-main-column">
        <div className="profile-custom-top">
          <div className="profile-avatar-wrap">
            <label
              className={
                isViewingFriendProfile
                  ? "profile-top-avatar profile-top-avatar-readonly"
                  : "profile-top-avatar"
              }
              title={
                isViewingFriendProfile
                  ? "Аватар пользователя"
                  : "Изменить аватарку"
              }
            >
              {visibleAvatar ? (
                <img src={visibleAvatar} alt="Аватар пользователя" />
              ) : (
                <span>{visibleInitials}</span>
              )}

              {!isViewingFriendProfile && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />

                  <div className="profile-top-avatar-edit">
                    <ProfileSvgIcon name="edit" />
                  </div>
                </>
              )}
            </label>

            {!isViewingFriendProfile && avatarPreview && (
              <button
                type="button"
                className="profile-avatar-remove"
                onClick={removeAvatar}
              >
                Удалить фото
              </button>
            )}
          </div>

          <div className="profile-top-info">
            <div className="profile-user-text-block">
  <div className="profile-name-crown-wrap">
    {visibleProfileIsPremium && (
      <span className="profile-premium-crown" title="Premium">
        <PremiumCrownIcon />
      </span>
    )}

    <h2>{visibleDisplayName}</h2>
  </div>

  <p>С нами с {visibleRegistrationDate}</p>

              {isViewingFriendProfile ? (
                <button
                  type="button"
                  className="profile-back-to-me-btn"
                  onClick={() => setViewedProfile(null)}
                >
                  ← Мой профиль
                </button>
              ) : (
                <button
                  type="button"
                  className="profile-logout-btn"
                  onClick={logout}
                  title="Выйти из аккаунта"
                  aria-label="Выйти из аккаунта"
                >
                  <LogoutSvgIcon />
                  <span>Выйти</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <ProfileProgressCards pedantTracker={profileTracker} />

        {!isViewingFriendProfile && (
          <ProfileSecurityBlock
            currentUser={currentUser}
            onEdit={setSecurityModal}
          />
        )}
      </div>

      <ProfileFriendsBlock
        currentUser={currentUser}
        showToast={showToast}
        onOpenFriendProfile={setViewedProfile}
      />
    </div>

    {securityModal && (
      <ProfileSecurityModal
        type={securityModal}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        showToast={showToast}
        onClose={() => setSecurityModal(null)}
      />
    )}
  </section>
);
}

function ProfileFriendsBlock({
  currentUser,
  showToast,
  onOpenFriendProfile,
}) {
  const [friendSearch, setFriendSearch] = useState("");
  const [isAddMode, setIsAddMode] = useState(false);
  const [addFriendLogin, setAddFriendLogin] = useState("");
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openedFriendMenuId, setOpenedFriendMenuId] = useState(null);

  const filteredFriends = friends.filter((friend) =>
    String(friend.username || "")
      .toLowerCase()
      .includes(friendSearch.trim().toLowerCase())
  );

  useEffect(() => {
    loadFriends();
  }, [currentUser?.id]);


  function openFriendProfile(friend) {
  const token = localStorage.getItem("token");

  if (!token) {
    showToast?.("Необходимо войти в аккаунт", "error");
    return;
  }

  fetch(`${API_URL}/users/${friend.id}/public-profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(`Сервер вернул не JSON. Статус: ${response.status}`);
  }

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || "Не удалось открыть профиль");
  }

  return data;
})
    .then((data) => {
      if (typeof onOpenFriendProfile === "function") {
        onOpenFriendProfile(data);
      }
    })
    .catch((error) => {
      console.error("Ошибка открытия профиля друга:", error);
      showToast?.(error.message || "Не удалось открыть профиль", "error");
    });
}

function getFriendAvatar(friend) {
  const avatar = friend.avatar_url || friend.avatarUrl || "";

  if (avatar && avatar.startsWith("/uploads")) {
    return `${API_URL.replace("/api", "")}${avatar}`;
  }

  return avatar;
}

function getFriendInitial(friend) {
  return String(friend.username || friend.email || "?")
    .charAt(0)
    .toUpperCase();
}

function isFriendPremium(friend) {
  return (
    friend?.subscription?.code === "premium" ||
    friend?.subscription === "premium" ||
    friend?.subscription_code === "premium" ||
    friend?.subscriptionCode === "premium" ||
    friend?.is_premium === true ||
    friend?.isPremium === true
  );
}

function deleteFriend(friendId) {
  const confirmed = window.confirm("Удалить друга?");

  if (!confirmed) {
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    showToast?.("Необходимо войти в аккаунт", "error");
    return;
  }

  fetch(`${API_URL}/friends/${friendId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (response) => {
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Не удалось удалить друга");
      }

      return data;
    })
    .then(() => {
      showToast?.("Друг удалён", "success");
      setOpenedFriendMenuId(null);
      loadFriends();
    })
    .catch((error) => {
      console.error("Ошибка удаления друга:", error);
      showToast?.(error.message || "Не удалось удалить друга", "error");
    });
}



  function loadFriends() {
    const token = localStorage.getItem("token");

    if (!token || currentUser?.is_guest) {
      setFriends([]);
      setIncomingRequests([]);
      return;
    }

    fetch(`${API_URL}/friends`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }

        setFriends(Array.isArray(data.friends) ? data.friends : []);
        setIncomingRequests(
          Array.isArray(data.incomingRequests) ? data.incomingRequests : []
        );
      })
      .catch((error) => {
        console.error("Ошибка загрузки друзей:", error);
      });
  }

  function sendFriendRequest(event) {
    event.preventDefault();

    const login = addFriendLogin.trim();

    if (!login) {
      showToast?.("Введите логин друга", "error");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token || currentUser?.is_guest) {
      showToast?.("Добавление друзей доступно только в аккаунте", "error");
      return;
    }

    setIsLoading(true);

    fetch(`${API_URL}/friends/requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: login,
      }),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || "Не удалось отправить заявку");
        }

        return data;
      })
      .then(() => {
        showToast?.("Заявка отправлена", "success");
        setAddFriendLogin("");
        setIsAddMode(false);
        loadFriends();
      })
      .catch((error) => {
        console.error("Ошибка отправки заявки:", error);
        showToast?.(error.message || "Не удалось отправить заявку", "error");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function respondToRequest(requestId, action) {
    const token = localStorage.getItem("token");

    if (!token) {
      showToast?.("Необходимо войти в аккаунт", "error");
      return;
    }

    fetch(`${API_URL}/friends/requests/${requestId}/${action}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || "Не удалось обработать заявку");
        }

        return data;
      })
      .then(() => {
        showToast?.(
          action === "accept" ? "Друг добавлен" : "Заявка отклонена",
          "success"
        );

        loadFriends();
      })
      .catch((error) => {
        console.error("Ошибка обработки заявки:", error);
        showToast?.(error.message || "Не удалось обработать заявку", "error");
      });
  }

  return (
    <aside className="profile-friends-card">
      <div className="profile-friends-top">
        <div className="profile-friends-search">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="11" cy="11" r="7" />
            <path d="M16.5 16.5L21 21" />
          </svg>

          <input
            type="text"
            value={friendSearch}
            onChange={(event) => setFriendSearch(event.target.value)}
            placeholder="Поиск друга"
          />
        </div>

        <button
          type="button"
          className="profile-add-friend-btn"
          title="Добавить друга"
          aria-label="Добавить друга"
          onClick={() => setIsAddMode((current) => !current)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            {isAddMode ? (
              <>
                <path d="M6 6L18 18" />
                <path d="M18 6L6 18" />
              </>
            ) : (
              <>
                <path d="M12 5V19" />
                <path d="M5 12H19" />
              </>
            )}
          </svg>
        </button>
      </div>

      {isAddMode && (
        <form className="profile-add-friend-form" onSubmit={sendFriendRequest}>
          <input
            value={addFriendLogin}
            onChange={(event) => setAddFriendLogin(event.target.value)}
            placeholder="Введите логин"
            autoFocus
          />

          <button type="submit" disabled={isLoading}>
            Отправить
          </button>
        </form>
      )}

      <div className="profile-friends-content">
        {incomingRequests.length > 0 && (
          <div className="profile-friend-requests">
            {incomingRequests.map((request) => (
              <div className="profile-friend-request" key={request.id}>
                <div className="profile-friend-avatar-wrap">
  {isFriendPremium(friend) && (
    <span className="friend-card-premium-crown" title="Premium">
      <PremiumCrownIcon />
    </span>
  )}

  <div className="profile-friend-avatar-wrap">
  {isFriendPremium(request) && (
    <span className="friend-card-premium-crown" title="Premium">
      <PremiumCrownIcon />
    </span>
  )}

  <div className="profile-friend-avatar">
    {getFriendAvatar(request) ? (
      <img src={getFriendAvatar(request)} alt={request.username || "Заявка"} />
    ) : (
      getFriendInitial(request)
    )}
  </div>
</div>
</div>

                <div className="profile-friend-request-text">
                  <strong>{request.username}</strong>
                  <p>вас хочет добавить в друзья</p>
                </div>

                <div className="profile-friend-request-actions">
                  <button
                    type="button"
                    className="accept"
                    onClick={() => respondToRequest(request.id, "accept")}
                    title="Принять"
                    aria-label="Принять"
                  >
                    <SaveCheckIcon />
                  </button>

                  <button
                    type="button"
                    className="decline"
                    onClick={() => respondToRequest(request.id, "decline")}
                    title="Отклонить"
                    aria-label="Отклонить"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredFriends.length > 0 && (
          <div className="profile-friends-list">
            {filteredFriends.map((friend) => (
  <div
    className="profile-friend-item clickable"
    key={friend.id}
    role="button"
    tabIndex={0}
    onClick={() => openFriendProfile(friend)}
    onKeyDown={(event) => {
      if (event.key === "Enter") {
        openFriendProfile(friend);
      }
    }}
  >
    <div className="profile-friend-avatar-wrap">
  {isFriendPremium(friend) && (
    <span className="friend-card-premium-crown" title="Premium">
      <PremiumCrownIcon />
    </span>
  )}

  <div className="profile-friend-avatar">
    {getFriendAvatar(friend) ? (
      <img
        src={getFriendAvatar(friend)}
        alt={friend.username || "Друг"}
      />
    ) : (
      getFriendInitial(friend)
    )}
  </div>
</div>

    <div className="profile-friend-info">
      <strong>{friend.username}</strong>
      <p>{friend.email || "Аккаунт Sunday"}</p>
    </div>

    <div className="profile-friend-actions" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        className="profile-friend-dots-btn"
        onClick={() =>
          setOpenedFriendMenuId((current) =>
            current === friend.id ? null : friend.id
          )
        }
        title="Действия"
        aria-label="Действия"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {openedFriendMenuId === friend.id && (
        <div className="profile-friend-menu">
          <button
            type="button"
            onClick={() => deleteFriend(friend.id)}
          >
            Удалить друга
          </button>
        </div>
      )}
    </div>
  </div>
))}
          </div>
        )}

        {incomingRequests.length === 0 && filteredFriends.length === 0 && (
          <div className="profile-friends-empty" />
        )}
      </div>
    </aside>
  );
}

function ProfileProgressCards({ pedantTracker }) {
  const activeDays = pedantTracker?.activeDays || 1;

  const rank = pedantTracker?.rank || {
    title: "Новичок порядка",
    subtitle: "Первый день активности",
    starTier: 0,
  };

  const hasStars = Number(rank.starTier || 0) > 0;

  return (
    <section className="profile-progress-strip">
      <article className="profile-progress-tile streak">
        <div className="profile-progress-tile-icon fire">
          <ProfileSvgIcon name="fire" />
        </div>

        <div className="profile-progress-tile-text">
          <span>Серия</span>
          <strong>{activeDays}</strong>
          <p>дней активности</p>
        </div>
      </article>

      <article className="profile-progress-tile rank">
        <div className="profile-progress-tile-icon badge">
          {hasStars ? (
            <ProfileSvgIcon name="shiny-star" />
          ) : (
            <ProfileSvgIcon name="star" />
          )}
        </div>

        <div className="profile-progress-tile-text rank-text">
          <span>Ранг</span>

          <div className="profile-rank-title-line">
            {hasStars ? (
              <ProfileRankStars tier={rank.starTier} />
            ) : (
              <strong>{rank.title || "Новичок порядка"}</strong>
            )}

            <div className="profile-rank-info-wrap">
              <button
                type="button"
                className="profile-rank-info-btn"
                aria-label="Информация о рангах"
                title="Информация о рангах"
              >
                i
              </button>

              <div className="profile-rank-tooltip">
                <h4>Ранги активности</h4>

                <div className="profile-rank-tooltip-list">
                  <p><strong>1 день</strong><span>Новичок порядка</span></p>
                  <p><strong>2 дня</strong><span>На серии</span></p>
                  <p><strong>7 дней</strong><span>Стабильный</span></p>
                  <p><strong>25 дней</strong><span>Системный</span></p>
                  <p><strong>50 дней</strong><span>Железный режим</span></p>
                  <p><strong>75 дней</strong><span>Несгибаемый</span></p>
                  <p><strong>100 дней</strong><span>Педант</span></p>
                  <p><strong>125 дней</strong><span>⭐</span></p>
                  <p><strong>150 дней</strong><span>✨</span></p>
                  <p><strong>175 дней</strong><span>✨ ⭐</span></p>
                  <p><strong>200 дней</strong><span>✨ ✨</span></p>
                  <p><strong>225 дней</strong><span>✨ ✨ ⭐</span></p>
                  <p><strong>250 дней</strong><span>✨ ✨ ✨</span></p>
                  <p><strong>275 дней</strong><span>✨ ✨ ✨ ⭐</span></p>
                  <p><strong>300 дней</strong><span>✨ ✨ ✨ ✨</span></p>
                </div>
              </div>
            </div>
          </div>

          <p>{rank.subtitle || "Первый день активности"}</p>
        </div>
      </article>
    </section>
  );
}

function getDaysLabel(value) {
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

function ProfileSecurityBlock({ currentUser, onEdit }) {
  const username = currentUser?.username || "Не указан";
  const email = currentUser?.email || "Не указана";

  return (
    <section className="profile-security-card">
      <div className="profile-security-head">
  <div>
    <h3>Личные данные</h3>
  </div>
</div>

      <div className="profile-security-list">
        <div className="profile-security-row">
          <div>
            <strong>Логин</strong>
            <p>{username}</p>
          </div>

          <button type="button" onClick={() => onEdit("username")}>
            Изменить
          </button>
        </div>

        <div className="profile-security-row">
          <div>
            <strong>Почта</strong>
            <p>{email}</p>
          </div>

          <button type="button" onClick={() => onEdit("email")}>
            Изменить
          </button>
        </div>

        <div className="profile-security-row">
          <div>
            <strong>Пароль</strong>
            <p>••••••••</p>
          </div>

          <button type="button" onClick={() => onEdit("password")}>
            Изменить
          </button>
        </div>
      </div>
    </section>
  );
}

function ProfileSecurityModal({
  type,
  currentUser,
  setCurrentUser,
  showToast,
  onClose,
}) {
  const [username, setUsername] = useState(currentUser?.username || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const titleMap = {
    username: "Изменить логин",
    email: "Изменить почту",
    password: "Изменить пароль",
  };

  function getEndpoint() {
    if (type === "username") {
      return `${API_URL}/profile/username`;
    }

    if (type === "email") {
      return `${API_URL}/profile/email`;
    }

    return `${API_URL}/profile/password`;
  }

  function buildPayload() {
    if (type === "username") {
      return {
        username: username.trim(),
      };
    }

    if (type === "email") {
      return {
        email: email.trim(),
      };
    }

    return {
      currentPassword,
      newPassword,
    };
  }

  function validate() {
    if (type === "username") {
      if (username.trim().length < 3) {
        showToast?.("Логин должен быть не короче 3 символов", "error");
        return false;
      }

      if (username.trim().length > 30) {
        showToast?.("Логин должен быть не длиннее 30 символов", "error");
        return false;
      }
    }

    if (type === "email") {
      if (!email.trim() || !email.includes("@")) {
        showToast?.("Введите корректную почту", "error");
        return false;
      }
    }

    if (type === "password") {
      if (!currentPassword.trim()) {
        showToast?.("Введите текущий пароль", "error");
        return false;
      }

      if (newPassword.length < 6) {
        showToast?.("Новый пароль должен быть не короче 6 символов", "error");
        return false;
      }

      if (newPassword !== repeatPassword) {
        showToast?.("Пароли не совпадают", "error");
        return false;
      }
    }

    return true;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    if (!validate()) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token || currentUser?.is_guest) {
      showToast?.("Настройки доступны только в аккаунте", "error");
      return;
    }

    setIsSaving(true);

    fetch(getEndpoint(), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(buildPayload()),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || "Не удалось сохранить изменения");
        }

        return data;
      })
      .then((data) => {
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));

          if (typeof setCurrentUser === "function") {
            setCurrentUser(data.user);
          }
        }

        showToast?.("Изменения сохранены", "success");
        onClose();
      })
      .catch((error) => {
        console.error("Ошибка изменения профиля:", error);
        showToast?.(error.message || "Не удалось сохранить изменения", "error");
      })
      .finally(() => {
        setIsSaving(false);
      });
  }

  return (
    <div className="modal-backdrop">
      <form className="simple-modal profile-security-modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <div>
            <h2>{titleMap[type] || "Безопасность"}</h2>
            <p>Подтвердите изменение данных аккаунта.</p>
          </div>

          <div className="modal-header-actions">
            <button
              type="submit"
              className="modal-save-icon-btn"
              disabled={isSaving}
              title="Сохранить"
              aria-label="Сохранить"
            >
              <SaveCheckIcon />
            </button>

            <button
              type="button"
              className="modal-close-icon-btn"
              onClick={onClose}
              title="Закрыть"
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>
        </div>

        {type === "username" && (
          <label className="field">
            <span>Новый логин</span>

            <input
              value={username}
              maxLength={30}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Введите новый логин"
              autoFocus
            />

            <div className="field-counter">{username.length}/30</div>
          </label>
        )}

        {type === "email" && (
          <label className="field">
            <span>Новая почта</span>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Введите новую почту"
              autoFocus
            />
          </label>
        )}

        {type === "password" && (
          <>
            <label className="field">
              <span>Текущий пароль</span>

              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Введите текущий пароль"
                autoFocus
              />
            </label>

            <label className="field">
              <span>Новый пароль</span>

              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Минимум 6 символов"
              />
            </label>

            <label className="field">
              <span>Повторите новый пароль</span>

              <input
                type="password"
                value={repeatPassword}
                onChange={(event) => setRepeatPassword(event.target.value)}
                placeholder="Повторите пароль"
              />
            </label>
          </>
        )}
      </form>
    </div>
  );
}

function getProfileInitials(name) {
  const cleanName = String(name || "Пользователь").trim();

  if (!cleanName) {
    return "U";
  }

  return cleanName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}


function formatProfileJoinDate(dateValue) {
  if (!dateValue) {
    return "сегодня";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "сегодня";
  }

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function ProfileSvgIcon({ name }) {
  const icons = {

    fire: (
  <>
    <path d="M12 22C8.7 22 6 19.4 6 16.1C6 13.7 7.4 11.7 9.2 10.3C10.6 9.2 11.6 7.7 11.4 5.5C13.7 7 16 9.7 16 13C17 12.2 17.6 11.1 17.8 9.8C19.2 11.3 20 13.4 20 15.7C20 19.2 16.6 22 12 22Z" />
    <path d="M12 18.8C10.5 18.8 9.4 17.7 9.4 16.3C9.4 15.1 10.1 14.2 11.1 13.4C11.9 12.8 12.4 11.9 12.3 10.9C13.7 11.8 14.8 13.1 14.8 14.8C14.8 17 13.5 18.8 12 18.8Z" />
  </>
),
    edit: (
  <>
    <path d="M4 20H8L18.5 9.5C19.3 8.7 19.3 7.4 18.5 6.6L17.4 5.5C16.6 4.7 15.3 4.7 14.5 5.5L4 16V20Z" />
    <path d="M13.5 6.5L17.5 10.5" />
  </>
),
    camera: (
      <>
        <path d="M7 7L8.6 4.8H15.4L17 7H19C20.1 7 21 7.9 21 9V18C21 19.1 20.1 20 19 20H5C3.9 20 3 19.1 3 18V9C3 7.9 3.9 7 5 7H7Z" />
        <circle cx="12" cy="13.5" r="3.4" />
      </>
    ),

    star: (
      <>
        <path d="M12 3.2L14.7 8.7L20.8 9.6L16.4 13.9L17.4 20L12 17.1L6.6 20L7.6 13.9L3.2 9.6L9.3 8.7L12 3.2Z" />
      </>
    ),

    "shiny-star": (
      <>
        <path d="M12 3.2L14.7 8.7L20.8 9.6L16.4 13.9L17.4 20L12 17.1L6.6 20L7.6 13.9L3.2 9.6L9.3 8.7L12 3.2Z" />
        <path d="M19 3L19.6 4.9L21.5 5.5L19.6 6.1L19 8L18.4 6.1L16.5 5.5L18.4 4.9L19 3Z" />
        <path d="M5 2L5.45 3.35L6.8 3.8L5.45 4.25L5 5.6L4.55 4.25L3.2 3.8L4.55 3.35L5 2Z" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {icons[name] || icons.camera}
    </svg>
  );
}

function ProfileRankStars({ tier }) {
  const normalizedTier = Math.min(Math.max(Number(tier || 0), 0), 10);

  const shinyStars = Math.floor(normalizedTier / 2);
  const regularStars = normalizedTier % 2;

  const stars = [
    ...Array.from({ length: shinyStars }, (_, index) => ({
      type: "shiny-star",
      id: `shiny-${index}`,
    })),
    ...Array.from({ length: regularStars }, (_, index) => ({
      type: "star",
      id: `regular-${index}`,
    })),
  ];

  if (stars.length === 0) {
    return null;
  }

  return (
    <div className="profile-rank-stars">
      {stars.map((star) => (
        <span
          key={star.id}
          className={`profile-rank-star ${star.type}`}
          title={star.type === "shiny-star" ? "Блестящая звезда" : "Звезда"}
        >
          <ProfileSvgIcon name={star.type} />
        </span>
      ))}
    </div>
  );
}

function ProfileSettingsModal({ currentUser, onClose }) {
  return (
    <div className="modal-backdrop">
      <article className="simple-modal profile-settings-modal">
        <div className="modal-header">
          <div>
            <h3>Настройки</h3>
            <p>Основная информация профиля.</p>
          </div>

          <button
            type="button"
            className="modal-close-icon-btn"
            onClick={onClose}
            aria-label="Закрыть"
            title="Закрыть"
          >
            ×
          </button>
        </div>

        <div className="profile-settings-list">
          <div className="profile-settings-row">
            <div>
              <span>Имя пользователя</span>
              <strong>{currentUser?.username || "Пользователь"}</strong>
            </div>

            <ProfileSvgIcon name="user" />
          </div>

          <div className="profile-settings-row">
            <div>
              <span>Email</span>
              <strong>{currentUser?.email || "Гостевой режим"}</strong>
            </div>

            <ProfileSvgIcon name="mail" />
          </div>
        </div>
      </article>
    </div>
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

      <span className="stat-card-icon">
        <StatSvgIcon name={icon} />
      </span>
    </div>
  );
}

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