const express = require('express');
const router = express.Router();

const Comment = require('../models/Comment');


router.get('/search', async (req, res) => {
    let { q: query, p: page } = req.query;
    if (!page || page < 0) page = 0;

    if (!query) {
        res.status(400).send('Query parameter is required (q=)');
        return;
    }

    const response = await fetch(`https://api.igdb.com/v4/games/`, {
        method: 'POST',
        headers: {
            "Accept": "application/json",
            "Client-ID": "bwmhssy6u1fe80lb7ou9z7f6n4gbje",
            "Authorization": "Bearer ubmwzqkcq304n8lfbilehq0z7mhujj"
        },
        body: `search "${query}"; fields first_release_date, status, name, cover.*, total_rating; ` +
            `where total_rating_count >= 10; limit ${10}; offset ${page * 10};`,
    }).catch((error) => {
        console.error('Error:', error);
    });

    const data = await response.json();
    console.log(data);

    res.send(data);
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    if (!id || id < 0) {
        res.status(400).send('Invalid game ID');
        return;
    }

    const response = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
            "Accept": "application/json",
            "Client-ID": "bwmhssy6u1fe80lb7ou9z7f6n4gbje",
            "Authorization": "Bearer ubmwzqkcq304n8lfbilehq0z7mhujj"
        },
        body: `fields *, 
        involved_companies.*, involved_companies.company.name, 
        release_dates.*, release_dates.platform.*,
        screenshots.*, similar_games.*, websites.*, language_supports.*; where id = ${id};`
    }).catch((error) => {
        console.error('Error:', error);
        res.status(500).send('An error occurred while fetching game data');
        return null;
    }).then((response) => {
        if (!response.ok) {
            console.error('Response is not OK:', response.status, response.statusText);
            res.status(500).send('An error occurred while fetching game data');
            return null;
        }
        return response;
    });

    if (!response) return;

    const data = await response.json();
    console.log(data);

    res.send(data);
});

router.get('/:id/similar', async (req, res) => {
    const { id } = req.params;

    if (!id || id < 0) {
        res.status(400).send('Invalid game ID');
        return;
    }

    const response = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
            "Accept": "application/json",
            "Client-ID": "bwmhssy6u1fe80lb7ou9z7f6n4gbje",
            "Authorization": "Bearer ubmwzqkcq304n8lfbilehq0z7mhujj"
        },
        body: `fields name, similar_games.*; where id = ${id};`
    }).catch((error) => {
        console.error('Error:', error);
    });

    const data = await response.json();
    console.log(data);

    res.send(data);
});

router.get('/:id/comment', async (req, res) => {
    const { id } = req.params;

    if (!id || id < 0) {
        res.status(400).send('Invalid game ID');
        return;
    }

    const comments = await Comment.find({game: id});

    res.send(comments);
});

router.post('/:id/comment', async (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;

    if (!id || id < 0) {
        res.status(400).send('Invalid game ID');
        return;
    }

    if (!comment) {
        res.status(400).send('Comment is required');
        return;
    }

    if (!req.isAuthenticated()) {
        res.status(401).send('User is not authenticated');
        return;
    }

    await Comment.create({game: id, user: req.user.id, comment});

    res.status(201).send('Comment added');
});

router.delete('/:id/comment', async (req, res) => {
    const { id } = req.params;

    if (!id || id < 0) {
        res.status(400).send('Invalid game ID');
        return;
    }

    if (!comment) {
        res.status(400).send('Comment is required');
        return;
    }

    if (!req.isAuthenticated()) {
        res.status(401).send('User is not authenticated');
        return;
    }

    const comment = await Comment.findById(id);
    if (!comment) {
        res.status(404).send('Comment not found');
        return;
    }

    const requester = req.user.id;
    if (comment.user.id !== requester) {
        res.status(403).send('User is not authorized to delete this comment');
        return;
    }

    await Comment.findByIdAndDelete(id).catch((error) => {
        console.error('Error:', error);
        res.status(500).send('An error occurred while deleting the comment');
        return;
    });
    res.status(200).send('Comment removed');
});


module.exports = router;