const express = require('express');
const router = express.Router();
const passport = require('passport');
const crypto = require('crypto');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
const multer = require('multer');
const socket = require('socket.io');
require('dotenv').config();
const localStrategy = require('passport-local');
const user = require('./users');
const post = require('./posts');
const comment = require('./comments');
const message = require('./messages');
var uuid = require('uuid');
const flash = require('express-flash');
const { use } = require('passport');
const { token } = require('morgan');
const { io, render } = require('../app');
const e = require('express');
const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name : process.env.CLOUD_NAME,
  api_key : process.env.API_KEY,
  api_secret : process.env.API_SECRET
})

passport.use(new localStrategy(user.authenticate()));

//Multer Code

var storageCover = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/CoverPictures')
  },
  filename: function (req, file, cb) {
    var rand = Math.floor(Math.random() * 1000000);
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    var name = Date.now() * rand + "SocialiteCover" + "." +  extension;
    cb(null, name)
  }
})

var storageProfile = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/ProfilePictures')
  },
  filename: function (req, file, cb) {
    var rand = Math.floor(Math.random() * 1000000);
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    var name = Date.now() * rand + "SocialiteProfile" + "." + extension;
    cb(null, name)
  }
})

var storagePost = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/PostPictures')
  },
  filename: function (req, file, cb) {
    var rand = Math.floor(Math.random() * 1000000);
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    var name = Date.now() * rand + "SocialitePosts" + "." +  extension;
    cb(null, name)
  }
})

var uploadCover = multer({ storage: storageCover, fileFilter: function(req, file, cb) {
 
  // The function should call `cb` with a boolean
  // to indicate if the file should be accepted
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png')
    cb(null, true);
  else
    req.fileValidationError = "Forbidden extension";
    return cb(null, false, req.fileValidationError);
 
  // To accept the file pass `true`, like so:
} });

var uploadProfile = multer({ storage: storageProfile, fileFilter: function(req, file, cb) {
 
  // The function should call `cb` with a boolean
  // to indicate if the file should be accepted
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png')
    cb(null, true);
  else
    req.fileValidationError = "Forbidden extension";
    return cb(null, false, req.fileValidationError);
  // To accept the file pass `true`, like so:
} });

var uploadPost = multer({ storage: storagePost,limits:{
  fileSize: 1024 * 1024
  }, fileFilter: function(req, file, cb) {
 
  // The function should call `cb` with a boolean
  // to indicate if the file should be accepted
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png'){
    cb(null, true);
  }
  else
    req.fileValidationError = "Forbidden extension";
    return cb(null, false, req.fileValidationError);
 
  // To accept the file pass `true`, like so:
} });


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

router.post('/reg', function(req, res){
  var newUser = new user({
    name : req.body.name,
    username : req.body.username,
    email : req.body.email
  })
    user.register(newUser, req.body.password)
    .then(function(regUser){
      passport.authenticate('local')(req, res, function(){
        res.redirect('/profile');
        var transporter = nodemailer.createTransport(smtpTransport({
          service: 'gmail',
          host: 'smtp.gmail.com',
          port:'467',
          auth: {
            user: `${process.env.E_USER}`,
            pass: `${process.env.E_PASS}`
          }
        }));
        var mailOptions = {
          from: '@gmail.com', 
          to: `${regUser.email}`,
          subject: 'Welcome to Socialite',
          html : `<h2 style='text-align:center; color:black; width:100%'>Welcome to Socialite</h2><br><p style='line-height:22px; color: rgb(61, 61, 61); '>Hello, ${regUser.name}. We're glad you are here. <br> With Socialite, Sharing and connecting with friends and family will be easier than ever before.</p><br><h4 style='color: rgb(61, 61, 61); '>We suggest you to - </h4><p style='line-height:22px; color: rgb(61, 61, 61); '>Add your details in the about section.</p><p style='line-height:22px; color: rgb(61, 61, 61); '>Add your profile and cover photo.</p><p style='line-height:22px; color: rgb(61, 61, 61); '>Find and add more and more friends.</p><br><p style='color: rgb(61, 61, 61); '>Regards<br>Socialite.</p>`
        };
        
        transporter.sendMail(mailOptions, function(error, info){
              if(error){
                console.log(error);
              }

        });  
      })
    })
    .catch(function(err){
      // res.status(503).json({ message : "registration failed", data : err});
      res.redirect('/notFound');
    })
});

router.get('/login',function(req, res){
  res.render('login');

})

router.post('/login', passport.authenticate('local',{
  successRedirect : '/profile',
  failureRedirect : '/failedLogin'
}) ,function(req, res){})

router.get('/failedLogin',function(req, res){
  req.flash('errinfo','invalid id or pass');
  // res.status(503).json({ message : "Login failed" });
  res.redirect('/login');
})

router.get('/profile', isLoggedIn,function(req, res){
  user.findOne({ username : req.session.passport.user})
  .populate({
    path: 'posts',
    options: { sort: { 'createdAt': -1}, limit: 5},
    populate : [{
      path : 'userid'
    }
    ,
   {
      path : 'reactions'
    },
  {
    path : 'comments'
    ,populate : [{ path : 'userid'},{ path : 'reactions'}]
  }]
  })
    .exec(function(err,data){
      if(err)
        console.log(err);
      user.findOne({username : req.session.passport.user})
        .then(function(me){
          if(me.warnings >= 5){
            res.redirect('/banned');
          }
          else{
            res.render('profile',{user : data , host : `${req.headers.host}`,postsLen : me.posts.length});
          }
        })
      // res.send(data.posts);
    })
})



router.get('/comment/:commid/showReacts',function(req, res){
  comment.findOne({ _id: req.params.commid})
    .populate('reactions')
    .exec(function(err,foundComment){
      res.json(foundComment.reactions)
    })
})

