const express = require('express');
const mongoose = require('mongoose');
const keys= require('./config/keys')
const passport = require('passport');
const bodyParser = require('body-parser');
require('./models/user')
require('./services/passport');

mongoose.connect(keys.mongoURI, { useNewUrlParser: true })

const app=express();


app.use(bodyParser.json())
app.use(passport.initialize())
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, PUT, POST, DELETE, PATCH"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials",true)
  next();
});

require('./routes/authRoutes')(app)
const articlesRouter = require('./routes/articles.js');

app.use('/',articlesRouter);

const port =process.env.PORT || 5000;
app.listen(port, () => {
	console.log(`Listening on port ${port}`)
})
