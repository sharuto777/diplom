const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const multer = require("multer");
//WW
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
 
 





app.use(cors());
app.use(express.json());

const requiredEnv = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD", "JWT_SECRET"];
const missingEnv = requiredEnv.filter((name) => !process.env[name]);

if (missingEnv.length > 0) {
  console.warn(`Не заполнены переменные окружения: ${missingEnv.join(", ")}`);
}

//WW
const uploadsDir = path.join(__dirname, "uploads");
const avatarsDir = path.join(uploadsDir, "avatars");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir);
}

app.use("/uploads", express.static(uploadsDir));


//WW
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = [".jpg", ".jpeg", ".png", ".webp"].includes(ext)
      ? ext
      : ".jpg";

    cb(null, `${req.user.id}-${Date.now()}${safeExt}`);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error("Можно загрузить только JPG, PNG или WEBP"));
      return;
    }

    cb(null, true);
  },
});


//WW
app.post(
  "/api/profile/avatar",
  authMiddleware,
  uploadAvatar.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "Файл аватарки не загружен",
        });
      }

      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      const oldAvatarResult = await pool.query(
        "SELECT avatar_url FROM users WHERE id = $1",
        [req.user.id]
      );

      const oldAvatarUrl = oldAvatarResult.rows[0]?.avatar_url;

      await pool.query(
        "UPDATE users SET avatar_url = $1 WHERE id = $2",
        [avatarUrl, req.user.id]
      );

      if (oldAvatarUrl && oldAvatarUrl.startsWith("/uploads/avatars/")) {
        const oldAvatarPath = path.join(
          __dirname,
          oldAvatarUrl.replace("/uploads/", "uploads/")
        );

        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      res.json({
        avatar_url: avatarUrl,
      });
    } catch (error) {
      console.error("Ошибка загрузки аватарки:", error);

      res.status(500).json({
        error: "Ошибка загрузки аватарки",
        message: error.message,
      });
    }
  }
);

//WW
app.delete("/api/profile/avatar", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT avatar_url FROM users WHERE id = $1",
      [req.user.id]
    );

    const avatarUrl = result.rows[0]?.avatar_url;

    if (avatarUrl && avatarUrl.startsWith("/uploads/avatars/")) {
      const avatarPath = path.join(
        __dirname,
        avatarUrl.replace("/uploads/", "uploads/")
      );

      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    await pool.query(
      "UPDATE users SET avatar_url = NULL WHERE id = $1",
      [req.user.id]
    );

    res.json({
      success: true,
    });
  } catch (error) {
    console.error("Ошибка удаления аватарки:", error);

    res.status(500).json({
      error: "Ошибка удаления аватарки",
      message: error.message,
    });
  }
});

//WW
function parseDurationToSeconds(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parts = String(value).split(":").map(Number);

  if (parts.some((part) => Number.isNaN(part))) {
    return null;
  }

  let totalSeconds = null;

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    totalSeconds = minutes * 60 + seconds;
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    totalSeconds = hours * 3600 + minutes * 60 + seconds;
  }

  if (!totalSeconds || totalSeconds <= 0) {
    return null;
  }

  return totalSeconds;
}

function formatSecondsToDuration(seconds) {
  if (!seconds) {
    return "";
  }

  const totalSeconds = Number(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function formatExerciseMetric(row) {
  return {
    id: row.id,
    userId: row.user_id,
    exerciseId: row.exercise_id,
    exerciseName: row.exercise_name || row.custom_exercise_name,
    customExerciseName: row.custom_exercise_name,
    measureType: row.measure_type,

    weight: row.weight_kg === null ? null : Number(row.weight_kg),
    reps: row.reps_count,
    sets: row.sets_count,

    distance: row.distance_km === null ? null : Number(row.distance_km),
    time: formatSecondsToDuration(row.duration_seconds),

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}




function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "Пользователь не авторизован",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Токен не передан",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Недействительный токен",
    });
  }
}

async function getUserSubscription(userId) {
  const result = await pool.query(
    `
    SELECT
      sp.id,
      sp.name,
      sp.code,
      sp.price_month,
      sp.price_year,
      sp.max_tasks,
      sp.max_workouts,
      sp.has_extended_stats,
      sp.has_extended_exercises,
      sp.has_ready_programs,
      sp.has_progress_history,
      sp.has_export,
      sp.has_no_ads,
      us.status,
      us.started_at,
      us.expires_at
    FROM user_subscriptions us
    JOIN subscription_plans sp ON sp.id = us.plan_id
    WHERE us.user_id = $1
      AND us.status = 'active'
      AND (us.expires_at IS NULL OR us.expires_at > CURRENT_TIMESTAMP)
    ORDER BY us.started_at DESC
    LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] || null;
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

app.get("/api/exercise-metrics", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        user_exercise_metrics.*,
        exercises.name AS exercise_name
      FROM user_exercise_metrics
      LEFT JOIN exercises ON exercises.id = user_exercise_metrics.exercise_id
      WHERE user_exercise_metrics.user_id = $1
      ORDER BY user_exercise_metrics.updated_at DESC
      `,
      [req.user.id]
    );

    res.json(result.rows.map(formatExerciseMetric));
  } catch (error) {
    console.error("Ошибка загрузки рабочих показателей:", error);
    res.status(500).json({ error: "Не удалось загрузить рабочие показатели" });
  }
});

app.post("/api/exercise-metrics", authMiddleware, async (req, res) => {
  try {
    const {
      exerciseId,
      exerciseName,
      measureType,
      weight,
      reps,
      sets,
      distance,
      time,
    } = req.body;

    const finalMeasureType = measureType || "weight_reps";
    const durationSeconds = parseDurationToSeconds(time);

    const selectedExerciseId = exerciseId || null;
    const customExerciseName = selectedExerciseId ? null : exerciseName;

    if (!selectedExerciseId && !customExerciseName) {
      return res.status(400).json({ error: "Укажите упражнение" });
    }

    const result = await pool.query(
      `
      INSERT INTO user_exercise_metrics (
        user_id,
        exercise_id,
        custom_exercise_name,
        measure_type,
        weight_kg,
        reps_count,
        sets_count,
        distance_km,
        duration_seconds
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
      `,
      [
        req.user.id,
        selectedExerciseId,
        customExerciseName,
        finalMeasureType,
        weight || null,
        reps || null,
        sets || null,
        distance || null,
        durationSeconds,
      ]
    );

    const metric = result.rows[0];

    await pool.query(
      `
      INSERT INTO user_exercise_metric_history (
        metric_id,
        user_id,
        measure_type,
        weight_kg,
        reps_count,
        sets_count,
        distance_km,
        duration_seconds
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        metric.id,
        req.user.id,
        metric.measure_type,
        metric.weight_kg,
        metric.reps_count,
        metric.sets_count,
        metric.distance_km,
        metric.duration_seconds,
      ]
    );

    const formattedResult = await pool.query(
      `
      SELECT
        user_exercise_metrics.*,
        exercises.name AS exercise_name
      FROM user_exercise_metrics
      LEFT JOIN exercises ON exercises.id = user_exercise_metrics.exercise_id
      WHERE user_exercise_metrics.id = $1
      `,
      [metric.id]
    );

    res.status(201).json(formatExerciseMetric(formattedResult.rows[0]));
  } catch (error) {
    console.error("Ошибка создания рабочего показателя:", error);
    res.status(500).json({ error: "Не удалось создать рабочий показатель" });
  }
});

app.put("/api/exercise-metrics/:id", authMiddleware, async (req, res) => {
  try {
    const {
      exerciseId,
      exerciseName,
      measureType,
      weight,
      reps,
      sets,
      distance,
      time,
    } = req.body;

    const finalMeasureType = measureType || "weight_reps";
    const durationSeconds = parseDurationToSeconds(time);

    const selectedExerciseId = exerciseId || null;
    const customExerciseName = selectedExerciseId ? null : exerciseName;

    if (!selectedExerciseId && !customExerciseName) {
      return res.status(400).json({ error: "Укажите упражнение" });
    }

    const result = await pool.query(
      `
      UPDATE user_exercise_metrics
      SET
        exercise_id = $1,
        custom_exercise_name = $2,
        measure_type = $3,
        weight_kg = $4,
        reps_count = $5,
        sets_count = $6,
        distance_km = $7,
        duration_seconds = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9 AND user_id = $10
      RETURNING *
      `,
      [
        selectedExerciseId,
        customExerciseName,
        finalMeasureType,
        weight || null,
        reps || null,
        sets || null,
        distance || null,
        durationSeconds,
        req.params.id,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Показатель не найден" });
    }

    const metric = result.rows[0];

    await pool.query(
      `
      INSERT INTO user_exercise_metric_history (
        metric_id,
        user_id,
        measure_type,
        weight_kg,
        reps_count,
        sets_count,
        distance_km,
        duration_seconds
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        metric.id,
        req.user.id,
        metric.measure_type,
        metric.weight_kg,
        metric.reps_count,
        metric.sets_count,
        metric.distance_km,
        metric.duration_seconds,
      ]
    );

    const formattedResult = await pool.query(
      `
      SELECT
        user_exercise_metrics.*,
        exercises.name AS exercise_name
      FROM user_exercise_metrics
      LEFT JOIN exercises ON exercises.id = user_exercise_metrics.exercise_id
      WHERE user_exercise_metrics.id = $1
      `,
      [metric.id]
    );

    res.json(formatExerciseMetric(formattedResult.rows[0]));
  } catch (error) {
    console.error("Ошибка обновления рабочего показателя:", error);
    res.status(500).json({ error: "Не удалось обновить рабочий показатель" });
  }
});

