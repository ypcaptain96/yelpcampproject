var express  = require("express");
var router   = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
var middleware = require("../middleware");


// USER PROFILES
router.get("/:id", function(req, res) {
   User.findById(req.params.id, function(err, foundUser){
       if(err || !foundUser)
       { 
           req.flash("error", "Specificed User not found!");
           return res.redirect("/campgrounds");   
       }
       Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds){
           if(err)
       {req.flash("error", "Something went wrong");
        res.redirect("back");   
       }
       res.render("users/show", {user: foundUser, campgrounds: campgrounds, page: 'user'});
       });
   });
});

router.get("/:id/edit", middleware.checkUserOwnership, function(req, res) {
     User.findById(req.params.id, function(err, foundUser)
     { if(err || !foundUser)
        {
           req.flash("error", "Specificed User not found!"); 
           res.redirect("back");
        } else {
        res.render("users/edit", {user: foundUser, page: 'user'});
        }
     });
});

router.put("/:id", function(req, res){
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