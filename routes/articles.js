const express = require('express');
const router = express.Router();
const rp = require('request-promise');
const xml2js = require ('xml2js');
const Article = require('../models/Article')
const feed_urls = require('../feed_urls.js')
const threshold = 10;

var response = [];

function getFeed(url, feedType){
  response = [];
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
          item.date=items[i].pubDate?items[i].pubDate[0]:'Published date not available';
          item.category=items[i].category?items[i].category[0]:'Category not available';
          item.description=items[i].description?items[i].description[0]:'Description not available';
          response.push(item)
        })
        var payloadString=JSON.stringify(response);
        console.log();
        save_articles(response, feedType);
      });
    })
    .catch(function(err){
      console.log(err);
    });

};

let save_articles = (articles_list, feedType) => {
  for(let article of articles_list){
    Article.findOne({"feedType": feedType, "title": article.title}, function(err, doc, successCallback=storeArticle){
      if(err) throw err;
      if(doc){
        console.log('Article is existing in the db');
      }else{
        successCallback(article, feedType);
      }
    });
  }
};

let storeArticle = function(article, feedType){
  var record = new Article();
  record.feedType = feedType;
  record.title = article.title;
  record.link = article.link;
  record.category = article.category;
  record.description = article.description || "None";
  console.log("start\n",article.description, "end\n")
  record.pubDate = article.date;
  record.save(function(err, row){
    if(err) throw err;
    else{
      if(row){
        console.log('Record insert successfull', row)
      }
    }
  });
};

let fetch_articles = () => {
  console.log('List of feed_urls', feed_urls);
  for(let feed of feed_urls){
      Object.entries(feed).forEach((array) => {
        let url = array[1];
        let feedType = array[0];
        console.log(`Hitting the URL ${url} for the articles`);
        getFeed(url, feedType);
      });
  }
};

let get_articles = (articleType, successCallback) => {
  Article.find({feedType: articleType}).sort({timeStamp: -1}).limit(threshold).exec(function(err, docs){
    if(err) throw err;
    successCallback(docs);
  })
};

let getLatestArticles = (successCallback) => {
  Article.find({}).sort({timeStamp: -1}).limit(threshold).exec(function(err, docs){
    successCallback(docs);
  })
};

router.get('/storeArticles', (req, res) => {
  fetch_articles();
  res.send("<marquee direction='ltr'> hello world</marquee>");
});

router.get('/latest', (req, res) => {
  function sendResponse(articles){
    res.send(articles);
  };
  getLatestArticles(sendResponse);
});

router.get('/:articleType', (req, res) => {
  let articleType = req.params.articleType;
  console.log(articleType)
  function sendResponse(articles){
    res.send(articles);
  };
  get_articles(articleType, sendResponse);
});

module.exports = router;