router.post('/post', isLoggedIn,uploadPost.single('postMedia'),async function(req, res){
if (req.fileValidationError) {
    req.flash('fileFormat','Only jpg, jpeg and png files allowed');
    res.redirect('back');
}

else if(req.file){
      const results = await cloudinary.v2.uploader.upload(req.file.path)
      var fname = results.secure_url;
      user.findOne({ username : req.session.passport.user})
      .then(function(foundUser){
    
        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        var today  = new Date();
        var now = `${today.toLocaleDateString("en-US", options)}, ${today.toLocaleTimeString()}`;
    
        post.create({
          userid : foundUser._id,
          content : req.body.content,
          media : fname,
          when : now
     
        })
          .then(function(createdPost){
            foundUser.posts.unshift(createdPost);
            foundUser.save()
              .then(function(saved){
                if(foundUser.warnings >= 5){
                  res.redirect('/banned');
                }
                else{
                  res.redirect('back');
                }
              })
          })
      })
  }
else{
  user.findOne({ username : req.session.passport.user})
  .then(function(foundUser){

    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var today  = new Date();
    var now = `${today.toLocaleDateString("en-US", options)}, ${today.toLocaleTimeString()}`;

    post.create({
      userid : foundUser._id,
      content : req.body.content,
      media : null,
      when : now
 
    })
      .then(function(createdPost){
        foundUser.posts.unshift(createdPost);
        foundUser.save()
          .then(function(saved){
            if(foundUser.warnings >= 5){
              res.redirect('/banned');
            }
            else{
              res.redirect('back');
            }
          })
      })
  })
}
});

router.post('/comment/:postid', isLoggedIn,function(req, res){
  user.findOne({ username : req.session.passport.user})
    .then(function(foundUser){
      if(foundUser.warnings >= 5){
        res.redirect('/banned');
      }
      else{
        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        var today  = new Date();
        
        comment.create({
          cmnt : req.body.comment,
          postid : req.params.postid,
          userid : foundUser._id,
          when : today.toLocaleString()
        })
          .then(function(createdComment){
            post.findOne({ _id : req.params.postid})
              .then(function(foundPost){
                foundPost.comments.push(createdComment._id);
                foundPost.save()
                  .then(function(saved){
                    res.redirect('back');
                  })
              })
          })
      }

    })
})

// router.get('/post/:postid/react', isLoggedIn,function(req, res){
//   user.findOne({ username : req.session.passport.user})
//   .then(function(foundUser){
//     post.findOne({ _id : req.params.postid})
//     .then(function(foundPost){
//       if(!foundPost.reactions.includes(foundUser._id)){
//         foundPost.reactions.push(foundUser._id);
//       }
//       else{
//         var index = foundPost.reactions.indexOf(foundUser._id);
//         foundPost.reactions.splice(index, index +1)
//       }
//       foundPost.save()
//         .then(function(savedPost){
//           res.redirect('back');
//         })
//     })
//   })
// });
router.get('/post/:postid/like', isLoggedIn,function(req, res){
  user.findOne({ username : req.session.passport.user})
  .then(function(foundUser){
    if(foundUser.warnings >= 5){
      res.redirect('/banned');
    }
    else{
      post.findOne({ _id : req.params.postid})
      .then(function(foundPost){
        if(!foundPost.reactions.includes(foundUser._id)){
          foundPost.reactions.push(foundUser._id);
        }
        else{
          var index = foundPost.reactions.indexOf(foundUser._id);
          foundPost.reactions.splice(index, index +1)
        }
        foundPost.save()
          .then(function(savedPost){
            post.findOne({ _id : req.params.postid})
            .populate('reactions')
            .then(function(reactedPost){
              res.json({reacted : reactedPost.reactions,user : foundUser});
            })
          })
      })
    }
  })
});

router.get('/comment/:commentid/like', isLoggedIn,function(req, res){
  user.findOne({ username : req.session.passport.user})
  .then(function(foundUser){
    if(foundUser.warnings >= 5){
      res.redirect('/banned');
    }
    else{
      comment.findOne({ _id : req.params.commentid})
      .then(function(foundcomment){
        if(!foundcomment.reactions.includes(foundUser._id)){
          foundcomment.reactions.push(foundUser._id);
        }
        else{
          var index = foundcomment.reactions.indexOf(foundUser._id);
          foundcomment.reactions.splice(index, index +1)
        }
        foundcomment.save()
          .then(function(savedComment){
            comment.findOne({ _id : req.params.commentid})
            .populate('reactions')
            .then(function(reactedComment){
              res.json({reacted : reactedComment.reactions,user : foundUser});
            })
          })
      })
    }
  })
});

// router.get('/comment/:commentid/react', isLoggedIn,function(req, res){
//   user.findOne({ username : req.session.passport.user})
//   .then(function(foundUser){
//     comment.findOne({ _id : req.params.commentid})
//     .then(function(foundcomment){
//       if(!foundcomment.reactions.includes(foundUser._id)){
//         foundcomment.reactions.push(foundUser._id);
//       }
//       else{
//         var index = foundcomment.reactions.indexOf(foundUser._id);
//         foundcomment.reactions.splice(index, index +1)
//       }
//       foundcomment.save()
//         .then(function(savedComment){
//           res.redirect('back');
//         })
//     })
//   })
// });

router.get('/getMessages/:chatId/:page',function(req, res){
  var toSkip = `${req.params.page}` * 10;
  message.find({ chatid : req.params.chatId})
  .sort({ 'createdAt': -1})
  .skip(toSkip)
  .limit(10)
  .then(function(messages){
    user.findById(messages[0].author)
    .then(function(one){
      user.findById(messages[0].receiver)
        .then(function(other){
          if(one.username == req.session.passport.user){
            var me = one;
            var other = other;
          }
          else{
            var me = other;
            var other = one;
          }
          var mergeData = {messages : messages,meUser : me, otherUser : other  };
          res.json(mergeData);
        })
    })
  })
})

