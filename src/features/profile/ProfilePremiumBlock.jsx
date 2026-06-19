import React from "react";
import { PremiumCrownIcon } from "../../components/common/Icons";

function formatPremiumExpiresDate(dateValue) {
  if (!dateValue) {
    return "без ограничения по сроку";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "не указано";
  }

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function ProfilePremiumBlock({ subscription, isPremiumUser, onOpenPremium }) {
  const isPremium = isPremiumUser || subscription?.code === "premium";
  const expiresAt = subscription?.expires_at || subscription?.expiresAt;

  return (
    <section className="profile-premium-card">
      <div className="profile-premium-head">
        <h3>Премиум</h3>
      </div>

      {isPremium ? (
        <div className="profile-premium-content">
          <div className="profile-premium-status">
            <span className="profile-premium-status-icon" aria-hidden="true">
              <PremiumCrownIcon />
            </span>
            <div>
              <strong>Premium активен</strong>
              <p>
                Действует до{" "}
                <span>{formatPremiumExpiresDate(expiresAt)}</span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="profile-premium-content">
          <div className="profile-premium-empty">
            <p>Premium не подключён</p>
            <button
              type="button"
              className="profile-premium-connect-btn"
              onClick={() => onOpenPremium?.()}
            >
              Подключить
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default ProfilePremiumBlock;