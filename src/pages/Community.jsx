import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import api from "../api/axios";
import useVoting from "../hooks/useVoting";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    body: "",
  });

  const { userVotes, handleVote, initializeVotes } = useVoting(
    posts,
    "post",
    "communityPostVotes"
  );

  const onVote = async (postId, voteType) => {
    try {
      await handleVote(postId, voteType, (id, delta, isAbsolute) => {
        setPosts((prevPosts) =>
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
      console.error("Vote failed:", err);
      alert("Failed to update vote. Please try again.");
    }
  };

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
      const postsData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.posts || [];

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
        } else if (Array.isArray(post.votes)) {
          // If votes is an array, calculate from upvotes/downvotes
          voteCount = (post.upvotes || 0) - (post.downvotes || 0);
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

        // Return clean post object without nested arrays/objects
        return {
          id: post.id,
          title: post.title || "",
          body: post.body || post.content || "",
          votes: voteCount,
          comments: post.comments_count || post.comments || 0,
          user_vote: post.user_vote, // Keep as is (number: 1, -1, or null)
          author: authorName,
          community_name: communityName,
          created_at: post.created_at || post.timestamp || null,
          // Don't include the votes array or other nested objects
        };
      });

      setPosts(normalizedPosts);
      initializeVotes(normalizedPosts);
    } catch (err) {
      console.error("Error fetching community posts:", err);
      setError("Failed to load posts. Please try again later.");
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

      // Normalize the new post data to match our structure
      const createdPost = response.data;
      const normalizedNewPost = {
        id: createdPost.id,
        title: createdPost.title || "",
        body: createdPost.body || "",
        votes:
          createdPost.upvotes !== undefined &&
          createdPost.downvotes !== undefined
            ? createdPost.upvotes - createdPost.downvotes
            : typeof createdPost.votes === "number"
            ? createdPost.votes
            : createdPost.votes_count || 0,
        comments: createdPost.comments_count || createdPost.comments || 0,
        user_vote: createdPost.user_vote || null,
        author:
          typeof createdPost.user === "object" && createdPost.user !== null
            ? createdPost.user.name || createdPost.user.username || "Anonymous"
            : typeof createdPost.author === "string"
            ? createdPost.author
            : "Anonymous",
        community_name:
          typeof createdPost.community === "object" &&
          createdPost.community !== null
            ? createdPost.community.name
            : createdPost.community_name || createdPost.community || "",
        created_at: createdPost.created_at || new Date().toISOString(),
      };

      setPosts([normalizedNewPost, ...posts]);
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
      <div className="community-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading community...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
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
              {loading && posts.length === 0 ? (
                <div className="no-posts">
                  <div className="spinner"></div>
                  <p>Loading posts...</p>
                </div>
              ) : error && posts.length === 0 ? (
                <div className="no-posts">
                  <p>{error}</p>
                  <button
                    onClick={fetchCommunityPosts}
                    className="retry-button"
                    style={{ marginTop: "12px" }}
                  >
                    Retry
                  </button>
                </div>
              ) : posts.length === 0 ? (
                <div className="no-posts">
                  <p>No posts yet. Be the first to post!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    userVote={userVotes[post.id] || null}
                    onVote={onVote}
                    onClick={(postId) => navigate(`/post/${postId}`)}
                    showCommunity={false}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar - Community Info */}
          <aside className="community-sidebar">
            <div className="sidebar-card about-card">
              <h3>About Community</h3>
              <p className="community-description">
                {typeof communityData?.description === "string"
                  ? communityData.description
                  : typeof communityData?.description === "object" &&
                    communityData?.description !== null
                  ? communityData.description.text ||
                    communityData.description.description ||
                    ""
                  : communityData?.description || ""}
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
                  {communityData?.created_at
                    ? new Date(communityData.created_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
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
                    className="modal-cancel-btn"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="modal-submit-btn">
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
