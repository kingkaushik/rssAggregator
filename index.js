const http = require('http');
const rp = require('request-promise');
const url = 'https://9to5google.com/feed/';
const xml2js = require ('xml2js')
const response=[]
var httpServer=http.createServer(unified)

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
          item.title=items[i].title[0];
          item.link=items[i].link[0];
          item.date=items[i].pubDate[0];
          item.category=items[i].category[0];
          item.description=items[i].description[0];
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

httpServer.listen(3000,()=>{
	console.log('the server is running on localhost:');
});
