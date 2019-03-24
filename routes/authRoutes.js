const passport = require('passport');
var mongoose = require('mongoose')
const User=mongoose.model('users')
module.exports=(app)=>{
  //calls the google oauth
  app.get(
    '/auth/google',
    passport.authenticate('google',{
      scope:['profile','email'],
      prompt : "select_account"
    })
  );

  app.get('/auth/google/callback',passport.authenticate('google'), (req, res) => {
    // res.send(req._passport.session.user)
    let id=req._passport.session.user.id
    let existingUser=req._passport.session.user.existingUser
    let userName=req._passport.session.user.userName
    let subscriptions=req._passport.session.user.subscriptions
    if(existingUser && subscriptions.length!=0){
      res.redirect('http://localhost:3000'+'/?id=' + id + '&userName='+userName);
    }else{
      res.redirect('http://localhost:3000/subscription'+'/?id=' + id + '&userName='+userName);
    }

  })
  app.post('/api/subscriptions',(req,res)=>{
    const { userId,subscriptions} = req.body;
    User.updateOne({_id:userId},{subscriptions:subscriptions},{upsert: true}).exec()
    res.end()
  })
  app.get('/api/logout', (req, res) => {
    req.logout();
    res.send("logged out")
  });
}
