import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import api from "../api/axios";
import useVoting from "../hooks/useVoting";
import "../styles/Home.css";

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    body: "",
    community: "",
  });

  const { userVotes, handleVote, initializeVotes } = useVoting(posts, "post");

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
      alert("Failed to update vote. Please try again.");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/posts");
      // Handle different response structures
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

        let communityName = "";
        if (typeof post.community === "object" && post.community !== null) {
          communityName = post.community.name || "";
        } else if (typeof post.community === "string") {
          communityName = post.community;
        } else {
          communityName = post.community_name || "";
        }

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
      setLoading(false);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load posts. Please try again later."
      );
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (
      !newPost.title.trim() ||
      !newPost.body.trim() ||
      !newPost.community.trim()
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await api.post("/posts", {
        title: newPost.title,
        body: newPost.body,
        community_id: 1, // Hardcoded for now as we need community ID, not name.
        // TODO: We need a dropdown of communities to select from
      });

      setPosts([response.data, ...posts]);
      setNewPost({ title: "", body: "", community: "" });
      setIsModalOpen(false);
      fetchPosts(); // Refresh to be sure
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Failed to create post");
    }
  };

  return (
    <Layout onCreatePost={() => setIsModalOpen(true)}>
      <div className="feed-container">
        <div className="posts-section">
          {/* Page Header */}
          <div className="page-header">
            <h1 className="page-title">Home</h1>
            <div className="page-divider"></div>
            <h2 className="page-subtitle">University Q&A Platform</h2>
            <div className="page-features">
              <span className="feature-item">Connect with classmates</span>
              <span className="feature-separator">•</span>
              <span className="feature-item">Share knowledge</span>
              <span className="feature-separator">•</span>
              <span className="feature-item">Get help</span>
            </div>
          </div>

          <div className="posts-feed">
            {loading && posts.length === 0 ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading posts...</p>
              </div>
            ) : error && posts.length === 0 ? (
              <div className="error-container">
                <p>{error}</p>
                <button onClick={fetchPosts} className="retry-btn">
                  Retry
                </button>
              </div>
            ) : posts.length === 0 ? (
              <div className="empty-state">
                <p>No posts yet. Be the first to create one!</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  userVote={userVotes[post.id] || null}
                  onVote={onVote}
                  showCommunity={true}
                />
              ))
            )}
          </div>
        </div>

        {/* Guidelines Sidebar */}
        <aside className="guidelines-sidebar">
          <div className="guidelines-card">
            <div className="guidelines-header">
              <div className="guidelines-logo">
                <div className="logo-icon">HU</div>
                <span className="logo-text">HUniTalk</span>
              </div>
            </div>

            <div className="guidelines-content">
              <h3 className="guidelines-title">Home</h3>
              <p className="guidelines-description">
                Your personal HUniTalk page. Come here to check in with your
                favorite communities.
              </p>
            </div>

            <div className="guidelines-divider"></div>

            <div className="guidelines-list">
              <button className="guideline-item">
                <span className="guideline-number">1</span>
                <span className="guideline-text">Remember to be human</span>
              </button>
              <button className="guideline-item">
                <span className="guideline-number">2</span>
                <span className="guideline-text">
                  Behave like you would in real life
                </span>
              </button>
              <button className="guideline-item">
                <span className="guideline-number">3</span>
                <span className="guideline-text">
                  Look for the original source of content
                </span>
              </button>
              <button className="guideline-item">
                <span className="guideline-number">4</span>
                <span className="guideline-text">
                  Search for duplicates before posting
                </span>
              </button>
              <button className="guideline-item">
                <span className="guideline-number">5</span>
                <span className="guideline-text">
                  Read the community's rules
                </span>
              </button>
            </div>

            <div className="guidelines-divider"></div>
          </div>
        </aside>
      </div>

      {/* Create Post Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create a Post</h2>
              <button
                className="modal-close"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-form">
              <div className="form-group">
                <label htmlFor="community">Community</label>
                <input
                  id="community"
                  type="text"
                  placeholder="e.g., Computer Science Community"
                  value={newPost.community}
                  onChange={(e) =>
                    setNewPost({ ...newPost, community: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  placeholder="Enter an interesting title"
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="body">Body</label>
                <textarea
                  id="body"
                  placeholder="What would you like to share?"
                  rows="6"
                  value={newPost.body}
                  onChange={(e) =>
                    setNewPost({ ...newPost, body: e.target.value })
                  }
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button onClick={handleCreatePost} className="button-primary">
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Home;
