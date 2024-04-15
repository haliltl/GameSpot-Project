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

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});