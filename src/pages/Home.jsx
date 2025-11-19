import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
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
  const [userVotes, setUserVotes] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/posts");
      // Assuming response.data is the array of posts or response.data.data
      setPosts(
        Array.isArray(response.data) ? response.data : response.data.data || []
      );
      setLoading(false);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again later.");
      setLoading(false);
    }
  };

  const handleVote = async (postId, voteType) => {
    // Optimistic update
    const currentVote = userVotes[postId];
    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) return;

    const originalPost = posts[postIndex];
    let newVotes = originalPost.votes;

    if (currentVote === voteType) {
      // Unvote logic would go here if supported, but for now let's just toggle
      // If already upvoted and clicking upvote again -> usually unvote
      // But the API routes provided are just /upvote and /downvote
      // Let's assume we just call the API
    }

    // For now, let's just call the API and refresh or update state based on response
    // to avoid complex optimistic logic without knowing backend behavior exactly
    try {
      if (voteType === "up") {
        await api.post(`/posts/${postId}/upvote`);
      } else {
        await api.post(`/posts/${postId}/downvote`);
      }

      // Refresh posts to get updated counts
      // Or manually update if we knew the calculation
      fetchPosts();

      setUserVotes((prev) => ({
        ...prev,
        [postId]: voteType,
      }));
    } catch (err) {
      console.error("Error voting:", err);
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
              <span className="feature-item">
                <span className="feature-icon">👥</span>
                Connect with classmates
              </span>
              <span className="feature-separator">•</span>
              <span className="feature-item">
                <span className="feature-icon">📚</span>
                Share knowledge
              </span>
              <span className="feature-separator">•</span>
              <span className="feature-item">
                <span className="feature-icon">💡</span>
                Get help
              </span>
            </div>
          </div>

          <div className="posts-feed">
            {posts.map((post) => (
              <article key={post.id} className="post-card">
                <div className="post-votes">
                  <button
                    className={`vote-button vote-up ${
                      userVotes[post.id] === "up" ? "active" : ""
                    }`}
                    onClick={() => handleVote(post.id, "up")}
                    aria-label="Upvote post"
                  >
                    ▲
                  </button>
                  <span className="vote-count">{post.votes}</span>
                  <button
                    className={`vote-button vote-down ${
                      userVotes[post.id] === "down" ? "active" : ""
                    }`}
                    onClick={() => handleVote(post.id, "down")}
                    aria-label="Downvote post"
                  >
                    ▼
                  </button>
                </div>

                <div className="post-content">
                  <div className="post-meta">
                    <span className="post-community">{post.community}</span>
                    <span className="post-separator">•</span>
                    <span className="post-author">Posted by {post.author}</span>
                    <span className="post-separator">•</span>
                    <span className="post-time">{post.timestamp}</span>
                  </div>

                  <h2 className="post-title">{post.title}</h2>
                  <p className="post-body">{post.body}</p>

                  <div className="post-actions">
                    <button
                      className="action-button"
                      aria-label={`View ${post.comments} comments`}
                    >
                      💬 {post.comments} comments
                    </button>
                    <button className="action-button" aria-label="Share post">
                      🔗 Share
                    </button>
                    <button className="action-button" aria-label="Save post">
                      🔖 Save
                    </button>
                  </div>
                </div>
              </article>
            ))}
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
