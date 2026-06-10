import React from "react";

function ProfileSecurityBlock({ currentUser, onEdit }) {
  const username = currentUser?.username || "Не указан";
  const email = currentUser?.email || "Не указана";

  return (
    <section className="profile-security-card">
      <div className="profile-security-head">
  <div>
    <h3>Личные данные</h3>
  </div>
</div>

      <div className="profile-security-list">
        <div className="profile-security-row">
          <div>
            <strong>Логин</strong>
            <p>{username}</p>
          </div>

          <button type="button" onClick={() => onEdit("username")}>
            Изменить
          </button>
        </div>

        <div className="profile-security-row">
          <div>
            <strong>Почта</strong>
            <p>{email}</p>
          </div>

          <button type="button" onClick={() => onEdit("email")}>
            Изменить
          </button>
        </div>

        <div className="profile-security-row">
          <div>
            <strong>Пароль</strong>
            <p>••••••••</p>
          </div>

          <button type="button" onClick={() => onEdit("password")}>
            Изменить
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProfileSecurityBlock;