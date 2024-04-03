const express = require('express');
const mongoose = require('mongoose');

const app = express();

mongoose.connect('mongodb://project:projectpassword123@99.247.239.46:27017/project-db');

const db = mongoose.connection;
db.once('open', () => {
    console.log('Connected to MongoDB at ' + db.host + ':' + db.port);
});