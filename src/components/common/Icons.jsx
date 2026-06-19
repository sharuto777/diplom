import React from "react";

const strokePath = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function StrokeSvg({ className, children }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

function StrokePath({ d }) {
  return <path d={d} {...strokePath} />;
}

export function SaveCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M5 12.5L9.3 16.8L19 7.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NextArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M5 12H18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.7"
        strokeLinecap="round"
      />
      <path
        d="M13 7L18 12L13 17"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M19 12H6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.7"
        strokeLinecap="round"
      />
      <path
        d="M11 7L6 12L11 17"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LogoutSvgIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M10 6H6.8C5.8 6 5 6.8 5 7.8V16.2C5 17.2 5.8 18 6.8 18H10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 8L17 12L13 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 12H9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PremiumCrownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 14 14"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M6.87347 2.31807c0.0426 -0.05315 0.0893 -0.06807 0.12629 -0.06807 0.03699 0 0.08369 0.01492 0.12628 0.06807 0.79057 0.98651 1.85748 2.70386 2.44001 4.61119 0.06277 0.20553 0.22673 0.3644 0.43415 0.42065 0.2074 0.05625 0.4292 0.00199 0.5872 -0.14366l2.0219 -1.86372c0.2762 1.60637 0.0979 3.35192 -0.1252 4.60771 -0.1375 0.77426 -0.7611 1.36906 -1.5702 1.49396 -2.64021 0.4077 -5.18761 0.4077 -7.82778 0.0001 -0.80915 -0.1249 -1.43276 -0.7197 -1.57029 -1.49397 -0.22306 -1.25578 -0.4014 -3.00131 -0.12518 -4.60766l2.02153 1.86338c0.15802 0.14566 0.37978 0.19991 0.58719 0.14366 0.20741 -0.05624 0.37138 -0.21511 0.43416 -0.42064 0.58253 -1.90725 1.6494 -3.62452 2.43994 -4.611Zm3.56833 3.32234c-0.65875 -1.70586 -1.60327 -3.18428 -2.34033 -4.10402 -0.57312 -0.715186 -1.6303 -0.715186 -2.20343 0 -0.73703 0.91971 -1.68151 2.39805 -2.34027 4.10383l-1.5344 -1.41436C1.44528 3.693 0.412771 3.89828 0.226577 4.77681c-0.40725 1.92156 -0.1888222 3.99964 0.058519 5.39209 0.236012 1.3287 1.301334 2.3087 2.610314 2.5108 2.76657 0.4271 5.44263 0.4271 8.20919 -0.0001 1.3089 -0.2021 2.3742 -1.1821 2.6102 -2.5108 0.2474 -1.39244 0.4658 -3.47054 0.0586 -5.39213 -0.1862 -0.87853 -1.2187 -1.08381 -1.7968 -0.55095l-1.5348 1.41469Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function AvatarEditIcon() {
  return (
    <StrokeSvg className="menu-icon-svg">
      <StrokePath d="M4 8H7L8.5 6H15.5L17 8H20V18H4V8Z" />
      <StrokePath d="M12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15Z" />
    </StrokeSvg>
  );
}

export function ProfileSvgIcon({ name, type }) {
  const iconName = name || type || "activity";

  const icons = {
    activity: (
      <>
        <StrokePath d="M3 20H21" />
        <StrokePath d="M6 20V14" />
        <StrokePath d="M11 20V10" />
        <StrokePath d="M16 20V6" />
      </>
    ),

    tasks: (
      <>
        <StrokePath d="M8 6H20" />
        <StrokePath d="M8 12H20" />
        <StrokePath d="M8 18H20" />
        <StrokePath d="M4 6H4.01" />
        <StrokePath d="M4 12H4.01" />
        <StrokePath d="M4 18H4.01" />
      </>
    ),

    workouts: (
      <>
        <StrokePath d="M6 20V10" />
        <StrokePath d="M12 20V4" />
        <StrokePath d="M18 20V14" />
      </>
    ),

    premium: (
      <>
        <StrokePath d="M4 18H20" />
        <StrokePath d="M5 18L7 7L12 12L17 7L19 18" />
        <StrokePath d="M8 21H16" />
      </>
    ),

    fire: (
      <>
        <StrokePath d="M12 22C8.7 22 6 19.4 6 16.1C6 13.7 7.4 11.7 9.2 10.3C10.6 9.2 11.6 7.7 11.4 5.5C13.7 7 16 9.7 16 13C17 12.2 17.6 11.1 17.8 9.8C19.2 11.3 20 13.4 20 15.7C20 19.2 16.6 22 12 22Z" />
        <StrokePath d="M12 18.8C10.5 18.8 9.4 17.7 9.4 16.3C9.4 15.1 10.1 14.2 11.1 13.4C11.9 12.8 12.4 11.9 12.3 10.9C13.7 11.8 14.8 13.1 14.8 14.8C14.8 17 13.5 18.8 12 18.8Z" />
      </>
    ),

    rank: (
      <StrokePath d="M12 3L14.1 8.26L20 9.27L15.55 14.14L16.82 21.02L12 17.77L7.18 21.02L8.45 14.14L4 9.27L9.9 8.26L12 3Z" />
    ),

    star: (
      <StrokePath d="M12 3L14.1 8.26L20 9.27L15.55 14.14L16.82 21.02L12 17.77L7.18 21.02L8.45 14.14L4 9.27L9.9 8.26L12 3Z" />
    ),

    "shiny-star": (
      <>
        <StrokePath d="M12 3L14.1 8.26L20 9.27L15.55 14.14L16.82 21.02L12 17.77L7.18 21.02L8.45 14.14L4 9.27L9.9 8.26L12 3Z" />
        <StrokePath d="M19 4L19.5 5.5L21 6L19.5 6.5L19 8L18.5 6.5L17 6L18.5 5.5L19 4Z" />
      </>
    ),

    edit: (
      <>
        <StrokePath d="M4 8H7L8.5 6H15.5L17 8H20V18H4V8Z" />
        <StrokePath d="M12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15Z" />
      </>
    ),

    user: (
      <>
        <StrokePath d="M12 12C13.66 12 15 10.66 15 9C15 7.34 13.66 6 12 6C10.34 6 9 7.34 9 9C9 10.66 10.34 12 12 12Z" />
        <StrokePath d="M5 20C5.6 17.2 8.5 15 12 15C15.5 15 18.4 17.2 19 20" />
      </>
    ),

    mail: (
      <>
        <StrokePath d="M4 6H20V18H4V6Z" />
        <StrokePath d="M4 7L12 13L20 7" />
      </>
    ),
  };

  return (
    <StrokeSvg className="menu-icon-svg profile-svg-icon">
      {icons[iconName] || icons.activity}
    </StrokeSvg>
  );
}