router.get('/getPosts/:page/:userId',isLoggedIn,function(req, res){
  var toSkip = `${req.params.page}` * 5;
  user.findById(req.params.userId)
  .populate({
    path: 'posts',
    options: { sort: { 'createdAt': -1}, skip : toSkip,limit: 5},
    populate : [{
      path : 'userid'
    }
    ,
   {
      path : 'reactions'
    },
  {
    path : 'comments'
    ,populate : [{ path : 'userid'},{ path : 'reactions'}]
  }]
  })
    .exec(function(err,data){
      if(err)
        console.log(err);
      user.findOne({ username : req.session.passport.user})
        .then(function(found){
          var mergeData = {user : data,me : found };
          res.json(mergeData);
        })

    })
})

router.post('/message/:receiver', isLoggedIn,function(req, res){
  user.findOne({ username : req.session.passport.user})
    .then(function(foundUser){
      var tempid;
      var returnedVal = foundUser.conversations.find(e => e.another === req.params.receiver);
      if(returnedVal == undefined){
        tempid = uuid.v4();
        var tempobj = {chatid : tempid, another: req.params.receiver}
        foundUser.conversations.push(tempobj);
        foundUser.save()
          .then(function(savedUser){
            user.findOne({ username : req.params.receiver})
              .then(function(foundReceiver){
                var tempobjrec = {chatid : tempid, another: req.session.passport.user}
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
      message.create({
        author : req.session.passport.user,
        receiver : req.params.receiver,
        msg : req.body.msg,
        chatid : tempid
      })
      .then(function(createdMsg){
        res.status(200).json(foundUser);
      })
    })
})

router.get('/messages/:chatid', isLoggedIn,function(req, res){
  message.find({ chatid : req.params.chatid})
    .then(function(allMessages){
      res.status(200).json(allMessages);
    })
})

router.get('/checkUser/:uname',function(req, res){
  user.findOne({username : req.params.uname})
    .then(function(foundUser){
      res.json(foundUser);
    })
})

router.get('/checkMail/:email',function(req, res){
  user.findOne({email : req.params.email})
    .then(function(foundUser){
      res.json(foundUser);
    })
})

router.get('/addFriend/:other',isLoggedIn,function(req, res){
  user.findOne({ username : req.session.passport.user})
    .then(function(loggedInUser){
      if(loggedInUser.warnings >= 5){
        res.redirect('/banned');
      }
      else{
        user.findOne({ _id : req.params.other})
        .then(function(otherUser){
          if(((otherUser.pendingRequests.find(elem => elem.toString() === loggedInUser._id.toString())) == undefined) && ((otherUser.friends.find(elem => elem.toString() === loggedInUser._id.toString())) == undefined) ){
            otherUser.pendingRequests.push(loggedInUser._id);
          }

          otherUser.save()
            .then(function(saved){
              res.redirect('back');
            })
        })
      }
    })
})

router.get('/friendAdded/:other',isLoggedIn,function(req, res){
  user.findOne({ username : req.session.passport.user})
    .then(function(loggedInUser){
      if(loggedInUser.warnings >= 5){
        res.redirect('/banned');
      }
      else{
        user.findOne({ _id : req.params.other})
        .then(function(otherUser){
          if(((loggedInUser.pendingRequests.find(elem => elem.toString() === otherUser._id.toString())) !== undefined) && ((loggedInUser.friends.find(elem => elem.toString() === otherUser._id.toString())) == undefined) ){
            loggedInUser.friends.push(otherUser._id);
          loggedInUser.save()
            .then(function(saved){
              otherUser.friends.push(loggedInUser._id);
              otherUser.save()
                .then(function(savedUser){
                  var loc = loggedInUser.pendingRequests.indexOf(otherUser._id);
                  if (loc > -1) {
                    loggedInUser.pendingRequests.splice(loc,1); 
                  }
                  loggedInUser.save()
                    .then(function(saved){
                      res.redirect('back');
                    })
                })
            })
          }
          else{
            res.send('Already added');
          }
        })
      }
    })
})

router.get('/unfriend/:other', isLoggedIn,function(req, res){
  user.findOne({username : req.session.passport.user})
    .then(function(loggedInUser){
      if(loggedInUser.warnings >= 5){
        res.redirect('/banned');
      }
      else{
        user.findOne({ _id : req.params.other})
        .then(function(otherUser){
          var loc = loggedInUser.friends.indexOf(otherUser._id);
          if(loc > -1){
            loggedInUser.friends.splice(loc,1);
          }
          loggedInUser.save()
            .then(function(savedUser){
              var loc2 = otherUser.friends.indexOf(loggedInUser._id);
              otherUser.friends.splice(loc2,1);
                otherUser.save()
                  .then(function(saved){
                    res.redirect('back'); 
                  })
            })
        })
      }
    })
})

router.get('/cancelRequest/:other',isLoggedIn,function(req, res){
  user.findOne({ username : req.session.passport.user})
    .then(function(foundUser){
      if(foundUser.warnings >= 5){
        res.redirect('/banned');
      }
      else{
        user.findById(req.params.other)
        .then(function(otherUser){
            var loc = otherUser.pendingRequests.indexOf(foundUser._id);
            if(loc > -1){
              otherUser.pendingRequests.splice(loc,1);
            }
            otherUser.save()
              .then(function(saved){
                res.redirect('back');
              })
        })
      }
    })
})  

router.get('/reset',function(req, res){
  res.render('reset');
})

router.post('/reset',function(req, res){
  user.findOne({email : req.body.email})
    .then(function(foundUser){
      if(foundUser == undefined){
        res.render('resetFail');
      }
      else{
        if(foundUser.warnings >= 5){
          res.redirect('/banned');
        }
        else{
          crypto.randomBytes(20, function(err, buf) {
            var token = buf.toString('hex');
            foundUser.resetPasswordToken = token;
            foundUser.resetPasswordExpires = Date.now() + 1800000;
            foundUser.save()
            .then(function(savedUser){ 
              var transporter = nodemailer.createTransport(smtpTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                auth: {
                  user: '@gmail.com',
                  pass: `${process.env.E_PASS}`
                }
              }));
              var emailLink = `http://${req.headers.host}/reset/${foundUser.resetPasswordToken}`;
              var mailOptions = {
                from: '@gmail.com',
                to: `${foundUser.email}`,
                subject: 'Reset Password',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                `${emailLink}` + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n\n' + 'Regards \nSocialite',
              };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  res.render('resetSent');
                }
              });  
            })
          });
        }
      }
    })
})

