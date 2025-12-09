import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/axios";
import useVoting from "../hooks/useVoting";
import "../styles/Profile.css";
import { FaPlus } from "react-icons/fa6";

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [followedCommunities, setFollowedCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const { userVotes, handleVote, initializeVotes } = useVoting(
    userPosts,
    "post"
  );

  const onVote = async (postId, voteType) => {
    try {
      await handleVote(postId, voteType, (id, delta, isAbsolute) => {
        setUserPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === id
              ? {
                  ...post,
                  votes: isAbsolute ? delta : (post.votes || 0) + delta,
                }
              : post
          )
        );
      });
    } catch (err) {
      alert("Failed to update vote. Please try again.");
    }
  };

  useEffect(() => {
    fetchProfileData();
    loadSavedPosts();
    loadAvatarFromStorage();
    const handleLogout = () => {
      setSavedPosts([]);
    };
    window.addEventListener("logout", handleLogout);
    return () => window.removeEventListener("logout", handleLogout);
  }, []);

  const loadSavedPosts = () => {
    const saved = localStorage.getItem("savedPosts");
    if (saved) {
      setSavedPosts(JSON.parse(saved));
    }
  };

  const loadAvatarFromStorage = () => {
    const savedAvatar = localStorage.getItem("userAvatar");
    if (savedAvatar) {
      setProfile((prev) => ({
        ...prev,
        avatar: savedAvatar,
      }));
    }
  };

  const handleUnsavePost = (postId) => {
    const saved = localStorage.getItem("savedPosts");
    if (saved) {
      const savedArray = JSON.parse(saved);
      const filtered = savedArray.filter((p) => p.id !== postId);
      localStorage.setItem("savedPosts", JSON.stringify(filtered));
      setSavedPosts(filtered);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    try {
      setUploadingAvatar(true);

      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;

        // Save to localStorage
        localStorage.setItem("userAvatar", base64String);
        // Dispatch a custom event for same-tab updates (TopBar listens to this)
        try {
          window.dispatchEvent(new Event("avatarUpdated"));
        } catch (e) {
          // ignore
        }

        // Update profile state
        setProfile((prev) => ({
          ...prev,
          avatar: base64String,
        }));

        setUploadingAvatar(false);
      };

      reader.onerror = () => {
        alert("Failed to read image file");
        setUploadingAvatar(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error uploading avatar:", err);
      alert("Failed to upload avatar. Please try again.");
      setUploadingAvatar(false);
    }
  };

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

      // Load avatar from localStorage if available
      const savedAvatar = localStorage.getItem("userAvatar");

      setProfile({
        ...profileRes.data,
        avatar: savedAvatar || profileRes.data.avatar,
      });

      const postsData = Array.isArray(postsRes.data)
        ? postsRes.data
        : postsRes.data?.data || [];

      // Normalize post data - remove nested objects that could cause rendering errors
      const normalizedPosts = postsData.map((post) => {
        // Calculate vote count from upvotes/downvotes or use existing count
        let voteCount = 0;
        if (post.upvotes !== undefined && post.downvotes !== undefined) {
          voteCount = post.upvotes - post.downvotes;
        } else if (typeof post.votes === "number") {
          voteCount = post.votes;
        } else if (post.votes_count !== undefined) {
          voteCount = post.votes_count;
        }

        // Extract author name safely
        let authorName = "Anonymous";
        if (typeof post.author === "string") {
          authorName = post.author;
        } else if (typeof post.user === "object" && post.user !== null) {
          authorName = post.user.name || post.user.username || "Anonymous";
        } else if (typeof post.author === "object" && post.author !== null) {
          authorName = post.author.name || post.author.username || "Anonymous";
        }

        // Extract community name safely
        let communityName = "";
        if (typeof post.community === "object" && post.community !== null) {
          communityName = post.community.name || "";
        } else if (typeof post.community === "string") {
          communityName = post.community;
        } else {
          communityName = post.community_name || "";
        }

        // Normalize user_vote to prevent object rendering
        let normalizedUserVote = null;
        if (typeof post.user_vote === "object" && post.user_vote !== null) {
          if (post.user_vote.type === "upvote") {
            normalizedUserVote = 1;
          } else if (post.user_vote.type === "downvote") {
            normalizedUserVote = -1;
          }
        } else if (typeof post.user_vote === "number") {
          normalizedUserVote = post.user_vote;
        } else if (typeof post.user_vote === "string") {
          normalizedUserVote = parseInt(post.user_vote, 10) || null;
        }

        // Return clean post object without nested arrays/objects
        return {
          id: post.id,
          title: post.title || "",
          body: post.body || post.content || "",
          votes: voteCount,
          comments: post.comments_count || post.comments || 0,
          user_vote: normalizedUserVote, // Keep as number: 1, -1, or null
          author: authorName,
          community_name: communityName,
          created_at: post.created_at || post.timestamp || null,
          // Don't include the votes array or other nested objects
        };
      });

      setUserPosts(normalizedPosts);

      initializeVotes(normalizedPosts);

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

  const renderContent = () => {
    if (activeTab === "saved") {
      if (savedPosts.length === 0) {
        return (
          <div className="empty-state">
            <div className="empty-icon">🔖</div>
            <h3 className="empty-title">No saved posts yet</h3>
            <p className="empty-description">Save posts to view them later</p>
            <button className="primary-btn" onClick={() => navigate("/home")}>
              Browse Posts
            </button>
          </div>
        );
      }

      return savedPosts.map((post) => (
        <div key={post.id} className="post-card">
          <div className="post-votes">
            <button className="vote-btn">▲</button>
            <span className="vote-count">{post.votes || 0}</span>
            <button className="vote-btn">▼</button>
          </div>
          <div className="post-content">
            <div className="post-header">
              <span className="post-community">
                c/
                {post.community_name ||
                  (typeof post.community === "object" && post.community !== null
                    ? post.community.name
                    : post.community) ||
                  "unknown"}
              </span>
              <span className="post-separator">•</span>
              <span className="post-date">
                {post.created_at
                  ? new Date(post.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "Recently"}
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
                <span>{post.comments || 0}</span>
              </button>
              <button className="post-stat">
                <span>↗</span>
                <span>Share</span>
              </button>
              <button
                className="post-stat unsave-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnsavePost(post.id);
                }}
              >
                <span>❌</span>
                <span>Unsave</span>
              </button>
            </div>
          </div>
        </div>
      ));
    }

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
              onClick={() => onVote(post.id, "up")}
            >
              ▲
            </button>
            <span className="vote-count">{post.votes || 0}</span>
            <button
              className={`vote-btn ${
                userVotes[post.id] === "down" ? "active" : ""
              }`}
              onClick={() => onVote(post.id, "down")}
            >
              ▼
            </button>
          </div>
          <div className="post-content">
            <div className="post-header">
              <span className="post-community">
                c/
                {post.community_name ||
                  (typeof post.community === "object" && post.community !== null
                    ? post.community.name
                    : post.community) ||
                  post.community_id ||
                  "unknown"}
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
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <h2>⚠️ Error</h2>
        <p>{error}</p>
        <button onClick={fetchProfileData} className="retry-btn">
          Retry
        </button>
      </div>
    );

  if (!profile) return null;

  return (
    <Layout>
      <div className="profile-page">
        <div className="profile-container">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar-container">
              <div className="profile-avatar">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {typeof profile.name === "string"
                      ? profile.name.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                )}
              </div>
              <label className="avatar-upload-btn" htmlFor="avatar-upload">
                {uploadingAvatar ? (
                  <span className="upload-spinner">⏳</span>
                ) : (
                  <span className="camera">
                    <FaPlus />
                  </span>
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
            </div>
            <h1 className="profile-name">
              {typeof profile.name === "string" ? profile.name : "User"}
            </h1>
            <p className="profile-username">
              @
              {typeof profile.name === "string"
                ? profile.name.toLowerCase().replace(/\s+/g, "")
                : "user"}
            </p>
          </div>

          {/* Profile Stats */}
          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-value">
                {typeof profile.reputation === "number"
                  ? profile.reputation
                  : 0}
              </div>
              <div className="stat-label">Reputation</div>
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
                    {followedCommunities.map((community) => {
                      // Ensure community name is a string, not an object
                      const communityName =
                        typeof community.name === "string"
                          ? community.name
                          : typeof community.name === "object" &&
                            community.name !== null
                          ? community.name.name || "Unknown"
                          : "Unknown";

                      return (
                        <button
                          key={community.id}
                          className="community-item"
                          onClick={() => navigate(`/community/${community.id}`)}
                        >
                          <div className="community-icon">
                            {communityName.charAt(0).toUpperCase()}
                          </div>
                          <div className="community-info">
                            <div className="community-name">
                              c/{communityName}
                            </div>
                            <div className="community-members">
                              {community.followers_count ||
                                community.members_count ||
                                0}{" "}
                              members
                            </div>
                          </div>
                        </button>
                      );
                    })}
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
