// Standalone test endpoint for Cloudinary functionality
// This provides a direct way to test if Cloudinary is working

const cloudinary = require('cloudinary').v2;
const utils = require('./utils');

// Test image - a 1x1 transparent pixel in base64
const TEST_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

module.exports = async (req, res) => {
  try {
    // 1. Check if Cloudinary env vars are set
    const envCheck = {
      CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET
    };
    
    console.log('Cloudinary test - env vars check:', envCheck);
    
    if (!envCheck.CLOUDINARY_CLOUD_NAME || !envCheck.CLOUDINARY_API_KEY || !envCheck.CLOUDINARY_API_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary environment variables not properly set',
        envCheck
      });
    }
    
    // 2. Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
    
    // 3. Try to get account info
    console.log('Cloudinary test - attempting to get account info...');
    const accountInfo = await cloudinary.api.usage();
    
    // 4. Try to upload a test image
    console.log('Cloudinary test - attempting to upload test image...');
    const uploadResult = await utils.handleCloudinaryUpload(cloudinary, TEST_IMAGE, {
      folder: 'tests',
      public_id: `test_${Date.now()}`
    });
    
    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary test upload failed',
        error: uploadResult.error,
        accountInfo
      });
    }
    
    // 5. Delete the test image
    console.log('Cloudinary test - cleaning up test image...');
    const deleteResult = await cloudinary.uploader.destroy(uploadResult.data.public_id);
    
    res.status(200).json({
      success: true,
      message: 'Cloudinary connection test successful',
      accountInfo: {
        plan: accountInfo.plan,
        credits: accountInfo.credits,
        usage: accountInfo.usage
      },
      testUpload: {
        public_id: uploadResult.data.public_id,
        format: uploadResult.data.format,
        deleted: deleteResult.result === 'ok'
      }
    });
  } catch (error) {
    console.error('Cloudinary test error:', error);
    res.status(500).json({
      success: false,
      message: 'Cloudinary connection test failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};