router.get('/reset/:token',function(req, res){
  user.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } })
    .then(function(foundUser){
      if(foundUser == undefined){
        res.render('resetExpired');
      }
      else{
        res.render('resetPassword',{user : foundUser});
      }
    })
})

router.post('/resetPass/:token',function(req, res){
  user.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } })
  .then(function(foundUser){
    if(foundUser == undefined){
      res.render('resetExpired');
    }
    else{
      foundUser.setPassword(req.body.password,function(err,user){
        if(err){
          console.log(err);
          res.redirect('/');
        }
        foundUser.resetPasswordToken = undefined;
        foundUser.resetPasswordExpires = undefined;
        foundUser.save()
          .then(function(savedUser){
            var transporter = nodemailer.createTransport(smtpTransport({
              service: 'gmail',
              host: 'smtp.gmail.com',
              auth: {
                user: '@gmail.com',
                pass: `${process.env.E_PASS}`
              }
            }));
            var mailOptions = {
              from: '@gmail.com',
              to: `${foundUser.email}`,
              subject: 'Socialite Password Reset Successfull',
              text: 'You just changed your password\n\n' + "If you did'nt change your password, Please contact us right away.\n\n" + "Just a reminder : \nNever share your password with anyone. \nCreate passwords that are hard to guess and don't use personal information. \nBe sure to include uppercase and lowercase letters, numbers, and symbols.Use different passwords for each of your online accounts."
            };
            
            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } else {
                res.render('resetSuccess');
              }
            });  
          })
      })
    }
  })
})

router.post('/uploadCover',isLoggedIn,uploadCover.single('coverPhoto'),async function(req,res){
  if (req.fileValidationError) {
    req.flash('fileFormat','Only jpg, jpeg and png files allowed');
    res.redirect('/profile');
  }
  const result = await cloudinary.v2.uploader.upload(req.file.path)
  user.findOne({ username : req.session.passport.user})
    .then(function(foundUser){
      var fname = result.secure_url;
      foundUser.CoverPhoto = fname;
      foundUser.save()
        .then(function(savedUser){
          res.redirect('/profile');
        })
    })
})

router.post('/uploadProfile',isLoggedIn,uploadProfile.single('profilePhoto'), async function(req,res){
  if (req.fileValidationError) {
    req.flash('fileFormat','Only jpg, jpeg and png files allowed');
    res.redirect('/profile');
  }
  const result = await cloudinary.v2.uploader.upload(req.file.path)
    user.findOne({ username : req.session.passport.user})
    .then(function(foundUser){
      var fname = result.secure_url;
      foundUser.profilePhoto = fname;
      foundUser.save()
        .then(function(savedUser){
          res.redirect('/profile');
        })
    })
})

router.get('/about',isLoggedIn,function(req, res){
  user.findOne({ username : req.session.passport.user})
    .then(function(foundUser){
      if(foundUser.warnings >= 5){
        res.redirect('/banned');
      }
      else{
        res.render('about',{ user : foundUser});
      }
    })
})

router.post('/about', isLoggedIn,function(req, res){
  user.findOne({ username : req.session.passport.user})
    .then(function(foundUser){
      foundUser.bio = req.body.bio;
      foundUser.name = req.body.name;
      foundUser.from = req.body.fromLoc;
      foundUser.dob = req.body.dob;
      foundUser.currentStatus = req.body.status;
      foundUser.hobbies = req.body.hobbies;
      foundUser.relationStatus = req.body.relationship;
      foundUser.gender = req.body.gender;
      foundUser.interestedIn = req.body.interested;
      foundUser.save()
        .then(function(savedUser){
          res.redirect('/profile');
        })
    })
})

router.get('/update/:postId/caption',isLoggedIn,function(req, res){
  post.findOne({_id : req.params.postId})
    .then(function(foundPost){
      res.json(foundPost);
    })
})

router.post('/update/:postId/caption',isLoggedIn,function(req,res){
  if (!req.params.postId.match(/^[0-9a-fA-F]{24}$/)) {
    res.redirect('/notFound');
  }
  else{
    user.findOne({ username : req.session.passport.user})
    .then(function(foundUser){
      post.findOne({ _id : req.params.postId})
      .populate('userid')
      .exec(function(err,foundPost){
        if(foundPost.userid.username == foundUser.username){
          post.findByIdAndUpdate(req.params.postId,{content : req.body.caption})
          .then(function(updatePost){
            res.redirect('back');
          })
        }
        else{
          user.findOne({ username : req.session.passport.user})
          .then(function(foundUser){
            foundUser.warnings++;
            foundUser.save()
            .then(function(savedUser){
              res.redirect('/malicious')
            })
          })
        }
      })
    })
  }


})

