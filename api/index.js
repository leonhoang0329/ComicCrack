// Vercel Serverless API Handler

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS method for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Parse the URL to get the endpoint
  const url = req.url;
  
  // Basic authentication check - mocked for debugging
  const isLoggedIn = true; // In production, this should validate the JWT token

  // Handle different API endpoints
  if (url === '/api/photos' && req.method === 'GET') {
    // Simulate photos API response with empty array
    return res.json([]);
  }
  
  if (url.startsWith('/api/auth/login') && req.method === 'POST') {
    // Simulate login API
    return res.json({
      token: "mock-token-for-testing",
      user: { _id: "mock-user-id", email: "test@example.com" }
    });
  }

  if (url.startsWith('/api/auth/register') && req.method === 'POST') {
    // Simulate register API
    return res.json({
      token: "mock-token-for-testing",
      user: { _id: "mock-user-id", email: "test@example.com" }
    });
  }

  if (url.startsWith('/api/diary') && req.method === 'GET') {
    // Simulate diary API response
    return res.json([]);
  }
  
  if (url.startsWith('/api/photos/upload') && req.method === 'POST') {
    // Simulate photo upload API
    return res.json({
      message: 'Photos uploaded successfully',
      count: 0,
      photos: []
    });
  }

  // Status route for debugging
  if (url === '/api/status') {
    return res.json({
      status: 'online',
      environment: process.env.NODE_ENV || 'production',
      message: 'This is a mock API for Vercel deployment testing'
    });
  }
  
  // Default response for unhandled routes
  return res.status(404).json({ 
    error: 'API endpoint not found', 
    url: req.url,
    method: req.method
  });
};