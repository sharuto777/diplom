import React, { useState } from "react";
import { SaveCheckIcon } from "../../components/common/Icons";
import { API_URL } from "../../api/apiClient";

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

export default ProfileSecurityModal;