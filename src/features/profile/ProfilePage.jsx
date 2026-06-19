import React, { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import { API_URL } from "../../api/apiClient";
import ProfileSecurityModal from "./ProfileSecurityModal";
import ProfileSettingsModal from "./ProfileSettingsModal";
import ProfileFriendsBlock from "./ProfileFriendsBlock";
import ProfileProgressCards from "./ProfileProgressCards";
import ProfileSecurityBlock from "./ProfileSecurityBlock";
import ProfilePremiumBlock from "./ProfilePremiumBlock";
import {
  PremiumCrownIcon,
  LogoutSvgIcon,
  ProfileSvgIcon,
  AvatarEditIcon,
} from "../../components/common/Icons";

function formatProfileJoinDate(dateValue) {
  if (!dateValue) {
    return "сегодня";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "сегодня";
  }

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function ProfileRankStars({ tier }) {
  const normalizedTier = Math.min(Math.max(Number(tier || 0), 0), 10);

  const shinyStars = Math.floor(normalizedTier / 2);
  const regularStars = normalizedTier % 2;

  const stars = [
    ...Array.from({ length: shinyStars }, (_, index) => ({
      type: "shiny-star",
      id: `shiny-${index}`,
    })),
    ...Array.from({ length: regularStars }, (_, index) => ({
      type: "star",
      id: `regular-${index}`,
    })),
  ];

  if (stars.length === 0) {
    return null;
  }

  return (
    <div className="profile-rank-stars">
      {stars.map((star) => (
        <span
          key={star.id}
          className={`profile-rank-star ${star.type}`}
          title={star.type === "shiny-star" ? "Блестящая звезда" : "Звезда"}
        >
          <ProfileSvgIcon name={star.type} />
        </span>
      ))}
    </div>
  );
}

function getProfileInitials(name) {
  const cleanName = String(name || "Пользователь").trim();

  if (!cleanName) {
    return "U";
  }

  return cleanName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function ProfilePage({
  currentUser,
  setCurrentUser,
  subscription,
  isPremiumUser,
  onOpenPremium,
  logout,
  showToast,
}) {
  const serverUrl = API_URL.replace("/api", "");

const [avatarPreview, setAvatarPreview] = useState("");
const [securityModal, setSecurityModal] = useState(null);
const [viewedProfile, setViewedProfile] = useState(null);

useEffect(() => {
  if (currentUser?.avatar_url) {
    setAvatarPreview(`${serverUrl}${currentUser.avatar_url}`);
  } else {
    setAvatarPreview("");
  }
}, [currentUser?.avatar_url, serverUrl]);

  const [pedantTracker, setPedantTracker] = useState(null);

  const displayName = currentUser?.username || "Пользователь";
  const initials = getProfileInitials(displayName);

const registrationDate = formatProfileJoinDate(
  currentUser?.created_at || currentUser?.createdAt || currentUser?.registered_at
);

const profileOwner = viewedProfile?.user || currentUser;
const profileTracker = viewedProfile?.pedantTracker || pedantTracker;
const isViewingFriendProfile = Boolean(viewedProfile?.user?.id);

const visibleDisplayName =
  profileOwner?.username ||
  profileOwner?.name ||
  profileOwner?.email ||
  "Пользователь";

const rawVisibleAvatar =
  profileOwner?.avatar_url ||
  profileOwner?.avatarUrl ||
  "";

const visibleAvatar =
  rawVisibleAvatar && rawVisibleAvatar.startsWith("/uploads")
    ? `${serverUrl}${rawVisibleAvatar}`
    : rawVisibleAvatar || avatarPreview;

const visibleInitials = getProfileInitials(visibleDisplayName);

const visibleRegistrationDate = profileOwner?.created_at
  ? new Date(profileOwner.created_at).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  : registrationDate;

  const visibleProfileIsPremium =
  profileOwner?.subscription?.code === "premium" ||
  profileOwner?.subscription === "premium" ||
  profileOwner?.subscription_code === "premium" ||
  profileOwner?.subscriptionCode === "premium" ||
  profileOwner?.is_premium === true ||
  profileOwner?.isPremium === true ||
  (!isViewingFriendProfile && isPremiumUser);

async function removeAvatar() {
  const token = localStorage.getItem("token");

  if (!token || currentUser?.is_guest) {
    setAvatarPreview("");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/profile/avatar`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || "Ошибка удаления аватарки");
    }

    setAvatarPreview("");
  } catch (error) {
    console.error("Ошибка удаления аватарки:", error);
    alert("Не удалось удалить аватарку.");
  }
}

  async function handleAvatarChange(event) {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("Выберите изображение для аватарки.");
    return;
  }

  const token = localStorage.getItem("token");

  if (!token || currentUser?.is_guest) {
    alert("Аватарку можно загрузить только в аккаунте.");
    return;
  }

  const formData = new FormData();
  formData.append("avatar", file);

  try {
    const response = await fetch(`${API_URL}/profile/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || "Ошибка загрузки аватарки");
    }

    setAvatarPreview(`${serverUrl}${data.avatar_url}`);
  } catch (error) {
    console.error("Ошибка загрузки аватарки:", error);
    alert("Не удалось загрузить аватарку.");
  }
}

  useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token || currentUser?.is_guest) {
    setPedantTracker({
      activeDays: 1,
      totalActiveDays: 1,
      rank: {
        title: "Новичок порядка",
        subtitle: "Гостевой режим",
        starTier: 0,
      },
      nextMilestone: 2,
      daysToNextMilestone: 1,
      progressPercent: 50,
    });

    return;
  }

  fetch(`${API_URL}/user-activity/today`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        throw new Error(data.error);
      }

      setPedantTracker(data);
    })
    .catch((error) => {
      console.error("Ошибка загрузки трекера активности:", error);
    });
}, [currentUser]);

  return (
  <section className="profile-custom-page">
    <div className="profile-page-layout">
      <div className="profile-main-column">
        <div className="profile-custom-top">
          <div className="profile-avatar-wrap">
            <label
              className={
                isViewingFriendProfile
                  ? "profile-top-avatar profile-top-avatar-readonly"
                  : "profile-top-avatar"
              }
              title={
                isViewingFriendProfile
                  ? "Аватар пользователя"
                  : "Изменить аватарку"
              }
            >
              {visibleAvatar ? (
                <img src={visibleAvatar} alt="Аватар пользователя" />
              ) : (
                <span>{visibleInitials}</span>
              )}

              {!isViewingFriendProfile && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />

                  <div className="profile-top-avatar-edit">
                    <AvatarEditIcon />
                  </div>
                </>
              )}
            </label>

            {!isViewingFriendProfile && avatarPreview && (
              <button
                type="button"
                className="profile-avatar-remove"
                onClick={removeAvatar}
              >
                Удалить фото
              </button>
            )}
          </div>

          <div className="profile-top-info">
            <div className="profile-user-text-block">
  <div className="profile-name-crown-wrap">
    {visibleProfileIsPremium && (
      <span className="profile-premium-crown" title="Premium">
        <PremiumCrownIcon />
      </span>
    )}

    <h2>{visibleDisplayName}</h2>
  </div>

  <p>С нами с {visibleRegistrationDate}</p>

              {isViewingFriendProfile ? (
                <button
                  type="button"
                  className="profile-back-to-me-btn"
                  onClick={() => setViewedProfile(null)}
                >
                  ← Мой профиль
                </button>
              ) : (
                <button
                  type="button"
                  className="profile-logout-btn"
                  onClick={logout}
                  title="Выйти из аккаунта"
                  aria-label="Выйти из аккаунта"
                >
                  <LogoutSvgIcon />
                  <span>Выйти</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <ProfileProgressCards pedantTracker={profileTracker} />

        {!isViewingFriendProfile && (
          <>
            <ProfileSecurityBlock
              currentUser={currentUser}
              onEdit={setSecurityModal}
            />

            <ProfilePremiumBlock
              subscription={subscription}
              isPremiumUser={isPremiumUser}
              onOpenPremium={onOpenPremium}
            />
          </>
        )}
      </div>

      <ProfileFriendsBlock
        currentUser={currentUser}
        showToast={showToast}
        onOpenFriendProfile={setViewedProfile}
      />
    </div>

    {securityModal && (
      <ProfileSecurityModal
        type={securityModal}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        showToast={showToast}
        onClose={() => setSecurityModal(null)}
      />
    )}
  </section>
);
}

export default ProfilePage;