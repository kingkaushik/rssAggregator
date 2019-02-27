const express = require('express');
const app = express();

const articlesRouter = require('./routes/articles.js');

app.use('/',articlesRouter);

module.exports = app;
