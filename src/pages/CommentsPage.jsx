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
  const [viewerType, setViewerType] = useState('microsoft'); // 'microsoft' or 'google'
  const [officeViewerError, setOfficeViewerError] = useState(false);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const { userVotes, handleVote, initializeVotes } = useVoting(
    comments,
    "comment",
    "commentVotes"
  );

  useEffect(() => {
    fetchPostAndComments();
    // close viewer when post changes
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
  // Replace your existing resolveAttachments & buildViewerDocs with this

  // -----------------------
  // Attachment helpers (fixed)
  // -----------------------
  const resolveAttachments = () => {
    if (!post) return [];
    const raw =
      post.attachments ||
      post.files ||
      post.media ||
      post.attachments_list ||
      [];

    console.log("Raw attachments:", raw);
    console.log("Post object:", post);

    const getFileNameFromUrl = (url) => {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        let filename = pathname.split("/").pop();
        if (filename && filename !== "") {
          const mimeToExt = {
            "vnd.ms-powerpoint": "ppt",
            "vnd.openxmlformats-officedocument.presentationml.presentation":
              "pptx",
            msword: "doc",
            "vnd.openxmlformats-officedocument.wordprocessingml.document":
              "docx",
            "vnd.ms-excel": "xls",
            "vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
            pdf: "pdf",
            plain: "txt",
            jpeg: "jpg",
            png: "png",
            gif: "gif",
            webp: "webp",
            bmp: "bmp",
            "svg+xml": "svg",
          };

          const parts = filename.split(".");
          if (parts.length > 1) {
            const lastPart = parts[parts.length - 1];
            if (mimeToExt[lastPart]) {
              parts[parts.length - 1] = mimeToExt[lastPart];
              filename = parts.join(".");
            } else if (parts.length > 2) {
              const mime = parts.slice(-2).join(".");
              if (mimeToExt[mime]) {
                parts.splice(-2, 2, mimeToExt[mime]);
                filename = parts.join(".");
              }
            }
          }
          return filename;
        }
        // If no filename in path, check query params
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
      const mimeToExt = {
        "vnd.ms-powerpoint": "ppt",
        "vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
        msword: "doc",
        "vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
        "vnd.ms-excel": "xls",
        "vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
        pdf: "pdf",
        plain: "txt",
        jpeg: "jpg",
        png: "png",
        gif: "gif",
        webp: "webp",
        bmp: "bmp",
        "svg+xml": "svg",
      };

      const parts = filename.split(".");
      if (parts.length > 1) {
        const lastPart = parts[parts.length - 1];
        if (mimeToExt[lastPart]) {
          parts[parts.length - 1] = mimeToExt[lastPart];
          return parts.join(".");
        } else if (parts.length > 2) {
          const mime = parts.slice(-2).join(".");
          if (mimeToExt[mime]) {
            parts.splice(-2, 2, mimeToExt[mime]);
            return parts.join(".");
          }
        }
      }
      return filename;
    };

    const resolved = raw
      .map((item) => {
        if (!item) return null;
        if (typeof item === "string") return { url: item, name: item };
        if (typeof item === "object") {
          // Backend returns URL in 'filename' field
          const url =
            item.filename ||
            item.url ||
            item.path ||
            item.file ||
            item.storage_url ||
            null;
          // Extract just the filename from the URL for display
          const rawName = item.name || getFileNameFromUrl(url) || "file";
          const name = normalizeFileName(rawName);
          console.log("Processing attachment:", { item, url, rawName, name });
          return { url, name };
        }
        return null;
      })
      .filter(Boolean);

    console.log("Resolved attachments:", resolved);
    return resolved;
  };

  const buildViewerDocs = (attachmentsArray) => {
    // Build docs for viewer: { uri: 'full-url', fileName: 'display-name' }
    return attachmentsArray.map((att) => {
      console.log("Building viewer doc:", att);
      return {
        uri: att.url, // Keep the full URL
        fileName: att.name || "file", // Use the name we already extracted
      };
    });
  };

  const openInViewer = (index = 0, attachmentsArray) => {
    console.log("Opening viewer with attachments:", attachmentsArray);
    if (!attachmentsArray || !attachmentsArray.length) return;

    setCurrentViewerIndex(index);
    const docs = buildViewerDocs(attachmentsArray);
    console.log("Viewer docs:", docs);

    // Rotate so the clicked index is first
    const ordered = docs.slice(index).concat(docs.slice(0, index));
    console.log("Ordered docs:", ordered);

    setViewerDocs(ordered);
    setViewerOpen(true);
    setViewerError(false);
  };

  const closeViewer = useCallback(() => {
    setViewerOpen(false);
    setViewerDocs([]);
  }, []);

  // handle Escape to close viewer
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

  // Resolve attachments for rendering
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

        {/* --- Attachments gallery --- */}
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
                        onClick={() => openInViewer(idx, attachments)}
                        title="Open full size"
                      >
                        <Maximize2 size={14} />
                      </button>
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
        {/* --- end attachments --- */}

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
                <button
                  type="button"
                  className="comment-cancel-btn"
                  onClick={handleCancelComment}
                  disabled={submittingComment}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="comment-submit-btn"
                  disabled={submittingComment}
                >
                  {submittingComment ? "Posting..." : "Comment"}
                </button>
              </div>
            )}
          </div>
        </form>

        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="no-comments">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment) => (
              <Comment key={comment.id} comment={comment} />
            ))
          )}
        </div>
      </div>

      {/* Custom File Viewer Modal */}
      {/* Custom File Viewer Modal */}
      {viewerOpen && viewerDocs.length > 0 && (
        <div className="docviewer-modal" role="dialog" aria-modal="true">
          <div className="docviewer-backdrop" onClick={closeViewer} />
          <div className="docviewer-panel">
            <div className="docviewer-header">
              <div className="docviewer-title">
                {viewerDocs[0]?.fileName || "Attachment"}
              </div>
              <div className="docviewer-actions">
                <a
                  href={viewerDocs[0]?.uri}
                  download={viewerDocs[0]?.fileName}
                  className="docviewer-download-btn"
                  title="Download"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DownloadCloud size={18} />
                </a>
                <button className="docviewer-close" onClick={closeViewer}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="docviewer-body">
              {(() => {
                const url = viewerDocs[0]?.uri;
                const fileName = viewerDocs[0]?.fileName || "";

                // Extract file extension
                const getFileType = (name) => {
                  const ext = name.toLowerCase().split(".").pop();
                  return ext;
                };

                const fileType = getFileType(fileName);

                // File type categories
                const isImage = [
                  "jpg",
                  "jpeg",
                  "png",
                  "gif",
                  "webp",
                  "bmp",
                  "svg",
                ].includes(fileType);
                const isPdf = fileType === "pdf";
                const isWord = ["doc", "docx"].includes(fileType);
                const isExcel = ["xls", "xlsx"].includes(fileType);
                const isPowerPoint = ["ppt", "pptx"].includes(fileType);
                const isText = ["txt", "csv", "log"].includes(fileType);
                const isOfficeDoc = isWord || isExcel || isPowerPoint;

                // Image viewer
                if (isImage) {
                  return (
                    <div className="viewer-image-container">
                      <img
                        src={url}
                        alt={fileName}
                        className="viewer-image"
                        onError={() => setViewerError(true)}
                      />
                    </div>
                  );
                }

                // PDF viewer - React PDF Viewer
                // PDF viewer - React PDF Viewer
                if (isPdf) {
                  return (
                    <div className="viewer-pdf-container">
                      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                        <div style={{ height: "100%", overflow: "auto" }}>
                          <Viewer
                            fileUrl={url}
                            plugins={[defaultLayoutPluginInstance]}
                            onDocumentLoad={(e) => {
                              setViewerError(false);
                              console.log(
                                "PDF loaded successfully:",
                                e.doc.numPages,
                                "pages"
                              );
                            }}
                            renderError={(error) => {
                              console.error("PDF render error:", error);
                              return (
                                <div className="viewer-error-overlay">
                                  <p>Unable to load PDF</p>
                                  <p className="error-details">
                                    {error.message}
                                  </p>
                                  <div className="unsupported-actions">
                                    <a
                                      href={url}
                                      download={fileName}
                                      className="unsupported-download-btn"
                                    >
                                      <DownloadCloud size={16} /> Download PDF
                                    </a>
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="unsupported-download-btn secondary"
                                    >
                                      Open in New Tab
                                    </a>
                                  </div>
                                </div>
                              );
                            }}
                            renderLoader={(percentages) => (
                              <div className="viewer-loading">
                                <div className="loading-spinner">
                                  <div className="spinner"></div>
                                  <p>
                                    Loading PDF... {Math.round(percentages)}%
                                  </p>
                                </div>
                              </div>
                            )}
                          />
                        </div>
                      </Worker>
                    </div>
                  );
                }
                // Office documents viewer using Microsoft Office Online
                if (isOfficeDoc) {
                  // Encode URL for viewers
                  const encodedUrl = encodeURIComponent(url);

                  // Microsoft Office Online Viewer (works for Word, Excel, PowerPoint)
                  const microsoftViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;

                  // Google Docs Viewer (fallback)
                  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;

                  const currentViewerUrl = viewerType === 'microsoft' ? microsoftViewerUrl : googleViewerUrl;

                  return (
                    <div className="viewer-office-container">
                      {!officeViewerError ? (
                        <>
                          <div className="office-viewer-controls">
                            <div className="viewer-type-toggle">
                              <button
                                className={`toggle-btn ${viewerType === 'microsoft' ? 'active' : ''}`}
                                onClick={() => {
                                  setViewerType('microsoft');
                                  setOfficeViewerError(false);
                                }}
                              >
                                Microsoft Viewer
                              </button>
                              <button
                                className={`toggle-btn ${viewerType === 'google' ? 'active' : ''}`}
                                onClick={() => {
                                  setViewerType('google');
                                  setOfficeViewerError(false);
                                }}
                              >
                                Google Viewer
                              </button>
                            </div>
                            <p className="viewer-hint">
                              Having trouble? Try switching viewers or download the file.
                            </p>
                          </div>

                          <iframe
                            src={currentViewerUrl}
                            className="viewer-iframe office-iframe"
                            title={fileName}
                            onError={() => setOfficeViewerError(true)}
                            onLoad={(e) => {
                              // Check if iframe loaded successfully
                              try {
                                const iframeDoc = e.target.contentDocument || e.target.contentWindow.document;
                                if (!iframeDoc) {
                                  setOfficeViewerError(true);
                                }
                              } catch (err) {
                                // Cross-origin, but that's okay - it means it loaded
                                console.log('Office viewer loaded (cross-origin)');
                              }
                            }}
                          />
                        </>
                      ) : (
                        <div className="viewer-unsupported">
                          <div className="unsupported-icon">📄</div>
                          <p className="unsupported-text">
                            {fileType.toUpperCase()} Document
                          </p>
                          <p className="unsupported-filename">{fileName}</p>
                          <p className="unsupported-hint">
                            Unable to preview this document. Please download to view or try opening in a new tab.
                          </p>
                          <div className="unsupported-actions">
                            <a
                              href={url}
                              download={fileName}
                              className="unsupported-download-btn"
                            >
                              <DownloadCloud size={16} />
                              Download File
                            </a>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="unsupported-download-btn secondary"
                            >
                              Open in New Tab
                            </a>
                            <button
                              onClick={() => setOfficeViewerError(false)}
                              className="unsupported-download-btn secondary"
                            >
                              Try Again
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // Text files - Direct display
                if (isText) {
                  return (
                    <div className="viewer-document-container">
                      <iframe
                        src={url}
                        className="viewer-iframe"
                        title={fileName}
                        style={{ background: "white" }}
                      />
                    </div>
                  );
                }

                // Unsupported file types
                return (
                  <div className="viewer-unsupported">
                    <div className="unsupported-icon">
                      <Maximize2 size={48} />
                    </div>
                    <p className="unsupported-text">Preview not available</p>
                    <p className="unsupported-filename">{fileName}</p>
                    <p className="unsupported-type">File type: .{fileType}</p>
                    <div className="unsupported-actions">
                      <a
                        href={url}
                        download={fileName}
                        className="unsupported-download-btn"
                      >
                        <DownloadCloud size={16} />
                        Download File
                      </a>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="unsupported-download-btn secondary"
                      >
                        Open in New Tab
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsPage;
