import React from "react";

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

export function ProfileSvgIcon({ type }) {
  const icons = {
    activity: (
      <>
        <path d="M4 19V13" />
        <path d="M10 19V8" />
        <path d="M16 19V5" />
        <path d="M22 19H2" />
      </>
    ),

    tasks: (
      <>
        <path d="M8 6H20" />
        <path d="M8 12H20" />
        <path d="M8 18H20" />
        <path d="M4 6H4.01" />
        <path d="M4 12H4.01" />
        <path d="M4 18H4.01" />
      </>
    ),

    workouts: (
      <>
        <path d="M6 20V10" />
        <path d="M12 20V4" />
        <path d="M18 20V14" />
      </>
    ),

    premium: (
      <>
        <path d="M4 18H20" />
        <path d="M5 18L7 7L12 12L17 7L19 18" />
        <path d="M8 21H16" />
      </>
    ),

    fire: (
      <>
        <path d="M12.4 21C8.8 21 6 18.4 6 15C6 12.7 7.2 10.8 8.8 9.3C10.3 7.9 11 6.3 10.8 4C13.4 5.4 15.1 7.5 15.4 10.1C16.1 9.4 16.5 8.5 16.6 7.5C18.3 9 19 11.2 19 13.5C19 17.8 16.2 21 12.4 21Z" />
        <path d="M12.2 18C10.6 18 9.4 16.8 9.4 15.3C9.4 14.1 10.1 13.2 11 12.4C11.8 11.7 12.2 10.9 12.1 9.8C13.6 10.7 14.5 12 14.5 13.5C15 13.1 15.3 12.6 15.4 12C16.2 12.8 16.6 13.9 16.6 15C16.6 16.8 14.9 18 12.2 18Z" />
      </>
    ),

    rank: (
      <>
        <path d="M12 3L14.7 8.4L20.7 9.3L16.4 13.5L17.4 19.5L12 16.7L6.6 19.5L7.6 13.5L3.3 9.3L9.3 8.4L12 3Z" />
        <path d="M12 8.2L13.2 10.6L15.9 11L14 12.9L14.4 15.5L12 14.3L9.6 15.5L10 12.9L8.1 11L10.8 10.6L12 8.2Z" />
      </>
    ),
  };

  return (
    <svg className="profile-svg-icon" viewBox="0 0 24 24" aria-hidden="true">
      {icons[type] || icons.activity}
    </svg>
  );
}

export function MenuSvgIcon({ name }) {
  const icons = {
    "Задачи": (
      <>
        <path d="M8 6H20" />
        <path d="M8 12H20" />
        <path d="M8 18H20" />
        <path d="M4 6H4.01" />
        <path d="M4 12H4.01" />
        <path d="M4 18H4.01" />
      </>
    ),

    "Календарь": (
      <>
        <path d="M7 3V6" />
        <path d="M17 3V6" />
        <path d="M4 8H20" />
        <path d="M5 5H19V20H5V5Z" />
      </>
    ),

    "Рабочие веса": (
      <>
        <path d="M6 9V15" />
        <path d="M18 9V15" />
        <path d="M3 10.5V13.5" />
        <path d="M21 10.5V13.5" />
        <path d="M6 12H18" />
      </>
    ),

    "Гайды": (
      <>
        <path d="M5 4H15C17.2 4 19 5.8 19 8V20H7C5.9 20 5 19.1 5 18V4Z" />
        <path d="M9 8H15" />
        <path d="M9 12H15" />
      </>
    ),

    "Моя тренировка": (
      <>
        <path d="M6 20V10" />
        <path d="M12 20V4" />
        <path d="M18 20V14" />
      </>
    ),

    "Статистика": (
      <>
        <path d="M4 19V13" />
        <path d="M10 19V8" />
        <path d="M16 19V5" />
        <path d="M22 19H2" />
      </>
    ),

    "Профиль": (
      <>
        <path d="M12 12C14.2 12 16 10.2 16 8C16 5.8 14.2 4 12 4C9.8 4 8 5.8 8 8C8 10.2 9.8 12 12 12Z" />
        <path d="M4 20C4.8 16.7 7.8 15 12 15C16.2 15 19.2 16.7 20 20" />
      </>
    ),
  };

  return (
    <svg className="menu-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      {icons[name] || icons["Задачи"]}
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