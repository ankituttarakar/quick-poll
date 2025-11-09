import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import CreatePoll from "./components/CreatePoll";
import PollPage from "./components/PollPage";
import { BarChart3 } from "lucide-react";
import "./styles.css";

function App() {
  return (
    // The BrowserRouter MUST wrap the entire application
    <BrowserRouter>
      {/* THIS IS THE FIX: We use the 'poll-page-container' class here.
        This class has 'max-width: 600px' and 'margin: 0 auto', which will
        center EVERYTHING inside it, including the header and the content below.
      */}
      <div className="poll-page-container">
        <header>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>
              <BarChart3 size={26} color="#2563eb" />
              QuickPoll
            </h1>
          </Link>
          <p>Create polls and see results update in real-time</p>
        </header>

        {/* The routes will now render inside the centered container */}
        <Routes>
          <Route path="/" element={<CreatePoll />} />
          <Route path="/poll/:id" element={<PollPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;