router.get('/delete/:postId',isLoggedIn,function(req, res){
  user.findOne({ username : req.session.passport.user})
    .then(function(foundUser){
      if(foundUser.warnings >= 5){
        res.redirect('/banned');
      }
      else if (!req.params.postId.match(/^[0-9a-fA-F]{24}$/)) {
        res.redirect('/notFound');
      }
      else{
        post.exists({ _id: req.params.postId })
        .then(function(isPostExist){
          if(isPostExist){
            var loc = foundUser.posts.indexOf(req.params.postId);
            if(loc == -1){
              user.findOne({ username : req.session.passport.user})
              .then(function(foundUser){
                foundUser.warnings++;
                foundUser.save()
                .then(function(savedUser){
                  res.redirect('/malicious')
                })
              })
            }
            else{
              foundUser.posts.splice(loc,1);
              foundUser.save()
                .then(function(saved){
                  post.findByIdAndDelete(req.params.postId)
                    .then(function(deletedPost){
                      res.redirect('back');
                    })
                }) 
            }
          }
          else{
            res.redirect('/notFound');
          }
        })
      }
    })
})

router.get('/verify/socialiteUser/:userId',function(req, res){
  user.exists({ email : '@gmail.com' })
  .then(function(isExist){
    if(isExist){
      user.findOne({ email : '@gmail.com'})
      .then(function(admin){
        user.findOne({ username : req.session.passport.user})
        .then(function(loggedInUser){
          if(loggedInUser.email === admin.email){
            user.findOne({_id : req.params.userId})
            .then(function(foundUser){
              foundUser.isVerified = true;
              foundUser.save()
                .then(function(savedUser){
                  res.redirect('/profile');
                })
            })
          }
          else{
            res.redirect('/notFound')
          }
        })
      })
    }
    else{
      res.redirect('/notFound');
    }
  })
})

router.get('/unBan/socialiteUser/:userId',function(req, res){
  user.exists({ email : '@gmail.com' })
  .then(function(isExist){
    if(isExist){
      user.findOne({ email : '@gmail.com'})
      .then(function(admin){
        user.findOne({ username : req.session.passport.user})
        .then(function(loggedInUser){
          if(loggedInUser.email === admin.email){
            user.findOne({_id : req.params.userId})
            .then(function(foundUser){
              foundUser.warnings = 0;
              foundUser.save()
                .then(function(savedUser){
                  res.redirect('/profile');
                })
            })
          }
          else{
            res.redirect('/notFound')
          }
        })
      })
    }
    else{
      res.redirect('/notFound');
    }
  })
})

router.get('/ban/socialiteUser/:userId',function(req, res){
  user.exists({ email : '@gmail.com' })
  .then(function(isExist){
    if(isExist){
      user.findOne({ email : '@gmail.com'})
      .then(function(admin){
        user.findOne({ username : req.session.passport.user})
        .then(function(loggedInUser){
          if(loggedInUser.email === admin.email){
            user.findOne({_id : req.params.userId})
            .then(function(foundUser){
              if(foundUser.warnings < 5){
                foundUser.warnings = 5;
              }
              foundUser.save()
                .then(function(savedUser){
                  res.redirect('/profile');
                })
            })
          }
          else{
            res.redirect('/notFound')
          }
        })
      })
    }
    else{
      res.redirect('/notFound');
    }
  })
})

router.get('/delete/comment/:commentId/:postId',isLoggedIn,function(req, res){
  if (!req.params.postId.match(/^[0-9a-fA-F]{24}$/) || !req.params.commentId.match(/^[0-9a-fA-F]{24}$/)) {
    res.redirect('/notFound');
  }
  else{
    user.findOne({ username : req.session.passport.user})
    .then(function(foundUser){
      if(foundUser.warnings >= 5){
        res.redirect('/banned');
      }
      else{
        comment.exists({ _id: req.params.commentId })
        .then(function(isExist){
          if(isExist){
              comment.findOne({ _id : req.params.commentId})
          .populate('userid')
          .exec(function(err,foundCmnt){
            post.exists({ _id: req.params.postId })
            .then(function(isPostExist){
              if(isPostExist){
                post.findOne({ _id : req.params.postId})
                .populate('userid')
                .exec(function(error,foundPost){
                  if(error){
                    res.redirect('/notFound');
                  }
                  if(foundPost.userid.username == foundUser.username || foundUser.username == foundCmnt.userid.username){
                    var loc = foundPost.comments.indexOf(req.params.commentId);
                  foundPost.comments.splice(loc,1);
                  foundPost.save()
                    .then(function(saved){
                      comment.findByIdAndDelete(req.params.commentId)
                        .then(function(deletedCmnt){
                          res.redirect('back');
                        })
                    })
                  }
                  else{
                    user.findOne({ username : req.session.passport.user})
                  .then(function(foundUser){
                    foundUser.warnings++;
                    foundUser.save()
                    .then(function(savedUser){
                      res.redirect('/malicious');
                    })
                  })
                  }
                })
              }
              else{
                res.redirect('/notFound');
              }
            })
          })
          }
          else{
            res.redirect('/notFound');
          }
        })
      }
      
    })
  }


})

router.get('/malicious',isLoggedIn,function(req, res){
  user.findOne({ username : req.session.passport.user})
  .then(function(foundUser){
    res.render('unauthentic',{user : foundUser});
  })
})

router.get('/notFound',function(req,res){
  res.render('notFound');
})

