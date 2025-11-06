const mongoose = require("mongoose");

const PollSchema = new mongoose.Schema({
  shortId: { type: String, required: true },
  question: { type: String, required: true },
  options: [
    {
      text: { type: String, required: true },
      votes: { type: Number, default: 0 },
    },
  ],
});

module.exports = mongoose.model("Poll", PollSchema);
