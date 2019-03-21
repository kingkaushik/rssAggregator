const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const server = 'localhost:27017';
const database = 'majorproject';

let db_url = `mongodb://${server}/${database}`
let db_options = {useNewUrlParser: true};
mongoose.connect(db_url, db_options);

const articlesRouter = require('./routes/articles.js');

app.use('/',articlesRouter);

module.exports = app;
