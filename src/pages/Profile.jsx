import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import "../styles/Profile.css";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // 1. Fetch User Profile
      const profileResponse = await api.get("/user/profile");
      const userData = profileResponse.data;
      setProfile(userData);

      // 2. Fetch User's Posts (using the user ID from profile)
      if (userData && userData.id) {
        try {
          const postsResponse = await api.get(`/posts/user/${userData.id}`);
          setUserPosts(
            Array.isArray(postsResponse.data)
              ? postsResponse.data
              : postsResponse.data.data || []
          );
        } catch (postErr) {
          console.error("Error fetching user posts:", postErr);
          // Don't fail the whole page if posts fail
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile.");
      setLoading(false);
    }
  };

  if (loading)
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </Layout>
    );

  if (error)
    return (
      <Layout>
        <div className="error-container">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={fetchProfileData} className="retry-btn">
            Retry
          </button>
        </div>
      </Layout>
    );

  if (!profile) return null;

  return (
    <Layout>
      <div className="profile-container">
        {/* Left Column: Feed & Tabs */}
        <div className="profile-feed">
          {/* Tabs */}
          <div className="profile-tabs">
            <div
              className={`profile-tab ${
                activeTab === "overview" ? "active" : ""
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </div>
            <div
              className={`profile-tab ${activeTab === "posts" ? "active" : ""}`}
              onClick={() => setActiveTab("posts")}
            >
              Posts
            </div>
            <div
              className={`profile-tab ${
                activeTab === "comments" ? "active" : ""
              }`}
              onClick={() => setActiveTab("comments")}
            >
              Comments
            </div>
            <div
              className={`profile-tab ${activeTab === "saved" ? "active" : ""}`}
              onClick={() => setActiveTab("saved")}
            >
              Saved
            </div>
          </div>

          {/* Content Area */}
          <div className="profile-content">
            {userPosts.length === 0 ? (
              <div className="no-posts-placeholder">
                <h3>hmm... u haven't posted anything yet</h3>
                <p>Go to a community and start the conversation!</p>
              </div>
            ) : (
              userPosts.map((post) => (
                <article key={post.id} className="post-card">
                  <div className="post-votes">
                    <button className="vote-button vote-up">▲</button>
                    <span className="vote-count">{post.votes || 0}</span>
                    <button className="vote-button vote-down">▼</button>
                  </div>
                  <div className="post-content">
                    <div className="post-meta">
                      <span className="post-community">
                        {post.community_name || `c/${post.community_id}`}
                      </span>
                      <span className="post-separator">•</span>
                      <span className="post-author">
                        Posted by u/{profile.name}
                      </span>
                      <span className="post-separator">•</span>
                      <span className="post-time">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h2 className="post-title">{post.title}</h2>
                    <p className="post-body">{post.body}</p>
                    <div className="post-actions">
                      <button className="action-button">
                        💬 {post.comments_count || 0} Comments
                      </button>
                      <button className="action-button">🔗 Share</button>
                      <button className="action-button">🔖 Save</button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-card">
            <div className="profile-banner"></div>
            <div className="profile-header-info">
              <div className="profile-avatar-wrapper">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="profile-avatar-img"
                  />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </div>

              <h2 className="profile-display-name">{profile.name}</h2>
              <p className="profile-username">
                u/{profile.name.toLowerCase().replace(/\s+/g, "")}
              </p>

              <div className="profile-actions">
                <button className="profile-btn profile-btn-primary">
                  <span>+</span> Create Avatar
                </button>
              </div>

              <div className="profile-stats-grid">
                <div className="stat-box">
                  <span className="stat-label">Reputation</span>
                  <span className="stat-value">
                    <span role="img" aria-label="karma">
                      🌸
                    </span>
                    {profile.reputation || 0}
                  </span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Cake Day</span>
                  <span className="stat-value">
                    <span role="img" aria-label="cake">
                      🍰
                    </span>
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="profile-more-options">
                <button className="options-btn">More Options</button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  );
}

export default Profile;
