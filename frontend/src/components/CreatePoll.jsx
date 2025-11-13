import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import * as api from "../api"; // <-- FIXED: Changed to import * as api

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  
  // --- NEW FEATURES STATE ---
  const [multipleAnswers, setMultipleAnswers] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const handleOptionChange = (i, value) => {
    const newOptions = [...options];
    newOptions[i] = value;
    setOptions(newOptions);
  };

  const addOption = () => setOptions([...options, ""]);

  // Function to remove an option
  const removeOption = (i) => {
    // Only allow removal if there are more than 2 options
    if (options.length > 2) {
      const newOptions = options.filter((_, index) => index !== i);
      setOptions(newOptions);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    // Filter out empty options before submitting
    const validOptions = options.filter(opt => opt.trim() !== '');

    if (validOptions.length < 2) {
      setError("Please provide at least two valid options.");
      return;
    }

    // Format options for the backend (as an array of objects with 'text' property)
    const formattedOptions = validOptions.map(opt => ({ text: opt.trim() }));

    // Build the payload for the API
    const payload = {
      question,
      options: formattedOptions, // Use the formatted array
      multipleAnswers,
    };

    // Only add expiresAt if it's set
    if (expiresAt) {
      payload.expiresAt = new Date(expiresAt).toISOString();
    }

    try {
      // *** FIXED: Now correctly calling the named export function ***
      const res = await api.createPoll(payload); 
      // Assuming your backend responds with the poll object, including an _id field
      const pollId = res.data._id || res.data.id || res.data.pollId; 
      if (pollId) {
        navigate(`/poll/${pollId}`);
      } else {
         setError("Poll created, but ID was missing from response.");
      }
    } catch (err) {
      console.error("Error creating poll:", err);
      const errMsg = err.response?.data?.msg || "Error creating poll. Please check if you are logged in and if your backend is running.";
      setError(errMsg);
    }
  };

  // FIX: This function formats the current date-time for the 'min' attribute
  const getMinDateTime = () => {
    const now = new Date();
    // Offset for local timezone
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    // Format to 'YYYY-MM-DDTHH:MM'
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="container">
      <h2>Create a New Poll</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
        
        <label className="form-label">Options</label>
        
        {options.map((opt, i) => (
          <div className="option-input-group" key={i}>
            <input
              type="text"
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => handleOptionChange(i, e.target.value)}
              required
            />
            {/* Show remove button only if more than 2 options */}
            {options.length > 2 && (
              <button 
                type="button" 
                className="remove-option-btn" 
                title="Remove option"
                onClick={() => removeOption(i)}
              >
                &times;
              </button>
            )}
          </div>
        ))}
        
        <button type="button" onClick={addOption} className="add-option-btn">
          + Add Option
        </button>

        {/* --- Poll Settings Section --- */}
        <div className="poll-settings">
          <h4>Poll Settings</h4>
          <div className="setting-row">
            <label htmlFor="multipleAnswers">Allow multiple answers</label>
            <input 
              type="checkbox"
              id="multipleAnswers"
              checked={multipleAnswers}
              onChange={(e) => setMultipleAnswers(e.target.checked)}
            />
          </div>
          
          <div className="setting-row">
            <label htmlFor="expiresAt">Set expiration date (optional)</label>
            <input
              type="datetime-local"
              id="expiresAt"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={getMinDateTime()} // This prevents entering past dates
            />
          </div>
        </div>
        
        {/* --- Error Display --- */}
        {error && (
          <div className="error-message" style={{color: 'red', margin: '1rem 0'}}>
            {error}
          </div>
        )}

        <button type="submit" className="create-poll-btn">Create Poll</button>
      </form>
    </div>
  );
}