/**
 * Utility functions for the API
 */

// Simple helper to safely handle Cloudinary uploads
exports.handleCloudinaryUpload = async (cloudinary, fileStr, options) => {
  try {
    if (!cloudinary) {
      throw new Error('Cloudinary instance not provided');
    }
    
    if (!fileStr) {
      throw new Error('No file data provided');
    }
    
    // Perform the upload
    const result = await cloudinary.uploader.upload(fileStr, options);
    return { success: true, data: result };
  } catch (error) {
    console.error('Cloudinary upload error:', error.message);
    return { 
      success: false, 
      error: error.message,
      details: error.http_code ? `HTTP ${error.http_code}: ${error.message}` : error.message
    };
  }
};

// Helper to validate environment variables
exports.validateEnvVars = () => {
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];
  
  const missing = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  return {
    isValid: missing.length === 0,
    missing
  };
};