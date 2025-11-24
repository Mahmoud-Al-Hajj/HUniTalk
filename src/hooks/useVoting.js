// hooks/useVoting.js
import { useState, useCallback, useEffect } from "react";
import api from "../api/axios";

/**
 * Custom hook for handling voting logic (posts, comments, etc.)
 * @param {Array} items - Array of items (posts/comments) with vote data
 * @param {string} itemType - Type of item ('post' or 'comment')
 * @param {string} persistKey - Key for localStorage persistence (optional)
 * @returns {object} - Voting state and handler functions
 */
export const useVoting = (items, itemType = "post", persistKey = null) => {
  const [userVotes, setUserVotes] = useState({});

  // Load from localStorage on mount if persistKey
  useEffect(() => {
    if (persistKey) {
      const stored = localStorage.getItem(persistKey);
      if (stored) {
        try {
          setUserVotes(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing stored votes:", e);
        }
      }
    }
  }, [persistKey]);

  // Save to localStorage when userVotes changes if persistKey
  useEffect(() => {
    if (persistKey && Object.keys(userVotes).length > 0) {
      localStorage.setItem(persistKey, JSON.stringify(userVotes));
    }
  }, [userVotes, persistKey]);

  /**
   * Initialize vote states from backend data or localStorage
   * Call this after fetching items from the backend
   */
  const initializeVotes = useCallback(
    (itemsData) => {
      if (persistKey) {
        // For persisted items, votes are already loaded from localStorage
        // Optionally merge with backend data if available
        const votesInit = { ...userVotes };
        itemsData.forEach((item) => {
          if (item.user_vote !== undefined && item.user_vote !== null) {
            const voteNum =
              typeof item.user_vote === "string"
                ? parseInt(item.user_vote, 10)
                : item.user_vote;
            if (voteNum === 1) {
              votesInit[item.id] = "up";
            } else if (voteNum === -1) {
              votesInit[item.id] = "down";
            } else {
              votesInit[item.id] = null;
            }
          }
        });
        setUserVotes(votesInit);
      } else {
        // For non-persisted, initialize from backend data
        const votesInit = {};
        itemsData.forEach((item) => {
          const userVote = item.user_vote;
          const voteNum =
            typeof userVote === "string" ? parseInt(userVote, 10) : userVote;

          if (voteNum === 1) {
            votesInit[item.id] = "up";
          } else if (voteNum === -1) {
            votesInit[item.id] = "down";
          } else {
            votesInit[item.id] = null;
          }
        });
        setUserVotes(votesInit);
      }
    },
    [persistKey, userVotes]
  );

  /**
   * Calculate vote delta for optimistic UI update
   */
  const calculateVoteDelta = (currentVote, clickedVote) => {
    const voteMap = { up: 1, down: -1, null: 0 };
    const currentNum = voteMap[currentVote] || 0;
    const clickedNum = clickedVote === "up" ? 1 : -1;

    let newNum, delta;

    if (currentNum === clickedNum) {
      // Remove vote
      newNum = 0;
      delta = -currentNum;
    } else if (currentNum === 0) {
      // Add vote
      newNum = clickedNum;
      delta = clickedNum;
    } else {
      // Switch vote (changes by ±2)
      newNum = clickedNum;
      delta = clickedNum - currentNum;
    }

    const newVoteState = newNum === 1 ? "up" : newNum === -1 ? "down" : null;
    return { newVoteState, delta };
  };

  /**
   * Handle vote action with optimistic updates
   * @param {number} itemId - ID of the item being voted on
   * @param {string} voteType - 'up' or 'down'
   * @param {function} updateCallback - Callback to update parent state
   */
  const handleVote = useCallback(
    async (itemId, voteType, updateCallback) => {
      const currentVote = userVotes[itemId] || null;
      const { newVoteState, delta } = calculateVoteDelta(currentVote, voteType);

      // Store previous state for rollback
      const previousVotes = { ...userVotes };

      // Optimistic update
      setUserVotes((prev) => ({ ...prev, [itemId]: newVoteState }));

      // Call the callback to update the item's vote count in parent component
      if (updateCallback) {
        updateCallback(itemId, delta);
      }

      try {
        // API call based on item type
        const endpoint =
          itemType === "post"
            ? `/posts/${itemId}/${voteType}vote`
            : `/comments/${itemId}/${voteType}vote`;

        const response = await api.post(endpoint);

        // For comments, calculate votes from upvotes/downvotes
        if (itemType === "comment" && response.data) {
          response.data.votes =
            (response.data.upvotes || 0) - (response.data.downvotes || 0);
        }

        // Update userVotes with server response if available
        if (response.data && response.data.user_vote !== undefined) {
          const serverVote = response.data.user_vote;
          const serverVoteState =
            serverVote === 1 ? "up" : serverVote === -1 ? "down" : null;
          setUserVotes((prev) => ({ ...prev, [itemId]: serverVoteState }));
        }

        // Optional: Update with server response if available
        if (
          response.data &&
          updateCallback &&
          response.data.votes !== undefined
        ) {
          updateCallback(itemId, response.data.votes, true); // true = absolute update
        }
      } catch (err) {
        console.error("Vote failed:", err);

        // Rollback on error
        setUserVotes(previousVotes);

        // Revert the optimistic update
        if (updateCallback) {
          updateCallback(itemId, -delta);
        }

        throw err; // Re-throw so parent can handle error message
      }
    },
    [userVotes, itemType]
  );

  /**
   * Get vote count for an item considering user's vote
   * @param {number} baseCount - Original vote count from backend
   * @param {number} itemId - Item ID
   * @returns {number} - Calculated vote count
   */
  const getVoteCount = useCallback(
    (baseCount, itemId) => {
      const userVote = userVotes[itemId];
      if (!userVote) return baseCount;

      // This is only needed if you're not doing optimistic updates on the count itself
      // If you update the count directly, you don't need this
      return baseCount;
    },
    [userVotes]
  );

  return {
    userVotes,
    handleVote,
    initializeVotes,
    getVoteCount,
  };
};

export default useVoting;
