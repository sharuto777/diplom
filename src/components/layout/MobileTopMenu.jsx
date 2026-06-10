import React from "react";
import { MenuSvgIcon } from "../common/Icons";

const mobileMenuItems = [
  "Задачи",
  "Календарь",
  "Рабочие веса",
  "Гайды",
  "Моя тренировка",
  "Статистика",
  "Профиль",
];

function MobileTopMenu({
  isOpen,
  activePage,
  setActivePage,
  closeMobileMenu,
}) {
  function handlePageClick(page) {
    setActivePage(page);
    closeMobileMenu();
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="mobile-menu-backdrop"
          onClick={closeMobileMenu}
          aria-label="Закрыть меню"
        />
      )}

      <nav className={isOpen ? "mobile-top-menu open" : "mobile-top-menu"}>
        <div className="mobile-top-menu-header">
          <h1>Sunday</h1>
          <p>Органайзер ЗОЖ</p>
        </div>

        <div className="mobile-top-menu-list">
          {mobileMenuItems.map((item) => (
            <button
              key={item}
              type="button"
              className={
                activePage === item
                  ? "mobile-top-menu-item active"
                  : "mobile-top-menu-item"
              }
              onClick={() => handlePageClick(item)}
            >
              <span>
                <MenuSvgIcon name={item} />
              </span>

              {item}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}

export default MobileTopMenu;