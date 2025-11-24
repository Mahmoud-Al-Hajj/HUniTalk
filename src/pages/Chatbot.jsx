import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/axios";
import { IoSearchOutline } from "react-icons/io5";
import "../styles/Chatbot.css";

function Chatbot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Rephrase 'This is an ai chatbot generated for better communication and simpler work flows'",
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
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          type: "bot",
          content: "This is a response from the AI chatbot.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 1500);
    } catch (err) {
      console.error("Error sending message:", err);
      setIsTyping(false);
    }
  };

  return (
    <Layout>
      <div className="chatbot-header">
        <h1 className="chatbot-title">HUniTalk Answers</h1>
        <p className="chatbot-subtitle">
          Got a question? Ask it and get answers, perspectives, and
          recommendations from all of HUniTalk.
        </p>
      </div>

      <div className="chatbot-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${message.type}-message`}
          >
            {message.type === "bot" && (
              <div className="message-avatar">
                <div className="bot-avatar-icon">Bot</div>
              </div>
            )}

            <div className="message-content">{message.content}</div>

            {message.type === "user" && profile && (
              <div className="message-avatar">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {profile.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="chat-message bot-message">
            <div className="message-avatar">
              <div className="bot-avatar-icon">Bot</div>
            </div>
            <div className="message-content typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-wrapper">
        <form className="chat-input-container" onSubmit={handleSendMessage}>
          <span className="search-icon">
            <IoSearchOutline />
          </span>
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder="How do I join the CS community."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
        </form>
      </div>
    </Layout>
  );
}

export default Chatbot;
