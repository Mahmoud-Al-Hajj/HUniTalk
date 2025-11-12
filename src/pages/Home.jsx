import React, { useState } from "react";
import "../styles/Home.css";

const initialPosts = [
  {
    id: 1,
    title: "Teacher has accused me of using ChatGPT",
    body: "My teacher has accused me of using ChatGPT on two of my essay's. I did not use it. She emailed me with screenshots showing a software saying it's 60% AI generated and she will be having a conversation with me tommorow. I go to a strict boarding school and they take this stuff really seriously. What can I tell her? Also is there any way to actually prove you used ChatGPT?",
    community: "Computer Science Community",
    author: "JimmyOrval",
    timestamp: "2 days ago",
    votes: 803,
    comments: 360,
  },
  {
    id: 2,
    title: "Best practices for React state management in 2024",
    body: "I've been working with React for a few years now, and I'm curious what everyone thinks about state management solutions. Are we still using Redux? Has Zustand taken over? What about the new use hook in React 19?",
    community: "reactjs",
    author: "devmaster99",
    timestamp: "5 hours ago",
    votes: 245,
    comments: 89,
  },
  {
    id: 3,
    title: "Just landed my first dev job!",
    body: "After 8 months of learning and applying, I finally got an offer as a junior frontend developer. The interview process was tough but fair. For those still searching - don't give up!",
    community: "webdev",
    author: "codernewbie",
    timestamp: "1 day ago",
    votes: 1542,
    comments: 203,
  },
  {
    id: 4,
    title: "CSS Grid vs Flexbox - when to use which?",
    body: "I keep seeing debates about this. Some people swear by Grid for everything, others stick with Flexbox. What's your approach? Do you use both depending on the situation?",
    community: "css",
    author: "stylewizard",
    timestamp: "3 days ago",
    votes: 421,
    comments: 156,
  },
];

function Home() {
  const [posts, setPosts] = useState(initialPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    body: "",
    community: "",
  });
  const [userVotes, setUserVotes] = useState({});

  const handleVote = (postId, voteType) => {
    const currentVote = userVotes[postId];

    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          let newVotes = post.votes;

          if (currentVote === voteType) {
            // Unvote
            newVotes = voteType === "up" ? post.votes - 1 : post.votes + 1;
          } else if (currentVote) {
            // Change vote
            newVotes = voteType === "up" ? post.votes + 2 : post.votes - 2;
          } else {
            // New vote
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
  };

  const handleCreatePost = (e) => {
    e.preventDefault();

    if (
      !newPost.title.trim() ||
      !newPost.body.trim() ||
      !newPost.community.trim()
    ) {
      alert("Please fill in all fields");
      return;
    }

    const post = {
      id: Date.now(),
      title: newPost.title,
      body: newPost.body,
      community: newPost.community,
      author: "You",
      timestamp: "Just now",
      votes: 1,
      comments: 0,
    };

    setPosts([post, ...posts]);
    setNewPost({ title: "", body: "", community: "" });
    setIsModalOpen(false);
  };

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <ul className="navbar-menu">
          <li className="navbar-item active">
            <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Home</span>
          </li>
          <li className="navbar-item">
            <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
            <span>Discover</span>
          </li>
          <li className="navbar-item">
            <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
            <span>My Posts</span>
          </li>
          <li className="navbar-item">
            <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
            <span>Communities</span>
          </li>
          <li className="navbar-item">
            <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
            </svg>
            <span>Saved</span>
          </li>
          <li className="navbar-item">
            <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z" />
            </svg>
            <span>AskHUni</span>
          </li>
        </ul>

        <div className="navbar-divider"></div>

        <ul className="navbar-footer">
          <li className="navbar-item">
            <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
            </svg>
            <span>HUniTalk Rules</span>
          </li>
          <li className="navbar-item">
            <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            <span>Privacy Policy</span>
          </li>
          <li className="navbar-item">
            <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 13.75c-2.34 0-7 1.17-7 3.5V19h14v-1.75c0-2.33-4.66-3.5-7-3.5zM4.34 17c.84-.58 2.87-1.25 4.66-1.25s3.82.67 4.66 1.25H4.34zM9 12c1.93 0 3.5-1.57 3.5-3.5S10.93 5 9 5 5.5 6.57 5.5 8.5 7.07 12 9 12zm0-5c.83 0 1.5.67 1.5 1.5S9.83 10 9 10s-1.5-.67-1.5-1.5S8.17 7 9 7zm7.04 6.81c1.16.84 1.96 1.96 1.96 3.44V19h4v-1.75c0-2.02-3.5-3.17-5.96-3.44zM15 12c1.93 0 3.5-1.57 3.5-3.5S16.93 5 15 5c-.54 0-1.04.13-1.5.35.63.89 1 1.98 1 3.15s-.37 2.26-1 3.15c.46.22.96.35 1.5.35z" />
            </svg>
            <span>User Agreement</span>
          </li>
        </ul>
      </nav>

      {/* TopBar */}
      <header className="topbar">
        <div className="topbar-content">
          <div className="topbar-brand">
            <div className="logo">HU</div>
            <span className="brand-name">HUniTalk</span>
          </div>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search HUniTalk"
              className="search-input"
              aria-label="Search HUniTalk"
            />
          </div>
          <div className="topbar-actions">
            <button
              className="create-button"
              onClick={() => setIsModalOpen(true)}
              aria-label="Create new post"
            >
              + Create
            </button>
            <div className="notification-icon">
              <span>🔔</span>
              <span className="notification-badge">3</span>
            </div>
            <div className="user-avatar">U</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
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
                      <span className="post-author">
                        Posted by {post.author}
                      </span>
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
      </main>

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
    </div>
  );
}

export default Home;
