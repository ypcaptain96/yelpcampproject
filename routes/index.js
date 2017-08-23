var express  = require("express");
var router   = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");

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
    if(req.body.adminCode === 'magic123'){
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
router.post("/login", passport.authenticate("local", 
{
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "Welcome back!" 
}),
function(req, res) {
});


// Logout Logic Route
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("error", "Logged you out");
    res.redirect("/campgrounds");
});

// USER PROFILES
router.get("/users/:id", function(req, res) {
   User.findById(req.params.id, function(err, foundUser){
       if(err)
       {req.flash("error", "Something went wrong");
        res.redirect("/");   
       }
       Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds){
           if(err)
       {req.flash("error", "Something went wrong");
        res.redirect("/");   
       }
       res.render("users/show", {user: foundUser, campgrounds: campgrounds});
       });
   });
});

router.get("/users/:id/edit", function(req, res) {
     User.findById(req.params.id, function(err, foundUser)
     { if(err)
        {
          res.redirect("back");
        } else {
        res.render("users/edit", {user: foundUser});
        }
     });
});

router.put("/users/:id", function(req, res){
     var newData = {firstName: req.body.firstName, email: req.body.email, avatar: req.body.avatar, bio: req.body.bio};
  User.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, user){
     if(err){
         res.redirect("back");
     } else{
         req.flash("success","Profile Updated!");
         res.redirect("/users/" + user._id);
     }
  });
});

module.exports = router;