app.delete("/api/exercise-metrics/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      DELETE FROM user_exercise_metrics
      WHERE id = $1 AND user_id = $2
      RETURNING id
      `,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Показатель не найден" });
    }

    res.json({ message: "Показатель удалён" });
  } catch (error) {
    console.error("Ошибка удаления рабочего показателя:", error);
    res.status(500).json({ error: "Не удалось удалить рабочий показатель" });
  }
});

app.get("/api/exercise-metrics/:id/history", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM user_exercise_metric_history
      WHERE metric_id = $1 AND user_id = $2
      ORDER BY recorded_at DESC
      `,
      [req.params.id, req.user.id]
    );

    res.json(
      result.rows.map((row) => ({
        id: row.id,
        metricId: row.metric_id,
        measureType: row.measure_type,
        weight: row.weight_kg === null ? null : Number(row.weight_kg),
        reps: row.reps_count,
        sets: row.sets_count,
        distance: row.distance_km === null ? null : Number(row.distance_km),
        time: formatSecondsToDuration(row.duration_seconds),
        recordedAt: row.recorded_at,
      }))
    );
  } catch (error) {
    console.error("Ошибка загрузки истории показателя:", error);
    res.status(500).json({ error: "Не удалось загрузить историю показателя" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  const client = await pool.connect();

  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Заполните логин, email и пароль",
      });
    }

    if (username.trim().length < 3) {
      return res.status(400).json({
        error: "Логин должен содержать минимум 3 символа",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Пароль должен содержать минимум 6 символов",
      });
    }

    await client.query("BEGIN");

    const existingUser = await client.query(
      `
      SELECT id
      FROM users
      WHERE email = $1 OR username = $2
      `,
      [email.trim().toLowerCase(), username.trim()]
    );

    if (existingUser.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        error: "Пользователь с таким email или логином уже существует",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userResult = await client.query(
      `
      INSERT INTO users (
        username,
        email,
        password_hash,
        role,
        is_guest
      )
      VALUES ($1, $2, $3, 'user', false)
      RETURNING id, username, email, role, is_guest, avatar_url, created_at
      `,
      [username.trim(), email.trim().toLowerCase(), passwordHash]
    );

    const user = userResult.rows[0];

    const freePlanResult = await client.query(
      `
      SELECT id
      FROM subscription_plans
      WHERE code = 'free'
      LIMIT 1
      `
    );

    if (freePlanResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(500).json({
        error: "В базе данных не найден тариф Free",
      });
    }

    const freePlanId = freePlanResult.rows[0].id;

    await client.query(
      `
      INSERT INTO user_subscriptions (
        user_id,
        plan_id,
        status,
        started_at,
        expires_at
      )
      VALUES ($1, $2, 'active', CURRENT_TIMESTAMP, NULL)
      `,
      [user.id, freePlanId]
    );

    await client.query("COMMIT");

    const subscription = await getUserSubscription(user.id);

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        email: user.email,
        role: user.role,
        is_guest: user.is_guest,
        subscription: subscription?.code || "free",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user,
      subscription,
    });
  } catch (error) {
  console.error("REGISTER ERROR:", error);
  res.status(500).json({
    error: "Ошибка регистрации",
    details: error.message
  });
} finally {
    client.release();
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Введите email и пароль",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        username,
        email,
        password_hash,
        role,
        is_guest,
        avatar_url,
        created_at
      FROM users
      WHERE email = $1
      LIMIT 1
      `,
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Неверный email или пароль",
      });
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Неверный email или пароль",
      });
    }

    delete user.password_hash;

    const subscription = await getUserSubscription(user.id);

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role,
        is_guest: user.is_guest,
        subscription: subscription?.code || "free",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user,
      subscription,
    });
  } catch (error) {
    console.error("Ошибка входа:", error);

    res.status(500).json({
      error: "Ошибка входа",
    });
  }
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        username,
        email,
        role,
        is_guest,
        avatar_url,
        created_at
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Пользователь не найден",
      });
    }

    const user = result.rows[0];
    const subscription = await getUserSubscription(user.id);

    res.json({
      user,
      subscription,
    });
  } catch (error) {
    console.error("Ошибка получения пользователя:", error);

    res.status(500).json({
      error: "Ошибка получения данных пользователя",
    });
  }
});


app.get("/", (req, res) => {
  res.send("FitPlanner backend работает. Используй /api/health, /api/tasks");
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "ok",
      message: "Backend работает, подключение к БД есть",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Ошибка подключения к БД",
      error: error.message,
    });
  }
});

//WW
app.get("/api/tasks", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        t.id,
        t.title,
        t.description,
        t.micro_step,
        t.subtasks,
        t.priority,
        t.status,
        t.start_datetime,
        t.end_datetime,
        t.group_id,
        tg.name AS group_name,
        tg.color AS group_color,
        c.name AS category,
        w.id AS workout_id,
        w.repeat_days,
        mg.name AS muscle_group,
        COALESCE(
  json_agg(
    json_build_object(
  'workout_exercise_id', we.id,
  'id', COALESCE(e.id::text, ue.id::text),
  'exercise_id', e.id,
  'user_exercise_id', ue.id,
  'name', COALESCE(e.name, ue.name),
  'sets_count', we.sets_count,
  'reps_count', we.reps_count,
  'weight_kg', we.weight_kg,
  'measure_units', COALESCE(e.measure_units, ue.measure_units, '["kg", "reps"]'::jsonb),
  'is_completed', we.is_completed,
  'is_custom', CASE WHEN ue.id IS NOT NULL THEN true ELSE false END
)
ORDER BY we.id ASC
  ) FILTER (WHERE e.id IS NOT NULL OR ue.id IS NOT NULL),
  '[]'
) AS exercises
      FROM tasks t
      LEFT JOIN task_groups tg ON tg.id = t.group_id
      LEFT JOIN task_categories c ON c.id = t.category_id
      LEFT JOIN workouts w ON w.task_id = t.id
      LEFT JOIN muscle_groups mg ON mg.id = w.main_muscle_group_id
      LEFT JOIN workout_exercises we ON we.workout_id = w.id
      LEFT JOIN exercises e ON e.id = we.exercise_id
      LEFT JOIN user_exercises ue ON ue.id = we.user_exercise_id
      WHERE t.user_id = $1
      GROUP BY
        t.id,
        t.title,
        t.description,
        t.micro_step,
        t.subtasks,
        t.priority,
        t.status,
        t.start_datetime,
        t.end_datetime,
        t.group_id,
        tg.name,
        tg.color,
        c.name,
        w.id,
        w.repeat_days,
        mg.name
      ORDER BY t.created_at DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка загрузки задач:", error);

    res.status(500).json({
      error: "Ошибка загрузки задач",
      message: error.message,
    });
  }
});

app.post("/api/task-groups", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "Название группы обязательно",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO task_groups (
        user_id,
        name,
        color
      )
      VALUES ($1, $2, $3)
      RETURNING id, name, color, created_at
      `,
      [userId, name.trim(), color || "#E6F8FA"]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка создания группы задач:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        error: "Группа с таким названием уже существует",
      });
    }

    res.status(500).json({
      error: "Ошибка создания группы задач",
      message: error.message,
    });
  }
});

//WW
app.post("/api/tasks", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const limitCheck = await checkTaskLimit(userId);

    if (!limitCheck.allowed) {
      return res.status(403).json({
        error: `Достигнут лимит бесплатного тарифа: ${limitCheck.limit} задач. Для снятия ограничения подключите Premium.`,
      });
    }

    const {
      title,
      description,
      subtasks,
      category,
      priority,
      start_datetime,
      end_datetime,
      group_id,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Название задачи обязательно" });
    }

    const trimmedTitle = title.trim();

    if (trimmedTitle.length > 60) {
      return res.status(400).json({
        error: "Название задачи не должно быть длиннее 60 символов",
      });
    }

    const categoryName = category || "Личное";

    const categoryResult = await pool.query(
      `
      SELECT id
      FROM task_categories
      WHERE name = $1
      LIMIT 1
      `,
      [categoryName]
    );

    let categoryId;

    if (categoryResult.rows.length > 0) {
      categoryId = categoryResult.rows[0].id;
    } else {
      const newCategory = await pool.query(
        `
        INSERT INTO task_categories (name)
        VALUES ($1)
        RETURNING id
        `,
        [categoryName]
      );

      categoryId = newCategory.rows[0].id;
    }

    const preparedSubtasks = Array.isArray(subtasks)
  ? subtasks
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .slice(0, 7)
      .map((title) => ({
        id: crypto.randomUUID(),
        title,
        is_completed: false,
      }))
  : [];

    const result = await pool.query(
      `
      INSERT INTO tasks (
        user_id,
        category_id,
        group_id,
        title,
        description,
        micro_step,
        subtasks,
        priority,
        status,
        start_datetime,
        end_datetime
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'new', $9, $10)
      RETURNING *
      `,
      [
        userId,
        categoryId,
        group_id || null,
        trimmedTitle,
        description || "",
        "",
        JSON.stringify(preparedSubtasks),
        priority || "medium",
        start_datetime || null,
        end_datetime || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка создания задачи:", error);
    res.status(500).json({
      error: "Ошибка создания задачи",
      message: error.message,
    });
  }
});

