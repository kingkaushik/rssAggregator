var mongoose = require('mongoose')

const express = require('express');
const router = express.Router();
const rp = require('request-promise');
const xml2js = require ('xml2js');
const Article = require('../models/Article')
const feed_urls = require('../config/feed_urls.js')
const threshold = 50;
const seperator = '.';
const User=mongoose.model('users')


function getFeed(url, feedType, website){
  let response = [];
  rp(url)
    .then(function(html){
      xml2js.parseString (html,(err,res)=>{
        response.title=res.rss.channel[0].title[0];
        response.description=res.rss.channel[0].description[0];
        let items=res.rss.channel[0].item
        let item={}
        items.map((a,i)=>{
          let item={}
          item.title=items[i].title?items[i].title[0]:'No title';
          item.link=items[i].link?items[i].link[0]:'Link not available';
          item.date= new Date(items[i].pubDate).toISOString() ?items[i].pubDate[0]: new Date(Date.now()).toISOString();
          item.category=items[i].category?items[i].category[0]:'Category not available';
          item.description=items[i].description?items[i].description[0]:'Description not available';
          response.push(item)
        })
        var payloadString=JSON.stringify(response);
        save_articles(response, feedType, website);
      });
    })
    .catch(function(err){
      console.log(err);
    });

};

let save_articles = (articles_list, feedType, website) => {
  for(let article of articles_list){
    Article.findOne({"feedType": feedType, "title": article.title}, function(err, doc, successCallback=storeArticle){
      if(err) throw err;
      if(doc){
        // console.log('Article is existing in the db');
      }else{
        successCallback(article, feedType, website);
      }
    });
  }
};

let storeArticle = function(article, feedType, website){
  let record = new Article();
  record.feedType = feedType;
  record.website = website;
  record.title = article.title;
  record.link = article.link;
  record.category = article.category;
  record.description = article.description || "None";
  record.pubDate = article.date;
  record.save(function(err, row){
    if(err) throw err;
    else{
      if(row){
        // console.log('Record insert successfull', row)
      }
    }
  });
};

let store_articles = () => {
  // console.log('List of feed_urls', feed_urls);
  for(let feed of Object.entries(feed_urls)){
      let website = feed[0];
      // console.log('for website', website)
      let urls = feed[1];
      Object.entries(urls).forEach((array) => {
        let url = array[1];
        let feedType = array[0];
        // console.log(`Hitting the URL ${url} for the articles`);
        getFeed(url, feedType, website);
      });
  }
};

let get_articles = (articleType, successCallback) => {
  Article.find({feedType: articleType}).sort({pubDate: -1}).limit(threshold).exec(function(err, docs){
    if(err) throw err;
    successCallback(docs);
  })
};

let getLatestArticles = (successCallback) => {
  Article.find({}).sort({pubDate: -1}).limit(threshold).exec(function(err, docs){
    successCallback(docs);
  })
};

let fetch_articles = (categories, successCallback) => {
    let result = [];
    let index= 0;
    let length = categories.length;
    for(let i=0;i<length;i++){
      let category = categories[i];
      let temp = category.split(seperator);
      let from_website = temp[0];
      let from_category = temp[1];
      Article.find({website: from_website, feedType: from_category}).sort({pubDate: -1}).limit(threshold).exec(function(err, docs){
        if(err) throw err;
        result.push(...docs);
        index += 1;
        if(index === length - 1){
          successCallback(result);
        }
      });
    }
};

router.get('/storeArticles', (req, res) => {
  store_articles();
  res.send("articles stored");
});

router.get('/latest', (req, res) => {
  function sendResponse(articles){
    res.send(articles);
  };
  getLatestArticles(sendResponse);
});

router.get('/:articleType', (req, res) => {
  let articleType = req.params.articleType;
  // console.log(articleType)
  function sendResponse(articles){
    res.send(articles);
  };
  get_articles(articleType, sendResponse);
});


// sample request: ["toi.tech", "toi.sports"]
// sample response: [[{}, {}, {}], [{}, {}, {}]]
router.post('/api/fetch_articles', (req, res) => {
  let body = req.body;
  function sendResponse(articles){
    res.send(articles)
  }
  if(req.body && Array.isArray(req.body)){
    fetch_articles(req.body, sendResponse)
  }else{
    res.write('Oops.. Not a valid request')
    res.write(JSON.stringify(req.body))
    res.end();
  }
});

router.post('/api/fetch_subscribtions', (req, res) => {
  if(req.body.userId){
    User.findById(req.body.userId)
    .then(user=>{
      res.send(user.subscriptions)
    })
  }else{
    res.send('Bad Request'+JSON.stringify(req.body))
  }
});

module.exports = router;
