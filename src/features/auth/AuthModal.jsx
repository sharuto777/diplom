import React, { useState } from "react";
import AppLogo from "../../components/AppLogo";


function SocialLinks() {
  return (
    <div className="auth-socials">
      <a href="https://vk.com/" target="_blank" rel="noreferrer">
        VK
      </a>

      <a href="https://t.me/" target="_blank" rel="noreferrer">
        Telegram
      </a>
    </div>
  );
}

function getMenuIcon(name) {
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
  };

  return (
    <svg className="menu-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      {icons[name] || icons["Задачи"]}
    </svg>
  );
}

function AuthFeature({ icon, title, text }) {
  return (
    <div className="auth-feature">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}

function LoginInfo() {
  return (
    <div className="auth-info-card login-info auth-info-animated">
      <span className="auth-info-label">Sunday</span>

      <h2>Планируйте день без лишнего хаоса</h2>

      <p>
        Sunday объединяет задачи, календарь и тренировки в одном простом
        интерфейсе.
      </p>

      <div className="auth-feature-list">
        <AuthFeature
          icon={getMenuIcon("Задачи")}
          title="Задачи"
          text="Создавайте дела и отслеживайте выполнение."
        />
        <AuthFeature
          icon={getMenuIcon("Календарь")}
          title="Календарь"
          text="Планируйте день и смотрите задачи по датам."
        />
        <AuthFeature
          icon={getMenuIcon("Тренировки")}
          title="Тренировки"
          text="Добавляйте тренировки и упражнения в расписание."
        />
      </div>

      <SocialLinks />
    </div>
  );
}

function BenefitCard({ number, title, text }) {
  return (
    <div className="auth-benefit-card">
      <strong>{number}</strong>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

function RegisterInfo() {
  return (
    <div className="auth-info-card selling auth-info-animated">
      <span className="auth-info-label">Почему Sunday?</span>

      <h2>Всё для планирования дня — в одном месте</h2>

      <p>
        Sunday помогает не просто записывать задачи, а удобно связывать дела,
        календарь и тренировки в единую систему.
      </p>

      <div className="auth-benefits">
        <BenefitCard
          number="01"
          title="Меньше хаоса"
          text="Задачи, календарь и тренировки не разбросаны по разным приложениям."
        />
        <BenefitCard
          number="02"
          title="Понятный день"
          text="Вы сразу видите, что запланировано на выбранную дату."
        />
        <BenefitCard
          number="03"
          title="ЗОЖ без перегруза"
          text="Тренировки встроены в обычный планировщик, а не живут отдельно."
        />
      </div>

      <div className="auth-result-box">
        <span>Результат</span>
        <p>
          Один сервис вместо списка дел, календаря и отдельного фитнес-планера.
        </p>
      </div>

      <SocialLinks />
    </div>
  );
}

function AuthInfoSide({ isRegisterMode }) {
  return (
    <section className="auth-info-side">
      {isRegisterMode ? <RegisterInfo /> : <LoginInfo />}
    </section>
  );
}

function AuthModal({ onLogin, onRegister, onGuestLogin }) {
  
  const [authMode, setAuthMode] = useState("login");

  const isRegisterMode = authMode === "register";

  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    if (isRegisterMode) {
      onRegister({
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
      });
    } else {
      onLogin({
        email: formData.get("email"),
        password: formData.get("password"),
      });
    }
  }

  return (
    <div className="modal-backdrop auth-backdrop">
      <div className="auth-window">
        <section className="auth-login-side">
          <div className="auth-brand compact">
            <AppLogo size={52} />

            <div>
              <h1>Sunday</h1>
              <p>Ваш личный планировщик</p>
            </div>
          </div>

          <div className="auth-main">
            <div className="auth-title compact">
              <h2>{isRegisterMode ? "Регистрация" : "Вход"}</h2>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
  {isRegisterMode && (
    <label>
      Логин
      <input
        name="username"
        type="text"
        placeholder="Введите логин"
        minLength="3"
        required
      />
    </label>
  )}

  <label>
    Email
    <input
      name="email"
      type="email"
      placeholder="Введите email"
      required
    />
  </label>

  <label>
    Пароль
    <input
      name="password"
      type="password"
      placeholder="Введите пароль"
      minLength="6"
      required
    />
  </label>

  <button type="submit" className="primary-btn">
    {isRegisterMode ? "Зарегистрироваться" : "Войти"}
  </button>

  <button
    type="button"
    className="auth-guest-btn"
    onClick={onGuestLogin}
  >
    Продолжить как гость
  </button>
</form>

            <div className="auth-divider">
  <span>или</span>
</div>

{isRegisterMode ? (
  <p className="auth-register-text">
    Уже есть аккаунт?{" "}
    <button type="button" onClick={() => setAuthMode("login")}>
      Войти
    </button>
  </p>
) : (
  <p className="auth-register-text">
    Нет аккаунта?{" "}
    <button type="button" onClick={() => setAuthMode("register")}>
      Создать аккаунт
    </button>
  </p>
)}
          </div>
        </section>

        <AuthInfoSide isRegisterMode={isRegisterMode} />
      </div>
    </div>
  );
}
export default AuthModal;