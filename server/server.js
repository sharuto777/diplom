const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

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
    await client.query("ROLLBACK");

    console.error("Ошибка регистрации:", error);

    res.status(500).json({
      error: "Ошибка регистрации пользователя",
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
              'id', e.id,
              'name', e.name,
              'is_completed', we.is_completed
            )
          ) FILTER (WHERE e.id IS NOT NULL),
          '[]'
        ) AS exercises
      FROM tasks t
      LEFT JOIN task_groups tg ON tg.id = t.group_id
      LEFT JOIN task_categories c ON c.id = t.category_id
      LEFT JOIN workouts w ON w.task_id = t.id
      LEFT JOIN muscle_groups mg ON mg.id = w.main_muscle_group_id
      LEFT JOIN workout_exercises we ON we.workout_id = w.id
      LEFT JOIN exercises e ON e.id = we.exercise_id
      WHERE t.user_id = $1
      GROUP BY
        t.id,
        t.title,
        t.description,
        t.micro_step,
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
      micro_step,
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

    const result = await pool.query(
      `
      INSERT INTO tasks (
        user_id,
        category_id,
        group_id,
        title,
        description,
        micro_step,
        priority,
        status,
        start_datetime,
        end_datetime
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'new', $8, $9)
      RETURNING *
      `,
      [
        userId,
        categoryId,
        group_id || null,
        trimmedTitle,
        description || "",
        micro_step || "",
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

    if (!title || !title.trim()) {
      return res.status(400).json({
        error: "Название тренировки обязательно",
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
        title,
        description,
        priority,
        status
      )
      VALUES ($1, $2, $3, $4, $5, 'planned')
      RETURNING id
      `,
      [
        userId,
        categoryId,
        title.trim(),
        description || "",
        priority || "medium",
      ]
    );

    const taskId = taskResult.rows[0].id;

    const mainMuscleGroupName =
      muscle_groups && muscle_groups.length > 0
        ? muscle_groups[0]
        : "Спина";

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
        repeat_days || [],
      ]
    );

    const workoutId = workoutResult.rows[0].id;

    if (exercises && exercises.length > 0) {
      for (const exercise of exercises) {
        await client.query(
          `
          INSERT INTO workout_exercises (
            workout_id,
            exercise_id,
            sets_count,
            reps_count,
            weight_kg,
            is_completed
          )
          VALUES ($1, $2, $3, $4, $5, false)
          `,
          [
            workoutId,
            exercise.exercise_id,
            exercise.sets_count || 3,
            exercise.reps_count || 10,
            exercise.weight_kg || null,
          ]
        );
      }
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

app.get("/api/statistics/extended", authMiddleware, requirePremium, async (req, res) => {
  res.json({
    message: "Расширенная статистика Premium",
  });
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

app.get("/api/exercises", async (req, res) => {
  try {
    const { muscle } = req.query;

    let result;

    if (muscle) {
      result = await pool.query(
        `
        SELECT
          e.id,
          e.name,
          e.description,
          e.difficulty,
          e.equipment,
          e.is_premium,
          mg.name AS muscle
        FROM exercises e
        JOIN exercise_muscle_groups emg ON emg.exercise_id = e.id
        JOIN muscle_groups mg ON mg.id = emg.muscle_group_id
        WHERE mg.name = $1
        ORDER BY e.name
        `,
        [muscle]
      );
    } else {
      result = await pool.query(
        `
        SELECT
          e.id,
          e.name,
          e.description,
          e.difficulty,
          e.equipment,
          e.is_premium,
          mg.name AS muscle
        FROM exercises e
        LEFT JOIN exercise_muscle_groups emg ON emg.exercise_id = e.id
        LEFT JOIN muscle_groups mg ON mg.id = emg.muscle_group_id
        ORDER BY e.name
        `
      );
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка загрузки упражнений:", error);

    res.status(500).json({
      error: "Ошибка загрузки упражнений",
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
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE workout_exercises we
      SET is_completed = true
      FROM workouts w
      JOIN tasks t ON t.id = w.task_id
      WHERE we.workout_id = w.id
        AND we.id = $1
        AND t.user_id = $2
      RETURNING we.id, we.is_completed
      `,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Упражнение не найдено",
      });
    }

    res.json({
      success: true,
      exercise: result.rows[0],
    });
  } catch (error) {
    console.error("Ошибка завершения упражнения:", error);

    res.status(500).json({
      error: "Ошибка завершения упражнения",
      message: error.message,
    });
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

app.listen(PORT, () => {
  console.log(`Backend запущен: http://localhost:${PORT}`);
});

