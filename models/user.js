var mongoose              = require("mongoose");
var uniqueValidator       = require('mongoose-unique-validator');
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
   username: {type: String, unique: true, required: true},
   password: String,
   avatar: String,
   firstName: String,
   bio: String,
   email: {type: String, index: true, unique: true, required: true},
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
userSchema.plugin(uniqueValidator, { message: 'ERROR!, Expected {PATH} to be unique.' });

module.exports = mongoose.model("User", userSchema);