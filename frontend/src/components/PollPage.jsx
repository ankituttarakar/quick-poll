import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as api from '../api.js';
import { jwtDecode } from 'jwt-decode'; // Make sure you ran: npm install jwt-decode

const PollPage = () => {
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false); // <-- FIX IS HERE
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const { data } = await api.getPoll(id);
        setPoll(data);

        // --- CHECK IF USER HAS VOTED ---
        const token = localStorage.getItem('token');
        if (token) {
          const user = jwtDecode(token);
          const userId = user.user.id;
          
          // Check if the poll's voters array (sent from backend) includes this user
          if (data.voters && data.voters.includes(userId)) {
            setHasVoted(true);
          }
        }
      } catch (err) {
        setError('Could not load poll.');
      } finally {
        setLoading(false);
      }
    };
    fetchPoll();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    if (!selectedOption) {
      setError('Please select an option.');
      return;
    }
    try {
      await api.voteOnPoll(id, selectedOption);
      navigate(`/results/${id}`);
    } catch (err) {
      // Handle the "Already voted" error from the server
      setError(err.response?.data?.msg || 'Failed to submit vote.');
      if (err.response?.data?.msg === 'You have already voted in this poll') {
        setHasVoted(true); // Sync UI
      }
      console.error(err);
    }
  };

  if (loading) return <div>Loading poll...</div>;
  if (error && !hasVoted) return <div style={{ color: 'red' }}>{error}</div>;
  if (!poll) return <div>Poll not found.</div>;

  // --- NEW RENDER LOGIC ---
  // If user has already voted, show a message instead of the form
  if (hasVoted) {
    return (
      <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>
        <h2>You have already voted in this poll.</h2>
        <p>Thank you for your participation!</p>
        <Link to={`/results/${id}`}>
          <button style={{ marginTop: '1rem' }}>View Results</button>
        </Link>
      </div>
    );
  }

  // If user has NOT voted, show the form
  return (
    <div style={{ color: 'white' }}>
      <h2>{poll.question}</h2>
      <form onSubmit={handleSubmit}>
        {poll.options.map((option) => (
          <div key={option._id} style={{ margin: '0.5rem 0', padding: '0.5rem', border: '1px solid #333', borderRadius: '4px' }}>
            <input
              type="radio"
              id={option._id}
              name="pollOption"
              value={option._id}
              onChange={(e) => setSelectedOption(e.target.value)}
            />
            <label htmlFor={option._id} style={{ marginLeft: '10px', fontSize: '1.1rem' }}>
              {option.text}
            </label>
          </div>
        ))}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ marginTop: '1rem' }}>Submit Vote</button>
      </form>
    </div>
  );
};

export default PollPage;