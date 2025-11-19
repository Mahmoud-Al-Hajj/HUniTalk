import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/axios";
import "../styles/Communities.css";

function Communities() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await api.get("/communities");
      const communitiesData = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      // Map to ensure consistent field names - backend uses is_following and followers_count
      const normalizedCommunities = communitiesData.map((c) => ({
        ...c,
        is_joined: c.is_following || c.is_followed || c.is_joined || false,
        members_count: c.followers_count || c.members_count || c.members || 0,
      }));

      setCommunities(normalizedCommunities);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching communities:", err);
      setError("Failed to load communities.");
      setLoading(false);
    }
  };

  const handleJoinToggle = async (communityId, isJoined) => {
    try {
      if (isJoined) {
        await api.post(`/communities/${communityId}/unfollow`);
      } else {
        await api.post(`/communities/${communityId}/follow`);
      }

      // Update local state
      setCommunities(
        communities.map((c) => {
          if (c.id === communityId) {
            return {
              ...c,
              is_joined: !isJoined,
              is_followed: !isJoined,
              members_count: isJoined
                ? (c.members_count || 0) - 1
                : (c.members_count || 0) + 1,
            };
          }
          return c;
        })
      );
    } catch (err) {
      console.error("Error toggling join status:", err);
      alert("Action failed. Please try again.");
    }
  };

  if (loading)
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading communities...</p>
        </div>
      </Layout>
    );

  if (error)
    return (
      <Layout>
        <div className="error-container">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={fetchCommunities} className="retry-btn">
            Retry
          </button>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="communities-container">
        <div className="communities-header">
          <h1 className="communities-title">Explore Communities</h1>
          <p className="communities-subtitle">
            Find and join communities that interest you.
          </p>
        </div>

        <div className="communities-grid">
          {communities.map((community) => (
            <div key={community.id} className="community-card">
              <div className="community-card-banner"></div>
              <div className="community-card-header">
                <div className="community-card-avatar">
                  {community.avatar ? (
                    <img src={community.avatar} alt={community.name} />
                  ) : (
                    <span>{community.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>

              <div className="community-card-info">
                <Link
                  to={`/community/${community.id}`}
                  className="community-card-name"
                >
                  c/{community.name}
                </Link>
                <p className="community-card-members">
                  {community.members_count || 0} members
                </p>
                <p className="community-card-description">
                  {community.description || "No description available."}
                </p>
              </div>

              <div className="community-card-actions">
                <button
                  className={`btn-join ${community.is_joined ? "joined" : ""}`}
                  onClick={() =>
                    handleJoinToggle(community.id, community.is_joined)
                  }
                >
                  {community.is_joined ? "Joined" : "Join"}
                </button>
                <Link to={`/community/${community.id}`} className="btn-visit">
                  Visit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default Communities;
