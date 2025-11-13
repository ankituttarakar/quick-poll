const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// --- Import Routes ---
// Import Poll routes (assuming the file is named routes/polls.js)
const pollRoutes = require('./routes/polls.js');
// Import Auth routes (assuming the file is named routes/auth.js)
const authRoutes = require('./routes/auth.js'); 

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
// Crucial: Parses incoming JSON requests (needed for req.body)
app.use(express.json()); 

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.log(`❌ MongoDB connection error: ${err.message}`));

// --- Use Routes ---
// Express uses these lines to map URLs to your route handlers
app.use('/api/polls', pollRoutes);
app.use('/api/auth', authRoutes); 

app.listen(PORT, () => console.log(`🚀 Local Server running on ${PORT}`));
