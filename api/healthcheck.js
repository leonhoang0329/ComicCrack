// Simple health check endpoint for Vercel
// This can be used to verify that the API is deployed correctly

module.exports = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    deployment: 'vercel'
  });
};