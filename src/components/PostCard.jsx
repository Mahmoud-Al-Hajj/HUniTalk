import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PostCard.css";

function PostCard({
  post,
  userVote = null,
  onVote,
  onClick,
  showCommunity = true,
  onSave,
  isSaved = false,
}) {
  const navigate = useNavigate();

  // Normalize userVote to ensure it's either "up", "down", or null
  const normalizedUserVote =
    userVote === "up" ? "up" : userVote === "down" ? "down" : null;

  // Normalize post data
  const normalizedPost = {
    id: post.id,
    title: post.title,
    body: post.body || post.content,
    // Handle vote count from different sources
    votes:
      post.votes !== undefined
        ? post.votes
        : post.votes_count !== undefined
        ? post.votes_count
        : 0,
    // Handle comments count from different sources
    comments:
      post.comments !== undefined
        ? post.comments
        : post.comments_count !== undefined
        ? post.comments_count
        : 0,
    // Handle community from different structures
    community:
      typeof post.community === "object" && post.community !== null
        ? post.community.name
        : post.community_name || post.community || "",
    // Handle author from different structures
    author:
      typeof post.author === "object" && post.author !== null
        ? post.author.name || post.author.username
        : post.user?.name || post.user?.username || post.author || "Anonymous",
    // Handle timestamp from different sources
    timestamp: post.timestamp || post.created_at || post.timeAgo || "",
    // Handle date formatting
    formattedDate: post.created_at
      ? new Date(post.created_at).toLocaleDateString()
      : post.timestamp || "",
  };

  const handleVoteClick = (e, voteType) => {
    e.stopPropagation();
    if (onVote) {
      onVote(normalizedPost.id, voteType);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(normalizedPost.id);
    } else {
      navigate(`/post/${normalizedPost.id}`);
    }
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    if (onSave) {
      onSave(post);
    }
  };

  return (
    <div className="post-card" onClick={handleCardClick}>
      <div className="post-votes">
        <button
          className={`vote-button vote-up ${
            normalizedUserVote === "up" ? "active" : ""
          }`}
          onClick={(e) => handleVoteClick(e, "up")}
          disabled={normalizedUserVote === "up"}
          aria-label="Upvote post"
        >
          ▲
        </button>
        <span className="vote-count">{normalizedPost.votes}</span>
        <button
          className={`vote-button vote-down ${
            normalizedUserVote === "down" ? "active" : ""
          }`}
          onClick={(e) => handleVoteClick(e, "down")}
          disabled={normalizedUserVote === "down"}
          aria-label="Downvote post"
        >
          ▼
        </button>
      </div>

      <div className="post-content">
        {showCommunity && normalizedPost.community && (
          <div className="post-meta">
            <span className="post-community">
              {normalizedPost.community.startsWith("c/")
                ? normalizedPost.community
                : `c/${normalizedPost.community}`}
            </span>
            <span className="post-separator">•</span>
            <span className="post-author">
              Posted by u/{normalizedPost.author}
            </span>
            {normalizedPost.formattedDate && (
              <>
                <span className="post-separator">•</span>
                <span className="post-time">
                  {normalizedPost.formattedDate}
                </span>
              </>
            )}
          </div>
        )}

        {!showCommunity && normalizedPost.formattedDate && (
          <div className="post-meta">
            <span className="post-author">
              Posted by u/{normalizedPost.author}
            </span>
            <span className="post-separator">•</span>
            <span className="post-time">{normalizedPost.formattedDate}</span>
            {normalizedPost.comments > 0 && (
              <>
                <span className="post-separator">•</span>
                <span className="post-comments">
                  💬 {normalizedPost.comments} comments
                </span>
              </>
            )}
          </div>
        )}

        <h2 className="post-title">{normalizedPost.title}</h2>
        {normalizedPost.body && (
          <p className="post-body">{normalizedPost.body}</p>
        )}

        <div className="post-actions">
          <button
            className="action-button"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            aria-label={`View ${normalizedPost.comments} comments`}
          >
            💬 {normalizedPost.comments} comments
          </button>
          <button
            className="action-button"
            onClick={(e) => e.stopPropagation()}
            aria-label="Share post"
          >
            🔗 Share
          </button>
          <button
            className={`action-button ${isSaved ? "saved" : ""}`}
            onClick={handleSaveClick}
            aria-label={isSaved ? "Unsave post" : "Save post"}
          >
            {isSaved ? "✅" : "🔖"} {isSaved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostCard;
