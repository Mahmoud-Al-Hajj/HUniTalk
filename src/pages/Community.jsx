import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/axios";
import "../styles/Community.css";

const Community = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();

  // State management
  const [communityData, setCommunityData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [userVotes, setUserVotes] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    body: "",
  });

  useEffect(() => {
    fetchCommunityData();
    fetchCommunityPosts();
  }, [communityId]);

  // Backend Integration - Fetch Community Data
  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/communities/${communityId}`);
      const communityDataFromApi = response.data;

      // Normalize field names
      const normalizedData = {
        ...communityDataFromApi,
        members_count:
          communityDataFromApi.followers_count ||
          communityDataFromApi.members_count ||
          0,
      };

      setCommunityData(normalizedData);
      const joinedStatus = communityDataFromApi.is_following || false;

      setIsJoined(joinedStatus);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching community data:", err);
      setError("Failed to load community data. Please try again later.");
      setLoading(false);
    }
  };

  // Backend Integration - Fetch Community Posts
  const fetchCommunityPosts = async () => {
    try {
      setError(null);

      const response = await api.get(`/posts/community/${communityId}`);
      setPosts(
        Array.isArray(response.data) ? response.data : response.data.data || []
      );
    } catch (err) {
      console.error("Error fetching community posts:", err);
      // Don't block the whole page if posts fail, just show empty or error in feed
    }
  };

  // Backend Integration - Join/Leave Community
  const handleJoinCommunity = async () => {
    const previousState = isJoined;
    const previousData = communityData;

    try {
      // Optimistic UI update
      setIsJoined(!isJoined);

      if (isJoined) {
        await api.post(`/communities/${communityId}/unfollow`);
        setCommunityData((prev) => ({
          ...prev,
          members_count: Math.max(0, (prev.members_count || 0) - 1),
          followers_count: Math.max(0, (prev.followers_count || 0) - 1),
        }));
      } else {
        await api.post(`/communities/${communityId}/follow`);
        setCommunityData((prev) => ({
          ...prev,
          members_count: (prev.members_count || 0) + 1,
          followers_count: (prev.followers_count || 0) + 1,
        }));
      }
    } catch (err) {
      console.error("Error joining/leaving community:", err);
      // Revert on error
      setIsJoined(previousState);
      setCommunityData(previousData);
      alert("Failed to update membership.");
    }
  };

  // Backend Integration - Vote on Post
  const handleVote = async (postId, voteType) => {
    const currentVote = userVotes[postId];
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    let newVoteState = voteType;
    let voteDelta = 0;

    // Calculate vote delta
    if (currentVote === voteType) {
      // Clicking same button removes vote
      newVoteState = null;
      voteDelta = voteType === "up" ? -1 : 1;
    } else if (currentVote) {
      // Switching from one to another
      voteDelta = voteType === "up" ? 2 : -2;
    } else {
      // First time voting
      voteDelta = voteType === "up" ? 1 : -1;
    }

    // Optimistic UI update
    setPosts(
      posts.map((p) =>
        p.id === postId ? { ...p, votes: (p.votes || 0) + voteDelta } : p
      )
    );

    setUserVotes((prev) => ({
      ...prev,
      [postId]: newVoteState,
    }));

    try {
      if (voteType === "up") {
        await api.post(`/posts/${postId}/upvote`);
      } else {
        await api.post(`/posts/${postId}/downvote`);
      }
    } catch (err) {
      console.error("Error voting:", err);
      fetchCommunityPosts();
    }
  };

  // Backend Integration - Create Post
  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!newPost.title.trim() || !newPost.body.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await api.post("/posts", {
        communities_id: communityId,
        title: newPost.title,
        body: newPost.body,
      });

      setPosts([response.data, ...posts]);
      setNewPost({ title: "", body: "" });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Failed to create post. Please try again.");
    }
  };

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="community-loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading community...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="community-error">
          <div className="error-message">
            <h2>⚠️ Error</h2>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="retry-button"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Main render
  return (
    <Layout>
      <div className="community-page">
        {/* Community Header */}
        <div className="community-header">
          <div className="community-banner">
            {communityData?.banner ? (
              <img src={communityData.banner} alt="Community Banner" />
            ) : (
              <div className="banner-gradient"></div>
            )}
          </div>

          <div className="community-info-bar">
            <div className="community-avatar-section">
              <div className="community-avatar">
                {communityData?.avatar || "C"}
              </div>
              <div className="community-title-section">
                <h1 className="community-name">c/{communityData?.name}</h1>
                <p className="community-members">
                  {(communityData?.members_count || 0).toLocaleString()} members
                </p>
              </div>
            </div>

            <div className="community-actions">
              <button
                className={`join-button ${isJoined ? "joined" : ""}`}
                onClick={handleJoinCommunity}
              >
                {isJoined ? "✓ Joined" : "+ Join"}
              </button>
              <button
                className="create-post-button"
                onClick={() => setIsModalOpen(true)}
                disabled={!isJoined}
                title={
                  !isJoined
                    ? "Join the community to create posts"
                    : "Create a new post"
                }
              >
                + Create Post
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="community-content">
          {/* Left Section - Posts */}
          <div className="posts-section">
            {/* Posts List */}
            <div className="posts-list">
              {posts.length === 0 ? (
                <div className="no-posts">
                  <p>No posts yet. Be the first to post!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="post-card">
                    <div className="post-votes">
                      <button
                        className={`vote-btn upvote ${
                          userVotes[post.id] === "up" ? "active" : ""
                        }`}
                        onClick={() => handleVote(post.id, "up")}
                      >
                        ▲
                      </button>
                      <span className="vote-count">
                        {post.votes || post.votes_count || 0}
                      </span>
                      <button
                        className={`vote-btn downvote ${
                          userVotes[post.id] === "down" ? "active" : ""
                        }`}
                        onClick={() => handleVote(post.id, "down")}
                      >
                        ▼
                      </button>
                    </div>

                    <div
                      className="post-content"
                      onClick={() => navigate(`/post/${post.id}`)}
                    >
                      <h3 className="post-title">{post.title}</h3>
                      <p className="post-body">{post.body}</p>
                      <div className="post-meta">
                        <span className="post-author">
                          Posted by u/
                          {post.author || post.user?.name || "Anonymous"}
                        </span>
                        <span className="post-separator">•</span>
                        <span className="post-time">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                        <span className="post-separator">•</span>
                        <span className="post-comments">
                          💬 {post.comments_count || 0} comments
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar - Community Info */}
          <aside className="community-sidebar">
            <div className="sidebar-card about-card">
              <h3>About Community</h3>
              <p className="community-description">
                {communityData?.description}
              </p>
              <div className="community-stats">
                <div className="stat-item">
                  <span className="stat-value">
                    {(communityData?.members_count || 0).toLocaleString()}
                  </span>
                  <span className="stat-label">Members</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{posts.length}</span>
                  <span className="stat-label">Posts</span>
                </div>
              </div>
              <div className="created-date">
                <span>
                  Created{" "}
                  {new Date(communityData?.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {communityData?.rules && communityData.rules.length > 0 && (
              <div className="sidebar-card rules-card">
                <h3>Community Rules</h3>
                <ol className="rules-list">
                  {communityData.rules.map((rule, index) => (
                    <li key={index} className="rule-item">
                      {rule}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {communityData?.moderators &&
              communityData.moderators.length > 0 && (
                <div className="sidebar-card moderators-card">
                  <h3>Moderators</h3>
                  <ul className="moderators-list">
                    {communityData.moderators.map((mod, index) => (
                      <li key={index} className="moderator-item">
                        <span className="mod-icon">👤</span>
                        <span className="mod-name">u/{mod}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </aside>
        </div>

        {/* Create Post Modal */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create Post in {communityData?.name}</h2>
                <button
                  className="close-modal"
                  onClick={() => setIsModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="post-form">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Post Title"
                    value={newPost.title}
                    onChange={(e) =>
                      setNewPost({ ...newPost, title: e.target.value })
                    }
                    className="form-input"
                    maxLength={300}
                    required
                  />
                </div>

                <div className="form-group">
                  <textarea
                    placeholder="Post Content (optional)"
                    value={newPost.body}
                    onChange={(e) =>
                      setNewPost({ ...newPost, body: e.target.value })
                    }
                    className="form-textarea"
                    rows={8}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Community;
