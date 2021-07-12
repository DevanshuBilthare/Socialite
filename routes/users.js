const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
const { use } = require('.');
require('dotenv').config();

mongoose.connect(`mongodb+srv://devanshu:o2may2ooo@socialmediaapp.yf3x9.mongodb.net/socialmediaapp?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true 
}).then(() => console.log("Mongoose is connected")).catch(err => console.log(err))


var userSchema = mongoose.Schema({
  name : String,
  username : {
    type : String,
    index: true
  },
  password : String,
  luckyname : String,
  contact : String,
  email : {
    type: String,
    required: true,
  },
  posts : [{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'post'
  }],
  conversations : [],
  pendingRequests : [{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'user'
  }],
  friends: [{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'user'
  }],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  profilePhoto : {
    type: String,
    default : 'https://res.cloudinary.com/dvvdjtd5j/image/upload/v1625072160/default_ugwiyi.png'
  },
  CoverPhoto : {
    type: String,
    default : 'https://res.cloudinary.com/dvvdjtd5j/image/upload/v1625072179/default_giumms.png'
  },
  bio : String,
  from : String,
  dob : String,
  currentStatus : String,
  hobbies : String,
  relationStatus : String,
  gender : String,
  interestedIn : String,
  isVerified : {
    type : Boolean,
    default : false
  },
  warnings : {
    type : Number,
    default : 0
  }
});

userSchema.plugin(plm);

module.exports = mongoose.model('user', userSchema);