app.post("/api/workouts", authMiddleware, async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = req.user.id;

    const {
      title,
      description,
      priority,
      muscle_groups,
      repeat_days,
      exercises,
    } = req.body;

    const trimmedTitle = String(title || "").trim();

    if (!trimmedTitle) {
      return res.status(400).json({
        error: "Название тренировки обязательно",
      });
    }

    if (!Array.isArray(muscle_groups) || muscle_groups.length === 0) {
      return res.status(400).json({
        error: "Выберите хотя бы одну группу мышц",
      });
    }

    if (!Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({
        error: "Добавьте хотя бы одно упражнение",
      });
    }

    await client.query("BEGIN");

    let categoryResult = await client.query(
      `
      SELECT id
      FROM task_categories
      WHERE name = $1
      LIMIT 1
      `,
      ["Тренировка"]
    );

    let categoryId;

    if (categoryResult.rows.length > 0) {
      categoryId = categoryResult.rows[0].id;
    } else {
      const newCategory = await client.query(
        `
        INSERT INTO task_categories (name)
        VALUES ($1)
        RETURNING id
        `,
        ["Тренировка"]
      );

      categoryId = newCategory.rows[0].id;
    }

    const taskResult = await client.query(
      `
      INSERT INTO tasks (
        user_id,
        category_id,
        task_type,
        title,
        description,
        priority,
        status
      )
      VALUES ($1, $2, 'workout', $3, $4, $5, 'planned')
      RETURNING id
      `,
      [
        userId,
        categoryId,
        trimmedTitle,
        description || "",
        priority || "medium",
      ]
    );

    const taskId = taskResult.rows[0].id;

    const mainMuscleGroupName = muscle_groups[0];

    const mainMuscleGroupResult = await client.query(
      `
      SELECT id
      FROM muscle_groups
      WHERE name = $1
      LIMIT 1
      `,
      [mainMuscleGroupName]
    );

    const mainMuscleGroupId = mainMuscleGroupResult.rows[0]?.id || null;

    const workoutResult = await client.query(
      `
      INSERT INTO workouts (
        task_id,
        main_muscle_group_id,
        duration_minutes,
        repeat_days
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [
        taskId,
        mainMuscleGroupId,
        null,
        Array.isArray(repeat_days) ? repeat_days : [],
      ]
    );

    const workoutId = workoutResult.rows[0].id;

    for (const exercise of exercises) {
      const exerciseName = String(exercise.name || "").trim();

      if (!exerciseName) {
        continue;
      }

      let baseExerciseId = exercise.exercise_id || null;
      let userExerciseId = exercise.user_exercise_id || null;

      if (!baseExerciseId && !userExerciseId) {
        const existingUserExercise = await client.query(
          `
          SELECT id
          FROM user_exercises
          WHERE user_id = $1
            AND LOWER(name) = LOWER($2)
          LIMIT 1
          `,
          [userId, exerciseName]
        );

        if (existingUserExercise.rows.length > 0) {
          userExerciseId = existingUserExercise.rows[0].id;
        } else {
          const newUserExercise = await client.query(
            `
            INSERT INTO user_exercises (
              user_id,
              name,
              description,
              difficulty,
              equipment,
              is_premium,
              measure_type,
              measure_units
            )
            VALUES ($1, $2, NULL, 'Средняя', NULL, false, 'weight_reps', '["kg"]'::jsonb)
            RETURNING id
            `,
            [userId, exerciseName]
          );

          userExerciseId = newUserExercise.rows[0].id;
        }
      }

      const setsCount =
  exercise.sets_count === "" ||
  exercise.sets_count === null ||
  exercise.sets_count === undefined
    ? 0
    : Number(exercise.sets_count);

const repsCount =
  exercise.reps_count === "" ||
  exercise.reps_count === null ||
  exercise.reps_count === undefined ||
  Number(exercise.reps_count) <= 0
    ? null
    : Number(exercise.reps_count);

await client.query(
  `
  INSERT INTO workout_exercises (
    workout_id,
    exercise_id,
    user_exercise_id,
    sets_count,
    reps_count,
    weight_kg,
    is_completed
  )
  VALUES ($1, $2, $3, $4, $5, $6, false)
  `,
  [
    workoutId,
    baseExerciseId,
    userExerciseId,
    setsCount,
    repsCount,
    exercise.weight_kg || null,
  ]
);
    }

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      task_id: taskId,
      workout_id: workoutId,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Ошибка создания тренировки:", error);

    res.status(500).json({
      error: "Ошибка создания тренировки",
      message: error.message,
    });
  } finally {
    client.release();
  }
});

app.patch("/api/tasks/:id/complete", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE tasks
      SET status = CASE
        WHEN status = 'completed'::task_status THEN 'in_progress'::task_status
        ELSE 'completed'::task_status
      END
      WHERE id = $1
        AND user_id = $2
      RETURNING *
      `,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Задача не найдена",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка обновления задачи:", error);

    res.status(500).json({
      error: "Ошибка обновления задачи",
      message: error.message,
    });
  }
});

//WW
app.patch("/api/tasks/:taskId/subtasks/:subtaskId/toggle", authMiddleware, async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;
    const userId = req.user.id;

    const taskResult = await pool.query(
      `
      SELECT id, subtasks
      FROM tasks
      WHERE id = $1 AND user_id = $2
      LIMIT 1
      `,
      [taskId, userId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        error: "Задача не найдена",
      });
    }

    const currentSubtasks = Array.isArray(taskResult.rows[0].subtasks)
      ? taskResult.rows[0].subtasks
      : [];

    const updatedSubtasks = currentSubtasks.map((subtask) => {
      if (String(subtask.id) !== String(subtaskId)) {
        return subtask;
      }

      return {
        ...subtask,
        is_completed: !Boolean(subtask.is_completed),
      };
    });

    const allSubtasksCompleted =
      updatedSubtasks.length > 0 &&
      updatedSubtasks.every((subtask) => subtask.is_completed);

    const result = await pool.query(
      `
      UPDATE tasks
      SET
        subtasks = $1::jsonb,
        status = CASE
          WHEN $2 = true THEN 'completed'::task_status
          ELSE status
        END
      WHERE id = $3 AND user_id = $4
      RETURNING *
      `,
      [
        JSON.stringify(updatedSubtasks),
        allSubtasksCompleted,
        taskId,
        userId,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка обновления подзадачи:", error);

    res.status(500).json({
      error: "Ошибка обновления подзадачи",
      message: error.message,
    });
  }
});

async function requirePremium(req, res, next) {
  try {
    const subscription = await getUserSubscription(req.user.id);

    if (!subscription || subscription.code !== "premium") {
      return res.status(403).json({
        error: "Эта возможность доступна только пользователям Premium",
      });
    }

    req.subscription = subscription;

    next();
  } catch (error) {
    console.error("Ошибка проверки Premium:", error);

    res.status(500).json({
      error: "Ошибка проверки подписки",
    });
  }
}

app.post("/api/payments/create", authMiddleware, async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = req.user.id;
    const { plan } = req.body;

    const allowedPlans = ["premium_month", "premium_year"];

    if (!allowedPlans.includes(plan)) {
      return res.status(400).json({
        error: "Некорректный тариф Premium",
      });
    }

    await client.query("BEGIN");

    const premiumPlanResult = await client.query(
      `
      SELECT id, code
      FROM subscription_plans
      WHERE code = 'premium'
      LIMIT 1
      `
    );

    if (premiumPlanResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(500).json({
        error: "В базе данных не найден тариф Premium",
      });
    }

    const premiumPlanId = premiumPlanResult.rows[0].id;

    const expiresInterval =
      plan === "premium_year" ? "1 year" : "1 month";

    await client.query(
      `
      UPDATE user_subscriptions
      SET status = 'cancelled'
      WHERE user_id = $1
        AND status = 'active'
      `,
      [userId]
    );

    await client.query(
      `
      INSERT INTO user_subscriptions (
        user_id,
        plan_id,
        status,
        started_at,
        expires_at
      )
      VALUES (
        $1,
        $2,
        'active',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP + $3::interval
      )
      `,
      [userId, premiumPlanId, expiresInterval]
    );

    await client.query("COMMIT");

    const subscription = await getUserSubscription(userId);

    res.json({
      success: true,
      mode: "test",
      message: "Premium подключён в тестовом режиме",
      subscription,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Ошибка создания платежа Premium:", error);

    res.status(500).json({
      error: "Ошибка подключения Premium",
      message: error.message,
    });
  } finally {
    client.release();
  }
});

app.get("/api/statistics/extended", authMiddleware, requirePremium, async (req, res) => {
  res.json({
    message: "Расширенная статистика Premium",
  });
});

