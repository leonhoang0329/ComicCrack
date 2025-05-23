// This file serves as the serverless function entry point for Vercel
const app = require('../server');

// Export the Express app as a serverless function
module.exports = app;