var express  = require("express");
var router   = express.Router();
var passport = require("passport");
var User = require("../models/user");

// HOME PAGE
router.get("/", function(req, res){
    res.render("landingPage");
});


// AUTH ROUTES

// Show register form
router.get("/register", function(req, res) {
   res.render("register"); 
});

// Handle sign up logic
router.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username});
   User.register(newUser, req.body.password, function(err, user){
       if(err){
           console.log(err);
           req.flash("error", err.message);
           return res.redirect("register");
       }
       passport.authenticate("local")(req, res, function(){
          req.flash("success", "Welcome to YelpCamp " + user.username.capitalize());
         res.redirect("/campgrounds");  
       });
   });
});


// Show Login form
router.get("/login", function(req, res) {
    res.render("login");
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


module.exports = router;