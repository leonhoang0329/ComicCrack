/**
 * Utility functions for the API
 */

// Helper to safely handle Cloudinary uploads with fallback to data URL storage
exports.handleCloudinaryUpload = async (cloudinary, fileStr, options) => {
  try {
    console.log('Cloudinary upload starting...');
    
    // Check if this is running on Vercel
    const isVercel = !!process.env.VERCEL;
    console.log('Running on Vercel:', isVercel);
    
    // Check if Cloudinary is configured
    if (!cloudinary) {
      console.error('Cloudinary instance not provided');
      throw new Error('Cloudinary instance not provided');
    }
    
    // Verify the Cloudinary config has been set
    const config = cloudinary.config();
    console.log('Cloudinary config check:', {
      cloud_name: config.cloud_name,
      api_key_set: !!config.api_key,
      api_secret_set: !!config.api_secret,
      secure: config.secure
    });
    
    // For demo account, return a fallback instead of trying to upload
    if (config.cloud_name === 'demo' || !config.api_key || !config.api_secret) {
      console.log('Using demo or incomplete Cloudinary config - returning mock result');
      // Generate a unique ID for the "public_id"
      const mockPublicId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      return { 
        success: true, 
        data: {
          public_id: mockPublicId,
          secure_url: fileStr.substring(0, 100) + '...', // Return truncated data URL
          format: 'data_url',
          bytes: fileStr.length,
          resource_type: 'image',
          created_at: new Date().toISOString(),
          is_mock: true
        },
        is_mock: true 
      };
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
    
    try {
      console.log('Direct upload attempt to Cloudinary starting...');
      
      // Add additional debugging
      if (typeof cloudinary.uploader.upload !== 'function') {
        console.error('CRITICAL ERROR: cloudinary.uploader.upload is not a function!');
        throw new Error('Cloudinary uploader not available');
      }

      // Add timeout and direct promise handling for more control
      const uploadPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Cloudinary upload timed out after 30 seconds'));
        }, 30000);
        
        cloudinary.uploader.upload(fileStr, uploadOptions)
          .then(result => {
            clearTimeout(timeout);
            resolve(result);
          })
          .catch(err => {
            clearTimeout(timeout);
            reject(err);
          });
      });
      
      // Wait for the upload with explicit timeout handling
      const result = await uploadPromise;
      
      // Validate response
      if (!result || !result.secure_url) {
        console.error('Cloudinary returned invalid response:', result);
        throw new Error('Invalid response from Cloudinary');
      }
      
      console.log('Cloudinary upload successful:', {
        public_id: result.public_id,
        url: result.secure_url ? 'generated' : 'missing',
        format: result.format,
        size: result.bytes
      });
      
      return { success: true, data: result };
    } catch (uploadError) {
      console.error('Cloudinary upload failed, using fallback:', uploadError.message);
      console.error('Full error:', uploadError);
      
      // Fallback for failed uploads - store as data URL
      const mockPublicId = `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      return { 
        success: true, 
        data: {
          public_id: mockPublicId,
          secure_url: fileStr,  // Return the full data URL
          format: 'data_url',
          bytes: fileStr.length,
          resource_type: 'image',
          created_at: new Date().toISOString(),
          is_fallback: true
        },
        is_fallback: true 
      };
    }
  } catch (error) {
    console.error('Cloudinary handler error:', error);
    // Detailed error logging
    console.error('Error details:', {
      message: error.message,
      code: error.http_code || 'none',
      name: error.name,
      stack: error.stack ? 'available' : 'not available'
    });
    
    // Ultimate fallback - return the data URL directly
    return { 
      success: true,  // Return success to allow the app to continue
      is_error_fallback: true,
      data: {
        public_id: `error_fallback_${Date.now()}`,
        secure_url: fileStr,  // Return the full data URL
        format: 'data_url',
        is_error_fallback: true
      },
      error: error.message
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