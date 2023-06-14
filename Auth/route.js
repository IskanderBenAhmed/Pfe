const express = require("express");
const router = express.Router();

const { register, login, update, deleteUser, getUsers, indexView } = require("./auth");
const { adminAuth } = require("../middleware/auth");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/update").put(adminAuth, update);
router.route("/deleteUser").delete(adminAuth, deleteUser);
router.route("/getUsers").get(getUsers);
router.get("/", (req, res) => {
    // Handle the GET request for the root route
    res.send("Welcome to the authentication route");
  });

  

module.exports = router;
