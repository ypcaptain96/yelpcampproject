var express  = require("express");
var router   = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
var middleware = require("../middleware");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

// HOME PAGE
router.get("/", function(req, res){
    res.render("landingPage");
});


// AUTH ROUTES

// Show register form
router.get("/register", function(req, res) {
   res.render("register", {page: 'register'}); 
});


// Handle sign up logic
router.post("/register", function(req, res) {
    var newUser = new User
        ({  username:  req.body.username, 
            firstName: req.body.firstName,
            email:     req.body.email,
            avatar:    req.body.avatar,
            bio:       req.body.bio
        });
    if(req.body.adminCode === process.env.ADMINCODE){
        newUser.isAdmin = true;
    }
     User.register(newUser, req.body.password, function(err, user){
       if(err){
           console.log(err);
           req.flash("error", err.message);
           return res.redirect("register");
       }
       passport.authenticate("local")(req, res, function(){
          req.flash("success", "Successfully Signed Up! Welcome to YelpCamp, " + user.username.capitalize());
         res.redirect("/campgrounds");  
       });
   });
});


// Show Login form
router.get("/login", function(req, res) {
    res.render("login", {page: 'login'});
});


// Handle login logic
//  == app.post("/login", middleware, callback) ==

router.post("/login", function (req, res, next) {
    passport.authenticate("local",
        {
            successRedirect: "/campgrounds",
            failureRedirect: "/login",
            successFlash: "Welcome back, " + req.body.username + "!",
            failureFlash: "Login failed, invalid credentials."
        })(req, res);
});

// Logout Logic Route
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("error", "Logged you out");
    res.redirect("/campgrounds");
});


// forgot password
router.get('/forgot', function(req, res) {
  res.render('forgot');
});


router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: process.env.GMAILADMIN,
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'suyog.dudpuri@gmail.com',
        subject: 'YelpCamp Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});


// RESET PASSWORD

// GET ROUTE
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});


// POST ROUTE
router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: process.env.GMAILADMIN,
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: process.env.GMAILADMIN,
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/campgrounds');
  });
});


// CONTACT ME PAGE
router.get("/contact",  middleware.isLoggedIn, function(req, res){
  User.findById(req.params.id, function(err, foundUser)
     { if(err)
        {
          req.flash("error", err.message);
          res.redirect("back");
        } else {
        res.render("contact", {user: foundUser});
        }
     });
});


router.post("/contact", function(req, res) {
   
    var api_key = process.env.APIKEY;
    var domain = process.env.DOMAIN;
    var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
     
    var data = {
      from: 'Mailgun YelpCamp <postmaster@sandboxe3f5266b3430461b81137814b3e43d2c.mailgun.org>',
      to: process.env.GMAILADMIN,
      subject: req.body.username + " - Sent you a message via YelpCamp",
      html: "<b style='color:blue'> Message: </b>" + req.body.msg
    };
     
    mailgun.messages().send(data, function (error, body) {
      console.log(body);
      if(!error){
        req.flash("success", "Message sent!");
        res.redirect("/campgrounds");}
      else{
        req.flash("error", "Message not sent!");
        res.redirect("/campgrounds");
      }
    });
});



module.exports = router;