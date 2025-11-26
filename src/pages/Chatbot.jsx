import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/axios";
import { IoSearchOutline } from "react-icons/io5";
import "../styles/Chatbot.css";

function Chatbot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]); // start empty
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
      // ignore; keep profile null if unauthenticated
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /**
   * Helper: try to extract a JSON object from a string (first {...} block)
   */
  const extractJsonFromText = (text) => {
    if (!text || typeof text !== "string") return null;
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      const parsed = JSON.parse(match[0]);
      return parsed;
    } catch (e) {
      return null;
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const trimmed = inputMessage.trim();
    if (!trimmed) return;

    // push user message immediately for snappy UI
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
    inputRef.current?.blur();

    try {
      const response = await api.post("/ai/ask", {
        message: userMessage.content,
        mode: "answer",
      });

      // determine assistant content and any parsed JSON
      let botContent = null;
      let parsed = null;

      // 1) if backend returned a structured object with answer/result/reply
      if (response.data) {
        if (response.data.reply && typeof response.data.reply === "string") {
          botContent = response.data.reply;
        } else if (
          response.data.answer &&
          typeof response.data.answer === "string"
        ) {
          botContent = response.data.answer;
        } else if (response.data.result && response.data.result.answer) {
          botContent = response.data.result.answer;
        } else if (typeof response.data === "string") {
          botContent = response.data;
        } else {
          // fallback: stringify if nothing else
          botContent = JSON.stringify(response.data);
        }

        // try parse JSON from response.data (common when controller returns parsed result)
        if (typeof response.data === "object") {
          // check for direct 'sources' or 'answer' fields
          if (
            response.data.sources ||
            response.data.answer ||
            response.data.result
          ) {
            parsed = response.data;
          } else if (response.data.reply) {
            // try extract JSON from reply text
            const fromText = extractJsonFromText(response.data.reply);
            if (fromText) parsed = fromText;
          }
        }
      }

      // 2) fallback: try parse JSON inside the botContent text (if not parsed yet)
      if (!parsed) {
        const fromText = extractJsonFromText(botContent);
        if (fromText) parsed = fromText;
      }

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: botContent,
        timestamp: new Date(),
        raw: response.data ?? null,
        parsed: parsed ?? null, // null or an object containing { answer, sources, ... }
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("AI Error:", err);

      const errorMsg = {
        id: Date.now() + 1,
        type: "bot",
        content:
          err.response?.data?.reply ||
          err.response?.data?.message ||
          "Something went wrong. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  // Optional: quick summarize helper (can be wired to UI)
  const summarizePost = async (postId) => {
    if (!postId) return;
    setInputMessage(`summarize post ${postId}`);
    await handleSendMessage();
  };

  // Render a list of sources under a bot message if present
  const renderSources = (parsed) => {
    if (!parsed) return null;

    // normalized sources array may exist in several shapes:
    // parsed.sources or parsed.result?.sources or parsed.entries (for glossary)
    const sources =
      parsed.sources ??
      parsed.result?.sources ??
      parsed.entries ??
      parsed.data?.sources ??
      null;

    if (!sources || !Array.isArray(sources) || sources.length === 0)
      return null;

    return (
      <div className="message-sources">
        <strong>Sources</strong>
        <ul>
          {sources.map((s, idx) => {
            // support several possible field names
            const id = s.id ?? s.post_id ?? s.postId ?? null;
            const title =
              s.title ??
              s.label ??
              s.term ??
              (id ? `Post ${id}` : JSON.stringify(s));
            const reason = s.reason ?? s.excerpt ?? s.hint ?? null;

            const href = id ? `/post/${id}` : s.url ?? "#";

            return (
              <li key={idx} className="source-item">
                {id ? (
                  <a
                    href={href}
                    onClick={(ev) => {
                      ev.preventDefault();
                      navigate(href);
                    }}
                  >
                    {title}
                  </a>
                ) : (
                  <span>{title}</span>
                )}
                {reason ? (
                  <span className="source-reason"> — {reason}</span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    );
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

            <div className="message-content">
              {message.content}

              {/* render parsed sources (if assistant returned them) */}
              {message.type === "bot" &&
                message.parsed &&
                renderSources(message.parsed)}
            </div>

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
            placeholder="What is mentioned in the posts about Operating Systems?"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
        </form>
      </div>
    </Layout>
  );
}

export default Chatbot;
