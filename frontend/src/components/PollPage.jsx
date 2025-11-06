import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles.css";

function PollPage() {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/polls/${id}`);
        setPoll(res.data);
      } catch (error) {
        console.error("Error fetching poll:", error);
      }
    };
    fetchPoll();

    // Optional: auto-refresh results every 2 seconds (like “real-time” updates)
    const interval = setInterval(fetchPoll, 2000);
    return () => clearInterval(interval);
  }, [id]);

  const handleVote = async (index) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/polls/${id}/vote`, { optionIndex: index });
      setPoll(res.data); // instantly update after vote
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  if (!poll) return <p style={{ textAlign: "center" }}>Loading poll...</p>;

  return (
    <div className="container">
      <h2>{poll.question}</h2>
      {poll.options.map((opt, i) => (
        <button key={i} className="poll-button" onClick={() => handleVote(i)}>
          {opt.text} ({opt.votes})
        </button>
      ))}
      <button style={{ marginTop: "10px" }} onClick={() => navigate("/")}>
        Create New Poll
      </button>
    </div>
  );
}

export default PollPage;
