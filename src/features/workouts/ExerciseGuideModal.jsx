import React from "react";

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

export default ExerciseGuideModal;