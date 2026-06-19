import React, { useState } from "react";

function PremiumModal({ onClose, onBuy, isBuying = false }) {
  const [selectedPlan, setSelectedPlan] = useState("premium_month");
  const [openedFaq, setOpenedFaq] = useState("stats");

  const plans = [
    {
      code: "premium_month",
      title: "Месяц",
      price: "199 ₽",
      description: "30 дней Premium",
    },
    {
      code: "premium_year",
      title: "Год",
      price: "1490 ₽",
      description: "Выгоднее на долгий срок",
      badge: "выгодно",
    },
  ];

  const faqItems = [
    {
      id: "stats",
      title: "Расширенная статистика",
      text:
        "Открывает подробную аналитику задач, тренировок, активности за месяц, процента выполнения и прогресса.",
    },
    {
      id: "limits",
      title: "Больше задач и тренировок",
      text:
        "Premium снимает ограничения бесплатного тарифа и позволяет свободнее планировать день, неделю и тренировки.",
    },
    {
      id: "progress",
      title: "История рабочих весов",
      text:
        "Можно отслеживать изменения рабочих весов, повторений и результатов по упражнениям.",
    },
    {
      id: "programs",
      title: "Готовые программы",
      text:
        "Основа для готовых тренировочных планов, которые можно будет быстро добавлять в своё расписание.",
    },
  ];

  return (
    <div className="modal-backdrop premium-payment-backdrop">
      <section className="premium-payment-modal premium-payment-modal-clean">
        <button
          type="button"
          className="premium-payment-close"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>

        <div className="premium-payment-top">
          <span className="premium-payment-mark">✦ Premium</span>

          <h2>Больше возможностей</h2>

          <p>
            Расширенная статистика, больше лимитов и контроль прогресса в одном тарифе.
          </p>
        </div>

        <div className="premium-payment-plans clean">
          {plans.map((plan) => (
            <button
              key={plan.code}
              type="button"
              className={
                selectedPlan === plan.code
                  ? "premium-payment-plan clean active"
                  : "premium-payment-plan clean"
              }
              onClick={() => setSelectedPlan(plan.code)}
            >
              <div className="premium-plan-row">
                <strong>{plan.title}</strong>

                {plan.badge && (
                  <span className="premium-payment-plan-badge">
                    {plan.badge}
                  </span>
                )}
              </div>

              <b>{plan.price}</b>
              <small>{plan.description}</small>
            </button>
          ))}
        </div>

        <div className="premium-faq-block">
          <div className="premium-faq-title">
            Что входит в Premium
          </div>

          <div className="premium-faq-list">
            {faqItems.map((item) => {
              const isOpen = openedFaq === item.id;

              return (
                <div
                  key={item.id}
                  className={isOpen ? "premium-faq-item open" : "premium-faq-item"}
                >
                  <button
                    type="button"
                    className="premium-faq-question"
                    onClick={() =>
                      setOpenedFaq((current) =>
                        current === item.id ? null : item.id
                      )
                    }
                  >
                    <span>{item.title}</span>
                    <strong>{isOpen ? "−" : "+"}</strong>
                  </button>

                  <div className="premium-faq-answer">
                    <p>{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="premium-payment-buy-btn clean"
          onClick={() => onBuy(selectedPlan)}
          disabled={isBuying}
        >
          {isBuying ? "Подключаем..." : "Подключить Premium"}
        </button>
      </section>
    </div>
  );
}

export default PremiumModal;