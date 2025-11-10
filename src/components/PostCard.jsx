import React from "react";
import {
  MessageCircle,
  Share2,
  Bookmark,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import "../styles/PostCard.css";

function PostCard({ post }) {
  const {
    community,
    author,
    timeAgo,
    title,
    content,
    votes = 803,
    comments = 360,
    isJoined = false,
  } = post;

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="community-info">
          <div className="community-avatar">
            <img src="/api/placeholder/24/24" alt={community} />
          </div>
          <span className="community-name">{community}</span>
          <span className="post-meta">
            • Posted by {author} • {timeAgo}
          </span>
        </div>

        {!isJoined && <button className="join-btn">Join</button>}
      </div>

      <div className="post-content">
        <div className="post-voting">
          <button className="vote-btn">
            <ArrowUp size={16} />
          </button>
          <span className="vote-count">{votes}</span>
          <button className="vote-btn">
            <ArrowDown size={16} />
          </button>
        </div>

        <div className="post-body">
          <h3 className="post-title">{title}</h3>
          <p className="post-text">{content}</p>
        </div>
      </div>

      <div className="post-actions">
        <button className="action-btn">
          <MessageCircle size={16} />
          <span>{comments} comments</span>
        </button>

        <button className="action-btn">
          <Share2 size={16} />
          <span>Share</span>
        </button>

        <button className="action-btn">
          <Bookmark size={16} />
          <span>Save</span>
        </button>
      </div>
    </div>
  );
}

export default PostCard;
