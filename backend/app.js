const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('./passport-config')(passport);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
  origin: 'http://localhost:3001',
  exposedHeaders: 'Authorization',
}));

app.use('/user', require('./routes/user'));
app.use('/game', require('./routes/game'));
app.use('/auth', require('./routes/auth'));


mongoose.connect('mongodb://project:projectpassword123@99.247.239.46:27017/project-db')
    .catch(error => console.error(error));

const db = mongoose.connection;
db.once('open', () => {
    console.log('Connected to MongoDB at ' + db.host + ':' + db.port);
});


app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});