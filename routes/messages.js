const mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
    author : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    receiver : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    msg : String,
    chatid : String,
    time : String
});

messageSchema.set('timestamps',true);

module.exports = mongoose.model('message',messageSchema);