import React from "react";
import { Menu, ChevronDown } from "lucide-react";
import NavBar from "../components/NavBar";
import TopBar from "../components/TopBar";
import "../styles/Home.css";

function Home() {
  return (
    <>
      <TopBar />
      <NavBar />
      <div className="home-container">
        <div className="main-content">
          <div className="content-header">
            <h1 className="page-title">
              <button className="menu-icon">
                <Menu size={20} />
              </button>
              Home
            </h1>
          </div>

          <div className="platform-info">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <span className="platform-badge">University Q&A Platform</span>
              <p className="platform-description">
                Connect with classmates • Share knowledge • Get help
              </p>
            </div>
            <button className="sort-selector">
              <span>Newest</span>
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Main content area for posts */}
          <div
            style={{
              backgroundColor: "#2c2b3d",
              padding: "40px",
              borderRadius: "12px",
              textAlign: "center",
              color: "#9ca3af",
            }}
          >
            <h3 style={{ color: "#ffffff", marginBottom: "10px" }}>
              Welcome to HUniTalk!
            </h3>
            <p>Your posts and community discussions will appear here.</p>
          </div>
        </div>

        <div className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-logo">
              <div className="sidebar-logo-icon"></div>
              <h2 className="sidebar-title">HUniTalk</h2>
            </div>
            <nav className="sidebar-nav">
              <a href="/home" className="sidebar-nav-item active">
                🏠 Home
              </a>
              <span
                style={{
                  color: "#9ca3af",
                  fontSize: "13px",
                  margin: "8px 12px 4px 12px",
                }}
              >
                Your personal HUniTalk page. Come here to check in with your
                favorite communities.
              </span>
              <a href="/posting" className="sidebar-nav-item">
                📝 Posting to HUniTalk
              </a>
            </nav>
          </div>

          <div className="sidebar-section">
            <ul className="posting-guidelines">
              <li>Remember the human</li>
              <li>Behave like you would in real life</li>
              <li>Look for the original source of content</li>
              <li>Search for duplicates before posting</li>
              <li>Read the community's rules</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
