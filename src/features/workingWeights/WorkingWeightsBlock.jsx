import React from "react";
import ExerciseMetricCard from "./ExerciseMetricCard";

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
export default WorkingWeightsBlock;