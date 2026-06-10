import React from "react";
import Badge from "../../components/common/Badge";

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

export default WorkoutCard;