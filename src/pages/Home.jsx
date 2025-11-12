import React, { useState } from "react";
import Layout from "../components/Layout";
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
