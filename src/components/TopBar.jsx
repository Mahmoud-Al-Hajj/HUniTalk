import React from "react";
import { Search, Plus, Bell } from "lucide-react";
import "../styles/TopBar.css";

function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar-brand">
        <div className="brand-logo">
          <div className="logo-icon"></div>
        </div>
        <span className="brand-text">HUniTalk</span>
      </div>

      <div className="search-container">
        <Search className="search-icon" size={16} />
        <input
          type="text"
          placeholder="Search HUniTalk"
          className="search-input"
        />
      </div>

      <div className="topbar-actions">
        <button className="create-button">
          <Plus size={16} />
          <span>Create</span>
        </button>

        <div className="notification-container">
          <Bell size={20} />
          <span className="notification-count">5</span>
        </div>

        <div className="user-profile">
          <img
            src="https://via.placeholder.com/32x32/4a5568/ffffff?text=U"
            alt="User"
            className="profile-image"
          />
        </div>
      </div>
    </div>
  );
}

export default TopBar;
