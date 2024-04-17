const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

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

router.get('/profile', isAuthenticated, (req, res) => {
    const user = req.user;
    user.password = undefined;
    res.status(200).send(user);
});

router.get('/favourite/', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        const favourites = user.favourite_games;
        res.send(favourites);
    } catch (error) {
        console.error("Error occurred while fetching favourites ", error);
        res.status(500).send('An error occurred');
    }
});

router.put('/favourite/:id', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id: itemId } = req.params;

        // find if the item is already in the favourites
        const user = await User.findById(userId);
        if (user.favourite_games.includes(itemId)) {
            res.status(400).send('Item already in favourites.');
            return;
        }

        await User.findByIdAndUpdate(userId, { $push: { favourite_games: itemId }});

        res.status(201).send('Item added to favourites.');
    } catch (error) {
        console.error("Error occurred while adding a favourite ", error);
        res.status(500).send('An error occurred');
    }
});

router.delete('/favourite/:id', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id: itemId } = req.params;
        await User.findByIdAndUpdate(userId, { $pull: { favourite_games: itemId }});
        res.status(201).send('Item removed from favourites.');
    } catch (error) {
        console.error("Error occurred while removing a favourite ", error);
        res.status(500).send('An error occurred');
    }
});

module.exports = router;