//WW
app.get("/api/statistics", authMiddleware, requirePremium, async (req, res) => {
  try {
    const userId = req.user.id;

    const taskSummaryResult = await pool.query(
      `
      SELECT
        COUNT(*)::int AS total_tasks,
        COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_tasks,
        COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress_tasks,
        COUNT(*) FILTER (WHERE status IN ('new', 'planned'))::int AS planned_tasks,
        COUNT(*) FILTER (WHERE status IN ('missed', 'cancelled'))::int AS missed_tasks,
        COUNT(*) FILTER (WHERE priority = 'high')::int AS high_priority_tasks
      FROM tasks
      WHERE user_id = $1
        AND task_type = 'regular'
      `,
      [userId]
    );

    const workoutSummaryResult = await pool.query(
      `
      SELECT
        COUNT(DISTINCT t.id)::int AS total_workouts,
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed')::int AS completed_workouts,
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'missed')::int AS missed_workouts,
        COALESCE(SUM(
          COALESCE(we.weight_kg, 0) *
          COALESCE(we.sets_count, 0) *
          COALESCE(we.reps_count, 0)
        ), 0)::numeric AS total_volume
      FROM tasks t
      LEFT JOIN workouts w ON w.task_id = t.id
      LEFT JOIN workout_exercises we ON we.workout_id = w.id
      WHERE t.user_id = $1
        AND t.task_type = 'workout'
      `,
      [userId]
    );

    const weekActivityResult = await pool.query(
      `
      WITH days AS (
        SELECT generate_series(
          date_trunc('week', CURRENT_DATE)::date,
          (date_trunc('week', CURRENT_DATE)::date + INTERVAL '6 days')::date,
          INTERVAL '1 day'
        )::date AS day
      )
      SELECT
        d.day,
        COUNT(t.id) FILTER (
          WHERE t.task_type = 'regular'
        )::int AS tasks_count,
        COUNT(t.id) FILTER (
          WHERE t.task_type = 'regular' AND t.status = 'completed'
        )::int AS completed_tasks_count,
        COUNT(t.id) FILTER (
          WHERE t.task_type = 'workout'
        )::int AS workouts_count,
        COUNT(t.id) FILTER (
          WHERE t.task_type = 'workout' AND t.status = 'completed'
        )::int AS completed_workouts_count,
        COALESCE(SUM(
          COALESCE(we.weight_kg, 0) *
          COALESCE(we.sets_count, 0) *
          COALESCE(we.reps_count, 0)
        ), 0)::numeric AS volume
      FROM days d
      LEFT JOIN tasks t
        ON t.user_id = $1
        AND t.start_datetime::date = d.day
      LEFT JOIN workouts w ON w.task_id = t.id
      LEFT JOIN workout_exercises we ON we.workout_id = w.id
      GROUP BY d.day
      ORDER BY d.day ASC
      `,
      [userId]
    );

    const muscleGroupsResult = await pool.query(
      `
      SELECT
        COALESCE(mg.name, 'Без группы') AS name,
        COUNT(DISTINCT t.id)::int AS workouts_count,
        COALESCE(SUM(
          COALESCE(we.weight_kg, 0) *
          COALESCE(we.sets_count, 0) *
          COALESCE(we.reps_count, 0)
        ), 0)::numeric AS volume
      FROM tasks t
      JOIN workouts w ON w.task_id = t.id
      LEFT JOIN muscle_groups mg ON mg.id = w.main_muscle_group_id
      LEFT JOIN workout_exercises we ON we.workout_id = w.id
      WHERE t.user_id = $1
        AND t.task_type = 'workout'
      GROUP BY mg.name
      ORDER BY workouts_count DESC, volume DESC
      LIMIT 6
      `,
      [userId]
    );

    const progressResult = await pool.query(
      `
      WITH history AS (
        SELECT
          h.metric_id,
          h.weight_kg,
          h.recorded_at,
          ROW_NUMBER() OVER (
            PARTITION BY h.metric_id
            ORDER BY h.recorded_at ASC
          ) AS first_row,
          ROW_NUMBER() OVER (
            PARTITION BY h.metric_id
            ORDER BY h.recorded_at DESC
          ) AS last_row
        FROM user_exercise_metric_history h
        WHERE h.user_id = $1
          AND h.weight_kg IS NOT NULL
      ),
      first_values AS (
        SELECT metric_id, weight_kg AS first_weight
        FROM history
        WHERE first_row = 1
      ),
      last_values AS (
        SELECT metric_id, weight_kg AS last_weight
        FROM history
        WHERE last_row = 1
      )
      SELECT
        COALESCE(e.name, m.custom_exercise_name, 'Упражнение') AS exercise_name,
        fv.first_weight,
        COALESCE(lv.last_weight, m.weight_kg) AS last_weight,
        COALESCE(lv.last_weight, m.weight_kg) - fv.first_weight AS progress
      FROM user_exercise_metrics m
      LEFT JOIN exercises e ON e.id = m.exercise_id
      JOIN first_values fv ON fv.metric_id = m.id
      LEFT JOIN last_values lv ON lv.metric_id = m.id
      WHERE m.user_id = $1
        AND fv.first_weight IS NOT NULL
        AND COALESCE(lv.last_weight, m.weight_kg) IS NOT NULL
      ORDER BY progress DESC
      LIMIT 5
      `,
      [userId]
    );

    const activityMapResult = await pool.query(
      `
      WITH days AS (
        SELECT generate_series(
          (CURRENT_DATE - INTERVAL '29 days')::date,
          CURRENT_DATE::date,
          INTERVAL '1 day'
        )::date AS day
      )
      SELECT
        d.day,
        COUNT(t.id)::int AS total_items,
        COUNT(t.id) FILTER (WHERE t.status = 'completed')::int AS completed_items
      FROM days d
      LEFT JOIN tasks t
        ON t.user_id = $1
        AND t.start_datetime::date = d.day
      GROUP BY d.day
      ORDER BY d.day ASC
      `,
      [userId]
    );

    const weekCompareResult = await pool.query(
      `
      SELECT
        COUNT(*) FILTER (
          WHERE start_datetime >= date_trunc('week', CURRENT_DATE)
            AND start_datetime < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
            AND status = 'completed'
        )::int AS current_week_completed,

        COUNT(*) FILTER (
          WHERE start_datetime >= date_trunc('week', CURRENT_DATE) - INTERVAL '7 days'
            AND start_datetime < date_trunc('week', CURRENT_DATE)
            AND status = 'completed'
        )::int AS previous_week_completed
      FROM tasks
      WHERE user_id = $1
      `,
      [userId]
    );

    const taskSummary = taskSummaryResult.rows[0];
    const workoutSummary = workoutSummaryResult.rows[0];
    const weekCompare = weekCompareResult.rows[0];

    const completedTasks = Number(taskSummary.completed_tasks || 0);
    const totalTasks = Number(taskSummary.total_tasks || 0);
    const taskCompletionRate =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const activityDays = activityMapResult.rows
      .filter((day) => Number(day.completed_items || 0) > 0)
      .map((day) => new Date(day.day).toISOString().slice(0, 10));

    let activeDaysStreak = 0;
    const today = new Date();

    for (let index = 0; index < 30; index += 1) {
      const checkedDate = new Date(today);
      checkedDate.setDate(today.getDate() - index);

      const dateKey = checkedDate.toISOString().slice(0, 10);

      if (activityDays.includes(dateKey)) {
        activeDaysStreak += 1;
      } else {
        break;
      }
    }

    const currentWeekCompleted = Number(weekCompare.current_week_completed || 0);
    const previousWeekCompleted = Number(weekCompare.previous_week_completed || 0);

    let weekDiffPercent = 0;

    if (previousWeekCompleted > 0) {
      weekDiffPercent = Math.round(
        ((currentWeekCompleted - previousWeekCompleted) / previousWeekCompleted) * 100
      );
    } else if (currentWeekCompleted > 0) {
      weekDiffPercent = 100;
    }

    const bestProgress = progressResult.rows[0] || null;
    const favoriteMuscleGroup = muscleGroupsResult.rows[0] || null;

    const insightParts = [];

    if (taskCompletionRate >= 80) {
      insightParts.push(`Отличная неделя: выполнено ${taskCompletionRate}% задач.`);
    } else if (taskCompletionRate >= 50) {
      insightParts.push(`Хороший темп: выполнено ${taskCompletionRate}% задач.`);
    } else {
      insightParts.push("Неделя пока спокойная: можно запланировать 1–2 главные задачи.");
    }

    if (Number(workoutSummary.completed_workouts || 0) > 0) {
      insightParts.push(
        `Тренировок выполнено: ${Number(workoutSummary.completed_workouts || 0)}.`
      );
    }

    if (favoriteMuscleGroup) {
      insightParts.push(`Самая активная группа мышц — ${favoriteMuscleGroup.name}.`);
    }

    if (bestProgress && Number(bestProgress.progress || 0) > 0) {
      insightParts.push(
        `Лучший прогресс: ${bestProgress.exercise_name} +${Number(bestProgress.progress).toFixed(1)} кг.`
      );
    }

    res.json({
      overview: {
        totalTasks,
        completedTasks,
        taskCompletionRate,
        totalWorkouts: Number(workoutSummary.total_workouts || 0),
        completedWorkouts: Number(workoutSummary.completed_workouts || 0),
        missedWorkouts: Number(workoutSummary.missed_workouts || 0),
        activeDaysStreak,
        trainingVolume: Number(workoutSummary.total_volume || 0),
        bestProgress: bestProgress
          ? {
              exerciseName: bestProgress.exercise_name,
              firstWeight: Number(bestProgress.first_weight || 0),
              lastWeight: Number(bestProgress.last_weight || 0),
              progress: Number(bestProgress.progress || 0),
            }
          : null,
        weekDiffPercent,
      },

      tasks: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: Number(taskSummary.in_progress_tasks || 0),
        planned: Number(taskSummary.planned_tasks || 0),
        missed: Number(taskSummary.missed_tasks || 0),
        highPriority: Number(taskSummary.high_priority_tasks || 0),
      },

      workouts: {
        total: Number(workoutSummary.total_workouts || 0),
        completed: Number(workoutSummary.completed_workouts || 0),
        missed: Number(workoutSummary.missed_workouts || 0),
        totalVolume: Number(workoutSummary.total_volume || 0),
        byMuscleGroup: muscleGroupsResult.rows.map((item) => ({
          name: item.name,
          workoutsCount: Number(item.workouts_count || 0),
          volume: Number(item.volume || 0),
        })),
      },

      weekActivity: weekActivityResult.rows.map((item) => ({
        date: item.day,
        tasksCount: Number(item.tasks_count || 0),
        completedTasksCount: Number(item.completed_tasks_count || 0),
        workoutsCount: Number(item.workouts_count || 0),
        completedWorkoutsCount: Number(item.completed_workouts_count || 0),
        volume: Number(item.volume || 0),
      })),

      progress: progressResult.rows.map((item) => ({
        exerciseName: item.exercise_name,
        firstWeight: Number(item.first_weight || 0),
        lastWeight: Number(item.last_weight || 0),
        progress: Number(item.progress || 0),
      })),

      activityMap: activityMapResult.rows.map((item) => ({
        date: item.day,
        totalItems: Number(item.total_items || 0),
        completedItems: Number(item.completed_items || 0),
      })),

      insight: insightParts.join(" "),
    });
  } catch (error) {
    console.error("Ошибка загрузки статистики:", error);

    res.status(500).json({
      error: "Ошибка загрузки статистики",
      message: error.message,
    });
  }
});

