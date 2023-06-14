const Mongoose = require("mongoose");

const UserSchema = new Mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
        match: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/

  },
  password: {
    type: String,
    minlength: 6,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
});

const User = Mongoose.model("user", UserSchema);

module.exports = User;
