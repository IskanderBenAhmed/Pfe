const express = require("express");
const connectDB = require("./db");
const authRoutes = require("./Auth/auth");
const project = require("./model/project");
const fs = require('fs');
const php = require('php');
const bodyParser = require('body-parser');
const path = require("path");

const app = express();

const publicFolderPath = path.join(__dirname);
const webbuilderFolderPath = path.join(__dirname, 'webbuilder');

// Serve static files from the "webbuilder" folder
app.use(express.static(webbuilderFolderPath));
app.use(express.static('public/main-template'));

const cookieParser = require("cookie-parser");
const { adminAuth, userAuth } = require("./middleware/auth.js");

const PORT = 5000;
app.use(express.static(publicFolderPath));

// Use php-express middleware
const phpExpress = require('php-express')({
  binPath: 'php', // Path to PHP binary
  iniPath: 'php.ini', // Path to PHP configuration file (optional)
});

// Route to handle PHP files
app.all(/.+\.php$/, phpExpress.router);

app.set("view engine", "ejs");

connectDB();
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use("/api/auth", require("./Auth/route"));

// Add route handling for email verification
app.get("/api/auth/verify/:token", authRoutes.verifyEmail);

app.get('/prelist-project', userAuth, async (req, res) => {
  try {
    // Fetch projects created by the logged-in user from the database
    const projects = await project.find({ createdBy: req.user.username });

    // Render the "prelist-project" template and pass the fetched projects as a variable
    res.render('prelist-project', { projects, currentUser: req.user });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.get('/projects', userAuth, async (req, res) => {
  try {
    // Fetch projects created by the logged-in user from the database
    const projects = await project.find({ createdBy: req.user.username });

    // Render the "prelist-project" template and pass the fetched projects as a variable
    res.render('prelist-project', { projects });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.get('/builder', (req, res) => {
  res.sendFile(path.join(__dirname, 'webbuilder', 'editor.html'));
});

app.get("/suggestion", (req, res) => res.render("suggestion"));

app.get("/", (req, res) => res.render("home.ejs"));
app.get("/register", (req, res) => res.render("register"));
app.get("/login", (req, res) => res.render("login"));

app.get("/create-project", (req, res) => {
  res.render("create-project"); // Rendu de la page de création de project
});

app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: "1" });
  res.redirect("/");
});

app.get("/admin", adminAuth, (req, res) => res.render("admin"));

app.get("/listUsers", userAuth, (req, res) => res.render("user"));

const server = app.listen(PORT, () =>
  console.log(`Server Connected to port ${PORT}`)
);

process.on("unhandledRejection", (err) => {
  console.log(`An error occurred: ${err.message}`);
  server.close(() => process.exit(1));
});

app.post('/saved-project', userAuth, async (req, res) => {
  // Extract the submitted form data from the request object
  const projectName = req.body.projectName;
  const projectDescription = req.body.projectDescription;
  const projectContactForm = req.body.projectContactForm === 'on';
  const projectGallery = req.body.projectGallery === 'on';
  const projectBlog = req.body.projectBlog === 'on';

  // Check if projectName and projectDescription are provided
  if (!projectName || !projectDescription) {
    return res.status(400).json({ error: 'projectName and projectDescription are required' });
  }

  // Perform any necessary operations to calculate the total price
  let totalPrice = 0;
  if (projectContactForm) {
    totalPrice += 100;
  }
  if (projectGallery) {
    totalPrice += 120;
  }
  if (projectBlog) {
    totalPrice += 50;
  }

  try {
    // Create a new instance of the project model and save it to the database
    let newProject = new project({
      projectName,
      projectDescription,
      price: totalPrice,
      createdBy: req.user.username
    });

    await newProject.save();

    // Send the JSON response
    res.render('saved-project', {
      projectName,
      projectDescription,
      projectContactForm,
      totalPrice,
      projectGallery,
      projectBlog
    });
    
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});
