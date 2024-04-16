const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    favourite_games: { type: Array, required: false },
    genre_history: { type: Map, of: Number },
});

module.exports = mongoose.model('User', userSchema);