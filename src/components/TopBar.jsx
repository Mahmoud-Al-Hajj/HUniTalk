import React from "react";
import { Search, Plus, Bell } from "lucide-react";
import "../styles/TopBar.css";

function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="logo-container">
          <div className="logo-icon">
            <div className="logo-chat-bubble">
              <div className="logo-avatar"></div>
            </div>
          </div>
          <span className="logo-text">
            HU<span className="logo-highlight">ni</span>Talk
          </span>
        </div>
      </div>

      <div className="topbar-center">
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search HUniTalk"
            className="search-input"
          />
        </div>
      </div>

      <div className="topbar-right">
        <button className="create-btn">
          <Plus size={16} />
          <span>Create</span>
        </button>

        <div className="notification-container">
          <Bell size={20} />
          <span className="notification-badge">2</span>
        </div>

        <div className="user-avatar">
          <img
            src="/api/placeholder/32/32"
            alt="User Avatar"
            className="avatar-image"
          />
        </div>
      </div>
    </div>
  );
}

export default TopBar;