async function checkTaskLimit(userId) {
  const subscription = await getUserSubscription(userId);

  if (!subscription || subscription.max_tasks === null) {
    return {
      allowed: true,
      subscription,
    };
  }

  const result = await pool.query(
    `
    SELECT COUNT(*)::int AS count
    FROM tasks
    WHERE user_id = $1
      AND status != 'completed'
    `,
    [userId]
  );

  const count = result.rows[0].count;

  return {
    allowed: count < subscription.max_tasks,
    current: count,
    limit: subscription.max_tasks,
    subscription,
  };
}


app.delete("/api/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM tasks
      WHERE id = $1
        AND user_id = $2
      RETURNING *
      `,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Задача не найдена",
      });
    }

    res.json({
      message: "Задача удалена",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Ошибка удаления задачи:", error);

    res.status(500).json({
      message: "Ошибка при удалении задачи",
      error: error.message,
    });
  }
});

app.get("/api/muscle-groups", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, name
      FROM muscle_groups
      ORDER BY name
      `
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка загрузки групп мышц:", error);

    res.status(500).json({
      error: "Ошибка загрузки групп мышц",
    });
  }
});

//WW  
app.get("/api/exercises", async (req, res) => {
  try {
    const { muscle } = req.query;

    let result;

    if (muscle) {
      result = await pool.query(
        `
        SELECT DISTINCT ON (e.id)
          e.id,
          e.name,
          e.description,
          e.difficulty,
          e.equipment,
          e.is_premium,
          e.measure_type,
          e.measure_units,
          NULL::uuid AS group_id,
          mg.name AS group_name,
          NULL::text AS group_color,
          mg.name AS muscle,
          false AS is_custom
        FROM exercises e
        JOIN exercise_muscle_groups emg ON emg.exercise_id = e.id
        JOIN muscle_groups mg ON mg.id = emg.muscle_group_id
        WHERE mg.name = $1
        ORDER BY e.id, mg.name
        `,
        [muscle]
      );
    } else {
      result = await pool.query(
        `
        SELECT DISTINCT ON (e.id)
          e.id,
          e.name,
          e.description,
          e.difficulty,
          e.equipment,
          e.is_premium,
          e.measure_type,
          e.measure_units,
          NULL::uuid AS group_id,
          mg.name AS group_name,
          NULL::text AS group_color,
          mg.name AS muscle,
          false AS is_custom
        FROM exercises e
        LEFT JOIN exercise_muscle_groups emg ON emg.exercise_id = e.id
        LEFT JOIN muscle_groups mg ON mg.id = emg.muscle_group_id
        ORDER BY e.id, mg.name
        `
      );
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка загрузки упражнений:", error);

    res.status(500).json({
      error: "Ошибка загрузки упражнений",
      message: error.message,
    });
  }
});

//WW
app.get("/api/exercise-guides", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        e.id,
        e.name,
        e.description,
        e.difficulty,
        e.equipment,
        COALESCE(mg.name, 'Без группы') AS group_name,
        eg.technique,
        eg.combinations,
        eg.tips
      FROM exercises e
      JOIN exercise_guides eg ON eg.exercise_id = e.id
      LEFT JOIN exercise_muscle_groups emg
        ON emg.exercise_id = e.id
        AND emg.is_primary = true
      LEFT JOIN muscle_groups mg
        ON mg.id = emg.muscle_group_id
      ORDER BY e.id ASC
      `
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка загрузки гайдов упражнений:", error);

    res.status(500).json({
      error: "Ошибка загрузки гайдов упражнений",
      message: error.message,
    });
  }
});

//WW
app.post("/api/exercises", authMiddleware, async (req, res) => {
  try {
    const { name, measureUnits, groupId } = req.body;

    const trimmedName = String(name || "").trim();

    if (!trimmedName) {
      return res.status(400).json({
        error: "Введите название упражнения",
      });
    }

    const units = Array.isArray(measureUnits) ? measureUnits : [];

    if (units.length === 0) {
      return res.status(400).json({
        error: "Выберите единицу измерения",
      });
    }

    const allowedUnits = ["kg", "km", "min", "reps"];

    const normalizedUnits = units.filter((unit) =>
      allowedUnits.includes(unit)
    );

    if (normalizedUnits.length === 0) {
      return res.status(400).json({
        error: "Выберите корректную единицу измерения",
      });
    }

    let measureType = "weight_reps";

    if (normalizedUnits.includes("km")) {
      measureType = "distance_time";
    } else if (
      normalizedUnits.includes("min") &&
      !normalizedUnits.includes("kg")
    ) {
      measureType = "time_sets";
    }

    const existingConstExercise = await pool.query(
      `
      SELECT id
      FROM exercises
      WHERE LOWER(name) = LOWER($1)
      LIMIT 1
      `,
      [trimmedName]
    );

    if (existingConstExercise.rows.length > 0) {
      return res.status(409).json({
        error: "Такое упражнение уже есть в общей базе",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO user_exercises (
        user_id,
        name,
        description,
        difficulty,
        equipment,
        is_premium,
        measure_type,
        measure_units,
        group_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)
      RETURNING
        id,
        name,
        description,
        difficulty,
        equipment,
        is_premium,
        measure_type,
        measure_units,
        group_id,
        true AS is_custom
      `,
      [
        req.user.id,
        trimmedName,
        null,
        "Средняя",
        null,
        false,
        measureType,
        JSON.stringify(normalizedUnits),
        groupId || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка создания пользовательского упражнения:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        error: "У вас уже есть такое упражнение",
      });
    }

    res.status(500).json({
      error: "Ошибка создания упражнения",
      message: error.message,
    });
  }
});

//WW
app.get("/api/user-exercises", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        ue.id,
        ue.name,
        ue.description,
        ue.difficulty,
        ue.equipment,
        ue.is_premium,
        ue.measure_type,
        ue.measure_units,
        ue.group_id,
        eg.name AS group_name,
        eg.color AS group_color,
        true AS is_custom
      FROM user_exercises ue
      LEFT JOIN exercise_groups eg ON eg.id = ue.group_id
      WHERE ue.user_id = $1
      ORDER BY ue.created_at ASC
      `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка загрузки пользовательских упражнений:", error);

    res.status(500).json({
      error: "Ошибка загрузки пользовательских упражнений",
      message: error.message,
    });
  }
});

app.delete("/api/user-exercises/:id", authMiddleware, async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const exerciseResult = await client.query(
      `
      SELECT id, name
      FROM user_exercises
      WHERE id = $1 AND user_id = $2
      `,
      [req.params.id, req.user.id]
    );

    if (exerciseResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Упражнение не найдено или его нельзя удалить",
      });
    }

    const exercise = exerciseResult.rows[0];

    await client.query(
      `
      DELETE FROM user_exercise_metrics
      WHERE user_id = $1
        AND custom_exercise_name = $2
      `,
      [req.user.id, exercise.name]
    );

    await client.query(
      `
      DELETE FROM user_exercises
      WHERE id = $1 AND user_id = $2
      `,
      [req.params.id, req.user.id]
    );

    await client.query("COMMIT");

    res.json({
      message: "Упражнение удалено",
      id: exercise.id,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Ошибка удаления пользовательского упражнения:", error);

    res.status(500).json({
      error: "Не удалось удалить упражнение",
    });
  } finally {
    client.release();
  }
});           

//WW
app.get("/api/exercise-groups", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, name, color, created_at
      FROM exercise_groups
      WHERE user_id = $1
      ORDER BY created_at ASC
      `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка загрузки групп упражнений:", error);

    res.status(500).json({
      error: "Ошибка загрузки групп упражнений",
    });
  }
});

