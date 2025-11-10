import React from "react";
import { Home } from "lucide-react";
import "../styles/Sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-card">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <div className="sidebar-chat-bubble">
                <div className="sidebar-avatar"></div>
              </div>
            </div>
            <span className="sidebar-logo-text">
              HU<span className="sidebar-highlight">ni</span>Talk
            </span>
          </div>
        </div>

        <div className="sidebar-menu">
          <div className="sidebar-item active">
            <Home size={18} />
            <span>Home</span>
          </div>
        </div>

        <div className="sidebar-description">
          <p>
            Your personal HUniTalk page. Come here to check in with your
            favorite communities.
          </p>
        </div>

        <div className="sidebar-guidelines">
          <h4>Posting to HUniTalk</h4>
          <ul>
            <li>Remember the human</li>
            <li>Behave like you would in real life</li>
            <li>Look for the original source of content</li>
            <li>Search for duplicates before posting</li>
            <li>Read the community's rules</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
