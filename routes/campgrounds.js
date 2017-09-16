var express    = require("express");
var router     = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var geocoder   = require("geocoder");


// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// INDEX  -  show all campgrounds
router.get("/", function(req, res){
    var noMatch = null;
    if(req.query.search){
            const regex = new RegExp(escapeRegex(req.query.search), 'gi');
             // Get all the informations from DB
            Campground.find({name: regex},function(err, allCampgrounds){
               if(err){
                   console.log("Errorrr!");
               } 
               else{
                   if(allCampgrounds.length < 1){
                    noMatch = "No campgrounds match that query, Please try again!";
                   }
                   res.render("campgrounds/index", {noMatch: noMatch, campgrounds: allCampgrounds, page: 'campgrounds'});
               }

            });
        } else {
            // Get all the informations from DB
            Campground.find({},function(err, allCampgrounds){
               if(err){
                   console.log("Errorrr!");
               } 
               else{
                   res.render("campgrounds/index", {noMatch: noMatch, campgrounds: allCampgrounds, page: 'campgrounds'});
               }
            });
        }
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
       geocoder.geocode(req.body.location, function (err, data) {
       var lat = data.results[0].geometry.location.lat;
       var lng = data.results[0].geometry.location.lng;
       var location = data.results[0].formatted_address;
       var newCampground = {name: name, price: price, image: image, description: desc, author: author, location: location, lat: lat, lng: lng};
        // Create a new campground and save to the DB
        Campground.create(newCampground, function(err, newlyCreated){
            if(err){
                console.log("Errooor!");
            }else{
                // redirect to the campgrounds page
                console.log(newlyCreated);
                res.redirect("/campgrounds");
            }
        });
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
        if(err || !foundCampground)
        {
            req.flash("error", "Campground not found!");
            res.redirect("/campgrounds");
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
     { if(err || !foundCampground)
        {
          req.flash("error", "Campground not found!");
          res.redirect("/campgrounds");
        } else {
        res.render("campgrounds/edit", {campground: foundCampground});
        }
     });
});


// UPDATE Campground Route
router.put("/:id", function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newData = {name: req.body.name, image: req.body.image, description: req.body.description, price: req.body.price, location: location, lat: lat, lng: lng};
    Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

// DESTROY - Deletes the specified campground
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
   Campground.findByIdAndRemove(req.params.id, function(err, campground) {
    Comment.remove({
      _id: {
        $in: campground.comments
      }
    }, function(err, comments) {
      req.flash('error', campground.name + ' deleted!');
      res.redirect('/campgrounds');
    })
  });
});


module.exports = router;