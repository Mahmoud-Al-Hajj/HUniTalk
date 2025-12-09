// CommentsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  Share2,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Trash2,
  DownloadCloud,
  Maximize2,
  X,
} from "lucide-react";
import api from "../api/axios";
import useVoting from "../hooks/useVoting";
import "../styles/CommentsPage.css";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
// PDF Viewer styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";

// Simple markdown renderer for AI summaries
const renderMarkdown = (text) => {
  if (!text) return null;

  // Split by lines
  const lines = text.split("\n");
  const elements = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="summary-list">
          {listItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Bold headers like **MAIN TAKEAWAY**
    if (
      trimmed.startsWith("**") &&
      trimmed.endsWith("**") &&
      trimmed.length > 4
    ) {
      flushList();
      const headerText = trimmed.slice(2, -2);
      elements.push(
        <h4 key={index} className="summary-heading">
          {headerText}
        </h4>
      );
    }
    // Bullet points
    else if (
      trimmed.startsWith("•") ||
      trimmed.startsWith("-") ||
      trimmed.startsWith("*")
    ) {
      const bulletText = trimmed.replace(/^[•\-\*]\s*/, "");
      listItems.push(bulletText);
    }
    // Regular paragraph (non-empty)
    else if (trimmed.length > 0) {
      flushList();
      // Handle inline bold **text**
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
      const formattedParts = parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      elements.push(
        <p key={index} className="summary-paragraph">
          {formattedParts}
        </p>
      );
    }
  });

  flushList();
  return elements;
};

const CommentsPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingComment, setDeletingComment] = useState(null);

  // DocViewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerDocs, setViewerDocs] = useState([]); // [{ uri, fileName }]
  const [currentViewerIndex, setCurrentViewerIndex] = useState(0);
  const [viewerError, setViewerError] = useState(false);
  const [viewerType, setViewerType] = useState("microsoft");
  const [officeViewerError, setOfficeViewerError] = useState(false);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const { userVotes, handleVote, initializeVotes } = useVoting(
    comments,
    "comment",
    "commentVotes"
  );

  const [aiSummary, setAiSummary] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  useEffect(() => {
    fetchPostAndComments();

    return () => {
      setViewerOpen(false);
      setViewerDocs([]);
    };
  }, [postId]);

  const fetchPostAndComments = async () => {
    try {
      setLoading(true);
      setError(null);

      const [postResponse, commentsResponse] = await Promise.all([
        api.get(`/posts/${postId}`),
        api.get(`/posts/${postId}/comments`),
      ]);

      setPost(postResponse.data);
      const normalizedComments = commentsResponse.data.map((comment) => ({
        ...comment,
        votes: (comment.upvotes || 0) - (comment.downvotes || 0),
        user_vote: comment.user_vote,
      }));
      setComments(normalizedComments);
      initializeVotes(normalizedComments);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load post");
      console.error("Error fetching post:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarizePost = async () => {
    if (!postId) return;

    try {
      setSummarizing(true);
      setSummaryError(null);

      const response = await api.post("/ai/ask", {
        message: `Summarize this post ${postId}`,
        mode: "summarize",
        post_id: postId,
      });
      console.log("request sent", response);
      console.log("AI response:", response.data);
      // The AI reply is inside response.data.ai.reply
      const aiReply = response.data?.ai?.reply || "No summary available.";
      const aiRaw = response.data?.ai?.raw || null;

      setAiSummary(aiReply);
    } catch (err) {
      console.error("AI summarize error:", err);
      setSummaryError(
        err.response?.data?.message || "Failed to get summary from AI."
      );
    } finally {
      setSummarizing(false);
    }
  };

  const handleVoteComment = async (commentId, voteType) => {
    try {
      await handleVote(commentId, voteType, (id, delta, isAbsolute) => {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === id
              ? {
                  ...comment,
                  votes: isAbsolute ? delta : (comment.votes || 0) + delta,
                }
              : comment
          )
        );
      });
    } catch (err) {
      console.error("Vote failed:", err);
      alert("Failed to update vote. Please try again.");
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;

    try {
      setSubmittingComment(true);
      const response = await api.post(`/posts/${postId}/comments`, {
        post_id: postId,
        body: commentText,
      });

      const storedUserJSON = localStorage.getItem("user");
      let storedUser = null;
      try {
        storedUser = storedUserJSON ? JSON.parse(storedUserJSON) : null;
      } catch (e) {
        storedUser = null;
      }

      const fallbackUser = storedUser
        ? {
            id: storedUser.id,
            name: storedUser.name,
            username: storedUser.username,
          }
        : null;

      const newComment = {
        ...response.data,
        votes: (response.data.upvotes || 0) - (response.data.downvotes || 0),
        user_vote: response.data.user_vote || null,
        user: response.data.user ||
          fallbackUser || {
            name: localStorage.getItem("username") || "Anonymous",
          },
        user_id: response.data.user_id || (storedUser && storedUser.id) || null,
      };

      setComments((prev) => {
        const updated = [newComment, ...prev];
        initializeVotes(updated);
        return updated;
      });
      setCommentText("");
    } catch (err) {
      console.error("Comment submission failed:", err);
      alert(err.response?.data?.message || "Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCancelComment = () => {
    setCommentText("");
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      setDeletingComment(commentId);
      await api.delete(`/comments/${commentId}`);

      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.message || "Failed to delete comment");
    } finally {
      setDeletingComment(null);
    }
  };

  // -----------------------
  // Attachment helpers
  // -----------------------
  const resolveAttachments = () => {
    if (!post) return [];
    const raw =
      post.attachments ||
      post.files ||
      post.media ||
      post.attachments_list ||
      [];

    const getFileNameFromUrl = (url) => {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        let filename = pathname.split("/").pop();
        if (filename && filename !== "") return filename;
        const nameParam =
          urlObj.searchParams.get("name") ||
          urlObj.searchParams.get("file") ||
          urlObj.searchParams.get("filename");
        if (nameParam) return nameParam;
        return null;
      } catch (e) {
        return null;
      }
    };

    const normalizeFileName = (filename) => {
      if (!filename) return null;
      return filename;
    };

    return raw
      .map((item) => {
        if (!item) return null;
        if (typeof item === "string") return { url: item, name: item };
        if (typeof item === "object") {
          const url =
            item.filename ||
            item.url ||
            item.path ||
            item.file ||
            item.storage_url ||
            null;
          const rawName = item.name || getFileNameFromUrl(url) || "file";
          const name = normalizeFileName(rawName);
          return { url, name };
        }
        return null;
      })
      .filter(Boolean);
  };

  const buildViewerDocs = (attachmentsArray) => {
    return attachmentsArray.map((att) => ({
      uri: att.url,
      fileName: att.name || "file",
    }));
  };

  const openInViewer = (index = 0, attachmentsArray) => {
    if (!attachmentsArray || !attachmentsArray.length) return;

    setCurrentViewerIndex(index);
    const docs = buildViewerDocs(attachmentsArray);

    // Rotate so the clicked index is first
    const ordered = docs.slice(index).concat(docs.slice(0, index));
    setViewerDocs(ordered);
    setViewerOpen(true);
    setViewerError(false);
  };

  const closeViewer = useCallback(() => {
    setViewerOpen(false);
    setViewerDocs([]);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && viewerOpen) closeViewer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewerOpen, closeViewer]);

  // -----------------------
  // Comment component
  // -----------------------
  const Comment = ({ comment }) => {
    const currentUserId = localStorage.getItem("user_id");
    const isOwner = comment.user_id?.toString() === currentUserId;
    const storedUserJSON = localStorage.getItem("user");
    let storedUser = null;
    try {
      storedUser = storedUserJSON ? JSON.parse(storedUserJSON) : null;
    } catch (e) {
      storedUser = null;
    }
    const displayName =
      comment.user?.name ||
      comment.user?.username ||
      storedUser?.name ||
      localStorage.getItem("username") ||
      "Anonymous";

    return (
      <div className="comment">
        <div className="comment-sidebar">
          <div className="vote-line"></div>
        </div>
        <div className="comment-content">
          <div className="comment-header">
            <div className="comment-avatar"></div>
            <span className="comment-author">
              {displayName}
              {comment.isOP && <span className="op-badge">OP</span>}
            </span>
            <span className="comment-timestamp">
              •{" "}
              {comment.created_at
                ? new Date(comment.created_at).toLocaleDateString()
                : "Just now"}
            </span>
          </div>

          <p className="comment-body">{comment.body}</p>

          <div className="comment-actions">
            <button
              className={`vote-btn ${
                userVotes[comment.id] === "up" ? "active" : ""
              }`}
              onClick={() => handleVoteComment(comment.id, "up")}
              disabled={userVotes[comment.id] === "up"}
            >
              <ArrowUp size={16} />
            </button>
            <span className="vote-count">{comment.votes || 0}</span>
            <button
              className={`vote-btn ${
                userVotes[comment.id] === "down" ? "active" : ""
              }`}
              onClick={() => handleVoteComment(comment.id, "down")}
              disabled={userVotes[comment.id] === "down"}
            >
              <ArrowDown size={16} />
            </button>

            <button className="action-btn">
              <Share2 size={14} />
              Share
            </button>

            {isOwner && (
              <button
                className="action-btn delete-btn"
                onClick={() => handleDeleteComment(comment.id)}
                disabled={deletingComment === comment.id}
              >
                <Trash2 size={14} />
                {deletingComment === comment.id ? "Deleting..." : "Delete"}
              </button>
            )}

            <button className="action-btn">
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="post-detail-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-detail-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="submit-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail-container">
        <div className="error">Post not found</div>
      </div>
    );
  }

  const attachments = resolveAttachments();

  return (
    <div className="post-detail-container">
      <div className="back-nav" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        <span>Back</span>
      </div>

      <div className="post-cardsss">
        <div className="post-header">
          <div className="post-avatar"></div>
          <span className="community-name">
            {post.community?.name || "r/general"}
          </span>
          <span>•</span>
          <span className="post-author">
            {post.user?.username || "Anonymous"}
          </span>
          <span>•</span>
          <span>
            {post.created_at
              ? new Date(post.created_at).toLocaleDateString()
              : "Recently"}
          </span>
        </div>

        <h1 className="post-title">{post.title}</h1>

        {post.body && <div className="post-body-section">{post.body}</div>}

        {/* --- Summarize Button --- */}
        <div style={{ margin: "10px 0" }}>
          <button
            className="summarize-btn"
            onClick={handleSummarizePost}
            disabled={summarizing}
          >
            {summarizing ? "Summarizing..." : "Summarize"}
          </button>
        </div>

        {(aiSummary || summaryError) && (
          <div className="ai-summary-box">
            <h3>Summary:</h3>
            {summaryError ? (
              <p style={{ color: "red" }}>{summaryError}</p>
            ) : (
              <div className="summary-content">{renderMarkdown(aiSummary)}</div>
            )}
          </div>
        )}

        {attachments.length > 0 && (
          <div className="post-attachments">
            {attachments.map((att, idx) => {
              const url = att?.url;
              if (!url) return null;
              const isImage = /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(url);
              return (
                <div className="attachment-item" key={idx}>
                  {isImage ? (
                    <img
                      src={url}
                      alt={`attachment-${idx}`}
                      className="attachment-thumb"
                      onClick={() => openInViewer(idx, attachments)}
                    />
                  ) : (
                    <div className="attachment-file">
                      <div className="file-icon">
                        <Maximize2 size={24} />
                      </div>
                      <div className="file-meta">
                        <span className="file-name">
                          {att.name || url.split("/").pop()}
                        </span>
                        <div className="file-actions">
                          <button
                            type="button"
                            className="download-btn"
                            onClick={() => openInViewer(idx, attachments)}
                          >
                            <Maximize2 size={14} /> Open
                          </button>
                          <button
                            type="button"
                            className="download-btn"
                            onClick={() => {
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = att.name || "";
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                            }}
                          >
                            <DownloadCloud size={14} /> Download
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {isImage && (
                    <div className="attachment-actions">
                      <button
                        type="button"
                        className="attachment-action-btn"
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = att.name || "";
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                        }}
                        title="Download"
                      >
                        <DownloadCloud size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="post-stats">
          <div className="vote-section">
            <button className="vote-btn">
              <ArrowUp size={20} />
            </button>
            <span className="vote-count">{post.upvotes || 0}</span>
            <button className="vote-btn">
              <ArrowDown size={20} />
            </button>
          </div>

          <button className="stat-btn">
            <MessageSquare size={16} />
            {comments.length}
          </button>

          <button className="stat-btn">
            <Share2 size={16} />
            Share
          </button>

          <button className="stat-btn">
            <MoreHorizontal size={16} />
          </button>

          <a
            href={`mailto:mah06.hajj@gmail.com?subject=Report%20Post%20(ID:%20${postId})&body=I%20would%20like%20to%20report%20this%20post%20(ID:%20${postId}) titled "${post.title}" for violating the community guidelines.`}
            className="report-btn"
            title="Report this post (opens your default email client)"
          >
            Report
          </a>
        </div>
      </div>

      <div className="comments-section">
        <div className="comments-header">
          <span style={{ fontSize: "13px", fontWeight: "600" }}>
            {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
          </span>
        </div>

        <form
          onSubmit={handleSubmitComment}
          className="comment-input-container"
        >
          <div className="comment-input-wrapper">
            <textarea
              className="comment-textarea"
              placeholder="Join the conversation"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={submittingComment}
              rows="3"
            />
            {commentText.trim() && (
              <div className="comment-input-actions">
                <button type="button" className="comment-more-btn">
                  <MoreHorizontal size={16} />
                </button>
                <div className="comment-submit-actions">
                  <button
                    type="button"
                    onClick={handleCancelComment}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={submittingComment}
                  >
                    {submittingComment ? "Posting..." : "Post"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="comments-list">
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </div>
      </div>

      {viewerOpen && (
        <div className="doc-viewer-overlay">
          <button className="close-viewer" onClick={closeViewer}>
            <X size={20} />
          </button>
          <DocViewer
            documents={viewerDocs}
            pluginRenderers={DocViewerRenderers}
            activeDocumentIndex={currentViewerIndex}
          />
        </div>
      )}
    </div>
  );
};

export default CommentsPage;
