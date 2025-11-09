import axios from "axios";

// This hardcodes the API URL to your local backend.
// It ignores any Vercel environment variables.
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export default api;