import React from "react";
import { PremiumCrownIcon } from "./Icons";

function PremiumModal({ isOpen, onClose, onActivate }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <article className="simple-modal premium-modal">
        <div className="premium-modal-icon">
          <PremiumCrownIcon />
        </div>

        <h2>Premium-доступ</h2>

        <p>
          Эта функция доступна только пользователям Premium. Подключите Premium,
          чтобы открыть расширенные возможности приложения.
        </p>

        <div className="premium-modal-actions">
          <button
            type="button"
            className="primary-btn"
            onClick={onActivate}
          >
            Подключить Premium
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={onClose}
          >
            Позже
          </button>
        </div>
      </article>
    </div>
  );
}

export default PremiumModal;