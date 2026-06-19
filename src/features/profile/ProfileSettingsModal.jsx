import React, { useState } from "react";
import { ProfileSvgIcon } from "../../components/common/Icons";
import { API_URL } from "../../api/apiClient";

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

export default ProfileSettingsModal;