export function MenuSvgIcon({ name }) {
  const icons = {
    Задачи: (
      <>
        <StrokePath d="M8 6H20" />
        <StrokePath d="M8 12H20" />
        <StrokePath d="M8 18H20" />
        <StrokePath d="M4 6H4.01" />
        <StrokePath d="M4 12H4.01" />
        <StrokePath d="M4 18H4.01" />
      </>
    ),

    Календарь: (
      <>
        <StrokePath d="M7 3V6" />
        <StrokePath d="M17 3V6" />
        <StrokePath d="M4 8H20" />
        <StrokePath d="M5 5H19V20H5V5Z" />
      </>
    ),

    "Рабочие веса": (
      <>
        <StrokePath d="M6 9V15" />
        <StrokePath d="M18 9V15" />
        <StrokePath d="M3 10.5V13.5" />
        <StrokePath d="M21 10.5V13.5" />
        <StrokePath d="M6 12H18" />
      </>
    ),

    Гайды: (
      <>
        <StrokePath d="M5 4H15C17.2 4 19 5.8 19 8V20H7C5.9 20 5 19.1 5 18V4Z" />
        <StrokePath d="M9 8H15" />
        <StrokePath d="M9 12H15" />
      </>
    ),

    "Моя тренировка": (
      <>
        <StrokePath d="M6 20V10" />
        <StrokePath d="M12 20V4" />
        <StrokePath d="M18 20V14" />
      </>
    ),

    Статистика: (
      <>
        <StrokePath d="M3 20H21" />
        <StrokePath d="M6 20V14" />
        <StrokePath d="M11 20V10" />
        <StrokePath d="M16 20V6" />
      </>
    ),

    Профиль: (
      <>
        <StrokePath d="M12 12C13.66 12 15 10.66 15 9C15 7.34 13.66 6 12 6C10.34 6 9 7.34 9 9C9 10.66 10.34 12 12 12Z" />
        <StrokePath d="M5 20C5.6 17.2 8.5 15 12 15C15.5 15 18.4 17.2 19 20" />
      </>
    ),
  };

  return (
    <StrokeSvg className="menu-icon-svg">
      {icons[name] || icons.Задачи}
    </StrokeSvg>
  );
}

export function StreakFireIcon({ className = "", size = 24 }) {
  const gradientId = React.useId().replace(/:/g, "");

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id={`streak-fire-body-${gradientId}`}
          x1="12"
          y1="5"
          x2="12"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="55%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
        <linearGradient
          id={`streak-fire-core-${gradientId}`}
          x1="12"
          y1="11"
          x2="12"
          y2="19"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="100%" stopColor="#FDE047" />
        </linearGradient>
      </defs>

      <path
        d="M12 22C8.7 22 6 19.4 6 16.1C6 13.7 7.4 11.7 9.2 10.3C10.6 9.2 11.6 7.7 11.4 5.5C13.7 7 16 9.7 16 13C17 12.2 17.6 11.1 17.8 9.8C19.2 11.3 20 13.4 20 15.7C20 19.2 16.6 22 12 22Z"
        fill={`url(#streak-fire-body-${gradientId})`}
      />

      <path
        d="M12 18.8C10.5 18.8 9.4 17.7 9.4 16.3C9.4 15.1 10.1 14.2 11.1 13.4C11.9 12.8 12.4 11.9 12.3 10.9C13.7 11.8 14.8 13.1 14.8 14.8C14.8 17 13.5 18.8 12 18.8Z"
        fill={`url(#streak-fire-core-${gradientId})`}
      />
    </svg>
  );
}

export function LoaderIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="menu-icon-svg"
    >
      <path d="M12 2v4" />
      <path d="m16.2 7.8 2.9-2.9" />
      <path d="M18 12h4" />
      <path d="m16.2 16.2 2.9 2.9" />
      <path d="M12 18v4" />
      <path d="m4.9 19.1 2.9-2.9" />
      <path d="M2 12h4" />
      <path d="m4.9 4.9 2.9 2.9" />
    </svg>
  );
}