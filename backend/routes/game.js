const express = require('express');
const router = express.Router();

const Comment = require('../models/Comment');
const User = require('../models/User');
const {verify} = require("jsonwebtoken");
const jwt = require("jsonwebtoken");

function isAuthenticated(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, 'supersecurejwtkey', (err, user) => {
            if (err) {
                console.error('Token is not valid');
                return res.status(403).send('Token is not valid');
            }
            req.user = user;
            next();
        });
    } else {
        return res.status(401).send('Token is not supplied');
    }
}

function isAuthenticatedCallback(req, cb) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, 'supersecurejwtkey', (err, user) => {
            if (err) {
                console.error('Token is not valid');
                cb(false);
            } else {
                req.user = user;
                cb(true);
            }
        }
        );
    } else {
        cb(false);
    }
}


const fetchIgdb = async (endpoint, body) => {
    try {
        const response = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Client-ID": "bwmhssy6u1fe80lb7ou9z7f6n4gbje",
                "Authorization": "Bearer ubmwzqkcq304n8lfbilehq0z7mhujj"
            },
            body: body
        });

        if (!response.ok) {
            throw new Error(`Response not OK: ${response.status}. ${response.statusText}. ${await response.text()}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

router.get('/search', async (req, res) => {
    let {q: query, p: page} = req.query;
    if (!page || page < 0) page = 0;

    if (!query) {
        res.status(400).send('You must provide a query');
        return;
    }

    try {
        const data = await fetchIgdb('games', `search "${query}"; 
        fields first_release_date, status, name, cover.*, total_rating; 
        where total_rating_count >= 10; limit ${24}; offset ${page * 10};`)

        res.send(data);
    } catch (error) {
        res.status(500).send('An error occurred while fetching game data');
    }
});

router.get('/search/genres', async (req, res) => {
    let {g: genre} = req.query;

    if (!genre) {
        try {
            const data = await fetchIgdb('genres', `fields name, slug; limit 500;`);
            res.send(data);
        } catch (error) {
            res.status(500).send('An error occurred while fetching genres');
        }
    } else {
        try {
            const data = await fetchIgdb('games', `fields first_release_date, status, name, cover.*, total_rating;
            where genres = (${genre}) & total_rating_count >= 10 & total_rating > 80; limit 12;`)

            res.send(data);
        } catch (error) {
            res.status(500).send('An error occurred while fetching genre search');
        }
    }
});

router.get('/recent', async (req, res) => {
    try {
        const dateThreshold = Math.floor(new Date().getTime() / 1000) - (60 * 60 * 24 * 60); // 60 days

        const data = await fetchIgdb('games', `fields first_release_date, status, name, cover.*, total_rating;
        where total_rating_count >= 5 & first_release_date > ${dateThreshold}; sort total_rating desc; limit 20;`);

        res.send(data);
    } catch (error) {
        res.status(500).send('An error occurred while fetching popular games');
    }
});

router.get('/:id', async (req, res) => {
    const {id} = req.params;

    if (!id || id < 0) {
        res.status(400).send('Invalid game ID');
        return;
    }

    try {
        const data = await fetchIgdb('games', `fields *,
            involved_companies.*, involved_companies.company.name,
            release_dates.*, release_dates.platform.*,
            genres.*, keywords.name, cover.*,
            screenshots.*, similar_games.*, websites.*, language_supports.*; where id = ${id};`);

        res.send(data);
        // send data then update genre history

        isAuthenticatedCallback(req, async (isAuthenticated) => {
            if (!isAuthenticated) return;

            const userId = req.user.id;
            const genres = data[0].genres;

            try {
                if (genres) {
                    console.log('Updating genre history');
                    let incOperation = {$inc: {}};
                    genres.forEach(genre => {
                        incOperation.$inc[`genre_history.${genre.id}`] = 1;
                    });

                    await User.updateOne(
                      {_id: userId},
                      incOperation
                    );
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    } catch (error) {
        res.status(500).send('An error occurred while fetching game data');
    }
});

router.get('/:id/similar', async (req, res) => {
    const {id} = req.params;

    if (!id || id < 0) {
        res.status(400).send('Invalid game ID');
        return;
    }

    try {
        const data = await fetchIgdb('games', `fields similar_games.*; where id = ${id};`);
        res.send(data);
    } catch (error) {
        res.status(500).send('An error occurred while fetching similar games');
    }
});

router.get('/:id/comment', async (req, res) => {
    const {id} = req.params;

    if (!id || id < 0) {
        res.status(400).send('Invalid game ID');
        return;
    }

    try {
        const comments = await Comment.find({game: id});
        res.send(comments);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while fetching comments');
    }

});

router.post('/:id/comment', isAuthenticated, async (req, res) => {
    const {id} = req.params;
    const {comment: msg} = req.body;

    if (!id || id < 0) {
        res.status(400).send('Invalid game ID');
        return;
    }

    if (!msg) {
        res.status(400).send('Comment is required');
        return;
    }

    const comment = new Comment({
        game: id,
        user: req.user._id,
        comment: msg,
    });

    try {
        await comment.save();
        res.status(201).send('Comment added');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while adding the comment');
    }
});

router.delete('/:id/comment/:cid', isAuthenticated, async (req, res) => {
    const {id, cid: commentId} = req.params;

    if (!id || id < 0) {
        res.status(400).send('Invalid game ID');
        return;
    }

    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            res.status(404).send('Comment not found');
            return;
        }

        if (comment.user._id.toString() !== req.user._id.toString()) {
            res.status(403).send('User is not authorized to delete this comment');
            return;
        }

        await Comment.findByIdAndDelete(commentId);
        res.status(200).send('Comment removed');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while removing the comment');
    }
});

module.exports = router;