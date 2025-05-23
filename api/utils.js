/**
 * Utility functions for the API
 */

// Simple helper to safely handle Cloudinary uploads with extensive logging
exports.handleCloudinaryUpload = async (cloudinary, fileStr, options) => {
  try {
    console.log('Cloudinary upload starting...');
    
    // Check if Cloudinary is configured
    if (!cloudinary) {
      console.error('Cloudinary instance not provided');
      throw new Error('Cloudinary instance not provided');
    }
    
    // Verify the Cloudinary config has been set
    const config = cloudinary.config();
    console.log('Cloudinary config check:', {
      cloud_name_set: !!config.cloud_name,
      api_key_set: !!config.api_key,
      api_secret_set: !!config.api_secret,
      secure: config.secure
    });
    
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      throw new Error('Cloudinary not properly configured');
    }
    
    if (!fileStr) {
      throw new Error('No file data provided');
    }
    
    // Make sure options are valid
    const uploadOptions = {
      ...options,
      folder: options.folder || 'kinflick',
      resource_type: options.resource_type || 'image'
    };
    
    console.log('Attempting Cloudinary upload with options:', {
      folder: uploadOptions.folder,
      resource_type: uploadOptions.resource_type,
      public_id: uploadOptions.public_id ? 'provided' : 'not provided'
    });
    
    // Perform the upload
    const result = await cloudinary.uploader.upload(fileStr, uploadOptions);
    
    console.log('Cloudinary upload successful:', {
      public_id: result.public_id,
      url: result.secure_url ? 'generated' : 'missing',
      format: result.format,
      size: result.bytes
    });
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    // Detailed error logging
    console.error('Error details:', {
      message: error.message,
      code: error.http_code || 'none',
      name: error.name,
      stack: error.stack ? 'available' : 'not available'
    });
    
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