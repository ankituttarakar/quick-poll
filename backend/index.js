const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const serverless = require("serverless-http"); // New import
const pollRoutes = require("./routes/polls");

// Load Environment Variables (MONGO_URI)
dotenv.config();

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ MONGO_URI is missing in .env file! Exiting.");
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- EXPRESS SETUP ---
const app = express();

// Trust proxies for correct IP retrieval (needed for IP-based voting)
app.set("trust proxy", 1); 
app.use(cors());
app.use(express.json());

// Main API Route
app.use("/api/polls", pollRoutes);

// --- Vercel Serverless Export ---
// Export the Express app wrapped in serverless-http 
// This is the permanent fix for the 404 error on the API endpoint
module.exports.handler = serverless(app);

// Keep the local listener for local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Local Server running on ${PORT}`));
}