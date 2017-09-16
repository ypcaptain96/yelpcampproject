// NPM Packages
var express         = require("express");
var bodyParser      = require("body-parser");
var mongoose        = require("mongoose");
var passport        = require("passport");
var flash           = require("connect-flash");
var moment          = require('moment-timezone');
var localStrategy   = require("passport-local");
var methodOverride  = require("method-override");
var Campground      = require("./models/campground");
var Comment         = require("./models/comment");
var User            = require("./models/user");
var seedDB          = require("./seeds");
var app             = express();

// Requiring Routes
var commentRoutes     = require("./routes/comments"),
    campgroundRoutes  = require("./routes/campgrounds"),
    indexRoutes       = require("./routes/index"),
    userRoutes        = require("./routes/users");
    
mongoose.Promise = global.Promise;
var url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp_v10";
mongoose.connect(url);


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require("moment");

// Seed the Database
// seedDB();


// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Magic woof woof!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error       = req.flash("error");
   res.locals.success     = req.flash("success");
   res.locals.warning     = req.flash("warning");
   next();
});

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};


app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/users", userRoutes);


app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The YelpCamp server has started!"); 
});