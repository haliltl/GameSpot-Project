const express = require('express');
const bcrypt = require("bcrypt");
const User = require("../models/User");
const passport = require("passport");
const router = express.Router();

router.get('/authenticated', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).send('Authenticated');
    } else {
        res.status(401).send('Not authenticated');
    }
});

router.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            username: req.body.username,
            password: hashedPassword,
        });
        await user.save();
        res.status(201).send('User created');
    } catch(err) {
        console.error('An error occurred', err);
        res.status(500).send('An error occurred while registering');
    }
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

router.post('/logout', (req, res) => {
    req.logout();
    res.status(200).send('Logged out');
});

module.exports = router;