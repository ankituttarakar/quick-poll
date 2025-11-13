const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const auth = require('../middleware/auth');

// ... (keep your existing GET /, POST /, and POST /:id/vote routes) ...
// ...
router.get('/', async (req, res) => {
    try {
        const polls = await Poll.find().select('question created_at creator').sort({ created_at: -1 });
        res.json(polls);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error fetching polls');
    }
});

router.post('/', auth, async (req, res) => {
    const { question, options } = req.body;
    
    if (!question || !options || options.length < 2) {
        return res.status(400).json({ msg: 'Please provide a question and at least two options.' });
    }
    
    const validOptions = options.map(opt => ({ text: opt.text || opt }));
    if (validOptions.some(opt => opt.text.trim() === '')) {
        return res.status(400).json({ msg: 'Options cannot be empty.' });
    }

    try {
        const newPoll = new Poll({
            question,
            options: validOptions,
            creator: req.user.id, 
        });

        const poll = await newPoll.save();
        res.json(poll); 
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error during poll creation');
    }
});

router.post('/:id/vote', auth, async (req, res) => {
    const { optionId } = req.body;
    const userId = req.user.id;

    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) {
            return res.status(404).json({ msg: 'Poll not found' });
        }
        
        if (poll.voters.includes(userId)) {
            return res.status(400).json({ msg: 'You have already voted in this poll' });
        }

        const option = poll.options.id(optionId);
        if (!option) {
            return res.status(404).json({ msg: 'Option not found' });
        }

        option.votes += 1;
        poll.voters.push(userId);
        await poll.save();
        
        res.json(poll); 

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error while recording vote');
    }
});
// ...
// ...

// *** MODIFY THIS ROUTE ***
// This route is for the VOTING page. It must send the voter IDs.
router.get('/:id', async (req, res) => {
    try {
        // We select 'voters' so the frontend can check if the user has voted
        const poll = await Poll.findById(req.params.id).select('question options voters');
        if (!poll) {
            return res.status(404).json({ msg: 'Poll not found' });
        }
        res.json(poll);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Poll not found' });
        }
        res.status(500).send('Server Error fetching single poll');
    }
});


// *** ADD THIS NEW ROUTE ***
// This route is for the RESULTS page.
// It is protected and only shows the voter list to the creator.
router.get('/:id/results', auth, async (req, res) => {
    try {
        let poll;
        
        // Find the poll first
        const basicPoll = await Poll.findById(req.params.id).select('question options creator comments');
        if (!basicPoll) {
             return res.status(404).json({ msg: 'Poll not found' });
        }

        // Check if the person requesting is the poll's creator
        if (basicPoll.creator.toString() === req.user.id) {
            // If they ARE the creator, re-fetch the poll and populate the voter names
            poll = await Poll.findById(req.params.id)
                .populate('comments.username', 'username') // (if you had comments)
                .populate('voters', 'username'); // <-- Get usernames of voters
        } else {
            // If they are NOT the creator, just send the basic poll data
            poll = basicPoll;
        }

        res.json(poll);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error getting results');
    }
});


module.exports = router;