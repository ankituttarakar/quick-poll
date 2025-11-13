import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../api.js';

const Results = () => {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [copied, setCopied] = useState(false);
  
  const { id } = useParams();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPollResults = async () => {
      if (!token) {
          setError('You must be logged in to view results.');
          setLoading(false);
          return;
      }
      try {
        // *** CHANGE: Call the new protected results route ***
        const { data } = await api.getPollResults(id);
        setPoll(data);
        setComments(data.comments || []);
      } catch (err) {
        setError('Could not load poll results. You may not have permission.');
      } finally {
        setLoading(false);
      }
    };
    fetchPollResults();
  }, [id, token]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const { data } = await api.addComment(id, { text: commentText });
      setComments(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setCommentText('');
    } catch (err) {
      setError('Failed to post comment. Please try again.');
    }
  };
  
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/poll/${id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Could not copy text: ', err);
      alert("Share URL: " + shareUrl); 
    });
  };

  if (loading) return <div>Loading results...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;
  if (!poll) return <div>Poll not found.</div>;

  const totalVotes = poll.options.reduce((sum, option) => sum + (option.votes || 0), 0);
  
  // *** NEW: Check if the 'voters' field exists (it only will for the creator) ***
  const isCreator = poll.voters ? true : false;

  return (
    <div className="results-container" style={{color: 'white'}}>
      <h2>{poll.question}</h2>
      <p>Total Votes: {totalVotes}</p>

      <div className="results-list" style={{ marginBottom: '2rem' }}>
        {poll.options.map((option) => {
          const percentage = totalVotes === 0
            ? 0
            : ((option.votes / totalVotes) * 100).toFixed(1);

          return (
            <div key={option._id} className="result-option" style={{ border: '1px solid #ccc', padding: '10px', margin: '5px 0', borderRadius: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontWeight: 'bold' }}>
                <span>{option.text}</span>
                <span>{option.votes} votes ({percentage}%)</span>
              </div>
              <div style={{ background: '#eee', height: '24px', borderRadius: '5px' }}>
                <div
                  style={{
                    width: `${percentage}%`,
                    background: '#007bff',
                    height: '100%',
                    borderRadius: '5px'
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* *** FIX: "Back to voting" now links to the homepage "/" *** */}
        <Link to="/">
          <button style={{ padding: '10px 20px' }}>Back to Polls</button>
        </Link>
        <button 
          onClick={handleShare}
          style={{ 
            padding: '10px 20px', 
            background: copied ? '#28a745' : '#17a2b8', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {copied ? 'Link Copied!' : 'Share Poll Link'}
        </button>
      </div>
      
      {/* *** NEW: Show this section ONLY if you are the creator *** */}
      {isCreator && (
        <div className="voter-list" style={{ marginTop: '2rem' }}>
            <h3>Voter List ({poll.voters.length})</h3>
            {poll.voters.length > 0 ? (
                 <ul style={{ listStyle: 'none', padding: 0 }}>
                    {poll.voters.map(voter => (
                        <li key={voter._id} style={{ padding: '5px', background: '#333' }}>
                            {voter.username}
                        </li>
                    ))}
                 </ul>
            ) : (
                <p>No votes have been cast yet.</p>
            )}
        </div>
      )}

      <div className="comments-section" style={{ marginTop: '2rem' }}>
        <h3>Comments ({comments.length})</h3>
        
        {token ? (
          <form onSubmit={handleCommentSubmit} style={{ marginBottom: '1rem' }}>
            <textarea
              rows="3"
              style={{ width: '100%', padding: '8px' }}
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
            ></textarea>
            <button type="submit" style={{ marginTop: '5px' }}>Post Comment</button>
          </form>
        ) : (
          <p><Link to="/login">Log in</Link> to post a comment.</p>
        )}

        <div className="comment-list">
          {comments.map((comment) => (
            <div key={comment._id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
              <strong>{comment.username}</strong>
              <p style={{ margin: '5px 0' }}>{comment.text}</p>
              <span style={{ fontSize: '0.8em', color: '#777' }}>
                {new Date(comment.date).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Results;