router.post('/update/comment/:commentId',isLoggedIn,function(req,res){
  if (!req.params.commentId.match(/^[0-9a-fA-F]{24}$/)) {
    res.redirect('/notFound');
  }
  else{
    user.findOne({username : req.session.passport.user})
    .then(function(foundUser){
      comment.findOne({ _id : req.params.commentId})
      .populate('userid')
      .exec(function(err,foundCmnt){
        if(foundCmnt.userid.username == foundUser.username){
          comment.findOneAndUpdate({_id : req.params.commentId},{ cmnt : req.body.comment})
          .then(function(comment){
            res.redirect('back');
          })
        }
        else{
          user.findOne({ username : req.session.passport.user})
          .then(function(foundUser){
            foundUser.warnings++;
            foundUser.save()
            .then(function(savedUser){
              res.redirect('/malicious')
            })
          })
        }
      })
    })
  }


})
router.get('/search/:uname',isLoggedIn,function(req, res){
  var getUser = req.params.uname;

  // user.find({$text: {$search: `"${getUser}"`}})
  //   .exec(function(err,found){
  //     res.send(found);
      
  //   })
  user.find({ username : { $regex: `${getUser}`, $options: "i" }},null, { options: { collation: {locale: "en" } ,sort: {'username' : 1}}})
  
    .then(function(foundUsers){
      res.json(foundUsers);
    })
})

router.get('/logout',function(req, res){
  req.logOut();
  res.redirect('/login');
})

router.get('/chat/:other',isLoggedIn,function(req, res){
  if (!req.params.other.match(/^[0-9a-fA-F]{24}$/)) {
    res.redirect('/notFound');
  }
  else{
    user.exists({ _id : req.params.other})
    .then(function(isExist){
      if(isExist){
        user.findOne({username : req.session.passport.user})
        .then(function(foundUser){
          if(foundUser.warnings >= 5){
            res.redirect('/banned');
          }
          else{
            user.findOne({ _id : req.params.other})
            .exec(function(err,otherUser){
              if(!err){
                var chatId = null;
                foundUser.conversations.forEach(function(conv){
                  if(conv.another == otherUser._id){
                    chatId = conv.chatid;
                  }
                })
                if(chatId != null){
                  message.find({chatid : chatId})
                    .sort({ 'createdAt': -1})
                    .limit(10)
                    .then(function(foundMessages){
                      message.find({chatid : chatId})
                      .then(function(chatLength){
                        res.render('chat',{ userFound : foundUser,other: otherUser,messages : foundMessages,chatLen : chatLength.length});
                      })
                    })
                }
                else{
                  res.render('chat',{ userFound : foundUser,other: otherUser,messages : null});
                }
              }
              else{
                res.redirect('/notFound');
              }
            })
          }
        })
      }
      else{
        res.redirect('/notFound');
      }
    })
  }
})

router.get('/friends', isLoggedIn,function(req,res){
  user.findOne({ username : req.session.passport.user})
  .populate({path : 'friends',
  options: { collation: {locale: "en" } ,sort: {'name' : 1}}
})
    .exec(function(err,foundUser){
      if(err){
        res.redirect('/notFound');
      }
      else{
        if(foundUser.warnings >= 5){
          res.redirect('/banned');
        }
        else{
          res.render('friends',{user : foundUser});
        }
      }
    })
})
router.get('/friends/:friendId', isLoggedIn,function(req,res){
  if (!req.params.friendId.match(/^[0-9a-fA-F]{24}$/)) {
    res.redirect('/notFound');
  }
  else{
    user.exists({ _id : req.params.friendId})
    .then(function(isExist){
      if(isExist){
        user.findOne({ _id : req.params.friendId})
        .populate({path : 'friends',
        options: { collation: {locale: "en" } ,sort: {'name' : 1}}
      })
          .exec(function(err,foundUser){
            if(err){
              res.redirect('/notFound');
            }
            else{
              user.findOne({ username : req.session.passport.user})
              .then(function(me){
                if(foundUser.warnings >= 5){
                  res.redirect('/banned');
                }
                else{
                  res.render('otherFriends',{user : foundUser,me : me});
                }
              })
            }
          })
      }
      else{
        res.redirect('/notFound');
      }
    })
  }
})
router.get('/profile/:userId',isLoggedIn,function(req, res){
  if (!req.params.userId.match(/^[0-9a-fA-F]{24}$/)) {
    res.redirect('/notFound');
  }
  else{
    user.exists({ _id : req.params.userId})
    .then(function(isExist){
      if(isExist){
        user.findOne({ username : req.session.passport.user})
        .then(function(foundUser){
          if(foundUser.warnings >= 5){
            res.redirect('/banned');
          }
          else{
            user.findById(req.params.userId)
            .populate({
              path: 'posts',
              options: { sort: { 'createdAt': -1}, limit: 5},
              populate : [{
                path : 'userid'
              }
              ,
             {
                path : 'reactions'
              },
            {
              path : 'comments'
              ,populate : [{ path : 'userid'},{ path : 'reactions'}]
            }]
            })
            .exec(function(err,data){
              if(err){
                res.redirect('/notFound');
              }
              else{
                if(foundUser._id == req.params.userId){
                  res.redirect('/profile')
                }
                else{
                  user.findById(req.params.userId)
                    .then(function(found){
                      res.render('otherProfile',{me : foundUser,user : data,host : `${req.headers.host}`,postsLen : found.posts.length});
                    })
                }
              }
            })
          }
        })
      }
      else{
        res.redirect('/notFound');
      }
    })
  }
})

router.get('/pendingRequests',isLoggedIn,function(req, res){
  user.findOne({username : req.session.passport.user})
    .populate('pendingRequests')
    .exec(function(err,foundUser){
      if(foundUser.warnings >= 5){
        res.redirect('/banned');
      }
      else{
        res.render('pendingRequests',{user : foundUser});
      }
    })
})

