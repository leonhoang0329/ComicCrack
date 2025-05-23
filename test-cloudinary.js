/**
 * Simple script to test Cloudinary configuration and upload functionality
 * 
 * Usage:
 * 1. Set environment variables CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET
 * 2. Run: node test-cloudinary.js
 */

// Load environment variables
require('dotenv').config();

// Import Cloudinary
const cloudinary = require('cloudinary').v2;

// A small test image in base64 format
const TEST_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

async function testCloudinary() {
  console.log('====== CLOUDINARY TEST SCRIPT ======');
  
  // Check for environment variables
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  console.log('Environment variables present:');
  console.log(`- CLOUDINARY_CLOUD_NAME: ${cloudName ? 'YES' : 'NO'}`);
  console.log(`- CLOUDINARY_API_KEY: ${apiKey ? 'YES' : 'NO'}`);
  console.log(`- CLOUDINARY_API_SECRET: ${apiSecret ? 'YES' : 'NO'}`);
  
  if (!cloudName || !apiKey || !apiSecret) {
    console.error('\n❌ ERROR: Missing required environment variables');
    console.log('\nPlease set the following environment variables:');
    console.log('  CLOUDINARY_CLOUD_NAME=your_cloud_name');
    console.log('  CLOUDINARY_API_KEY=your_api_key');
    console.log('  CLOUDINARY_API_SECRET=your_api_secret');
    console.log('\nThen run this script again.');
    return;
  }
  
  // Configure Cloudinary
  console.log('\nConfiguring Cloudinary...');
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
  
  try {
    // Test API access
    console.log('\nTesting API access...');
    const accountInfo = await cloudinary.api.usage();
    console.log('✅ API access successful');
    console.log(`   Plan: ${accountInfo.plan}`);
    
    // Test upload
    console.log('\nTesting upload functionality...');
    const uploadResult = await cloudinary.uploader.upload(TEST_IMAGE, {
      folder: 'tests',
      public_id: `test_${Date.now()}`
    });
    console.log('✅ Upload successful');
    console.log(`   Public ID: ${uploadResult.public_id}`);
    console.log(`   URL: ${uploadResult.secure_url}`);
    
    // Test delete
    console.log('\nTesting delete functionality...');
    const deleteResult = await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log(`✅ Delete successful: ${deleteResult.result}`);
    
    console.log('\n✅ All tests passed! Cloudinary is correctly configured.');
  } catch (error) {
    console.error('\n❌ ERROR: Cloudinary test failed');
    console.error(`   Message: ${error.message}`);
    console.error(`   Details: ${JSON.stringify(error, null, 2)}`);
  }
}

// Run the test
testCloudinary().catch(err => {
  console.error('Unhandled error:', err);
});