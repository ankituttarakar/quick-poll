import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  // Check for the token to determine login status
  const token = localStorage.getItem('token'); 
  // Placeholder username or logic to decode token for actual username
  const username = 'User'; 

  const handleLogout = () => {
    // Remove the token and redirect to login
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav style={{ background: '#1c1c3f', color: '#fff', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>QuickPoll</Link>
      </div>
      
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</Link>
        <Link to="/create" style={{ color: '#fff', textDecoration: 'none' }}>Create Poll</Link>
        
        {token ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: '#bbb' }}>Logged in as: {username}</span>
            <button 
              onClick={handleLogout} 
              style={{ padding: '0.5rem 1rem', background: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ color: '#fff', textDecoration: 'none' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
