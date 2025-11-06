const express = require("express");
const router = express.Router();
const Poll = require("../models/Poll");
const shortid = require("shortid");

// ✅ CREATE a new poll
router.post("/", async (req, res) => {
  try {
    const { question, options } = req.body;

    if (!question || !options || options.length < 2) {
      return res.status(400).json({ error: "Please provide a question and at least two options." });
    }

    const newPoll = new Poll({
      shortId: shortid.generate(),
      question,
      options: options.map((text) => ({ text })),
    });

    await newPoll.save();
    res.json({ pollId: newPoll.shortId });
  } catch (error) {
    console.error("Error creating poll:", error);
    res.status(500).json({ error: "Failed to create poll" });
  }
});

// ✅ GET a poll by shortId (for viewing)
router.get("/:shortId", async (req, res) => {
  try {
    const poll = await Poll.findOne({ shortId: req.params.shortId });
    if (!poll) return res.status(404).json({ error: "Poll not found" });
    res.json(poll);
  } catch (error) {
    console.error("Error fetching poll:", error);
    res.status(500).json({ error: "Failed to fetch poll" });
  }
});

// ✅ VOTE for an option
router.post("/:shortId/vote", async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findOne({ shortId: req.params.shortId });

    if (!poll) return res.status(404).json({ error: "Poll not found" });

    poll.options[optionIndex].votes += 1;
    await poll.save();

    res.json(poll);
  } catch (error) {
    console.error("Error voting:", error);
    res.status(500).json({ error: "Failed to vote" });
  }
});

module.exports = router;
