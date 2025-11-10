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
  UserCheck,
} from "lucide-react";
import "../styles/NavBar.css";

function NavBar() {
  return (
    <div className="navbar">
      <div className="navbar-logo">
        <div className="logo-icon">
          <div className="logo-shape"></div>
        </div>
        <span className="logo-text">HUniTalk</span>
      </div>

      <nav className="navbar-menu">
        <a href="/home" className="nav-item active">
          <Home size={20} />
          <span>Home</span>
        </a>
        <a href="/discover" className="nav-item">
          <Globe size={20} />
          <span>Discover</span>
        </a>
        <a href="/posts" className="nav-item">
          <Edit3 size={20} />
          <span>My Posts</span>
        </a>
        <a href="/communities" className="nav-item">
          <Users size={20} />
          <span>Communities</span>
        </a>
        <a href="/saved" className="nav-item">
          <Bookmark size={20} />
          <span>Saved</span>
        </a>
        <a href="/ask" className="nav-item">
          <HelpCircle size={20} />
          <span>AskHUni</span>
        </a>
      </nav>

      <div className="navbar-footer">
        <a href="/rules" className="nav-item">
          <FileText size={20} />
          <span>HUniTalk Rules</span>
        </a>
        <a href="/privacy" className="nav-item">
          <Shield size={20} />
          <span>Privacy Policy</span>
        </a>
        <a href="/agreement" className="nav-item">
          <UserCheck size={20} />
          <span>User Agreement</span>
        </a>
      </div>
    </div>
  );
}

export default NavBar;
