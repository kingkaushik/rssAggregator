var mongoose = require('mongoose')

var schema = mongoose.Schema;

var articleSchema = new schema({
  title: {
    type: String,
    required: true
  },
  link:{
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  feedType:{
    type: String,
    required: true
  },
  timeStamp: {
    type: Date,
    default: Date.now
  },
  pubDate: {
    type: String,
    required: true
  },
  website: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('articles', articleSchema, 'articles');
