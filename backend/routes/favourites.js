const express = require('express');
const router = express.Router();
const User = require('../models/User');

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    console.error('User is not authenticated');
    res.redirect('/login');
}

router.post('/add', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.body;
        await User.findByIdAndUpdate(userId, { $addToSet: { favourites: itemId }});
        res.status(201).send('Item added to favourites.');
    } catch (error) {
        console.error("Error occurred while adding a favourite ", error);
        res.status(500).send('An error occurred');
    }
});

router.post('/remove', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.body;
        await User.findByIdAndUpdate(userId, { $pull: { favourites: itemId }});
        res.status(201).send('Item removed from favourites.');
    } catch (error) {
        console.error("Error occurred while removing a favourite ", error);
        res.status(500).send('An error occurred');
    }
});

module.exports = router;