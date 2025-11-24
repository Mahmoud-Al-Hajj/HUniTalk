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

  const handleLogout = () => {
    localStorage.removeItem("token");
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

        <button className="Navlogout" onClick={handleLogout}>
          logout
        </button>

        <div className="topbar-actions">
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
