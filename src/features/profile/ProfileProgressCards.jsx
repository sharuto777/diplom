import React, { useEffect, useRef, useState } from "react";
import { StreakFireIcon } from "../../components/common/Icons";
import {
  BASE_RANK_LEVELS,
  RANK_STAR_NOTE,
  formatCompactDaysLabel,
  getRankDisplayTitle,
} from "../../utils/activityRank";

function RankInfoButton() {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleOutsideClick(event) {
      if (!wrapRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div
      ref={wrapRef}
      className={`rank-card-info${isOpen ? " is-open" : ""}`}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        className="rank-card-info-btn"
        aria-label="Звания трекера"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 10V16" />
          <circle cx="12" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      </button>

      <div className="rank-card-info-popover" role="tooltip">
        <p className="rank-card-info-title">Звания</p>

        <ul className="rank-card-info-list">
          {BASE_RANK_LEVELS.map((level) => (
            <li key={level.minDays}>
              <span>{formatCompactDaysLabel(level.minDays)}</span>
              <span>{level.title}</span>
            </li>
          ))}
        </ul>

        <p className="rank-card-info-note">{RANK_STAR_NOTE}</p>
      </div>
    </div>
  );
}

function ProfileProgressCards({ pedantTracker }) {
  const activeDays = pedantTracker?.activeDays || 1;

  const rank = pedantTracker?.rank || {
    title: "Новичок порядка",
    subtitle: "Первый день активности",
    starTier: 0,
  };

  const tierThresholds = [1, 2, 7, 25, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300];
  const currentTierIndex = tierThresholds.findIndex((threshold) => activeDays < threshold);
  const currentTier = currentTierIndex === -1 ? tierThresholds.length : currentTierIndex;
  const nextThreshold = tierThresholds[currentTier] || 350;
  const prevThreshold = tierThresholds[currentTier - 1] || 0;
  const progressToNext = Math.min(
    100,
    Math.round(((activeDays - prevThreshold) / (nextThreshold - prevThreshold)) * 100)
  );

  const rankColors = {
    0: "#eab308",
    1: "#f59e0b",
    2: "#f97316",
    3: "#8b5cf6",
    4: "#06b6d4",
    5: "#10b981",
    6: "#ef4444",
    7: "#8b5cf6",
    8: "#f43f5e",
    9: "#0ea5e9",
  };
  const currentColor = rankColors[Math.min(currentTier, 9)] || "#eab308";
  const rankTitle = getRankDisplayTitle(rank);

  return (
    <section className="profile-progress-strip">
      <article className="profile-progress-tile creative streak">
        <div className="tile-icon streak-fire-icon-wrap">
          <StreakFireIcon className="streak-fire-icon" size={28} />
        </div>

        <div className="tile-content">
          <div className="tile-value">{activeDays}</div>
          <div className="tile-label">дней подряд</div>
          <div className="tile-sub">серия активности</div>
        </div>
      </article>

      <article className="profile-progress-tile creative rank">
        <RankInfoButton />

        <div className="tile-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2L14.09 8.26L21 9.27L16.55 14.14L17.82 21.02L12 17.77L6.18 21.02L7.45 14.14L3 9.27L9.91 8.26L12 2Z"
              fill="#FBBF24"
            />
          </svg>
        </div>

        <div className="tile-content">
          <div className="tile-value" style={{ color: currentColor }}>
            {rankTitle}
          </div>
          <div className="tile-label">ранг</div>
          <div className="rank-progress-mini">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressToNext}%`, background: currentColor }}
              />
            </div>
            <span>
              {activeDays}/{nextThreshold}
            </span>
          </div>
        </div>
      </article>
    </section>
  );
}

export default ProfileProgressCards;