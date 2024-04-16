const express = require('express');
const router = express.Router();

const Comment = require('../models/Comment');
const User = require('../models/User');

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    console.error('User is not authenticated');
    res.status(401).send('User is not authenticated');
}

const fetchGamesFromQuery = async (query, page) => {
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

    return await response.json();
}

const fetchGamesFromGenres = async (genres) => {
    const response = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
            "Accept": "application/json",
            "Client-ID": "bwmhssy6u1fe80lb7ou9z7f6n4gbje",
            "Authorization": "Bearer ubmwzqkcq304n8lfbilehq0z7mhujj"
        },
        body: `fields first_release_date, status, name, cover.*, total_rating; ` +
            `where genres = (${genres}) & total_rating_count >= 40; sort total_rating desc; limit 15;`
    }).catch((error) => {
        console.error('Error:', error);
    });

    return await response.json();
}

router.get('/search', async (req, res) => {
    let {q: query, p: page, genres} = req.query;
    if (!page || page < 0) page = 0;

    if (!query && !genres) {
        res.status(400).send('You must provide a query or genres');
        return;
    }

    if (query && genres) {
        res.status(400).send('You must provide either a query or genres, not both');
        return;
    }

    const data = query ? await fetchGamesFromQuery(query, page) : await fetchGamesFromGenres(genres);

    res.send(data);
});

router.get('/:id', async (req, res) => {
    const {id} = req.params;

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
        genres.*, 
        keywords.name,
        cover.*,
        screenshots.*, similar_games.*, websites.*, language_supports.*; where id = ${id};`
    }).catch((error) => {
        console.error('Error:', error);
        res.status(500).send('An error occurred while fetching game data');
        return null;
    }).then(async (response) => {
        if (!response.ok) {
            console.error('Response is not OK:', response.status, response.statusText, await response.json());
            res.status(500).send('An error occurred while fetching game data');
            return null;
        }
        return response;
    });

    if (!response) return;

    const data = await response.json();

    if (req.isAuthenticated()) {
        const userId = req.user.id;
        const genres = data[0].genres;

        console.log('Authenticated user:', userId);
        console.log('Genres:', genres);

        try {
            if (genres) {
                console.log('Updating genre history');
                let incOperation = {$inc: {}};
                genres.forEach(genre => {
                    incOperation.$inc[`genre_history.${genre.id}`] = 1;
                });
                console.log('incOperation:', incOperation);

                await User.updateOne(
                    {_id: userId},
                    incOperation
                );
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    res.send(data);
});

router.get('/:id/similar', async (req, res) => {
    const {id} = req.params;

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
            console.log('req.user._id:', req.user._id.toString());
            console.log('comment.user._id:', comment.user._id.toString());
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