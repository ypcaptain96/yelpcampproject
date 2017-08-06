var express    = require("express");
var router     = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");


// INDEX  -  show all campgrounds
router.get("/", function(req, res){
    // Get all the informations from DB
    Campground.find({},function(err, allCampgrounds){
       if(err){
           console.log("Errorrr!");
       } 
       else{
           res.render("campgrounds/index", {campgrounds: allCampgrounds});
       }
    });
    
});


// CREATE  -  Add new campground to the database
router.post("/", middleware.isLoggedIn, function(req, res){
            // get data from form and add to the array
       var name  = req.body.name;
       var price = req.body.price;
       var image = req.body.image;
       var desc  = req.body.description;
       var author = {
           id: req.user._id,
           username: req.user.username
       };
       var newCampground = {name: name, price: price, image: image, description: desc, author: author};
        // Create a new campground and save to the DB
        Campground.create(newCampground, function(err, newlyCreated){
            if(err){
                console.log("Errooor!");
            }else{
                // redirect to the campgrounds page
                res.redirect("/campgrounds");
            }
        });
});


// NEW  -  Show form to create a new campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
   res.render("campgrounds/new"); 
});


// SHOW  -  Shows information about one particular campground
router.get("/:id", function(req, res) {
    // find the campground with the provided ID
    Campground.findById(req.params.id).populate("comments").exec( function(err, foundCampground){
        if(err)
        {
            console.log("ERRROR!");
        }
        else
        {
            // render the show template
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// EDIT Campground Route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
     Campground.findById(req.params.id, function(err, foundCampground)
     { if(err)
        {
          res.redirect("back");
        } else {
        res.render("campgrounds/edit", {campground: foundCampground});
        }
     });
});


// UPDATE Campground Route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    // Find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err){
           res.redirect("/campgrounds");
       } else{
           // Redirect to show page
           req.flash("success", "You successfully edited the campground");
           res.redirect("/campgrounds/" + req.params.id);
       }
    });
    
});

// DESTROY - Deletes the specified campground
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
   Campground.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/campgrounds");
      } else{
          req.flash("warning", "You deleted a campground");
          res.redirect("/campgrounds");
      }
   }); 
});

module.exports = router;