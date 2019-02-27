const express = require('express');
const router = express.Router();
const rp = require('request-promise');
const xml2js = require ('xml2js');

// const url = 'https://9to5google.com/feed/';
const url = 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms'
const response=[]

function unified(req,respo){
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
        var payloadString=JSON.stringify(response)
        respo.setHeader('Content-Type','application/json')
        respo.writeHead(200)
        respo.end(payloadString)  
      });
    })
    .catch(function(err){
      console.log(err);
    });
}

router.get('/articles',(req, res) => {
  unified(req,res);
});

module.exports = router;