router.get('/post/:postId',isLoggedIn,function(req, res){
  if (!req.params.postId.match(/^[0-9a-fA-F]{24}$/)) {
    res.redirect('/notFound');
  }
  else{
    post.exists({ _id : req.params.postId})
    .then(function(isExist){
      if(isExist){
        user.findOne({ username : req.session.passport.user})
        .then(function(foundUser){
          if(foundUser.warnings >= 5){
            res.redirect('/banned');
          }
          else{
            post.findById(req.params.postId)
            .populate({
              path: 'userid'
            })
            .populate({
              path : 'reactions'
            })
            .populate({
              path : 'comments',
              populate : [{ path : 'userid'},{ path : 'reactions'}]
            })
            .then(function(foundPost){
              res.render('viewPost',{me : foundUser,post : foundPost,host : `${req.headers.host}`});
            })
          }
        })
      }
      else{
        res.redirect('/notFound');
      }
    })
  }
})

router.get('/update/:commentId/comment',isLoggedIn,function(req, res){
  comment.findOne({ _id : req.params.commentId})
    .then(function(foundComment){
      res.json(foundComment.cmnt);
    })
})

router.get('/likedBy/:postId',function(req, res){
  if (!req.params.postId.match(/^[0-9a-fA-F]{24}$/)) {
    res.redirect('/notFound');
  }
  else{
    post.exists({ _id : req.params.postId})
    .then(function(isExist){
      if(isExist){
        post.findOne({ _id : req.params.postId})
        .populate('reactions')
        .then(function(foundPost){
          user.findOne({ username : req.session.passport.user})
          .then(function(foundUser){
            if(foundUser.warnings >= 5){
              res.redirect('/banned');
            }
            else{
              res.render('likedBy',{reactions : foundPost.reactions,user : foundUser});
            }
          })
          
        })
      }
      else{
        res.redirect('/notFound');
      }
    })
  }
})


router.get('/messages',isLoggedIn,function(req, res){
  var tempo = [];
  // var i;
  user.findOne({ username : req.session.passport.user})
  .populate('coversations.another')
  .then(function(data){ 
    // for(i=0;i<data.conversations.length;i++){
      
    //   message.find({chatid : data.conversations[i].chatid})
    //   .populate('author')
    //   .sort({'timestamp': -1 })
    //   .limit(1)
    //   .then(function(found){
    //     tempo.push(found[0]);
    //     // res.send(found[0]);
    //     console.log(found[0].msg);
    //   })
    // }

    function asyncLoop( i, callback ) {
      if( i < data.conversations.length ) {

        message.find({chatid : data.conversations[i].chatid})
        .populate('author')
        .populate('receiver')
        .sort({'createdAt': -1 })
        .limit(1)
        .then(function(found){
          tempo.push(found[0]);
          asyncLoop( i+1, callback );
        })
      } else {
          callback();
      }
  }
  asyncLoop( 0, function() {
    tempo.sort(function(a,b){
      return new Date(a.createdAt) - new Date(b.createdAt) ;
    })
    if(data.warnings >= 5){
      res.redirect('/banned');
    }
    else{
      res.render('messages',{messages : tempo,user : data});
    }
  });
  })
})

router.get('/contact',isLoggedIn,function(req,res){
  user.findOne({ username : req.session.passport.user})
  .then(function(foundUser){
    if(foundUser.warnings >= 5){
      res.redirect('/banned');
    }
    else{
      res.render('contact',{ user : foundUser })
    }
  })
})
router.post('/contact',isLoggedIn,function(req, res){
  user.findOne({ username : req.session.passport.user})
  .then(function(foundUser){
    var transporter = nodemailer.createTransport(smtpTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      auth: {
        user: `${process.env.E_USER}`,
        pass: `${process.env.E_PASS}`
      }
    }));
    var mailOptions = {
      from: '@gmail.com',
      to: '@gmail.com',
      subject: `${foundUser.email} , ${foundUser.username} : ${req.body.subject}`,
      text: req.body.message.toString()
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        res.redirect('/notFound');
      } else {
        res.render('contactSuccess',{ user : foundUser});
      }
    });  
  })
})

router.post('/contactUs',function(req, res){
    var transporter = nodemailer.createTransport(smtpTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      auth: {
        user: '@gmail.com',
        pass: `${process.env.E_PASS}`
      }
    }));
    var mailOptions = {
      from: '@gmail.com',
      to: '@gmail.com',
      subject: `${req.body.email} : ${req.body.subject}`,
      text: req.body.message.toString()
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        res.redirect('/notFound');
      } else {
        res.render('contactUsSuccess');
      }
    });  
})


router.get('/contactUs',function(req, res){
  res.render('contactUs');
})

