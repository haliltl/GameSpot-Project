const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
    username: { type: String, required: true },
    gameId: { type: Number, required: true },
    comment: { type: String, required: true },
    date: { type: Date, required: true }
});

module.exports = mongoose.model('Comment', commentSchema);