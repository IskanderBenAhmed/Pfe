const fs = require('fs');
const express = require('express');
const app = express();
const path = require('path');
const php = require('php');
const publicFolderPath = path.join(__dirname);

// Serve static files
app.use(express.static(publicFolderPath));

// Use php-express middleware
const phpExpress = require('php-express')({
  binPath: 'php', // Path to PHP binary
  iniPath: 'php.ini', // Path to PHP configuration file (optional)
});

// Route to handle PHP files
app.all(/.+\.php$/, phpExpress.router);

// Handle requests for HTML files
app.get('/', (req, res) => {
  const html = fs.readFileSync(path.join(publicFolderPath, 'editor.html'), 'utf-8');
  res.send(html);
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
