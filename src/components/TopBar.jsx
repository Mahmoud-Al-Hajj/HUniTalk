import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/TopBar.css";

function TopBar({ onCreatePost }) {
  const navigate = useNavigate();
  const [userAvatar, setUserAvatar] = useState(null);
  const [userName, setUserName] = useState("U");

  useEffect(() => {
    // Load avatar from localStorage
    const loadUserData = () => {
      const savedAvatar = localStorage.getItem("userAvatar");
      if (savedAvatar) {
        setUserAvatar(savedAvatar);
      }

      // Optionally load user name from localStorage or API
      const savedUserName = localStorage.getItem("userName");
      if (savedUserName) {
        setUserName(savedUserName.charAt(0).toUpperCase());
      }
    };

    loadUserData();

    // Listen for storage changes (when avatar is updated in Profile page)
    const handleStorageChange = (e) => {
      if (e.key === "userAvatar") {
        setUserAvatar(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also create a custom event listener for same-tab updates
    const handleAvatarUpdate = () => {
      const savedAvatar = localStorage.getItem("userAvatar");
      setUserAvatar(savedAvatar);
    };

    window.addEventListener("avatarUpdated", handleAvatarUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("avatarUpdated", handleAvatarUpdate);
    };
  }, []);

  useEffect(() => {
    const handleLogoutEvent = () => {
      setUserAvatar(null);
      setUserName("U");
    };
    window.addEventListener("logout", handleLogoutEvent);
    return () => window.removeEventListener("logout", handleLogoutEvent);
  }, []);

  const handleCreateClick = () => {
    if (onCreatePost) {
      onCreatePost();
    }
  };

  const handleLogoClick = () => {
    navigate("/home");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userAvatar"); // Clear avatar on logout
    localStorage.removeItem("userName");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");
    localStorage.removeItem("savedPosts");
    // Notify other components that logout occurred so they can reset
    try {
      window.dispatchEvent(new Event("logout"));
    } catch (e) {
      // ignore
    }
    navigate("/login");
  };

  return (
    <header className="topbar">
      <div className="topbar-content">
        <div
          className="topbar-brand"
          onClick={handleLogoClick}
          style={{ cursor: "pointer" }}
        >
          <div className="logo">HU</div>
          <span className="brand-name">HUniTalk</span>
        </div>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search HUniTalk"
            className="search-input"
            aria-label="Search HUniTalk"
          />
        </div>
        <div className="topbar-actions">
          <div
            className="user-avatar"
            onClick={() => navigate("/profile")}
            style={{ cursor: "pointer" }}
          >
            {userAvatar ? (
              <img
                src={userAvatar}
                alt="User avatar"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            ) : (
              userName
            )}
          </div>
          <button className="Navlogout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