app.delete("/api/exercise-groups/:id", authMiddleware, async (req, res) => {
  const groupId = req.params.id;

  if (!groupId || groupId === "all") {
    return res.status(400).json({
      error: "Группу «Все» удалить нельзя",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const groupResult = await client.query(
      `
      SELECT id
      FROM exercise_groups
      WHERE id = $1 AND user_id = $2
      `,
      [groupId, req.user.id]
    );

    if (groupResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Группа не найдена",
      });
    }

    const userExercisesResult = await client.query(
      `
      SELECT id, name
      FROM user_exercises
      WHERE group_id = $1 AND user_id = $2
      `,
      [groupId, req.user.id]
    );

    const userExerciseIds = userExercisesResult.rows.map((exercise) => exercise.id);
    const userExerciseNames = userExercisesResult.rows.map((exercise) => exercise.name);

    if (userExerciseNames.length > 0) {
      await client.query(
        `
        DELETE FROM user_exercise_metrics
        WHERE user_id = $1
          AND custom_exercise_name = ANY($2::text[])
        `,
        [req.user.id, userExerciseNames]
      );
    }

    if (userExerciseIds.length > 0) {
      await client.query(
        `
        DELETE FROM user_exercises
        WHERE user_id = $1
          AND id = ANY($2::uuid[])
        `,
        [req.user.id, userExerciseIds]
      );
    }

    await client.query(
      `
      DELETE FROM exercise_groups
      WHERE id = $1 AND user_id = $2
      `,
      [groupId, req.user.id]
    );

    await client.query("COMMIT");

    res.json({
      message: "Группа и упражнения удалены",
      id: groupId,
      deletedExercisesCount: userExerciseIds.length,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Ошибка удаления группы упражнений:", error);

    res.status(500).json({
      error: "Не удалось удалить группу",
    });
  } finally {
    client.release();
  }
});

app.post("/api/exercise-groups", authMiddleware, async (req, res) => {
  try {
    const { name, color } = req.body;

    const trimmedName = String(name || "").trim();

    if (!trimmedName) {
      return res.status(400).json({
        error: "Введите название группы",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO exercise_groups (
        user_id,
        name,
        color
      )
      VALUES ($1, $2, $3)
      RETURNING id, name, color, created_at
      `,
      [req.user.id, trimmedName, color || "#E6F8FA"]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка создания группы упражнений:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        error: "Такая группа уже существует",
      });
    }

    res.status(500).json({
      error: "Ошибка создания группы упражнений",
    });
  }
});

app.get("/api/muscle-combinations", async (req, res) => {
  try {
    const { muscle } = req.query;

    if (!muscle) {
      return res.status(400).json({
        error: "Не указана группа мышц",
      });
    }

    const result = await pool.query(
      `
      SELECT recommended.name AS recommended_muscle_group
      FROM muscle_group_combinations mgc
      JOIN muscle_groups main ON main.id = mgc.main_muscle_group_id
      JOIN muscle_groups recommended ON recommended.id = mgc.recommended_muscle_group_id
      WHERE main.name = $1
      ORDER BY recommended.name
      `,
      [muscle]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка загрузки совместимых групп:", error);

    res.status(500).json({
      error: "Ошибка загрузки совместимых групп",
    });
  }
});

app.get("/api/calendar-events", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        description,
        start_datetime,
        end_datetime,
        color
      FROM calendar_events
      ORDER BY start_datetime;
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: "Ошибка при получении событий календаря",
      error: error.message,
    });
  }
});



app.delete("/api/task-groups/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM task_groups
      WHERE id = $1
        AND user_id = $2
      RETURNING id, name
      `,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Группа не найдена",
      });
    }

    res.json({
      success: true,
      deletedGroup: result.rows[0],
    });
  } catch (error) {
    console.error("Ошибка удаления группы задач:", error);

    res.status(500).json({
      error: "Ошибка удаления группы задач",
      message: error.message,
    });
  }
});

app.delete("/api/tasks", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      DELETE FROM tasks
      WHERE user_id = $1
      RETURNING *
      `,
      [userId]
    );

    res.json({
      message: "Все задачи пользователя удалены",
      deletedCount: result.rowCount,
    });
  } catch (error) {
    console.error("Ошибка удаления всех задач:", error);

    res.status(500).json({
      message: "Ошибка при удалении всех задач",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

app.patch("/api/workout-exercises/:id/complete", authMiddleware, async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = req.user.id;
    const { id } = req.params;

    await client.query("BEGIN");

    const exerciseResult = await client.query(
      `
      UPDATE workout_exercises we
      SET is_completed = NOT COALESCE(we.is_completed, false)
      FROM workouts w
      JOIN tasks t ON t.id = w.task_id
      WHERE we.workout_id = w.id
        AND we.id = $1
        AND t.user_id = $2
      RETURNING
        we.id,
        we.workout_id,
        we.is_completed,
        t.id AS task_id
      `,
      [id, userId]
    );

    if (exerciseResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Упражнение не найдено",
      });
    }

    const updatedExercise = exerciseResult.rows[0];

    const workoutProgressResult = await client.query(
      `
      SELECT
        COUNT(*)::int AS total_count,
        COUNT(*) FILTER (WHERE is_completed = true)::int AS completed_count
      FROM workout_exercises
      WHERE workout_id = $1
      `,
      [updatedExercise.workout_id]
    );

    const totalCount = Number(workoutProgressResult.rows[0].total_count || 0);
    const completedCount = Number(workoutProgressResult.rows[0].completed_count || 0);

    const nextTaskStatus =
      totalCount > 0 && completedCount === totalCount
        ? "completed"
        : completedCount > 0
          ? "in_progress"
          : "planned";

    await client.query(
      `
      UPDATE tasks
      SET status = $1::task_status
      WHERE id = $2
        AND user_id = $3
      `,
      [nextTaskStatus, updatedExercise.task_id, userId]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      exercise: updatedExercise,
      workoutProgress: {
        totalCount,
        completedCount,
        status: nextTaskStatus,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Ошибка переключения упражнения:", error);

    res.status(500).json({
      error: "Ошибка переключения упражнения",
      message: error.message,
    });
  } finally {
    client.release();
  }
});

app.get("/api/task-groups", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        color,
        created_at
      FROM task_groups
      WHERE user_id = $1
      ORDER BY created_at ASC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка загрузки групп задач:", error);

    res.status(500).json({
      error: "Ошибка загрузки групп задач",
      message: error.message,
    });
  }
});

//WW
function getPedantRank(activeDays) {
  const days = Number(activeDays || 0);

  if (days >= 100) {
    return {
      title: "Педант",
      subtitle: "100 дней дисциплины",
      milestone: 100,
      starTier: Math.min(Math.floor((days - 100) / 25), 10),
    };
  }

  if (days >= 75) {
    return {
      title: "Мастер порядка",
      subtitle: "75 дней активности",
      milestone: 75,
      starTier: 0,
    };
  }

  if (days >= 50) {
    return {
      title: "Хранитель режима",
      subtitle: "50 дней активности",
      milestone: 50,
      starTier: 0,
    };
  }

  if (days >= 25) {
    return {
      title: "Организованный",
      subtitle: "25 дней активности",
      milestone: 25,
      starTier: 0,
    };
  }

  if (days >= 7) {
    return {
      title: "Стабильный",
      subtitle: "7 дней активности",
      milestone: 7,
      starTier: 0,
    };
  }

  if (days >= 2) {
    return {
      title: "Начинающий педант",
      subtitle: "2 дня активности",
      milestone: 2,
      starTier: 0,
    };
  }

  return {
    title: "Новичок порядка",
    subtitle: "Первый день активности",
    milestone: 1,
    starTier: 0,
  };
}

function getNextPedantMilestone(activeDays) {
  const days = Number(activeDays || 0);

  if (days < 2) return 2;
  if (days < 7) return 7;
  if (days < 25) return 25;
  if (days < 50) return 50;
  if (days < 75) return 75;
  if (days < 100) return 100;

  const nextStarMilestone = 100 + (Math.floor((days - 100) / 25) + 1) * 25;

  return Math.min(nextStarMilestone, 350);
}

function getActivityRank(activeDays) {
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
    return {
      title: "Педант",
      subtitle: "100 дней активности",
      starTier: 0,
    };
  }

  if (days >= 75) {
    return {
      title: "Несгибаемый",
      subtitle: "75 дней активности",
      starTier: 0,
    };
  }

  if (days >= 50) {
    return {
      title: "Железный режим",
      subtitle: "50 дней активности",
      starTier: 0,
    };
  }

  if (days >= 25) {
    return {
      title: "Системный",
      subtitle: "25 дней активности",
      starTier: 0,
    };
  }

  if (days >= 7) {
    return {
      title: "Стабильный",
      subtitle: "7 дней активности",
      starTier: 0,
    };
  }

  if (days >= 2) {
    return {
      title: "На серии",
      subtitle: "2 дня активности",
      starTier: 0,
    };
  }

  return {
    title: "Новичок порядка",
    subtitle: "Первый день активности",
    starTier: 0,
  };
}

//WW
app.post("/api/user-activity/today", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query(
      `
      INSERT INTO user_activity_days (user_id, activity_date)
      VALUES ($1, CURRENT_DATE)
      ON CONFLICT (user_id, activity_date) DO NOTHING
      `,
      [userId]
    );

    const activityResult = await pool.query(
      `
      SELECT activity_date::text AS activity_date
      FROM user_activity_days
      WHERE user_id = $1
      ORDER BY activity_date DESC
      `,
      [userId]
    );

    const activitySet = new Set(
      activityResult.rows.map((row) => String(row.activity_date).slice(0, 10))
    );

    let activeDays = 0;
    const cursorDate = new Date();

    cursorDate.setHours(12, 0, 0, 0);

    while (true) {
      const year = cursorDate.getFullYear();
      const month = String(cursorDate.getMonth() + 1).padStart(2, "0");
      const day = String(cursorDate.getDate()).padStart(2, "0");
      const dateKey = `${year}-${month}-${day}`;

      if (!activitySet.has(dateKey)) {
        break;
      }

      activeDays += 1;
      cursorDate.setDate(cursorDate.getDate() - 1);
    }

    const rank = getActivityRank(activeDays);

    const milestones = [
      2, 7, 25, 50, 75, 100,
      125, 150, 175, 200, 225, 250, 275, 300,
    ];

    const nextMilestone =
      milestones.find((milestone) => milestone > activeDays) || null;

    const previousMilestone =
      [...milestones].reverse().find((milestone) => milestone <= activeDays) || 0;

    const progressPercent = nextMilestone
      ? Math.round(
          ((activeDays - previousMilestone) /
            (nextMilestone - previousMilestone)) *
            100
        )
      : 100;

    res.json({
      activeDays,
      totalActiveDays: activitySet.size,
      rank,
      nextMilestone,
      daysToNextMilestone: nextMilestone ? nextMilestone - activeDays : 0,
      progressPercent,
    });
  } catch (error) {
    console.error("Ошибка обновления активности пользователя:", error);

    res.status(500).json({
      error: "Ошибка обновления активности пользователя",
      message: error.message,
    });
  }
});

//WW
app.get("/api/calendar/:year/holidays", async (req, res) => {
  const year = Number(req.params.year);

  try {
    if (!Number.isInteger(year) || year < 2020 || year > 2030) {
      return res.json({
        year,
        months: [],
        days: [],
        status: 200,
        source: "fallback",
      });
    }

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 3500);

    const response = await fetch(
      `https://calendar.kuzyak.in/api/calendar/${year}`,
      {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
          Referer: "https://calendar.kuzyak.in/",
        },
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn("Kuzyak API status:", response.status);

      return res.json({
        year,
        months: [],
        days: [],
        status: 200,
        source: "fallback",
      });
    }

    const data = await response.json();

    return res.json({
      ...data,
      source: "kuzyak",
    });
  } catch (error) {
  const year = Number(req.params.year);
  const months = [];

  for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    let notWorkingDays = 0;

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, monthIndex, day);
      const dayOfWeek = date.getDay();

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        notWorkingDays += 1;
      }
    }

    months.push({
      id: monthIndex,
      notWorkingDays,
    });
  }

  return res.json({
    year,
    source: "fallback",
    days: [],
    months,
  });
}
});

