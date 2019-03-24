const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys= require('../config/keys')
const mongoose = require('mongoose');

const User=mongoose.model('users')

passport.serializeUser(({user,existingUser},done)=>{
  // console.log(user);
  let obj={
    id:user.id,
    userName:user.userName,
    subscriptions:user.subscriptions,
    existingUser,
  }
  done(null,obj)
})

passport.deserializeUser((id,done)=>{
  User.findById(id)
  .then(user=>{
    done(null,user)
  })
})


passport.use(new GoogleStrategy(
  {
  clientID:keys.googleClientID,
  clientSecret:keys.googleClientSecret,
  callbackURL:'/auth/google/callback',
  },
  (accessToken,refreshToken,profile,done)=>{
    // console.log(accessToken,refreshToken,profile,done);
    User.findOne({googleId:profile.id})
      .then((existingUser)=>{
        if(existingUser){
            done(null,{user:existingUser,existingUser:true})//(error,user)
        }else{
          new User({googleId:profile.id,userName:profile.name.givenName})
          .save()
          .then(user=>done(null,{user,existingUser:false}))
        }
      })
  }
))
