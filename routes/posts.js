const mongoose = require('mongoose');
var random = require('mongoose-simple-random');
var postSchema = mongoose.Schema({
  userid : {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'user'
  },
  content : String,
  media : {
      type : String,
      default : null
  },
  reactions : [
      {
          type : mongoose.Schema.Types.ObjectId,
          ref : 'user'
      }
  ],
  comments : [
      {
          type : mongoose.Schema.Types.ObjectId,
          ref : 'comment'
      }
  ],
  when : String
});

postSchema.plugin(random);
postSchema.set('timestamps',true);

module.exports = mongoose.model('post',postSchema);