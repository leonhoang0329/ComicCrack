const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://leonhoang0329.github.io',
  credentials: true
}));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'KinFlick/frontend/build')));

// The "catchall" handler: for any request that doesn't match one
// defined above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'KinFlick/frontend/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});