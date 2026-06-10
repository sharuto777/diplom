import React from "react";
import { ProfileSvgIcon } from "../../components/common/Icons";

function ProfileProgressCards({ pedantTracker }) {
  const activeDays = pedantTracker?.activeDays || 1;

  const rank = pedantTracker?.rank || {
    title: "Новичок порядка",
    subtitle: "Первый день активности",
    starTier: 0,
  };

  const hasStars = Number(rank.starTier || 0) > 0;

  return (
    <section className="profile-progress-strip">
      <article className="profile-progress-tile streak">
        <div className="profile-progress-tile-icon fire">
          <ProfileSvgIcon type="fire" />
        </div>

        <div className="profile-progress-tile-text">
          <span>Серия</span>
          <strong>{activeDays}</strong>
          <p>дней активности</p>
        </div>
      </article>

      <article className="profile-progress-tile rank">
        <div className="profile-progress-tile-icon badge">
          {hasStars ? (
            <ProfileSvgIcon name="shiny-star" />
          ) : (
            <ProfileSvgIcon name="star" />
          )}
        </div>

        <div className="profile-progress-tile-text rank-text">
          <span>Ранг</span>

          <div className="profile-rank-title-line">
            {hasStars ? (
              <ProfileRankStars tier={rank.starTier} />
            ) : (
              <strong>{rank.title || "Новичок порядка"}</strong>
            )}

            <div className="profile-rank-info-wrap">
              <button
                type="button"
                className="profile-rank-info-btn"
                aria-label="Информация о рангах"
                title="Информация о рангах"
              >
                i
              </button>

              <div className="profile-rank-tooltip">
                <h4>Ранги активности</h4>

                <div className="profile-rank-tooltip-list">
                  <p><strong>1 день</strong><span>Новичок порядка</span></p>
                  <p><strong>2 дня</strong><span>На серии</span></p>
                  <p><strong>7 дней</strong><span>Стабильный</span></p>
                  <p><strong>25 дней</strong><span>Системный</span></p>
                  <p><strong>50 дней</strong><span>Железный режим</span></p>
                  <p><strong>75 дней</strong><span>Несгибаемый</span></p>
                  <p><strong>100 дней</strong><span>Педант</span></p>
                  <p><strong>125 дней</strong><span>⭐</span></p>
                  <p><strong>150 дней</strong><span>✨</span></p>
                  <p><strong>175 дней</strong><span>✨ ⭐</span></p>
                  <p><strong>200 дней</strong><span>✨ ✨</span></p>
                  <p><strong>225 дней</strong><span>✨ ✨ ⭐</span></p>
                  <p><strong>250 дней</strong><span>✨ ✨ ✨</span></p>
                  <p><strong>275 дней</strong><span>✨ ✨ ✨ ⭐</span></p>
                  <p><strong>300 дней</strong><span>✨ ✨ ✨ ✨</span></p>
                </div>
              </div>
            </div>
          </div>

          <p>{rank.subtitle || "Первый день активности"}</p>
        </div>
      </article>
    </section>
  );
}

export default ProfileProgressCards;