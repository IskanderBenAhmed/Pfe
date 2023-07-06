const Mongoose = require("mongoose");

const profileSchema = new Mongoose.Schema({
  username: {
    type: String,
    unique: true
      },
  email: {
    type: String,
    unique: true,
        match: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/

  },    
  Firstname: {
    type: String,
  },
  Lastname: {
    type: String,
  },
  city: {
    type: String,
  },
  country: {
    type: String,
  },
  postal_code: {
    type: String,
  },
  About_me: {
    type: String,
  },
});

const profile = Mongoose.model("profile", profileSchema);

module.exports = profile;
