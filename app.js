var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var flash = require('express-flash');
var socket = require('socket.io');
const message = require('./routes/messages');
var uuid = require('uuid');

const passport = require('passport');
const expressSession = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());

app.use(expressSession({
  resave : false,
  saveUninitialized : false,
  secret : 'wdjwdkowdowd'
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(usersRouter.serializeUser());
passport.deserializeUser(usersRouter.deserializeUser());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

var io = socket();
app.io = io;

io.on('connection',function(socket){
  socket.on('newmessage',function(data){
    usersRouter.findOne({ _id : data.sender})
    .then(function(foundUser){
      var tempid;
      var returnedVal = foundUser.conversations.find(e => e.another == data.receiver);
      if(returnedVal == undefined){
        tempid = uuid.v4();
        var tempobj = {chatid : tempid, another: data.receiver}
        foundUser.conversations.push(tempobj);
        foundUser.save()
          .then(function(savedUser){
            usersRouter.findOne({ _id : data.receiver})
              .then(function(foundReceiver){
                var tempobjrec = {chatid : tempid, another: data.sender}
                foundReceiver.conversations.push(tempobjrec);
                foundReceiver.save()
                  .then(function(savedRec){  
                  })
              })
          })
      }
      else{
        tempid = returnedVal.chatid;
      }
      var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      var today  = new Date();
      var now = `${today.toLocaleDateString("en-US", options)}, ${today.toLocaleTimeString()}`;
      message.create({
        author : data.sender,
        receiver : data.receiver,
        msg : data.content,
        chatid : tempid,
        time : now
      })
      .then(function(createdMsg){
        io.emit('addMessage',{msg : createdMsg})
      })
    })
  })
})


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
