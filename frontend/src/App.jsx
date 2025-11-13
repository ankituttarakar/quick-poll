import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PollList from "./components/PollList"; 
import CreatePoll from "./components/CreatePoll";
import PollPage from "./components/PollPage";
import Results from "./components/Results";
import Login from "./components/Login";
import Register from "./components/Register";
import "./styles.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar /> 
      
      <div className="container" style={{ padding: '2rem' }}>
        <Routes>
          <Route path="/" element={<PollList />} /> 
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/create" element={<CreatePoll />} />
          <Route path="/poll/:id" element={<PollPage />} />
          <Route path="/results/:id" element={<Results />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
