var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var userSchema = new Schema({
  googleId: {
    type: String,
    required: true
  },
  subscriptions: [String],
  userName:String,
});

mongoose.model('users', userSchema);
