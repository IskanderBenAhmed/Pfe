const express = require("express");
const connectDB = require("./db");
const authRoutes = require("./Auth/auth");
const project = require("./model/project");
const file = require('./model/file');
const session = require('express-session');


const multer = require('multer');
const app = express();
app.use(session({
  secret: '4715aed3c946f7b0a38e6b534a9583628d84e96d10fbc04700770d572af3dce43625dd',
  resave: false,
  saveUninitialized: false
}));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify the directory where you want to store the uploaded files
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate a unique filename for the uploaded file
    cb(null, file.originalname);
  },
});

// Configure multer with the storage options
const upload = multer({ storage });

// Handle file upload route
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Get the file details from the request object
    const originalFilename = req.file.originalname;

    const { filename, path } = req.file;
    const { username } = req.body; // Retrieve the username from the request body

    // Create a new File document using the schema and save it to the "files" collection
    const newFile = await file.create({ filename, filepath: path, addedBy: username });

    res.status(201).json({ message: 'File uploaded successfully', file: newFile });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload file', error: error.message });
  }
});

const bodyParser = require('body-parser');
const path = require("path");
app.use(express.static('public/main-template'));

const cookieParser = require("cookie-parser");
const { adminAuth, userAuth } = require("./middleware/auth.js");

const PORT = 5000;

app.set("view engine", "ejs");

connectDB();
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use("/api/auth", require("./Auth/route"));

app.get("/api/auth/verify/:token", authRoutes.verifyEmail);

app.get('/prelist-project', userAuth, async (req, res) => {
  try {
    const projects = await project.find({ createdBy: req.user.username });
    res.render('prelist-project', { projects, currentUser: req.user });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.get('/projects', userAuth, async (req, res) => {
  try {
    const projects = await project.find({ createdBy: req.user.username });
    res.render('prelist-project', { projects });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.get('/all-projects', (req, res) => {
  project.find({}, (err, projects) => {
    if (err) {
      console.error('Error fetching projects:', err);
      res.sendStatus(500);
    } else {
      res.render('projects', { projects });
    }
  });
});

app.post('/save-attachment', upload.single('attachment'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  res.status(200).json({ message: 'File saved successfully.' });
});

app.use('/uploads', express.static('uploads'));

app.get("/suggestion", (req, res) => res.render("suggestion"));

app.get("/attached-file", userAuth, (req, res) => {
  res.render("attached-file", { currentUser: req.user });
});

app.get("/", (req, res) => res.render("home.ejs"));
app.get("/register", (req, res) => res.render("register"));
app.get("/login", (req, res) => res.render("login"));

app.get("/create-project", (req, res) => {
  res.render("create-project");
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



app.post('/project-theme', (req, res) => {
  // Process the submitted form data
  const projectType = req.body.projectType;
  // ...

  // Store the project type in the session
  req.session.projectType = projectType;

  // Redirect to the "tech-selection" page
  res.redirect('/tech-selection');
});

// Handle GET request for the "project-type" page
app.get('/project-type', (req, res) => {
  const category = req.query.category; // Retrieve the category from the query parameters

  if (!category) {
    // If the category is missing, redirect back to the "project-theme" page
    return res.redirect('/project-theme');
  }

  res.render('project-type', { category, projectType: req.query.projectType });
});



// Handle POST request for the "project-type" page
app.post('/project-type', (req, res) => {
  const category = req.body.category;
  const projectType = req.body.projectType;

  // Render the project-type page with the category and projectType values
  res.render('project-type', { category, projectType });
});



app.post('/project-theme', (req, res) => {
  // Process the submitted form data
  const projectType = req.body.projectType;
  // ...

  // Store the project type in the session
  req.session.projectType = projectType;

  // Redirect to the "tech-selection" page
  res.redirect('/project-type');
});

app.get('/project-theme', (req, res) => {
  const category = req.session.category; // Retrieve the category from the session
  
  res.render('project-theme', { category });
});



app.use(express.urlencoded({ extended: true }));

app.post('/tech-selection', (req, res) => {
  const category = req.body.category;
  const projectType = req.body.projectType;
  const backend = req.body.backend;
  const frontend = req.body.frontend;
  const database = req.body.database;
  

  // Redirect to the "success" page or any other desired page
  res.render('tech-selection', { category, projectType });
});




app.get('/tech-selection', (req, res) => {
  const category = req.session.category; // Retrieve the category from the session
  const projectType = req.session.projectType; // Retrieve the project type from the session
  res.render('tech-selection', { category, projectType });
});

app.post('/saved-project', (req, res) => {
  const { backend, frontend, database, category , projectType,status} = req.body;


  // Save the form data to the database using your preferred method
  const newProject = new project({
    backend,
    frontend,
    database,
    category,
    projectType,
    status 
  });

  // Save the project document
  newProject.save()
    .then(savedProject => {
      console.log('Project saved:', savedProject);
      res.redirect('/attached-file');    })
    .catch(error => {
      console.error('Error saving project:', error);
      res.status(500).json({ error: 'An error occurred while saving the project.' });
    });
});