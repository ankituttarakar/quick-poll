import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api.js'; // The correct import format

const PollList = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        // Calls the backend GET /api/polls route
        const { data } = await api.getAllPolls();
        // Sorts polls by newest first
        setPolls(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      } catch (err) {
        setError('Could not load polls. Ensure your backend is running and the /api/polls route is defined.');
      } finally {
        setLoading(false);
      }
    };
    fetchPolls();
  }, []);

  if (loading) return <div>Loading polls...</div>;
  if (error) return <div style={{ color: 'red', margin: '2rem' }}>{error}</div>;

  return (
    <div className="poll-list-container">
      <h2>Active Polls</h2>
      {polls.length === 0 ? (
        <p>No polls found. <Link to="/create">Be the first to create one!</Link></p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {polls.map((poll) => (
            <li key={poll._id} style={{ margin: '1rem 0', border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
              <h3>{poll.question}</h3>
              <Link to={`/poll/${poll._id}`}>
                <button style={{ marginRight: '1rem' }}>Vote Now</button>
              </Link>
              <Link to={`/results/${poll._id}`}>
                <button>View Results</button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PollList;
