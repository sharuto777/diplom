const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
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

app.get("/api/tasks", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        t.id,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.start_datetime,
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
      WHERE t.user_id = (
        SELECT id FROM users WHERE username = 'demo_user'
      )
      GROUP BY
        t.id,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.start_datetime,
        t.group_id,
        tg.name,
        tg.color,
        c.name,
        w.id,
        w.repeat_days,
        mg.name
      ORDER BY t.created_at DESC
      `
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

app.get("/api/task-groups", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        color,
        created_at
      FROM task_groups
      WHERE user_id = (
        SELECT id FROM users WHERE username = 'demo_user'
      )
      ORDER BY created_at ASC
      `
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

app.post("/api/task-groups", async (req, res) => {
  try {
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
      SELECT
        u.id,
        $1,
        $2
      FROM users u
      WHERE u.username = 'demo_user'
      RETURNING id, name, color, created_at
      `,
      [name.trim(), color || "#E6F8FA"]
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

app.post("/api/tasks", async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      start_datetime,
      end_datetime,
      group_id,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Название задачи обязательно",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO tasks (
        user_id,
        category_id,
        group_id,
        title,
        description,
        task_type,
        status,
        priority,
        start_datetime,
        end_datetime
      )
      SELECT
        u.id,
        c.id,
        $6,
        $1,
        $2,
        'regular'::task_type,
        'new'::task_status,
        $3::task_priority,
        $4,
        $5
      FROM users u
      LEFT JOIN task_categories c ON c.name = $7
      WHERE u.username = 'demo_user'
      RETURNING *;
      `,
      [
        title.trim(),
        description || null,
        priority || "medium",
        start_datetime || null,
        end_datetime || null,
        group_id || null,
        category || "Личное",
      ]
    );

    const task = result.rows[0];

    if (task.start_datetime) {
      await pool.query(
        `
        INSERT INTO calendar_events (
          user_id,
          task_id,
          title,
          description,
          start_datetime,
          end_datetime,
          color
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          '#3b82f6'
        );
        `,
        [
          task.user_id,
          task.id,
          task.title,
          task.description,
          task.start_datetime,
          task.end_datetime,
        ]
      );
    }

    res.status(201).json(task);
  } catch (error) {
    console.error("Ошибка создания задачи:", error);

    res.status(500).json({
      message: "Ошибка при создании задачи",
      error: error.message,
    });
  }
});

app.post("/api/workouts", async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      title,
      description,
      priority,
      muscle_groups,
      repeat_days,
      exercises,
    } = req.body;

    await client.query("BEGIN");

    const userResult = await client.query(
      "SELECT id FROM users WHERE username = $1",
      ["demo_user"]
    );

    const userId = userResult.rows[0].id;

    const categoryResult = await client.query(
      "SELECT id FROM task_categories WHERE name = $1",
      ["Тренировка"]
    );

    const categoryId = categoryResult.rows[0].id;

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
        title,
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

    res.json({
      success: true,
      task_id: taskId,
      workout_id: workoutId,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Ошибка создания тренировки:", error);

    res.status(500).json({
      error: "Ошибка создания тренировки",
    });
  } finally {
    client.release();
  }
});

app.patch("/api/tasks/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE tasks
      SET status = CASE
        WHEN status = 'completed'::task_status THEN 'in_progress'::task_status
        ELSE 'completed'::task_status
      END
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка обновления задачи:", error);
    res.status(500).json({ error: "Ошибка обновления задачи" });
  }
});

app.delete("/api/tasks", async (req, res) => {
  try {
    const result = await pool.query(`
      DELETE FROM tasks
      WHERE user_id = (
        SELECT id
        FROM users
        WHERE username = 'demo_user'
      )
      RETURNING *;
    `);

    res.json({
      message: "Все задачи удалены",
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

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM tasks
      WHERE id = $1
      RETURNING *;
      `,
      [id]
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
    const result = await pool.query(`
      SELECT id, name, description
      FROM muscle_groups
      ORDER BY name;
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: "Ошибка при получении групп мышц",
      error: error.message,
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
        message: "Не указана группа мышц",
      });
    }

    const result = await pool.query(
      `
      SELECT
        recommended.name AS recommended_muscle_group
      FROM muscle_group_combinations mgc
      JOIN muscle_groups main ON main.id = mgc.main_muscle_group_id
      JOIN muscle_groups recommended ON recommended.id = mgc.recommended_muscle_group_id
      WHERE main.name = $1
      ORDER BY recommended.name;
      `,
      [muscle]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: "Ошибка при получении совместимых групп мышц",
      error: error.message,
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

app.get("/api/task-groups", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        created_at
      FROM task_groups
      WHERE user_id = (
        SELECT id FROM users WHERE username = 'demo_user'
      )
      ORDER BY created_at ASC
      `
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

app.post("/api/task-groups", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "Название группы обязательно",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO task_groups (
        user_id,
        name
      )
      SELECT
        u.id,
        $1
      FROM users u
      WHERE u.username = 'demo_user'
      RETURNING id, name, created_at
      `,
      [name.trim()]
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

app.delete("/api/task-groups/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM task_groups
      WHERE id = $1
        AND user_id = (
          SELECT id FROM users WHERE username = 'demo_user'
        )
      RETURNING id, name
      `,
      [id]
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

const PORT = process.env.PORT || 5000;

app.patch("/api/workout-exercises/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE workout_exercises
      SET is_completed = true
      WHERE id = $1
      RETURNING id, is_completed
      `,
      [id]
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
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend запущен: http://localhost:${PORT}`);
});

