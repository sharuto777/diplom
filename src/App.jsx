import React, { useEffect, useMemo, useRef, useState } from "react";
import "./styles/styles.css";
import "./styles/dark-theme.css";
import { applyTheme, getStoredTheme, toggleTheme } from "./utils/theme";
import AppLogo from "./components/AppLogo.jsx";

import {
  getMinutesValue,
  getDefaultMeasureUnits,
  getMeasureTypeFromUnits,
  detectExerciseMeasureType,
} from "./features/workingWeights/workingWeightUtils";

import {
  formatTaskFromApi,
  formatPriority,
  formatDate,
} from "./features/tasks/taskApiFormatters";
import { canonicalGroupColor, normalizeGroup } from "./utils/groupColors";

import WorkoutsPage from "./features/workouts/WorkoutsPage";
import PremiumModal from "./components/common/PremiumModal";
import AppToast from "./components/common/AppToast";
import Sidebar from "./components/layout/Sidebar";
import AuthModal from "./features/auth/AuthModal";
import TaskGroupModal from "./features/tasks/TaskGroupModal";
import TaskModal from "./features/tasks/TaskModal";
import CalendarPage from "./features/calendar/CalendarPage";
import StatsPage from "./features/stats/StatsPage";
import ProfilePage from "./features/profile/ProfilePage";
import MobileTopMenu from "./components/layout/MobileTopMenu";
import TasksPage from "./features/tasks/TasksPage";
import WorkoutModal from "./features/workouts/WorkoutModal";

import { API_URL } from "./api/apiClient";


const menuItems = [
  "Задачи",
  "Календарь",
  "Рабочие веса",
  "Гайды",
  "Моя тренировка",
  "Статистика",
  "Профиль",
];

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
  const [theme, setTheme] = useState(getStoredTheme);

  const [taskFilter, setTaskFilter] = useState("Все");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriorities, setSelectedPriorities] = useState([]);
const [selectedTaskDate, setSelectedTaskDate] = useState("");
const [taskTimeSortDirection, setTaskTimeSortDirection] = useState("asc");

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

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function handleToggleTheme() {
    setTheme((currentTheme) => toggleTheme(currentTheme));
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

      setExerciseGroups(data.map(normalizeGroup));
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
      setTaskGroups(
        Array.isArray(data) ? data.map(normalizeGroup) : []
      );
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
      setTaskGroups((current) => [...current, normalizeGroup(group)]);
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
              groupColor: selectedGroup?.color
                ? canonicalGroupColor(selectedGroup.color)
                : null,
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
    groupColor: selectedGroup?.color
      ? canonicalGroupColor(selectedGroup.color)
      : null,
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
      isPremiumUser={isPremiumUser}
      onOpenPremium={() => setIsPremiumModalOpen(true)}
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
      isPremiumUser={isPremiumUser}
      onOpenPremium={() => setIsPremiumModalOpen(true)}
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
      isPremiumUser={isPremiumUser}
      onOpenPremium={() => setIsPremiumModalOpen(true)}
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
      onOpenPremium={() => setIsPremiumModalOpen(true)}
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
<MobileTopMenu
  isOpen={isMobileMenuOpen}
  activePage={activePage}
  setActivePage={setActivePage}
  closeMobileMenu={() => setIsMobileMenuOpen(false)}
  theme={theme}
  onToggleTheme={handleToggleTheme}
/>
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
  theme={theme}
  onToggleTheme={handleToggleTheme}
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
  isPremiumUser={isPremiumUser}
  onOpenPremium={() => setIsPremiumModalOpen(true)}
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

export default App;