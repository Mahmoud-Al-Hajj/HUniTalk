import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/axios";
import "../styles/Chatbot.css";

function Chatbot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Rephrase 'This is an AI chatbot generated for better communication and simpler work flows'",
      timestamp: new Date(),
    },
    {
      id: 2,
      type: "user",
      content:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s.",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedMode, setSelectedMode] = useState("search"); // "search" or "summarize"
  const [isTyping, setIsTyping] = useState(false);
  const [profile, setProfile] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/user/profile");
      setProfile(response.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Simulate AI response - Replace with actual API call
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          type: "bot",
          content: generateBotResponse(inputMessage, selectedMode),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 1500);

      // Actual API call example:
      // const response = await api.post("/ai/chat", {
      //   message: inputMessage,
      //   mode: selectedMode
      // });
      // const botMessage = {
      //   id: Date.now() + 1,
      //   type: "bot",
      //   content: response.data.message,
      //   timestamp: new Date()
      // };
      // setMessages(prev => [...prev, botMessage]);
      // setIsTyping(false);
    } catch (err) {
      console.error("Error sending message:", err);
      setIsTyping(false);
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const generateBotResponse = (message, mode) => {
    if (mode === "summarize") {
      return `Here's a summary of your input: "${message.substring(
        0,
        100
      )}..." - The key points include the main concepts and ideas presented in your text.`;
    } else {
      return `Based on your search query "${message}", here are some relevant results and recommendations from the HUniTalk community.`;
    }
  };

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    const modeMessage = {
      id: Date.now(),
      type: "system",
      content: `Mode switched to ${mode === "search" ? "Search" : "Summarize"}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, modeMessage]);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Layout>
      <div className="chatbot-wrapper">
        {/* Header Section */}
        <div className="chatbot-header">
          <div className="chatbot-header-content">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <span className="back-icon">←</span>
            </button>
            <div className="chatbot-title-section">
              <h1 className="chatbot-title">HUniTalk Answers</h1>
              <p className="chatbot-subtitle">
                Got a question? Ask it and get answers, perspectives, and
                recommendations from all of HUniTalk.
              </p>
            </div>
          </div>
        </div>

        {/* Chat Messages Container */}
        <div className="chat-container">
          <div className="messages-wrapper">
            {messages.map((message) => (
              <div key={message.id} className={`message-item ${message.type}`}>
                {message.type === "bot" && (
                  <div className="message-avatar bot-avatar">
                    <span className="bot-icon">🤖</span>
                  </div>
                )}

                <div className="message-content-wrapper">
                  <div className={`message-bubble ${message.type}`}>
                    <p className="message-text">{message.content}</p>
                  </div>
                  <span className="message-time">
                    {formatTime(message.timestamp)}
                  </span>
                </div>

                {message.type === "user" && profile && (
                  <div className="message-avatar user-avatar">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt={profile.name} />
                    ) : (
                      <span className="avatar-text">
                        {profile.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="message-item bot">
                <div className="message-avatar bot-avatar">
                  <span className="bot-icon">🤖</span>
                </div>
                <div className="message-content-wrapper">
                  <div className="message-bubble bot typing-indicator">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Mode Selector */}
        <div className="mode-selector-wrapper">
          <div className="mode-selector">
            <button
              className={`mode-btn ${
                selectedMode === "search" ? "active" : ""
              }`}
              onClick={() => handleModeChange("search")}
            >
              <span className="mode-icon">🔍</span>
              <span className="mode-text">Search Mode</span>
              <span className="mode-description">
                Find relevant posts and discussions
              </span>
            </button>
            <button
              className={`mode-btn ${
                selectedMode === "summarize" ? "active" : ""
              }`}
              onClick={() => handleModeChange("summarize")}
            >
              <span className="mode-icon">📝</span>
              <span className="mode-text">Summarize Mode</span>
              <span className="mode-description">
                Get concise summaries of content
              </span>
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div className="chat-input-wrapper">
          <form className="chat-input-container" onSubmit={handleSendMessage}>
            <div className="input-field-wrapper">
              <span className="search-icon">🔍</span>
              <input
                ref={inputRef}
                type="text"
                className="chat-input"
                placeholder={
                  selectedMode === "search"
                    ? "How do I join the CS community."
                    : "Enter text to summarize..."
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <button
                type="submit"
                className="send-btn"
                disabled={!inputMessage.trim() || isTyping}
              >
                <span className="send-icon">➤</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default Chatbot;
