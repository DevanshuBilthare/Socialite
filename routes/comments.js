const mongoose = require('mongoose');

var commentSchema = mongoose.Schema({
    cmnt : String,
    postid : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'post'
    },
    userid : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    reactions : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'user'
        }
    ],
    when : String
});


module.exports = mongoose.model('comment', commentSchema);