import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/axios";
import "../styles/Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [followedCommunities, setFollowedCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [userVotes, setUserVotes] = useState({});

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      const [profileRes, postsRes, communitiesRes] = await Promise.all([
        api.get("/user/profile"),
        api
          .get("/user/profile")
          .then((res) =>
            res.data?.id
              ? api.get(`/posts/user/${res.data.id}`)
              : Promise.resolve({ data: [] })
          ),
        api.get("/communities/user"),
      ]);

      setProfile(profileRes.data);
      const postsData = Array.isArray(postsRes.data)
        ? postsRes.data
        : postsRes.data?.data || [];
      setUserPosts(postsData);

      // Initialize userVotes from backend data
      const votes = {};
      postsData.forEach((post) => {
        if (post.user_vote) {
          votes[post.id] = post.user_vote;
        }
      });
      setUserVotes(votes);

      setFollowedCommunities(
        Array.isArray(communitiesRes.data)
          ? communitiesRes.data
          : communitiesRes.data?.data || []
      );
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile.");
      setLoading(false);
    }
  };

  const handleVote = async (postId, voteType) => {
    const currentVote = userVotes[postId];
    let voteDelta = 0;

    if (currentVote === voteType) {
      voteDelta = voteType === "up" ? -1 : 1;
    } else if (currentVote) {
      voteDelta = voteType === "up" ? 2 : -2;
    } else {
      voteDelta = voteType === "up" ? 1 : -1;
    }

    setUserPosts((posts) =>
      posts.map((p) =>
        p.id === postId ? { ...p, votes: (p.votes || 0) + voteDelta } : p
      )
    );

    setUserVotes((prev) => ({
      ...prev,
      [postId]: currentVote === voteType ? null : voteType,
    }));

    try {
      await api.post(
        `/posts/${postId}/${voteType === "up" ? "upvote" : "downvote"}`
      );
    } catch (err) {
      console.error("Error voting:", err);
      fetchProfileData();
    }
  };

  const renderContent = () => {
    if (activeTab === "posts") {
      if (userPosts.length === 0) {
        return (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3 className="empty-title">No posts yet</h3>
            <p className="empty-description">
              Share your knowledge and start a conversation
            </p>
            <button
              className="primary-btn"
              onClick={() => navigate("/communities")}
            >
              Browse Communities
            </button>
          </div>
        );
      }

      return userPosts.map((post) => (
        <div key={post.id} className="post-card">
          <div className="post-votes">
            <button
              className={`vote-btn ${
                userVotes[post.id] === "up" ? "active" : ""
              }`}
              onClick={() => handleVote(post.id, "up")}
            >
              ▲
            </button>
            <span className="vote-count">{post.votes || 0}</span>
            <button
              className={`vote-btn ${
                userVotes[post.id] === "down" ? "active" : ""
              }`}
              onClick={() => handleVote(post.id, "down")}
            >
              ▼
            </button>
          </div>
          <div className="post-content">
            <div className="post-header">
              <span className="post-community">
                c/{post.community_name || post.community_id}
              </span>
              <span className="post-separator">•</span>
              <span className="post-date">
                {new Date(post.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <h3
              className="post-title"
              onClick={() => navigate(`/post/${post.id}`)}
            >
              {post.title}
            </h3>
            <p className="post-body">{post.body}</p>
            <div className="post-footer">
              <button className="post-stat">
                <span>💬</span>
                <span>{post.comments_count || 0}</span>
              </button>
              <button className="post-stat">
                <span>↗</span>
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      ));
    }

    return (
      <div className="empty-state">
        <div className="empty-icon">🚧</div>
        <h3 className="empty-title">Coming Soon</h3>
        <p className="empty-description">We're working on this feature</p>
      </div>
    );
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
      <div className="profile-page">
        <div className="profile-container">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} />
              ) : (
                <div className="avatar-placeholder">
                  {profile.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>
            <h1 className="profile-name">{profile.name}</h1>
            <p className="profile-username">
              @{profile.name?.toLowerCase().replace(/\s+/g, "")}
            </p>
          </div>

          {/* Profile Stats */}
          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-value">{profile.reputation || 0}</div>
              <div className="stat-label">Karma</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{userPosts.length}</div>
              <div className="stat-label">Posts</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{followedCommunities.length}</div>
              <div className="stat-label">Communities</div>
            </div>
          </div>

          {/* Profile Tabs */}
          <div className="profile-tabs">
            <button
              className={`profile-tab ${activeTab === "posts" ? "active" : ""}`}
              onClick={() => setActiveTab("posts")}
            >
              Posts
            </button>
            <button
              className={`profile-tab ${
                activeTab === "comments" ? "active" : ""
              }`}
              onClick={() => setActiveTab("comments")}
            >
              Comments
            </button>
            <button
              className={`profile-tab ${activeTab === "saved" ? "active" : ""}`}
              onClick={() => setActiveTab("saved")}
            >
              Saved
            </button>
          </div>

          {/* Two Column Layout */}
          <div className="profile-layout">
            {/* Main Content */}
            <div className="profile-content">{renderContent()}</div>

            {/* Sidebar */}
            <aside className="profile-sidebar">
              {followedCommunities.length > 0 && (
                <div className="sidebar-section">
                  <h3 className="sidebar-title">My Communities</h3>
                  <div className="communities-list">
                    {followedCommunities.map((community) => (
                      <button
                        key={community.id}
                        className="community-item"
                        onClick={() => navigate(`/community/${community.id}`)}
                      >
                        <div className="community-icon">
                          {community.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="community-info">
                          <div className="community-name">
                            c/{community.name}
                          </div>
                          <div className="community-members">
                            {community.followers_count ||
                              community.members_count ||
                              0}{" "}
                            members
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="sidebar-section">
                <h3 className="sidebar-title">Account Info</h3>
                <div className="info-item">
                  <span className="info-label">Joined</span>
                  <span className="info-value">
                    {new Date(profile.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Profile;
