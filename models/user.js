var mongoose              = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
   username: {type: String, unique: true, required: true},
   password: String,
   avatar: String,
   firstName: String,
   bio: String,
   email: {type: String, unique: true, required: true},
   resetPasswordToken: String,
   resetPasswordExpires: Date,
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