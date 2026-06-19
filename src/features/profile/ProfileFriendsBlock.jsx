import React, { useEffect, useState } from "react";
import { API_URL } from "../../api/apiClient";
import { PremiumCrownIcon, SaveCheckIcon } from "../../components/common/Icons";

function ProfileFriendsBlock({
  currentUser,
  showToast,
  onOpenFriendProfile,
}) {
  const [friendSearch, setFriendSearch] = useState("");
  const [isAddMode, setIsAddMode] = useState(false);
  const [addFriendLogin, setAddFriendLogin] = useState("");
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openedFriendMenuId, setOpenedFriendMenuId] = useState(null);

  const filteredFriends = friends.filter((friend) =>
    String(friend.username || "")
      .toLowerCase()
      .includes(friendSearch.trim().toLowerCase())
  );

  useEffect(() => {
    loadFriends();
  }, [currentUser?.id]);


  function openFriendProfile(friend) {
  const token = localStorage.getItem("token");

  if (!token) {
    showToast?.("Необходимо войти в аккаунт", "error");
    return;
  }

  fetch(`${API_URL}/users/${friend.id}/public-profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(`Сервер вернул не JSON. Статус: ${response.status}`);
  }

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || "Не удалось открыть профиль");
  }

  return data;
})
    .then((data) => {
      if (typeof onOpenFriendProfile === "function") {
        onOpenFriendProfile(data);
      }
    })
    .catch((error) => {
      console.error("Ошибка открытия профиля друга:", error);
      showToast?.(error.message || "Не удалось открыть профиль", "error");
    });
}

function getFriendAvatar(friend) {
  const avatar = friend.avatar_url || friend.avatarUrl || "";

  if (avatar && avatar.startsWith("/uploads")) {
    return `${API_URL.replace("/api", "")}${avatar}`;
  }

  return avatar;
}

function getFriendInitial(friend) {
  return String(friend.username || friend.email || "?")
    .charAt(0)
    .toUpperCase();
}

function isFriendPremium(friend) {
  return (
    friend?.subscription?.code === "premium" ||
    friend?.subscription === "premium" ||
    friend?.subscription_code === "premium" ||
    friend?.subscriptionCode === "premium" ||
    friend?.is_premium === true ||
    friend?.isPremium === true
  );
}

function deleteFriend(friendId) {
  const confirmed = window.confirm("Удалить друга?");

  if (!confirmed) {
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    showToast?.("Необходимо войти в аккаунт", "error");
    return;
  }

  fetch(`${API_URL}/friends/${friendId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (response) => {
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Не удалось удалить друга");
      }

      return data;
    })
    .then(() => {
      showToast?.("Друг удалён", "success");
      setOpenedFriendMenuId(null);
      loadFriends();
    })
    .catch((error) => {
      console.error("Ошибка удаления друга:", error);
      showToast?.(error.message || "Не удалось удалить друга", "error");
    });
}



  function loadFriends() {
    const token = localStorage.getItem("token");

    if (!token || currentUser?.is_guest) {
      setFriends([]);
      setIncomingRequests([]);
      return;
    }

    fetch(`${API_URL}/friends`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }

        setFriends(Array.isArray(data.friends) ? data.friends : []);
        setIncomingRequests(
          Array.isArray(data.incomingRequests) ? data.incomingRequests : []
        );
      })
      .catch((error) => {
        console.error("Ошибка загрузки друзей:", error);
      });
  }

  function sendFriendRequest(event) {
    event.preventDefault();

    const login = addFriendLogin.trim();

    if (!login) {
      showToast?.("Введите логин друга", "error");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token || currentUser?.is_guest) {
      showToast?.("Добавление друзей доступно только в аккаунте", "error");
      return;
    }

    setIsLoading(true);

    fetch(`${API_URL}/friends/requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: login,
      }),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || "Не удалось отправить заявку");
        }

        return data;
      })
      .then(() => {
        showToast?.("Заявка отправлена", "success");
        setAddFriendLogin("");
        setIsAddMode(false);
        loadFriends();
      })
      .catch((error) => {
        console.error("Ошибка отправки заявки:", error);
        showToast?.(error.message || "Не удалось отправить заявку", "error");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function respondToRequest(requestId, action) {
    const token = localStorage.getItem("token");

    if (!token) {
      showToast?.("Необходимо войти в аккаунт", "error");
      return;
    }

    fetch(`${API_URL}/friends/requests/${requestId}/${action}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || "Не удалось обработать заявку");
        }

        return data;
      })
      .then(() => {
        showToast?.(
          action === "accept" ? "Друг добавлен" : "Заявка отклонена",
          "success"
        );

        loadFriends();
      })
      .catch((error) => {
        console.error("Ошибка обработки заявки:", error);
        showToast?.(error.message || "Не удалось обработать заявку", "error");
      });
  }

  return (
    <aside className="profile-friends-card">
      <div className="profile-friends-top">
        <div className="profile-friends-search">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="11" cy="11" r="7" />
            <path d="M16.5 16.5L21 21" />
          </svg>

          <input
            type="text"
            value={friendSearch}
            onChange={(event) => setFriendSearch(event.target.value)}
            placeholder="Поиск друга"
          />
        </div>

        <button
          type="button"
          className="profile-add-friend-btn"
          title="Добавить друга"
          aria-label="Добавить друга"
          onClick={() => setIsAddMode((current) => !current)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            {isAddMode ? (
              <>
                <path d="M6 6L18 18" />
                <path d="M18 6L6 18" />
              </>
            ) : (
              <>
                <path d="M12 5V19" />
                <path d="M5 12H19" />
              </>
            )}
          </svg>
        </button>
      </div>

      {isAddMode && (
        <form className="profile-add-friend-form" onSubmit={sendFriendRequest}>
          <input
            value={addFriendLogin}
            onChange={(event) => setAddFriendLogin(event.target.value)}
            placeholder="Введите логин"
            autoFocus
          />

          <button type="submit" disabled={isLoading}>
            Отправить
          </button>
        </form>
      )}

      <div className="profile-friends-content">
        {incomingRequests.length > 0 && (
          <div className="profile-friend-requests">
            {incomingRequests.map((request) => (
              <div className="profile-friend-request" key={request.id}>
                <div className="profile-friend-avatar-wrap">
  {isFriendPremium(friend) && (
    <span className="friend-card-premium-crown" title="Premium">
      <PremiumCrownIcon />
    </span>
  )}

  <div className="profile-friend-avatar-wrap">
  {isFriendPremium(request) && (
    <span className="friend-card-premium-crown" title="Premium">
      <PremiumCrownIcon />
    </span>
  )}

  <div className="profile-friend-avatar">
    {getFriendAvatar(request) ? (
      <img src={getFriendAvatar(request)} alt={request.username || "Заявка"} />
    ) : (
      getFriendInitial(request)
    )}
  </div>
</div>
</div>

                <div className="profile-friend-request-text">
                  <strong>{request.username}</strong>
                  <p>вас хочет добавить в друзья</p>
                </div>

                <div className="profile-friend-request-actions">
                  <button
                    type="button"
                    className="accept"
                    onClick={() => respondToRequest(request.id, "accept")}
                    title="Принять"
                    aria-label="Принять"
                  >
                    <SaveCheckIcon />
                  </button>

                  <button
                    type="button"
                    className="decline"
                    onClick={() => respondToRequest(request.id, "decline")}
                    title="Отклонить"
                    aria-label="Отклонить"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredFriends.length > 0 && (
          <div className="profile-friends-list">
            {filteredFriends.map((friend) => (
  <div
    className="profile-friend-item clickable"
    key={friend.id}
    role="button"
    tabIndex={0}
    onClick={() => openFriendProfile(friend)}
    onKeyDown={(event) => {
      if (event.key === "Enter") {
        openFriendProfile(friend);
      }
    }}
  >
    <div className="profile-friend-avatar-wrap">
  {isFriendPremium(friend) && (
    <span className="friend-card-premium-crown" title="Premium">
      <PremiumCrownIcon />
    </span>
  )}

  <div className="profile-friend-avatar">
    {getFriendAvatar(friend) ? (
      <img
        src={getFriendAvatar(friend)}
        alt={friend.username || "Друг"}
      />
    ) : (
      getFriendInitial(friend)
    )}
  </div>
</div>

    <div className="profile-friend-info">
      <strong>{friend.username}</strong>
      <p>{friend.email || "Аккаунт Sunday"}</p>
    </div>

    <div className="profile-friend-actions" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        className="profile-friend-dots-btn"
        onClick={() =>
          setOpenedFriendMenuId((current) =>
            current === friend.id ? null : friend.id
          )
        }
        title="Действия"
        aria-label="Действия"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {openedFriendMenuId === friend.id && (
        <div className="profile-friend-menu">
          <button
            type="button"
            onClick={() => deleteFriend(friend.id)}
          >
            Удалить друга
          </button>
        </div>
      )}
    </div>
  </div>
))}
          </div>
        )}

        {incomingRequests.length === 0 && filteredFriends.length === 0 && (
          <div className="profile-friends-empty" />
        )}
      </div>
    </aside>
  );
}

export default ProfileFriendsBlock;