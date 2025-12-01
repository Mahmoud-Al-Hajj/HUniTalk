import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import api from "../api/axios";
import useVoting from "../hooks/useVoting";
import "../styles/Community.css";

const Community = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const currentUserID = JSON.parse(localStorage.getItem("userId"));
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
    attachments: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Study Room State
  const [showStudyRoom, setShowStudyRoom] = useState(false);
  const [studyRoomData, setStudyRoomData] = useState(null);
  const [studyRoomMessages, setStudyRoomMessages] = useState([]);
  const [studyRoomMembers, setStudyRoomMembers] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isInStudyRoom, setIsInStudyRoom] = useState(false);
  const [studyRoomLoading, setStudyRoomLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagePollingInterval = useRef(null);
  const heartbeatInterval = useRef(null);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (messagePollingInterval.current) {
        clearInterval(messagePollingInterval.current);
      }
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
    };
  }, []);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [studyRoomMessages]);

  // Poll for new messages and send heartbeat when in study room
  useEffect(() => {
    if (isInStudyRoom && studyRoomData) {
      // Fetch messages immediately
      fetchStudyRoomMessages();
      fetchStudyRoomMembers();

      // Poll for messages every 5 seconds
      messagePollingInterval.current = setInterval(() => {
        fetchStudyRoomMessages();
        fetchStudyRoomMembers();
      }, 3000);

      // Send heartbeat every 60 seconds to stay "online"
      heartbeatInterval.current = setInterval(() => {
        sendHeartbeat();
      }, 50000);

      return () => {
        if (messagePollingInterval.current) {
          clearInterval(messagePollingInterval.current);
        }
        if (heartbeatInterval.current) {
          clearInterval(heartbeatInterval.current);
        }
      };
    }
  }, [isInStudyRoom, studyRoomData]);

  // Backend Integration - Fetch Community Data
  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/communities/${communityId}`);
      const communityDataFromApi = response.data;

      const normalizedData = {
        ...communityDataFromApi,
        members_count:
          communityDataFromApi.followers_count ||
          communityDataFromApi.members_count ||
          0,
        study_room_id:
          communityDataFromApi.study_rooms?.id ||
          communityDataFromApi.study_room_id ||
          null,
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

      const normalizedPosts = postsData.map((post) => {
        let voteCount = 0;
        if (post.upvotes !== undefined && post.downvotes !== undefined) {
          voteCount = post.upvotes - post.downvotes;
        } else if (typeof post.votes === "number") {
          voteCount = post.votes;
        } else if (post.votes_count !== undefined) {
          voteCount = post.votes_count;
        } else if (Array.isArray(post.votes)) {
          voteCount = (post.upvotes || 0) - (post.downvotes || 0);
        }

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
          user_vote: post.user_vote,
          author: authorName,
          community_name: communityName,
          created_at: post.created_at || post.timestamp || null,
        };
      });

      setPosts(normalizedPosts);
      initializeVotes(normalizedPosts);
    } catch (err) {
      console.error("Error fetching community posts:", err);
      setError("Failed to load posts. Please try again later.");
    }
  };

  // Backend Integration - Join/Leave Community
  const handleJoinCommunity = async () => {
    const previousState = isJoined;
    const previousData = communityData;

    try {
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
      setIsJoined(previousState);
      setCommunityData(previousData);
      alert("Failed to update membership.");
    }
  };

  // STUDY ROOM FUNCTIONS

  // Internal function to join room
  const joinRoom = async (roomId) => {
    try {
      await api.post("/study-rooms/join", {
        study_room_id: roomId,
      });

      setIsInStudyRoom(true);
    } catch (err) {
      console.error("Error joining study room:", err);

      if (err.response?.status === 422) {
        alert("Invalid study room. Please try again.");
      } else {
        alert("Failed to join study room.");
      }
      throw err;
    }
  };

  const handleOpenStudyRoom = async () => {
    if (!isJoined) {
      alert("Please join the community first to access the study room.");
      return;
    }

    setStudyRoomLoading(true);
    try {
      // Check if study room already exists
      if (!communityData?.study_room_id) {
        alert("No study room configured for this community yet.");
        setStudyRoomLoading(false);
        return;
      }

      // Join the room first
      await api.post("/study-rooms/join", {
        study_room_id: communityData.study_room_id,
      });

      // Then set the state - this will trigger the useEffect to start polling
      setStudyRoomData({ id: communityData.study_room_id });
      setIsInStudyRoom(true);
      setShowStudyRoom(true);
    } catch (err) {
      console.error("Error opening study room:", err);

      if (err.response?.status === 422) {
        const errors = err.response?.data?.errors;
        const errorMessage = errors
          ? Object.values(errors).flat().join(", ")
          : "Invalid study room";
        alert(`Validation error: ${errorMessage}`);
      } else if (err.response?.status === 404) {
        alert("Study room not found. It may have been deleted.");
      } else {
        alert("Failed to open study room. Please try again.");
      }

      // Reset state on error
      setShowStudyRoom(false);
      setStudyRoomData(null);
      setIsInStudyRoom(false);
    } finally {
      setStudyRoomLoading(false);
    }
  };

  // Leave study room
  const handleLeaveStudyRoom = async () => {
    try {
      await api.post("/study-rooms/leave", {
        study_room_id: studyRoomData?.id,
      });

      setIsInStudyRoom(false);
      setShowStudyRoom(false);
      setStudyRoomMessages([]);
      setStudyRoomMembers([]);

      // Clear intervals
      if (messagePollingInterval.current) {
        clearInterval(messagePollingInterval.current);
      }
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
    } catch (err) {
      console.error("Error leaving study room:", err);
      alert("Failed to leave study room.");
    }
  };

  // Send heartbeat to keep user "online"
  const sendHeartbeat = async () => {
    if (!studyRoomData?.id) return;

    try {
      await api.post("/study-rooms/heartbeat", {
        study_room_id: studyRoomData.id,
      });
    } catch (err) {
      console.error("Error sending heartbeat:", err);
      // Don't alert user, just log it
    }
  };

  // Fetch study room messages
  const fetchStudyRoomMessages = async () => {
    if (!studyRoomData?.id) return;

    try {
      const response = await api.get("/study-rooms/messages", {
        params: { study_room_id: studyRoomData.id },
      });

      const messages = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.messages || [];

      setStudyRoomMessages(messages);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // Fetch study room members
  const fetchStudyRoomMembers = async () => {
    if (!studyRoomData?.id) return;

    try {
      const response = await api.get("/study-rooms/members", {
        params: { study_room_id: studyRoomData.id },
      });

      const members = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.members || [];

      setStudyRoomMembers(members);
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  };

  // Send message in study room
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    const messageToSend = newMessage.trim();
    setNewMessage(""); // Clear input immediately

    try {
      const response = await api.post("/study-rooms/message", {
        study_room_id: studyRoomData?.id,
        message: messageToSend,
      });

      // Optimistically add the message
      if (response.data) {
        setStudyRoomMessages((prev) => [...prev, response.data]);
      }

      // Fetch all messages to ensure sync
      await fetchStudyRoomMessages();
    } catch (err) {
      console.error("Error sending message:", err);

      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const errorMessage = Object.values(errors).flat().join(", ");
        alert(`Cannot send message: ${errorMessage}`);
      } else {
        alert("Failed to send message.");
      }

      setNewMessage(messageToSend); // Restore message on error
    }
  };

  // File handling functions
  const getMimeTypeFromExtension = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    const mimeMap = {
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ppt: "application/vnd.ms-powerpoint",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      doc: "application/msword",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      xls: "application/vnd.ms-excel",
      pdf: "application/pdf",
      txt: "text/plain",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
    };
    return mimeMap[ext] || null;
  };

  const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        const base64Data = arrayBufferToBase64(arrayBuffer);

        const mimeFromExt = getMimeTypeFromExtension(file.name);
        const finalMime =
          mimeFromExt || file.type || "application/octet-stream";

        const dataUrl = `data:${finalMime};base64,${base64Data}`;

        resolve(dataUrl);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const MAX_FILES = 5;
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;

    const existingCount = newPost.attachments.length;
    if (existingCount + files.length > MAX_FILES) {
      alert(`You can attach up to ${MAX_FILES} files.`);
      return;
    }

    const converted = [];

    for (const file of files) {
      const ext = file.name.split(".").pop().toLowerCase();
      const allowedExtensions = [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "svg",
        "pdf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "ppt",
        "pptx",
        "txt",
      ];

      if (!allowedExtensions.includes(ext)) {
        alert(`${file.name} is not a supported file type.`);
        continue;
      }

      if (file.size > MAX_SIZE_BYTES) {
        alert(`${file.name} is too large. Max size is 5MB.`);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        converted.push({ base64, name: file.name, type: file.type });
      } catch (err) {
        console.error("Failed converting file:", err);
      }
    }

    if (converted.length) {
      setNewPost((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...converted],
      }));
    }

    e.target.value = "";
  };

  const removeAttachment = (index) => {
    setNewPost((prev) => {
      const copy = [...prev.attachments];
      copy.splice(index, 1);
      return { ...prev, attachments: copy };
    });
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!newPost.title.trim() || !newPost.body.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        communities_id: communityId,
        title: newPost.title,
        body: newPost.body,
        ...(newPost.attachments.length > 0 && {
          attachments: newPost.attachments.map((att) => att.base64),
        }),
      };

      const response = await api.post("/posts", payload);

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
      setNewPost({ title: "", body: "", attachments: [] });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
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
                className="study-room-button"
                onClick={handleOpenStudyRoom}
                disabled={!isJoined || studyRoomLoading}
                title={
                  !isJoined
                    ? "Join the community to access study room"
                    : "Open study room"
                }
              >
                {studyRoomLoading ? "Loading..." : "📚 Study Room"}
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

        {/* Study Room Modal */}
        {showStudyRoom && (
          <div className="modal-overlay" onClick={handleLeaveStudyRoom}>
            <div
              className="modal-content study-room-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>📚 Study Room - {communityData?.name}</h2>
                <button className="close-modal" onClick={handleLeaveStudyRoom}>
                  ✕
                </button>
              </div>

              <div className="study-room-container">
                {/* Members Sidebar */}
                <div className="study-room-members">
                  <h3>
                    Members Online (
                    {studyRoomMembers.filter((m) => m.online).length}/
                    {studyRoomMembers.length})
                  </h3>
                  <div className="members-list">
                    {studyRoomMembers.length === 0 ? (
                      <div className="no-members">
                        <p>No members online</p>
                      </div>
                    ) : (
                      studyRoomMembers.map((member) => (
                        <div
                          key={member.user_id}
                          className={`member-item ${
                            member.online ? "online" : "offline"
                          }`}
                        >
                          <div className="member-avatar">
                            {member.name?.[0] || "?"}
                            {member.online && (
                              <span className="online-indicator"></span>
                            )}
                          </div>
                          <span className="member-name">{member.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Chat Area */}
                <div className="study-room-chat">
                  <div className="messages-container">
                    {studyRoomMessages.length === 0 ? (
                      <div className="no-messages">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      studyRoomMessages.map((msg) => (
                        <div key={msg.id} className="message-item">
                          <div className="message-avatar">
                            {msg.user?.name?.[0] || "?"}
                          </div>
                          <div className="message-content">
                            <div className="message-header">
                              <span className="message-author">
                                {msg.user?.name || "Anonymous"}
                              </span>
                              <span className="message-time">
                                {msg.created_at
                                  ? new Date(msg.created_at).toLocaleTimeString(
                                      [],
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )
                                  : ""}
                              </span>
                            </div>
                            <p className="message-text">{msg.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form
                    onSubmit={handleSendMessage}
                    className="message-input-form"
                  >
                    <input
                      type="text"
                      placeholder={
                        isInStudyRoom
                          ? "Type a message..."
                          : "Join the study room to send messages"
                      }
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="message-input"
                      disabled={!isInStudyRoom}
                      maxLength={2000}
                    />
                    <button
                      type="submit"
                      className="send-message-btn"
                      disabled={!isInStudyRoom || !newMessage.trim()}
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

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

                <div className="form-group attachments-section">
                  <label className="attachments-label">Attachments</label>
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    multiple
                    onChange={handleFilesSelected}
                    className="form-input"
                  />
                  <div className="attachments-preview">
                    {newPost.attachments.map((att, idx) => {
                      const isImage = att.base64.startsWith("data:image/");

                      return (
                        <div key={idx} className="attachment-item">
                          {isImage ? (
                            <img
                              src={att.base64}
                              alt={`attachment-${idx}`}
                              className="attachment-thumb"
                            />
                          ) : (
                            <div className="attachment-file-preview">
                              <div className="file-icon">📄</div>
                              <span className="file-name">{att.name}</span>
                            </div>
                          )}
                          <button
                            type="button"
                            className="remove-attachment-btn"
                            onClick={() => removeAttachment(idx)}
                            title="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <small className="attachments-hint">
                    Up to 5 files (images, PDFs, documents). Max 5MB each.
                  </small>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="modal-cancel-btn"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="modal-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Posting..." : "Post"}
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
