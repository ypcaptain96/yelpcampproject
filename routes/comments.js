var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");


// NEW - Show form to create a new comment
router.get("/new", middleware.isLoggedIn, function(req, res) {
    // Find Campground by Id
    Campground.findById(req.params.id, function(err, campground){
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render("comments/new", {campground: campground});
        }
    });
});


// CREATE - Creates a new comment
router.post("/", middleware.isLoggedIn, function(req, res){
    // Lookup campground using ID
    Campground.findById(req.params.id, function(err, campground) {
       if(err)
       {
           console.log(err);
           res.redirect("/campgrounds");
       }
       else
       {
           // Create new comment
           Comment.create(req.body.comment, function(err, comment){
               if(err)
               {
                   req.flash("error", "Something went wrong!");
                   console.log(err);
               }
               else
               {    
                   // Add username and id to comment
                   comment.author.id = req.user._id;
                   comment.author.username = req.user.username;
                   // Save comment
                    comment.save();
                   // Connect new comment to campground and Save
                    campground.comments.push(comment);
                    campground.save();
                    // redirect to campground showpage
                    req.flash("success", "Successfully added a new comment");
                    res.redirect("/campgrounds/" + campground._id);
               }
           });
       }
    });
});

// EDIT - Shows the edit form for a specific comment
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
   Comment.findById(req.params.comment_id, function(err, foundComment) {
      if(err){
          res.redirect("back");
      } else{
          res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
      }
   });
});

// UPDATE - Updates the comment
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
     if(err){
         res.redirect("back");
     } else{
         res.redirect("/campgrounds/" + req.params.id);
     }
  });
});

// DESTROY - Deletes the comment
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findByIdAndRemove(req.params.comment_id, function(err){
      if(err){
          res.redirect("back");
      } else{
           req.flash("warning", "Comment deleted!");
          res.redirect("/campgrounds/" + req.params.id);
      }
   });  
});

module.exports = router;