import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import "../styles.css";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Share2, Copy, AlertTriangle, Clock } from 'lucide-react';

// --- Results Component ---
// This component displays the bar chart and percentage bars for results
function PollResults({ poll }) {
  const totalVotes = poll.options.reduce((acc, option) => acc + option.votes, 0);
  
  // Data for the bar chart
  const chartData = poll.options.map((option, index) => ({
    name: option.text.length > 15 ? option.text.substring(0, 15) + '...' : option.text,
    votes: option.votes,
  }));

  // Colors for the bar chart
  const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

  return (
    <div className="poll-results">
      <h3>Results</h3>
      <p className="total-votes">Total Votes: {totalVotes}</p>

      {/* Bar Chart */}
      <div style={{ width: '100%', height: 300, marginBottom: '24px' }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="votes" fill="#8884d8">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Percentage Bars */}
      {poll.options.map((option, index) => {
        const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
        return (
          <div className="result-bar-wrapper" key={index}>
            <div className="result-bar-label">
              <span>{option.text}</span>
              <span className="result-percentage">{option.votes} ({percentage.toFixed(0)}%)</span>
            </div>
            <div className="result-bar">
              <div 
                className="result-bar-fill" 
                style={{ width: `${percentage}%` }}
              >
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Share Component ---
// This component displays the shareable link and copy button
function SharePoll({ pollId }) {
  const [copied, setCopied] = useState(false);
  const pollUrl = `${window.location.origin}/poll/${pollId}`;

  const handleCopy = () => {
    // This uses the modern clipboard API
    navigator.clipboard.writeText(pollUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <div className="share-container">
      <h3><Share2 size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }}/>Share This Poll</h3>
      <div className="share-input-group">
        <input type="text" value={pollUrl} readOnly />
        <button onClick={handleCopy} className="share-copy-btn">
          {copied ? "Copied!" : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
}


// --- Main Poll Page Component ---
export default function PollPage() {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // NEW: State for voting
  const [selectedOptions, setSelectedOptions] = useState([]); // Use an array for multi-select
  const [isPollClosed, setIsPollClosed] = useState(false);
  const [showResults, setShowResults] = useState(false); // Show results after voting
  
  const { id: pollId } = useParams();

  // Fetch the poll data
  useEffect(() => {
    const fetchPoll = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/polls/${pollId}`);
        setPoll(res.data);
        
        // Check if poll is expired
        if (res.data.expiresAt && new Date() > new Date(res.data.expiresAt)) {
          setIsPollClosed(true);
          setShowResults(true); // Automatically show results if expired
          setError("This poll has expired and is no longer accepting votes.");
        }
      } catch (err) {
        console.error("Error fetching poll:", err);
        const errMsg = err.response?.data?.error || "Poll not found.";
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchPoll();
  }, [pollId]);

  // Handle selection for BOTH radio and checkbox
  const handleSelectionChange = (optionIndex) => {
    if (poll.multipleAnswers) {
      // Checkbox logic (multiple)
      if (selectedOptions.includes(optionIndex)) {
        setSelectedOptions(selectedOptions.filter(idx => idx !== optionIndex));
      } else {
        setSelectedOptions([...selectedOptions, optionIndex]);
      }
    } else {
      // Radio button logic (single)
      setSelectedOptions([optionIndex]);
    }
  };

  // Handle vote submission
  const handleSubmitVote = async (e) => {
    e.preventDefault();
    if (selectedOptions.length === 0) {
      setError("Please select at least one option.");
      return;
    }
    
    setError(null);

    try {
      // Send an array of indices, matching the new backend
      const res = await api.post(`/polls/${pollId}/vote`, {
        optionIndices: selectedOptions,
      });
      setPoll(res.data); // Update poll with new vote counts
      setShowResults(true); // Show results after successful vote
    } catch (err) {
      console.error("Error voting:", err);
      const errMsg = err.response?.data?.error || "Failed to submit vote.";
      setError(errMsg);
      
      // If error is "Already voted" or "Expired", show results
      if (errMsg.includes("voted") || errMsg.includes("expired")) {
        setIsPollClosed(true);
        setShowResults(true);
      }
    }
  };

  if (loading) return <div className="container"><h2>Loading Poll...</h2></div>;
  
  // Show a hard error for "Poll not found"
  if (!poll && error) {
    return (
      <div className="container error-message">
        <AlertTriangle size={24} />
        <strong style={{marginLeft: '10px'}}>{error}</strong>
      </div>
    );
  }

  // This should not happen, but good to have
  if (!poll) return null;

  return (
    <div className="poll-page-container">
      <div className="poll-info">
        
        {/* --- Header --- */}
        <h2>{poll.question}</h2>
        {poll.expiresAt && (
          <p style={{ color: isPollClosed ? 'var(--red)' : 'var(--dark-gray)' }}>
            <Clock size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            {isPollClosed ? 'Poll closed' : `Closes on: ${new Date(poll.expiresAt).toLocaleString()}`}
          </p>
        )}

        {/* --- Error Display --- */}
        {error && !loading && (
          <div className="error-message" style={{ marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* --- Voting Form OR Results --- */}
        {!showResults ? (
          <form className="voting-form" onSubmit={handleSubmitVote}>
            {poll.options.map((option, index) => (
              <label className="vote-option" key={index}>
                {option.text}
                <input
                  type={poll.multipleAnswers ? "checkbox" : "radio"}
                  name="pollOption"
                  checked={selectedOptions.includes(index)}
                  onChange={() => handleSelectionChange(index)}
                />
                <span className="vote-checkmark"></span>
              </label>
            ))}
            <button 
              type="submit" 
              className="vote-btn" 
              disabled={selectedOptions.length === 0}
            >
              Submit Vote
            </button>
          </form>
        ) : (
          <PollResults poll={poll} />
        )}

      </div>
      
      {/* Share Poll Component */}
      <SharePoll pollId={pollId} />
    </div>
  );
}