//WW
app.get("/api/import/wger/exercises-preview", async (req, res) => {
  try {
    const response = await fetch(
      "https://wger.de/api/v2/exercise/?language=2&limit=20"
    );

    if (!response.ok) {
      console.error("Wger API status:", response.status);

      return res.status(response.status).json({
        error: "Не удалось получить упражнения из wger",
      });
    }

    const data = await response.json();

    res.json({
      count: data.count,
      next: data.next,
      results: data.results.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        description: exercise.description,
        category: exercise.category,
        muscles: exercise.muscles,
        muscles_secondary: exercise.muscles_secondary,
        equipment: exercise.equipment,
      })),
    });
  } catch (error) {
    console.error("Ошибка проверки wger:", error);

    res.status(500).json({
      error: "Ошибка проверки wger",
    });
  }
});

//WW
app.put("/api/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const {
      title,
      description,
      subtasks,
      priority,
      start_datetime,
      end_datetime,
      group_id,
    } = req.body;

    const trimmedTitle = String(title || "").trim();

    if (!trimmedTitle) {
      return res.status(400).json({
        error: "Название задачи обязательно",
      });
    }

    if (trimmedTitle.length > 60) {
      return res.status(400).json({
        error: "Название задачи не должно быть длиннее 60 символов",
      });
    }

    const preparedSubtasks = Array.isArray(subtasks)
      ? subtasks
          .map((item) => {
            if (typeof item === "string") {
              return {
                id: crypto.randomUUID(),
                title: item.trim(),
                is_completed: false,
              };
            }

            return {
              id: item.id || crypto.randomUUID(),
              title: String(item.title || "").trim(),
              is_completed: Boolean(item.is_completed),
            };
          })
          .filter((item) => item.title)
          .slice(0, 7)
      : [];

    const result = await pool.query(
      `
      UPDATE tasks
      SET
        title = $1,
        description = $2,
        subtasks = $3::jsonb,
        priority = $4,
        start_datetime = $5,
        end_datetime = $6,
        group_id = $7
      WHERE id = $8
        AND user_id = $9
      RETURNING *
      `,
      [
        trimmedTitle,
        description || "",
        JSON.stringify(preparedSubtasks),
        priority || "medium",
        start_datetime || null,
        end_datetime || null,
        group_id || null,
        id,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Задача не найдена",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка обновления задачи:", error);

    res.status(500).json({
      error: "Ошибка обновления задачи",
      message: error.message,
    });
  }
});

app.delete("/api/workouts/:taskId", authMiddleware, async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = req.user.id;
    const { taskId } = req.params;

    await client.query("BEGIN");

    const taskResult = await client.query(
      `
      SELECT id
      FROM tasks
      WHERE id = $1
        AND user_id = $2
      LIMIT 1
      `,
      [taskId, userId]
    );

    if (taskResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Тренировка не найдена",
      });
    }

    await client.query(
      `
      DELETE FROM tasks
      WHERE id = $1
        AND user_id = $2
      `,
      [taskId, userId]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Ошибка удаления тренировки:", error);

    res.status(500).json({
      error: "Ошибка удаления тренировки",
      message: error.message,
    });
  } finally {
    client.release();
  }
});

app.put("/api/workouts/:taskId", authMiddleware, async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = req.user.id;
    const { taskId } = req.params;

    const {
      title,
      description,
      priority,
      muscle_groups,
      repeat_days,
      exercises,
    } = req.body;

    const trimmedTitle = String(title || "").trim();

    if (!trimmedTitle) {
      return res.status(400).json({
        error: "Название тренировки обязательно",
      });
    }

    if (!Array.isArray(muscle_groups) || muscle_groups.length === 0) {
      return res.status(400).json({
        error: "Выберите хотя бы одну группу мышц",
      });
    }

    if (!Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({
        error: "Добавьте хотя бы одно упражнение",
      });
    }

    await client.query("BEGIN");

    const taskResult = await client.query(
      `
      SELECT id
      FROM tasks
      WHERE id = $1
        AND user_id = $2
        AND task_type = 'workout'
      LIMIT 1
      `,
      [taskId, userId]
    );

    if (taskResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Тренировка не найдена" });
    }

    await client.query(
      `
      UPDATE tasks
      SET
        title = $1,
        description = $2,
        priority = $3
      WHERE id = $4
        AND user_id = $5
      `,
      [
        trimmedTitle,
        description || "",
        priority || "medium",
        taskId,
        userId,
      ]
    );

    const mainMuscleGroupName = muscle_groups[0];

    const mainMuscleGroupResult = await client.query(
      `
      SELECT id
      FROM muscle_groups
      WHERE name = $1
      LIMIT 1
      `,
      [mainMuscleGroupName]
    );

    const mainMuscleGroupId = mainMuscleGroupResult.rows[0]?.id || null;

    const workoutResult = await client.query(
      `
      UPDATE workouts
      SET
        main_muscle_group_id = $1,
        repeat_days = $2
      WHERE task_id = $3
      RETURNING id
      `,
      [
        mainMuscleGroupId,
        Array.isArray(repeat_days) ? repeat_days : [],
        taskId,
      ]
    );

    if (workoutResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Тренировка не найдена" });
    }

    const workoutId = workoutResult.rows[0].id;

    await client.query(
      `
      DELETE FROM workout_exercises
      WHERE workout_id = $1
      `,
      [workoutId]
    );

    for (const exercise of exercises) {
      const exerciseName = String(exercise.name || "").trim();

      if (!exerciseName) {
        continue;
      }

      let baseExerciseId = exercise.exercise_id || null;
      let userExerciseId = exercise.user_exercise_id || null;

      if (!baseExerciseId && !userExerciseId) {
        const existingUserExercise = await client.query(
          `
          SELECT id
          FROM user_exercises
          WHERE user_id = $1
            AND LOWER(name) = LOWER($2)
          LIMIT 1
          `,
          [userId, exerciseName]
        );

        if (existingUserExercise.rows.length > 0) {
          userExerciseId = existingUserExercise.rows[0].id;
        } else {
          const newUserExercise = await client.query(
            `
            INSERT INTO user_exercises (
              user_id,
              name,
              description,
              difficulty,
              equipment,
              is_premium,
              measure_type,
              measure_units
            )
            VALUES ($1, $2, NULL, 'Средняя', NULL, false, 'weight_reps', '["kg"]'::jsonb)
            RETURNING id
            `,
            [userId, exerciseName]
          );

          userExerciseId = newUserExercise.rows[0].id;
        }
      }

      const setsCount =
        exercise.sets_count === "" ||
        exercise.sets_count === null ||
        exercise.sets_count === undefined
          ? 0
          : Number(exercise.sets_count);

      const repsCount =
        exercise.reps_count === "" ||
        exercise.reps_count === null ||
        exercise.reps_count === undefined ||
        Number(exercise.reps_count) <= 0
          ? null
          : Number(exercise.reps_count);

      const weightKg =
        exercise.weight_kg === "" ||
        exercise.weight_kg === null ||
        exercise.weight_kg === undefined
          ? null
          : Number(exercise.weight_kg);

      await client.query(
        `
        INSERT INTO workout_exercises (
          workout_id,
          exercise_id,
          user_exercise_id,
          sets_count,
          reps_count,
          weight_kg,
          is_completed
        )
        VALUES ($1, $2, $3, $4, $5, $6, false)
        `,
        [
          workoutId,
          baseExerciseId,
          userExerciseId,
          setsCount,
          repsCount,
          weightKg,
        ]
      );
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      task_id: taskId,
      workout_id: workoutId,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Ошибка редактирования тренировки:", error);

    res.status(500).json({
      error: "Ошибка редактирования тренировки",
      message: error.message,
    });
  } finally {
    client.release();
  }
});

