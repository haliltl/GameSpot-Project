const express = require('express');
const mongoose = require('mongoose');

const app = express();

mongoose.connect('mongodb://project:projectpassword123@99.247.239.46:27017/project-db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(r => {
    console.log('Connected to MongoDB');
});