import React, { useEffect, useRef, useState } from "react";
import { API_URL } from "../../api/apiClient";
import { PremiumCrownIcon, SaveCheckIcon } from "../../components/common/Icons";

const FRIEND_SEARCH_MIN_LENGTH = 1;
const FRIEND_SEARCH_DEBOUNCE_MS = 300;

function ProfileFriendsBlock({
  currentUser,
  showToast,
  onOpenFriendProfile,
}) {
  const [friendSearch, setFriendSearch] = useState("");
  const [isAddMode, setIsAddMode] = useState(false);
  const [addFriendLogin, setAddFriendLogin] = useState("");
  const [friendSuggestions, setFriendSuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openedFriendMenuId, setOpenedFriendMenuId] = useState(null);
  const addFriendFormRef = useRef(null);
  const searchRequestIdRef = useRef(0);

  const filteredFriends = friends.filter((friend) =>
    String(friend.username || "")
      .toLowerCase()
      .includes(friendSearch.trim().toLowerCase())
  );

  useEffect(() => {
    loadFriends();
  }, [currentUser?.id]);

  useEffect(() => {
    if (!openedFriendMenuId) {
      return undefined;
    }

    function handleOutsideClick(event) {
      if (!event.target.closest(".profile-friend-item")) {
        setOpenedFriendMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [openedFriendMenuId]);

  useEffect(() => {
    if (!isAddMode) {
      setFriendSuggestions([]);
      setIsSuggestionsOpen(false);
      return undefined;
    }

    const query = addFriendLogin.trim();

    if (query.length < FRIEND_SEARCH_MIN_LENGTH) {
      setFriendSuggestions([]);
      setIsSearchingUsers(false);
      setIsSuggestionsOpen(query.length > 0);
      return undefined;
    }

    const requestId = searchRequestIdRef.current + 1;
    searchRequestIdRef.current = requestId;
    setIsSearchingUsers(true);
    setIsSuggestionsOpen(true);

    const timeoutId = window.setTimeout(() => {
      const token = localStorage.getItem("token");

      if (!token || currentUser?.is_guest) {
        setFriendSuggestions([]);
        setIsSearchingUsers(false);
        return;
      }

      fetch(
        `${API_URL}/friends/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then(async (response) => {
          const contentType = response.headers.get("content-type") || "";
          const isJson = contentType.includes("application/json");
          const data = isJson ? await response.json() : null;

          if (!response.ok) {
            throw new Error(
              data?.error ||
                (response.status === 404
                  ? "Поиск недоступен. Перезапустите сервер."
                  : "Не удалось выполнить поиск")
            );
          }

          if (data?.error) {
            throw new Error(data.error);
          }

          return data;
        })
        .then((data) => {
          if (searchRequestIdRef.current !== requestId) {
            return;
          }

          setFriendSuggestions(Array.isArray(data.users) ? data.users : []);
        })
        .catch((error) => {
          if (searchRequestIdRef.current !== requestId) {
            return;
          }

          console.error("Ошибка поиска пользователей:", error);
          setFriendSuggestions([]);
          showToast?.(error.message || "Не удалось выполнить поиск", "error");
        })
        .finally(() => {
          if (searchRequestIdRef.current === requestId) {
            setIsSearchingUsers(false);
          }
        });
    }, FRIEND_SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [addFriendLogin, currentUser?.is_guest, isAddMode]);

  useEffect(() => {
    if (!isAddMode) {
      return undefined;
    }

    function handleOutsideClick(event) {
      if (!addFriendFormRef.current?.contains(event.target)) {
        setIsSuggestionsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isAddMode]);

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

  function getRelationshipLabel(status) {
    switch (status) {
      case "friend":
        return "Уже в друзьях";
      case "pending_sent":
        return "Заявка отправлена";
      case "pending_received":
        return "Уже отправил вам заявку";
      default:
        return "Нажмите, чтобы отправить заявку";
    }
  }

  function canSendRequestToUser(user) {
    return !user?.relationshipStatus || user.relationshipStatus === "none";
  }

  function resetAddFriendForm() {
    setAddFriendLogin("");
    setFriendSuggestions([]);
    setIsSuggestionsOpen(false);
    setIsSearchingUsers(false);
  }

  function sendFriendRequest(username) {
    const login = String(username || addFriendLogin).trim();

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
        resetAddFriendForm();
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

  function handleSendFriendRequest(event) {
    event.preventDefault();
    sendFriendRequest(addFriendLogin);
  }

  function handleSelectSuggestion(user) {
    setAddFriendLogin(user.username);

    if (!canSendRequestToUser(user)) {
      showToast?.(getRelationshipLabel(user.relationshipStatus), "info");
      return;
    }

    setIsSuggestionsOpen(false);
    sendFriendRequest(user.username);
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

  const showSuggestionPanel =
    isAddMode &&
    isSuggestionsOpen &&
    addFriendLogin.trim().length >= FRIEND_SEARCH_MIN_LENGTH;

  const canSearchUsers = Boolean(currentUser?.id) && !currentUser?.is_guest;

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
          onClick={() => {
            setIsAddMode((current) => {
              if (current) {
                resetAddFriendForm();
              }

              return !current;
            });
          }}
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
        <form
          ref={addFriendFormRef}
          className="profile-add-friend-form"
          onSubmit={handleSendFriendRequest}
        >
          <div className="profile-add-friend-input-wrap">
            <input
              value={addFriendLogin}
              onChange={(event) => {
                setAddFriendLogin(event.target.value);
                setIsSuggestionsOpen(true);
              }}
              onFocus={() => setIsSuggestionsOpen(true)}
              placeholder="Введите логин"
              autoComplete="off"
              autoFocus
            />

            {showSuggestionPanel && (
              <div className="profile-friend-search-suggest">
                {isSearchingUsers ? (
                  <div className="profile-friend-search-suggest-empty">
                    Поиск...
                  </div>
                ) : !canSearchUsers ? (
                  <div className="profile-friend-search-suggest-empty">
                    Поиск доступен только в аккаунте
                  </div>
                ) : friendSuggestions.length === 0 ? (
                  <div className="profile-friend-search-suggest-empty">
                    Никого не найдено
                  </div>
                ) : (
                  friendSuggestions.map((user) => (
                    <button
                      type="button"
                      key={user.id}
                      className={
                        canSendRequestToUser(user)
                          ? "profile-friend-search-suggest-item"
                          : "profile-friend-search-suggest-item is-disabled"
                      }
                      onClick={() => handleSelectSuggestion(user)}
                      disabled={isLoading}
                    >
                      <div className="profile-friend-avatar">
                        {getFriendAvatar(user) ? (
                          <img
                            src={getFriendAvatar(user)}
                            alt={user.username || "Пользователь"}
                          />
                        ) : (
                          getFriendInitial(user)
                        )}
                      </div>

                      <div className="profile-friend-search-suggest-text">
                        <strong>{user.username}</strong>
                        <span>
                          {getRelationshipLabel(user.relationshipStatus)}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

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
                  {isFriendPremium(request) && (
                    <span className="friend-card-premium-crown" title="Premium">
                      <PremiumCrownIcon />
                    </span>
                  )}

                  <div className="profile-friend-avatar">
                    {getFriendAvatar(request) ? (
                      <img
                        src={getFriendAvatar(request)}
                        alt={request.username || "Заявка"}
                      />
                    ) : (
                      getFriendInitial(request)
                    )}
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
                className={
                  openedFriendMenuId === friend.id
                    ? "profile-friend-item is-menu-open"
                    : "profile-friend-item"
                }
                key={friend.id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  setOpenedFriendMenuId((current) =>
                    current === friend.id ? null : friend.id
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setOpenedFriendMenuId((current) =>
                      current === friend.id ? null : friend.id
                    );
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

                {openedFriendMenuId === friend.id && (
                  <div
                    className="profile-friend-menu"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="profile-friend-menu-profile"
                      onClick={() => {
                        setOpenedFriendMenuId(null);
                        openFriendProfile(friend);
                      }}
                    >
                      Перейти в профиль
                    </button>

                    <button
                      type="button"
                      className="profile-friend-menu-danger"
                      onClick={() => deleteFriend(friend.id)}
                    >
                      Удалить из друзей
                    </button>
                  </div>
                )}
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