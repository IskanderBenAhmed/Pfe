const express = require("express");
const connectDB = require("./db");
const authRoutes = require("./Auth/auth");
const project = require("./model/project");
const file = require('./model/file');
const session = require('express-session');
const propositions = require('./model/propositions');
const flash = require('connect-flash');

const profile= require("./model/profile")


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
app.use(express.static('public/assets'));


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

app.get('/prelist-project',userAuth, async (req, res) => {
  const username = req.user.username;

  project.find({ status: 'approved' }, (err, projects) => {
    if (err) {
      console.error('Error fetching projects:', err);
      res.sendStatus(500);
    } else {
      res.render('prelist-project', { projects, username });
    }
  });
});



app.get('/projects', userAuth, async (req, res) => {
  try {
    const projects = await project.find({ createdBy: req.user.username });
    res.render('projects', { projects });
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



  

// Handle GET request for the "project-type" page
// Handle GET request for the "project-type" page
app.get('/project-type', (req, res) => {
  const category = req.query.category;
  const projectName = req.query.projectName;

  if (!category || !projectName) {
    return res.redirect('/project-theme');
  }

  const projectType = req.session.projectType;
  const selectedTemplate = req.session.selectedTemplate;

  res.render('project-type', { category, projectName, projectType, selectedTemplate });
});

// Handle POST request for the "project-type" page
app.post('/project-type', (req, res) => {
  const category = req.body.category;
  const projectType = req.body.projectType;
  const projectName = req.body.projectName;
  const selectedTemplate = req.body.selectedTemplate;
  req.session.selectedTemplate = selectedTemplate;

  // Store the project type and selected template in the session
  req.session.projectType = projectType;

  // Render the project-type page with the category, projectName, projectType, and selectedTemplate values
  res.render('project-type', { category, projectName, projectType, selectedTemplate });
});


app.get('/project-theme', (req, res) => {
  const category = req.session.category;
  const projectName = req.session.projectName;
  var selectedTemplate = 'Template Name'; // Replace 'Template Name' with the actual selected template name
  // Retrieve the category from the session
  
  res.render('project-theme', { category,projectName,selectedTemplate: selectedTemplate });
});

app.post('/project-theme', (req, res) => {
  // Process the submitted form data
  const projectType = req.body.projectType;
  const selectedTemplate = req.body.selectedTemplateNameInput;

  
  // ...

  // Store the project type in the session
  req.session.projectType = projectType;


  // Redirect to the "tech-selection" page
  res.redirect('/project-type');
});





app.use(express.urlencoded({ extended: true }));

app.get('/tech-selection', (req, res) => {
  const category = req.session.category;
  const projectName = req.session.projectName;
  const projectType = req.session.projectType;

  res.render('tech-selection', { category, projectName, projectType });
});


app.post('/tech-selection', (req, res) => {
  const backend = req.body.backend;
  const frontend = req.body.frontend;
  const database = req.body.database;
  const category = req.body.category;
  const projectName = req.body.projectName;
  const projectType = req.body.projectType;
  res.render('tech-selection', {
    backend,
    frontend,
    database,
    category,
    projectName,
    projectType,
  });
});











app.post('/saved-project',  userAuth, async(req, res) => {
  const { projectName , backend , frontend , database , category , projectType , status , paymentMethod , startDate , endDate , Estimated_price , maxBudget ,...pack } = req.body;

 
  const coding = req.body.coding === 'on';
  const Testing = req.body.Testing === 'on';
  const deployment = req.body.deployment === 'on';

  // Save the form data to the database using your preferred method

  let totalPrice = 0;
  if (coding) {
    totalPrice += 2000;
  }
  if (Testing) {
    totalPrice += 1700;
  }
  if (deployment) {
    totalPrice += 1200;
  }
  const newProject = new project({
    projectName ,
    backend,
    frontend,
    database,
    category,
    projectType,
    status,
    paymentMethod,
    startDate,
    endDate,
    Estimated_price: totalPrice,
    maxBudget,
    createdBy: req.user.username,


    pack: Object.keys(pack).filter(key => pack[key] === 'on') // Extract checked pack

  });

  // Save the project document
  newProject
    .save()
    .then(savedProject => {
      console.log('Project saved:', savedProject);
      res.redirect('/project-pack');
    })
    .catch(error => {
      console.error('Error saving project:', error);
      res.status(500).json({ error: 'An error occurred while saving the project.' });
    });
});






app.get('/payment', (req, res) => {
  const { backend, frontend, database, category, projectName, projectType } = req.query;

  res.render('payment', {
    backend,
    frontend,
    database,
    category,
    projectName,
    projectType,
  });
});


app.post('/payment', (req, res) => {
  const { backend , frontend , database , category , projectName , projectType , status , paymentMethod } = req.body;

  // Update the payment method in the project document using your preferred method
  res.render('payment', {
    backend,
    frontend,
    database,
    category,
    projectName,
    projectType,
    status,
    paymentMethod,
  });
});


app.get('/duration', (req, res) => {
  // Retrieve the values passed from the previous route (payment)
  const { backend, frontend, database, category,projectName, projectType, paymentMethod } = req.query;

  // Render the duration.ejs view and pass the values as local variables
  res.render('duration', {
    backend,
    frontend,
    database,
    category,
    projectName ,
    projectType,
    paymentMethod
  });
});

app.post('/duration', (req, res) => {
  // Retrieve the values from the request body
  const { backend , frontend , database , category ,projectName , projectType , paymentMethod , startDate , endDate} = req.body;

  // Perform any necessary processing or validation with the values

  // Save the form data to the database using your preferred method
  res.render('duration', {
    backend,
    frontend,
    database,
    category,
    projectName ,
    projectType,
    paymentMethod,
    startDate,
    endDate
    
  });

});


  app.get('/project-pack', (req, res) => {
    const { backend, frontend, database, category,projectName, projectType, paymentMethod,startDate, endDate } = req.query;
    res.render('project-pack', {
      backend,
      frontend,
      database,
      category,
      projectName ,
      projectType,
      paymentMethod,
      startDate,
      endDate,
       

      
    });
  });

app.post('/project-pack', (req, res) => {
  // Retrieve the values from the request body
  const { backend , frontend , database , category ,projectName , projectType , paymentMethod , startDate , endDate , Estimated_price , maxBudget ,...pack} = req.body;

  // Perform any necessary processing or validation with the values

  // Save the form data to the database using your preferred method
  res.render('project-pack', {
    backend,
    frontend,
    database,
    category,
    projectName ,
    projectType,
    paymentMethod,
    startDate,
    endDate,
   
    Estimated_price,
    maxBudget,
    ...pack
    
  });

});

app.get('/my-projects', userAuth, async (req, res) => {
  try {
    const projects = await project.find({ createdBy: req.user.username });
    res.render('my-projects', { projects });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});
// Assuming you have the necessary imports and setup

// Update the status of a project
app.post('/projects/:projectId/status', adminAuth, async (req, res) => {
  const { projectId } = req.params;
  const { status } = req.body;

  try {
    const updatedProject = await project.findByIdAndUpdate(projectId, { status }, { new: true });
    res.redirect('/all-projects');
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});
app.get('/freelancer-home', (req, res) => {
  // Perform any necessary logic or data retrieval here
  // Render the freelancer-home.ejs template
  res.render('freelancer-home');
});


app.post('/save-proposition', (req, res) => {
  const { projectName , username , price } = req.body;

  // Validate the required fields
  if (!projectName || !username || !price) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  // Save the proposition to the database
  const proposition = new propositions({
    projectName,
    freelancerUsername: username,
    price,
  });

  proposition.save()
    .then(() => {
      res.status(200).json({ message: 'Proposition added successfully!' });
    })
    .catch(error => {
      console.error('Error saving proposition:', error);
      res.status(500).json({ error: 'Failed to save proposition.' });
    });
});



app.get('/get-username', userAuth, (req, res) => {
  // Assuming the authenticated user's username is available in the req.user object
  const username = req.user.username;
  res.json({ username });
});
app.get('/get-role', userAuth, (req, res) => {
  const role = req.user.role;
  res.json({ role });
});
  
  
app.get('/client-profile', userAuth, async (req, res) => {
  const username = req.user.username;
  const role = req.user.role;


  try {
    // Retrieve the user profile data from the database
    const userProfile = await profile.findOne({ username: username });

      // Render the client-profile.ejs template and pass the userProfile, username, and role variables
      res.render('client-profile', { userProfile: userProfile, username: username, role: role });
      // Handle the case when the user profile is not found
  } catch (error) {
    // Handle any errors that occur during profile retrieval
    res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
});




app.get('/freelancer-profile', userAuth, async (req, res) => {
  const username = req.user.username;
  const role = req.user.role;


  try {
    // Retrieve the user profile data from the database
    const userProfile = await profile.findOne({ username: username });

      // Render the freelancer-profile.ejs template and pass the userProfile, username, and role variables
      res.render('freelancer-profile', { userProfile: userProfile, username: username, role: role });
      // Handle the case when the user profile is not found
  } catch (error) {
    // Handle any errors that occur during profile retrieval
    res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
});
app.get('/freelancer-requests', userAuth, async (req, res) => {
  try {
    // Get the logged-in user's ID from the session or token
    const username = req.user.username;

    // Fetch propositions for the logged-in user from the database
    const fetchedPropositions = await propositions.find({ freelancerUsername: username });


    // Render the freelancer-requests.ejs template with the fetched propositions
    res.render('freelancer-requests', { propositions: fetchedPropositions });
  } catch (error) {
    // Handle any errors that occur
    console.error('Error fetching propositions:', error);
    res.status(500).send('Internal Server Error');
  }
});




app.get('/proposition-approval', userAuth, async (req, res) => {
  try {
    // Fetch all propositions from the database
    const fetchedPropositions = await propositions.find({});

    // Render the proposition-approval.ejs template with the fetched propositions
    res.render('proposition-approval', { propositions: fetchedPropositions });
  } catch (error) {
    // Handle any errors that occur
    console.error('Error fetching propositions:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.use(flash());

app.post('/propositions/:propositionId/status', userAuth, async (req, res) => {
  try {
    const propositionId = req.params.propositionId;
    const { status } = req.body;

    // Update the proposition status in the database
    await propositions.findByIdAndUpdate(propositionId, { status });
    req.flash('success', 'Proposition status changed successfully.');

    res.redirect('/proposition-approval'); // Redirect to the proposition approval page after updating the status
  } catch (error) {
    console.error('Error updating proposition status:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/select-proposition', userAuth, async (req, res) => {
  try {
    // Fetch approved propositions from the database
    const username = req.user.username;

    // Fetch projects created by the logged-in user
    const createdProjects = await project.find({ createdBy: username });

    // Extract the project names from the created projects
    const projectNames = createdProjects.map(project => project.projectName);

    // Fetch approved propositions that belong to the created projects
    const fetchedPropositions = await propositions.find({ projectName: { $in: projectNames }, status: 'approved' });

    // Render the select-proposition.ejs template with the fetched approved propositions
    res.render('select-proposition', { propositions: fetchedPropositions });
  } catch (error) {
    // Handle any errors that occur
    console.error('Error fetching propositions:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/select-proposition', userAuth, async (req, res) => {
  try {
    const propositionId = req.body.propositionId;

    // Find the proposition in the database
    const proposition = await propositions.findById(propositionId);

    if (!proposition) {
      // Proposition not found
      return res.status(404).send('Proposition not found');
    }

    // Toggle the value of the 'selected' field
    proposition.selected = !proposition.selected;

    // Save the updated proposition in the database
    await proposition.save();

    res.sendStatus(200);
  } catch (error) {
    // Handle any errors that occur
    console.error('Error updating proposition selection:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/upload-template', upload.single('template'), (req, res) => {
  // Access the uploaded file using req.file
  const templateFile = req.file;

  // Process the uploaded file as needed

  // Retrieve the list of uploaded templates
  // You can fetch this from a database or an array in memory
  const templates = [
    { name: 'Template 1' },
    { name: 'Template 2' },
    { name: 'Template 3' }
  ];

  // Render the upload-template view and pass the templates data
  res.render('upload-template', { templates: templates });
});

app.get('/upload-template', (req, res) => {
  // Render the upload-template view without any uploaded templates initially
  res.render('upload-template', { templates: [] });
});
app.put('/api/projects/:projectId', userAuth, async (req, res) => {
  const projectId = req.params.projectId;
  const { projectName , backend , frontend , database , category , projectType , status , paymentMethod , startDate , endDate , Estimated_price , maxBudget , ...pack } = req.body;

  const coding = req.body.coding === 'on';
  const Testing = req.body.Testing === 'on';
  const deployment = req.body.deployment === 'on';

  let totalPrice = 0;
  if (coding) {
    totalPrice += 2000;
  }
  if (Testing) {
    totalPrice += 1700;
  }
  if (deployment) {
    totalPrice += 1200;
  }

  // Find the project document by ID and update the fields
  project.findByIdAndUpdate(projectId, {
    projectName,
    backend,
    frontend,
    database,
    category,
    projectType,
    status,
    paymentMethod,
    startDate,
    endDate,
    Estimated_price: totalPrice,
    maxBudget,
    pack: Object.keys(pack).filter(key => pack[key] === 'on')
  })
    .then(updatedProject => {
      console.log('Project updated:', updatedProject);
      res.json(updatedProject);
    })
    .catch(error => {
      console.error('Error updating project:', error);
      res.status(500).json({ error: 'An error occurred while updating the project.' });
    });
});
app.delete('/api/projects/:projectId', userAuth, async (req, res) => {
  const projectId = req.params.projectId;

  try {
    // Find the project document by ID and delete it
    const deletedProject = await project.findByIdAndDelete(projectId);
    if (!deletedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    console.log('Project deleted:', deletedProject);
    res.json(deletedProject);
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'An error occurred while deleting the project.' });
  }
});
app.post('/save-profile', (req, res) => {
  const profileData = req.body;

  console.log('Profile Data:', profileData);

  // Check if a profile with the same username already exists
  profile.findOne({ username: profileData.username })
    .then(existingProfile => {
      if (existingProfile) {
        // Profile already exists, update the existing profile
        existingProfile.email = profileData.email;
        existingProfile.Firstname = profileData.Firstname;
        existingProfile.Lastname = profileData.Lastname;
        existingProfile.city = profileData.city;
        existingProfile.country = profileData.country;
        existingProfile.postal_code = profileData.postal_code;
        existingProfile.About_me = profileData.About_me;

        return existingProfile.save();
      } else {
        // Profile doesn't exist, create a new profile
        const newProfile = new profile(profileData);
        return newProfile.save();
      }
    })
    .then(savedProfile => {
      console.log('Saved Profile:', savedProfile);
      res.status(200).json(savedProfile);
    })
    .catch(error => {
      console.error('Failed to save profile:', error);
      res.status(500).json({ error: 'Failed to save profile' });
    });
});

