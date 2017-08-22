var mongoose              = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
   username: String,
   password: String,
   isAdmin: {type: Boolean, default: false}
});

var options = {
 errorMessages: {
  IncorrectPasswordError: 'Password or Username is incorrect',
  IncorrectUsernameError: 'Password or Username is incorrect'
 }
};

userSchema.plugin(passportLocalMongoose, options);

module.exports = mongoose.model("User", userSchema);