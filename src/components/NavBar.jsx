import React from "react";
import {
  Home,
  Globe,
  Edit3,
  Users,
  Bookmark,
  HelpCircle,
  FileText,
  Shield,
  File,
} from "lucide-react";
import "../styles/NavBar.css";

function NavBar() {
  return (
    <div className="navbar">
      <nav className="nav-main">
        <div className="nav-item active">
          <Home size={18} />
          <span>Home</span>
        </div>

        <div className="nav-item">
          <Globe size={18} />
          <span>Discover</span>
        </div>

        <div className="nav-item">
          <Edit3 size={18} />
          <span>My Posts</span>
        </div>

        <div className="nav-item">
          <Users size={18} />
          <span>Communities</span>
        </div>

        <div className="nav-item">
          <Bookmark size={18} />
          <span>Saved</span>
        </div>

        <div className="nav-item">
          <HelpCircle size={18} />
          <span>AskHUni</span>
        </div>
      </nav>

      <div className="nav-divider"></div>

      <nav className="nav-footer">
        <div className="nav-item">
          <FileText size={18} />
          <span>HUniTalk Rules</span>
        </div>

        <div className="nav-item">
          <Shield size={18} />
          <span>Privacy Policy</span>
        </div>

        <div className="nav-item">
          <File size={18} />
          <span>User Agreement</span>
        </div>
      </nav>
    </div>
  );
}

export default NavBar;
