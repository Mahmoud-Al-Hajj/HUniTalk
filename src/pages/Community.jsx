import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "../styles/Community.css";
// import axios from 'axios'; // Uncomment when ready to integrate backend

const Community = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();

  // State management
  const [communityData, setCommunityData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [sortBy, setSortBy] = useState("hot"); // hot, new, top
  const [userVotes, setUserVotes] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    body: "",
  });

  // Fetch community data on component mount
  useEffect(() => {
    fetchCommunityData();
    fetchCommunityPosts();
  }, [communityId]);

  // Fetch posts when sort changes
  useEffect(() => {
    fetchCommunityPosts();
  }, [sortBy]);

  // Backend Integration - Fetch Community Data
  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      // const response = await axios.get(`/api/communities/${communityId}`, {
      //   headers: {
      //     Authorization: `Bearer ${localStorage.getItem('token')}`
      //   }
      // });
      // setCommunityData(response.data);
      // setIsJoined(response.data.isJoined);

      // Mock data for now
      setTimeout(() => {
        setCommunityData({
          id: communityId,
          name: "Computer Science Community",
          description:
            "A community for computer science students and professionals to discuss algorithms, data structures, programming languages, and career advice.",
          members: 45230,
          createdAt: "2023-01-15",
          banner: null,
          avatar: "CS",
          rules: [
            "Be respectful and professional",
            "No spam or self-promotion",
            "Stay on topic",
            "Use appropriate flair for posts",
            "Search before posting",
          ],
          moderators: ["Prof_Smith", "AdminCS", "ModHelper"],
        });
        setIsJoined(false);
        setLoading(false);
      }, 800);
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

      // TODO: Replace with actual API call
      // const response = await axios.get(`/api/communities/${communityId}/posts`, {
      //   params: { sort: sortBy },
      //   headers: {
      //     Authorization: `Bearer ${localStorage.getItem('token')}`
      //   }
      // });
      // setPosts(response.data);

      // Mock data for now
      setTimeout(() => {
        setPosts([
          {
            id: 1,
            title: "Teacher has accused me of using ChatGPT",
            body: "My teacher has accused me of using ChatGPT on two of my essay's. I did not use it. She emailed me with screenshots showing a software saying it's 60% AI generated and she will be having a conversation with me tommorow.",
            author: "JimmyOrval",
            timestamp: "2 days ago",
            votes: 803,
            comments: 360,
            isPinned: true,
          },
          {
            id: 2,
            title: "Data Structures Final Exam Tips?",
            body: "Anyone have tips for the upcoming data structures final? What topics should I focus on?",
            author: "studyhard123",
            timestamp: "5 hours ago",
            votes: 45,
            comments: 23,
            isPinned: false,
          },
          {
            id: 3,
            title: "Internship at Google - My Experience",
            body: "Just finished my summer internship at Google. Happy to answer any questions about the interview process and what it's like working there!",
            author: "tech_intern",
            timestamp: "1 day ago",
            votes: 234,
            comments: 87,
            isPinned: false,
          },
        ]);
      }, 500);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again later.");
    }
  };

  // Backend Integration - Join/Leave Community
  const handleJoinCommunity = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await axios.post(`/api/communities/${communityId}/join`, {}, {
      //   headers: {
      //     Authorization: `Bearer ${localStorage.getItem('token')}`
      //   }
      // });

      setIsJoined(!isJoined);
      setCommunityData((prev) => ({
        ...prev,
        members: isJoined ? prev.members - 1 : prev.members + 1,
      }));
    } catch (err) {
      console.error("Error joining/leaving community:", err);
      alert("Failed to update membership. Please try again.");
    }
  };

  // Backend Integration - Vote on Post
  const handleVote = async (postId, voteType) => {
    const currentVote = userVotes[postId];

    // Optimistic UI update
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          let newVotes = post.votes;

          if (currentVote === voteType) {
            newVotes = voteType === "up" ? post.votes - 1 : post.votes + 1;
          } else if (currentVote) {
            newVotes = voteType === "up" ? post.votes + 2 : post.votes - 2;
          } else {
            newVotes = voteType === "up" ? post.votes + 1 : post.votes - 1;
          }

          return { ...post, votes: newVotes };
        }
        return post;
      })
    );

    setUserVotes((prev) => ({
      ...prev,
      [postId]: currentVote === voteType ? null : voteType,
    }));

    try {
      // TODO: Replace with actual API call
      // await axios.post(`/api/posts/${postId}/vote`, {
      //   voteType: currentVote === voteType ? 'unvote' : voteType
      // }, {
      //   headers: {
      //     Authorization: `Bearer ${localStorage.getItem('token')}`
      //   }
      // });
    } catch (err) {
      console.error("Error voting:", err);
      // Revert optimistic update on error
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
      // TODO: Replace with actual API call
      // const response = await axios.post(`/api/communities/${communityId}/posts`, {
      //   title: newPost.title,
      //   body: newPost.body
      // }, {
      //   headers: {
      //     Authorization: `Bearer ${localStorage.getItem('token')}`
      //   }
      // });

      // Mock new post creation
      const post = {
        id: posts.length + 1,
        title: newPost.title,
        body: newPost.body,
        author: "CurrentUser", // Will come from auth context
        timestamp: "Just now",
        votes: 1,
        comments: 0,
        isPinned: false,
      };

      setPosts([post, ...posts]);
      setNewPost({ title: "", body: "" });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Failed to create post. Please try again.");
    }
  };

  // Navigate to post detail
  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
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
    <Layout onCreatePost={() => setIsModalOpen(true)}>
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
                <h1 className="community-name">{communityData?.name}</h1>
                <p className="community-members">
                  {communityData?.members?.toLocaleString()} members
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
              {isJoined && (
                <button
                  className="create-post-button"
                  onClick={() => setIsModalOpen(true)}
                >
                  + Create Post
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="community-content">
          {/* Left Section - Posts */}
          <div className="posts-section">
            {/* About Section (Mobile) */}
            <div className="about-section-mobile">
              <h3>About Community</h3>
              <p className="community-description">
                {communityData?.description}
              </p>
            </div>

            {/* Sort Options */}
            <div className="sort-bar">
              <button
                className={`sort-option ${sortBy === "hot" ? "active" : ""}`}
                onClick={() => setSortBy("hot")}
              >
                🔥 Hot
              </button>
              <button
                className={`sort-option ${sortBy === "new" ? "active" : ""}`}
                onClick={() => setSortBy("new")}
              >
                ✨ New
              </button>
              <button
                className={`sort-option ${sortBy === "top" ? "active" : ""}`}
                onClick={() => setSortBy("top")}
              >
                🏆 Top
              </button>
            </div>

            {/* Posts List */}
            <div className="posts-list">
              {posts.length === 0 ? (
                <div className="no-posts">
                  <p>No posts yet. Be the first to post!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className={`post-card ${post.isPinned ? "pinned" : ""}`}
                  >
                    {post.isPinned && (
                      <div className="pinned-badge">📌 Pinned</div>
                    )}

                    <div className="post-votes">
                      <button
                        className={`vote-btn upvote ${
                          userVotes[post.id] === "up" ? "active" : ""
                        }`}
                        onClick={() => handleVote(post.id, "up")}
                      >
                        ▲
                      </button>
                      <span className="vote-count">{post.votes}</span>
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
                      onClick={() => handlePostClick(post.id)}
                    >
                      <h3 className="post-title">{post.title}</h3>
                      <p className="post-body">{post.body}</p>
                      <div className="post-meta">
                        <span className="post-author">
                          Posted by u/{post.author}
                        </span>
                        <span className="post-separator">•</span>
                        <span className="post-time">{post.timestamp}</span>
                        <span className="post-separator">•</span>
                        <span className="post-comments">
                          💬 {post.comments} comments
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
                    {communityData?.members?.toLocaleString()}
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
                  {new Date(communityData?.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="sidebar-card rules-card">
              <h3>Community Rules</h3>
              <ol className="rules-list">
                {communityData?.rules?.map((rule, index) => (
                  <li key={index} className="rule-item">
                    {rule}
                  </li>
                ))}
              </ol>
            </div>

            <div className="sidebar-card moderators-card">
              <h3>Moderators</h3>
              <ul className="moderators-list">
                {communityData?.moderators?.map((mod, index) => (
                  <li key={index} className="moderator-item">
                    <span className="mod-icon">👤</span>
                    <span className="mod-name">u/{mod}</span>
                  </li>
                ))}
              </ul>
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