router.get('/newsfeed',isLoggedIn,function(req,res){
  user.findOne({ username : req.session.passport.user})
    .populate({
      path: 'friends',
      options: {limit: 10},
      populate : [{
        path : 'posts',
        match : {'createdAt': {"$gt":new Date(Date.now() - 24*60*60*1000)}},
        // options: { match : {'createdAt': {"$gt":new Date(Date.now() - 24*60*60*1000)}},},
        populate : [{
          path : 'userid'
        }
        ,
        {
          path : 'reactions'
        },
      {
        path : 'comments'
        ,populate : [{ path : 'userid'},{ path : 'reactions'}]
      }]
      }],
    })
    .exec(function(err,data){
      var convLen;
      var tempo = [];
      data.conversations.length >= 3 ? convLen = 3 : convLen = data.conversations.length;
      function asyncLoop( i, callback ) {
        if( i < convLen ) {
  
          message.find({chatid : data.conversations[i].chatid})
          .populate('author')
          .populate('receiver')
          .sort({'createdAt': -1 })
          .limit(1)
          .then(function(found){
            tempo.push(found[0]);
            asyncLoop( i+1, callback );
          })
        } else {
            callback();
        }
    }
    asyncLoop( 0, function() {
      user.findOne({ username : req.session.passport.user})
      .populate({
        path: 'posts',
        match : {'createdAt': {"$gt":new Date(Date.now() - 24*60*60*1000)}},
        populate : [{
          path : 'userid'
        }
        ,
       {
          path : 'reactions'
        },
      {
        path : 'comments'
        ,populate : [{ path : 'userid'},{ path : 'reactions'}]
      }]
      })
      .exec(function(err,mePosts){
        // tempo.sort(function(a,b){
        //   return a.createdAt.localeCompare(b.createdAt);
        // })
        tempo.sort(function(a,b){
          return new Date(b.createdAt) - new Date(a.createdAt) ;
        })
        
        if(data.warnings >= 5){
          res.redirect('/banned');
        }
        else{
          user.findOne({ username : req.session.passport.user})
          .populate({
            path: 'friends',
            populate : [{
              path : 'posts',
              match : {'createdAt': {"$gt":new Date(Date.now() - 24*60*60*1000)}},
              // options: { match : {'createdAt': {"$gt":new Date(Date.now() - 24*60*60*1000)}},},
            }],
          })
          .exec(function(err,totalPostData){
            var totalPosts = 0;
            totalPostData.friends.forEach(function(frnd){
              totalPosts += frnd.posts.length;
            })
            totalPosts += mePosts.posts.length;
            res.render('feed',{ data : data,host : `${req.headers.host}`,messagesList : tempo,userPosts : mePosts.posts,friendsLength : mePosts.friends.length,totalPosts : totalPosts });
          })
        }
      })
      
    });
    })
})

router.get('/newsFeed/:page',isLoggedIn,function(req, res){
  var toSkip = `${req.params.page}` * 10;
  user.findOne({ username : req.session.passport.user})
    .populate({
      path: 'friends',
      options: {skip : toSkip,limit: 10},
      populate : [{
        path : 'posts',
        match : {'createdAt': {"$gt":new Date(Date.now() - 24*60*60*1000)}},
        populate : [{
          path : 'userid'
        }
        ,
        {
          path : 'reactions'
        },
      {
        path : 'comments'
        ,populate : [{ path : 'userid'},{ path : 'reactions'}]
      }]
      }],
    })
    .exec(function(err,data){
      var mergeData = {data : data,host : `${req.headers.host}`};
      if(data.warnings >= 5){
        res.redirect('/banned');
      }
      else{
        res.json(mergeData);
      }
    })

})

router.get('/banned',isLoggedIn,function(req, res){
  res.render('banned');
})


router.get('/getRandomPosts',isLoggedIn,function(req, res){
  // post.find()
  // .sort({ 'createdAt': -1})
  // .populate({
  //   path: 'userid'
  // })
  // .populate({
  //   path : 'reactions'
  // })
  // .populate({
  //   path : 'comments',
  //   populate : [{ path : 'userid'},{ path : 'reactions'}]
  // })
  // .limit(10)
  // .exec(function(err,foundData){
  //   user.findOne({ username : req.session.passport.user})
  //   .then(function(foundUser){
  //     var mergeData = {dataFound : foundData,host : `${req.headers.host}`,loggedUser : foundUser};
  //     res.json(mergeData);
  //   })
  // })
  var postCount;
  post.count({}, function( err, count){
    postCount = count;
  })
  var tempArr = [];
  function asyncLoop( i, callback ) {
    var randNum =   Math.floor(Math.random() * (postCount + 1))
    if( i < 10 ) {
      post.find()
      .skip(randNum)
      .populate({
      path: 'userid'
      })
      .populate({
        path : 'reactions'
      })
      .populate({
        path : 'comments',
        populate : [{ path : 'userid'},{ path : 'reactions'}]
      })
      .limit(1)
      .then(function(found){
        tempArr.push(found[0]);
        asyncLoop( i+1, callback );
      })
    } else {
        callback();
    }
}
asyncLoop( 0, function() {
  user.findOne({ username : req.session.passport.user})
  .then(function(foundUser){
    var mergeData = {dataFound : tempArr,host : `${req.headers.host}`,loggedUser : foundUser};
    res.json(mergeData);
  })
})
})

router.get('/resetMyPassword',isLoggedIn,function(req,res){
  user.findOne({ username : req.session.passport.user})
  .then(function(data){
    res.render('resetCurrentPass',{ data : data});
  })
})
router.post('/resetPassword/setNewPass',function(req,res){
  user.findOne({ username : req.session.passport.user})
  .then(function(foundUser){
    foundUser.setPassword(req.body.password,function(err,user){
      if(err){
        res.redirect('/notFound');
      }
      else{
        foundUser.save()
        .then(function(savedUser){
          req.flash('resetinfo','success');
          res.redirect('/login');
          var transporter = nodemailer.createTransport(smtpTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            auth: {
              user: '@gmail.com',
              pass: `${process.env.E_PASS}`
            }
          }));
          var mailOptions = {
            from: '@gmail.com',
            to: `${foundUser.email}`,
            subject: 'Socialite Password Reset Successfull',
            text: 'You just changed your password\n\n' + "If you did'nt change your password, Please contact us right away.\n\n" + "Just a reminder : Never share your password or security questions with anyone. \n Create passwords that are hard to guess and don't use personal information. \n Be sure to include uppercase and lowercase letters, numbers, and symbols.Use different passwords for each of your online accounts."
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            }
          });  
        })
      }
    })
  })
})
router.get('/deleteAccount/:userid',function(req,res){
  user.findOneAndDelete({ _id : req.params.userid})
  .then(function(){
    res.redirect('/');
  })
})
router.get('/aboutUs',function(req,res){
  res.render('aboutUs')
})

router.get('*',function(req,res){
  res.redirect('/notFound');
})


function isLoggedIn(req, res, next){
  if(req.isAuthenticated())
    return next();
  else
    res.redirect('/login');
}

module.exports = router;