app.patch("/api/profile/username", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const username = String(req.body.username || "").trim();

    if (username.length < 3) {
      return res.status(400).json({
        error: "Логин должен быть не короче 3 символов",
      });
    }

    if (username.length > 30) {
      return res.status(400).json({
        error: "Логин должен быть не длиннее 30 символов",
      });
    }

    const existsResult = await pool.query(
      `
      SELECT id
      FROM users
      WHERE LOWER(username) = LOWER($1)
        AND id <> $2
      LIMIT 1
      `,
      [username, userId]
    );

    if (existsResult.rows.length > 0) {
      return res.status(409).json({
        error: "Такой логин уже занят",
      });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET username = $1
      WHERE id = $2
      RETURNING id, username, email, role, avatar_url, created_at
      `,
      [username, userId]
    );

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Ошибка изменения логина:", error);

    res.status(500).json({
      error: "Ошибка изменения логина",
      message: error.message,
    });
  }
});

app.patch("/api/profile/email", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return res.status(400).json({
        error: "Введите корректную почту",
      });
    }

    const existsResult = await pool.query(
      `
      SELECT id
      FROM users
      WHERE LOWER(email) = LOWER($1)
        AND id <> $2
      LIMIT 1
      `,
      [email, userId]
    );

    if (existsResult.rows.length > 0) {
      return res.status(409).json({
        error: "Такая почта уже используется",
      });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET email = $1
      WHERE id = $2
      RETURNING id, username, email, role, avatar_url, created_at
      `,
      [email, userId]
    );

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Ошибка изменения почты:", error);

    res.status(500).json({
      error: "Ошибка изменения почты",
      message: error.message,
    });
  }
});

app.patch("/api/profile/password", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const currentPassword = String(req.body.currentPassword || "");
    const newPassword = String(req.body.newPassword || "");

    if (!currentPassword) {
      return res.status(400).json({
        error: "Введите текущий пароль",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "Новый пароль должен быть не короче 6 символов",
      });
    }

    const userResult = await pool.query(
      `
      SELECT id, password_hash
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: "Пользователь не найден",
      });
    }

    const user = userResult.rows[0];

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        error: "Текущий пароль указан неверно",
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `
      UPDATE users
      SET password_hash = $1
      WHERE id = $2
      `,
      [passwordHash, userId]
    );

    res.json({
      success: true,
    });
  } catch (error) {
    console.error("Ошибка изменения пароля:", error);

    res.status(500).json({
      error: "Ошибка изменения пароля",
      message: error.message,
    });
  }
});

app.get("/api/friends", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const friendsResult = await pool.query(
      `
      SELECT
        u.id,
        u.username,
        u.email,
        u.avatar_url,
        uf.created_at
      FROM user_friends uf
      JOIN users u ON u.id = uf.friend_id
      WHERE uf.user_id = $1
      ORDER BY u.username ASC
      `,
      [userId]
    );

    const incomingRequestsResult = await pool.query(
  `
  SELECT
    fr.id,
    fr.sender_id,
    u.username,
    u.email,
    u.avatar_url,
    fr.created_at
  FROM friend_requests fr
  JOIN users u ON u.id = fr.sender_id
  WHERE fr.receiver_id = $1
    AND fr.status = 'pending'
  ORDER BY fr.created_at DESC
  `,
  [userId]
);

    res.json({
      friends: friendsResult.rows,
      incomingRequests: incomingRequestsResult.rows,
    });
  } catch (error) {
    console.error("Ошибка загрузки друзей:", error);

    res.status(500).json({
      error: "Ошибка загрузки друзей",
      message: error.message,
    });
  }
});

app.post("/api/friends/requests", authMiddleware, async (req, res) => {
  try {
    const senderId = req.user.id;
    const username = String(req.body.username || "").trim();

    if (!username) {
      return res.status(400).json({
        error: "Введите логин пользователя",
      });
    }

    const receiverResult = await pool.query(
      `
      SELECT id, username, email
      FROM users
      WHERE LOWER(username) = LOWER($1)
      LIMIT 1
      `,
      [username]
    );

    if (receiverResult.rows.length === 0) {
      return res.status(404).json({
        error: "Пользователь с таким логином не найден",
      });
    }

    const receiver = receiverResult.rows[0];

    if (String(receiver.id) === String(senderId)) {
      return res.status(400).json({
        error: "Нельзя добавить самого себя",
      });
    }

    const alreadyFriendsResult = await pool.query(
      `
      SELECT id
      FROM user_friends
      WHERE user_id = $1
        AND friend_id = $2
      LIMIT 1
      `,
      [senderId, receiver.id]
    );

    if (alreadyFriendsResult.rows.length > 0) {
      return res.status(409).json({
        error: "Этот пользователь уже у вас в друзьях",
      });
    }

    const existingRequestResult = await pool.query(
      `
      SELECT id, sender_id, receiver_id, status
      FROM friend_requests
      WHERE status = 'pending'
        AND (
          (sender_id = $1 AND receiver_id = $2)
          OR
          (sender_id = $2 AND receiver_id = $1)
        )
      LIMIT 1
      `,
      [senderId, receiver.id]
    );

    if (existingRequestResult.rows.length > 0) {
      return res.status(409).json({
        error: "Заявка между вами уже существует",
      });
    }

    const requestResult = await pool.query(
      `
      INSERT INTO friend_requests (sender_id, receiver_id)
      VALUES ($1, $2)
      RETURNING id, sender_id, receiver_id, status, created_at
      `,
      [senderId, receiver.id]
    );

    res.status(201).json({
      success: true,
      request: requestResult.rows[0],
    });
  } catch (error) {
    console.error("Ошибка отправки заявки в друзья:", error);

    res.status(500).json({
      error: "Ошибка отправки заявки в друзья",
      message: error.message,
    });
  }
});

app.post("/api/friends/requests/:requestId/accept", authMiddleware, async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    await client.query("BEGIN");

    const requestResult = await client.query(
      `
      SELECT id, sender_id, receiver_id, status
      FROM friend_requests
      WHERE id = $1
        AND receiver_id = $2
        AND status = 'pending'
      LIMIT 1
      `,
      [requestId, userId]
    );

    if (requestResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Заявка не найдена",
      });
    }

    const request = requestResult.rows[0];

    await client.query(
      `
      UPDATE friend_requests
      SET status = 'accepted',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [requestId]
    );

    await client.query(
      `
      INSERT INTO user_friends (user_id, friend_id)
      VALUES ($1, $2), ($2, $1)
      ON CONFLICT (user_id, friend_id) DO NOTHING
      `,
      [request.sender_id, request.receiver_id]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Ошибка принятия заявки:", error);

    res.status(500).json({
      error: "Ошибка принятия заявки",
      message: error.message,
    });
  } finally {
    client.release();
  }
});

app.post("/api/friends/requests/:requestId/decline", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    const result = await pool.query(
      `
      UPDATE friend_requests
      SET status = 'declined',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
        AND receiver_id = $2
        AND status = 'pending'
      RETURNING id
      `,
      [requestId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Заявка не найдена",
      });
    }

    res.json({
      success: true,
    });
  } catch (error) {
    console.error("Ошибка отклонения заявки:", error);

    res.status(500).json({
      error: "Ошибка отклонения заявки",
      message: error.message,
    });
  }
});

app.delete("/api/friends/:friendId", authMiddleware, async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    await client.query("BEGIN");

    await client.query(
      `
      DELETE FROM user_friends
      WHERE 
        (user_id = $1 AND friend_id = $2)
        OR
        (user_id = $2 AND friend_id = $1)
      `,
      [userId, friendId]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Ошибка удаления друга:", error);

    res.status(500).json({
      error: "Ошибка удаления друга",
      message: error.message,
    });
  } finally {
    client.release();
  }
});

app.get("/api/users/:userId/public-profile", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;

    const friendCheckResult = await pool.query(
      `
      SELECT id
      FROM user_friends
      WHERE user_id = $1
        AND friend_id = $2
      LIMIT 1
      `,
      [currentUserId, userId]
    );

    if (
      friendCheckResult.rows.length === 0 &&
      String(currentUserId) !== String(userId)
    ) {
      return res.status(403).json({
        error: "Профиль доступен только друзьям",
      });
    }

    const userResult = await pool.query(
      `
      SELECT
        id,
        username,
        email,
        avatar_url,
        created_at
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: "Пользователь не найден",
      });
    }

    const activityResult = await pool.query(
      `
      SELECT activity_date::text AS activity_date
      FROM user_activity_days
      WHERE user_id = $1
      ORDER BY activity_date DESC
      `,
      [userId]
    );

    const activitySet = new Set(
      activityResult.rows.map((row) => String(row.activity_date).slice(0, 10))
    );

    let activeDays = 0;
    const cursorDate = new Date();

    cursorDate.setHours(12, 0, 0, 0);

    while (true) {
      const year = cursorDate.getFullYear();
      const month = String(cursorDate.getMonth() + 1).padStart(2, "0");
      const day = String(cursorDate.getDate()).padStart(2, "0");
      const dateKey = `${year}-${month}-${day}`;

      if (!activitySet.has(dateKey)) {
        break;
      }

      activeDays += 1;
      cursorDate.setDate(cursorDate.getDate() - 1);
    }

    res.json({
      user: userResult.rows[0],
      pedantTracker: {
        activeDays,
        totalActiveDays: activitySet.size,
        rank: getActivityRank(activeDays),
      },
    });
  } catch (error) {
    console.error("Ошибка загрузки публичного профиля:", error);

    res.status(500).json({
      error: "Ошибка загрузки публичного профиля",
      message: error.message,
    });
  }
});


//WW
//WW
app.listen(PORT, () => {
  console.log(`Backend запущен: http://localhost:${PORT}`);
});

