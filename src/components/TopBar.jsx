import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/TopBar.css";

function TopBar({ onCreatePost }) {
  const navigate = useNavigate();

  const handleCreateClick = () => {
    if (onCreatePost) {
      onCreatePost();
    }
  };

  const handleLogoClick = () => {
    navigate("/home");
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
          <div className="notification-icon">
            <span>🔔</span>
            <span className="notification-badge">3</span>
          </div>
          <div
            className="user-avatar"
            onClick={() => navigate("/profile")}
            style={{ cursor: "pointer" }}
          >
            U
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
