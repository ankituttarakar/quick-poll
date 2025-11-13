import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '../api.js';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }
    
    try {
      await api.registerUser({ username, password });
      
      const loginResponse = await api.loginUser({ username, password });
      
      localStorage.setItem('token', loginResponse.data.token); 
      
      navigate('/'); 

    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed. Check if username is taken.');
    }
  };

  return (
    <div style={{ color: 'white', padding: '20px', maxWidth: '400px', margin: '2rem auto', border: '1px solid #333', borderRadius: '8px' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', backgroundColor: '#333', color: 'white', border: '1px solid #555' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', backgroundColor: '#333', color: 'white', border: '1px solid #555' }}
          />
        </div>
        
        {error && <p style={{ color: '#e94560', textAlign: 'center' }}>{error}</p>}
        
        <button 
          type="submit" 
          style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Register & Log In
        </button>
        <p style={{ fontSize: '0.9em', textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: '#00ffff', textDecoration: 'none' }}>Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;