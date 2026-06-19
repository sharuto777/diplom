import React from "react";
import AppLogo from "../AppLogo";
import { PremiumCrownIcon, MenuSvgIcon } from "../common/Icons";
import { API_URL } from "../../api/apiClient";

const menuGroups = [
  {
    title: "Основное",
    items: ["Задачи", "Календарь"],
  },
  {
    title: "Тренировки",
    items: ["Рабочие веса", "Гайды", "Моя тренировка"],
  },
  {
    title: "Аккаунт",
    items: ["Статистика", "Профиль"],
  },
];

function Sidebar({
  activePage,
  setActivePage,
  tasks = [],
  currentUser,
  subscription,
  isPremiumUser,
  onOpenPremium,
  isMobileMenuOpen,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  closeMobileMenu,
}) {
  const today = new Date().toISOString().slice(0, 10);

  const todayTasksCount = tasks.filter((task) => {
    const date =
      task.start_datetime ||
      task.startDatetime ||
      task.end_datetime ||
      task.endDatetime ||
      "";

    return String(date).slice(0, 10) === today;
  }).length;

  const completedTodayCount = tasks.filter((task) => {
    const date =
      task.start_datetime ||
      task.startDatetime ||
      task.end_datetime ||
      task.endDatetime ||
      "";

    return (
      String(date).slice(0, 10) === today &&
      (task.status === "completed" || task.is_completed)
    );
  }).length;

  function handlePageClick(page) {
    setActivePage(page);
    closeMobileMenu?.();
  }

  function getUserAvatar(user) {
    if (!user) return "";
    const avatar = user.avatar_url || user.avatarUrl || "";
    if (avatar && (avatar.startsWith("/uploads") || avatar.startsWith("uploads"))) {
      const base = API_URL.replace("/api", "");
      const path = avatar.startsWith("/") ? avatar : `/${avatar}`;
      return `${base}${path}`;
    }
    return avatar;
  }

  return (
    <aside
      className={[
        "sidebar",
        "sunday-sidebar",
        isSidebarCollapsed ? "desktop-collapsed" : "",
        isMobileMenuOpen ? "mobile-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="sidebar-brand-new">
        <button
          type="button"
          className="sidebar-logo-button"
          onClick={() => handlePageClick("Задачи")}
          title="На главную"
          aria-label="На главную"
        >
          <AppLogo />
        </button>

        <div className="sidebar-brand-text">
          <h1>Sunday</h1>
          <p>Органайзер ЗОЖ</p>
        </div>

        <button
          type="button"
          className="sidebar-inner-toggle"
          onClick={() => setIsSidebarCollapsed?.((current) => !current)}
          title={isSidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
          aria-label={isSidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
        >
          <svg
            className="sidebar-inner-toggle-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {isSidebarCollapsed ? (
              <path
                d="M9 6L15 12L9 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <path
                d="M15 6L9 12L15 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav-new">
        {menuGroups.map((group) => (
          <div className="sidebar-nav-group" key={group.title}>
            <div className="sidebar-nav-title">{group.title}</div>

            <div className="sidebar-nav-list">
              {group.items.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    activePage === item
                      ? "sidebar-nav-item active"
                      : "sidebar-nav-item"
                  }
                  onClick={() => handlePageClick(item)}
                >
                  <span className="sidebar-nav-icon">
                    <MenuSvgIcon name={item} />
                  </span>

                  <span className="sidebar-nav-text">{item}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-today-card">
        <span>Сегодня</span>

        <div className="sidebar-today-grid">
          <div>
            <strong>{todayTasksCount}</strong>
            <p>задач</p>
          </div>

          <div>
            <strong>{completedTodayCount}</strong>
            <p>готово</p>
          </div>
        </div>
      </div>

      {!isPremiumUser && (
        <button
          type="button"
          className="sidebar-premium-new"
          onClick={() => onOpenPremium?.()}
        >
          <div className="sidebar-premium-icon">
            <PremiumCrownIcon />
          </div>
          <div className="sidebar-premium-content">
            <div className="sidebar-premium-title">Premium</div>
            <div className="sidebar-premium-desc">
              Полный доступ к статистике и функциям
            </div>
          </div>
        </button>
      )}

      {currentUser && (
        <div
          className="sidebar-user-new"
          onClick={() => handlePageClick("Профиль")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handlePageClick("Профиль");
            }
          }}
          style={{ cursor: "pointer" }}
        >
          <div className="sidebar-user-avatar">
            {currentUser.avatar_url ? (
              <img
                src={getUserAvatar(currentUser)}
                alt={currentUser.username || "Профиль"}
              />
            ) : (
              <span>
                {String(currentUser.username || currentUser.email || "U")
                  .slice(0, 1)
                  .toUpperCase()}
              </span>
            )}
          </div>

          <div className="sidebar-user-info">
            <strong>{currentUser.username || "Пользователь"}</strong>
            <p>{isPremiumUser ? "Premium" : subscription?.code || "Free"}</p>
          </div>
        </div>
      )}

      <button
        type="button"
        className="sidebar-wall-toggle"
        onClick={() => setIsSidebarCollapsed?.((current) => !current)}
        title={isSidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
        aria-label={isSidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
      />
    </aside>
  );
}

export default Sidebar;