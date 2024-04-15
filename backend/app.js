const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const User = require('./models/User');
const bcrypt = require('bcrypt');
require('./passport-config')(passport);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/favourites', require('./routes/favourites'));


mongoose.connect('mongodb://project:projectpassword123@10.0.0.25:27017/project-db')
    .catch(error => console.error(error));

const db = mongoose.connection;
db.once('open', () => {
    console.log('Connected to MongoDB at ' + db.host + ':' + db.port);
});

app.post('/register', async (req, res) => {
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

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.post('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.get('/search', async (req, res) => {
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

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});