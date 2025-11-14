import axios from 'axios';

// This line tells Vercel to use your new Render URL in production,
// but keep using localhost for development.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: API_URL,
});

const getToken = () => localStorage.getItem('token');

export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (userData) => API.post('/auth/login', userData);

export const getAllPolls = () => API.get('/polls');
export const getPoll = (pollId) => API.get(`/polls/${pollId}`); // This is for the VOTING page

// *** ADD THIS NEW FUNCTION ***
// This is for the RESULTS page
export const getPollResults = (pollId) => {
  return API.get(`/polls/${pollId}/results`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
};

export const createPoll = (pollData) => {
  return API.post('/polls', pollData, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
};

export const voteOnPoll = (pollId, optionId) => {
  return API.post(`/polls/${pollId}/vote`, { optionId }, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
};

export const addComment = (pollId, commentData) => {
  return API.post(`/polls/${pollId}/comment`, commentData, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
};