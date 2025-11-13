const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  text: String,
  votes: {
    type: Number,
    default: 0,
  },
});

const CommentSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const PollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: [OptionSchema],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, 
  },
  comments: [CommentSchema],
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Poll', PollSchema);