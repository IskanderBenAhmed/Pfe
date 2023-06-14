const User = require("../model/User");
const project = require('../model/project');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const JWT_KEY = "jwtactive987";
const JWT_RESET_KEY = "jwtreset987";

const jwtSecret = "4715aed3c946f7b0a38e6b534a9583628d84e96d10fbc04700770d572af3dce43625dd";

// Create a nodemailer transporter


exports.register = async (req, res, next) => {
  const { username,email, password, role } = req.body;

  // Check if the user already exists
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email ID already registered" });
    }
  } catch (error) {
    return res.status(500).json({ message: "An error occurred", error: error.message });
  }

  // Proceed with user registration
  if (password.length < 6) {
    return res.status(400).json({ message: "Password is less than 6 characters" });
  }

  bcrypt.hash(password, 10).then(async (hash) => {
    try {
      const user = await User.create({
        username,
        email,
        password: hash,
        role: role || "Basic",
        isVerified: false, // Add a new field to track email verification status
      });

      const maxAge = 3 * 60 * 60;
      const token = jwt.sign(
        { id: user._id,username, email, role: user.role },
        jwtSecret,
        {
          expiresIn: maxAge,
        }
      );

      // Send verification email
      const verificationLink = `http://localhost:3000/verify/${token}`;
      const mailOptions = {
        from: "nodejsa@gmail.com",
        to: email,
        subject: "Email Verification",
        text: `Click on the link to verify your email: ${verificationLink}`,
        html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
      };

      

      res.status(201).json({
        message: "Verification email sent. Please check your email to complete the registration.",
        user: user._id,
        role: user.role,
      });
    } catch (error) {
      res.status(400).json({
        message: "User not successfully created",
        error: error.message,
      });
    }
  });
};

exports.login = async (req, res, next) => {
  const { username,email, password } = req.body;

  // Check if email and password are provided
  if (!username || !email || !password) {
    return res.status(400).json({
      message: "username , email or password not present",
    });
  }

  try {
    const user = await User.findOne({ email }); // Ensure email is defined here

    if (!user) {
      return res.status(400).json({
        message: "Login not successful",
        error: "User not found",
      });
    } else {
      // Compare given password with hashed password
      bcrypt.compare(password, user.password).then(function (result) {
        if (result) {
          const maxAge = 3 * 60 * 60;
          const token = jwt.sign(
            { id: user._id,username, email, role: user.role },
            jwtSecret,
            {
              expiresIn: maxAge,
            }
          );
          res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: maxAge * 1000,
          });
          res.status(201).json({
            message: "User successfully logged in",
            user: user._id,
            role: user.role,
          });
        } else {
          res.status(400).json({ message: "Login not successful" });
        }
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const decodedToken = jwt.verify(token, jwtSecret);
    const user = await User.findById(decodedToken.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "Email verification successful" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};



exports.update = async (req, res, next) => {
  const { role, id } = req.body;

  // Verifying if role and id are present
  if (role && id) {
    // Verifying if the value of role is admin
    if (role === "admin") {
      // Finds the user with the id
      try {
        const user = await User.findById(id);
        // Verifies the user is not an admin
        if (user.role !== "admin") {
          user.role = role;
          await user.save();
          res.status(201).json({ message: "Update successful", user });
        } else {
          res.status(400).json({ message: "User is already an Admin" });
        }
      } catch (error) {
        res.status(400).json({ message: "An error occurred", error: error.message });
      }
    } else {
      res.status(400).json({ message: "Role is not admin" });
    }
  } else {
    res.status(400).json({ message: "Role or Id not present" });
  }
};

exports.deleteUser = async (req, res, next) => {
  const { id } = req.body;

  try {
    const user = await User.findById(id);
    await user.remove();
    res.status(201).json({ message: "User successfully deleted", user });
  } catch (error) {
    res.status(400).json({ message: "An error occurred", error: error.message });
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    const userFunction = users.map((user) => ({
      username: user.username,
      email: user.email,
      role: user.role,
      id: user._id,
    }));
    res.status(200).json({ user: userFunction });
  } catch (error) {
    res.status(401).json({ message: "Not successful", error: error.message });
  }
};
