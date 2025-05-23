/**
 * Build script for Vercel deployment verification
 * This file ensures that the serverless function dependencies are properly installed
 */

const fs = require('fs');
const path = require('path');

// Verify package.json exists in root
try {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = require(packageJsonPath);
  
  // Log the dependencies for verification
  console.log('✅ Root package.json found with dependencies:');
  
  // Check for required dependencies
  const requiredDeps = [
    'express', 
    'mongoose', 
    'cloudinary', 
    'multer', 
    'jsonwebtoken',
    'bcryptjs'
  ];
  
  const missingDeps = [];
  
  for (const dep of requiredDeps) {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`  - ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`  - ❌ ${dep}: MISSING`);
      missingDeps.push(dep);
    }
  }
  
  if (missingDeps.length > 0) {
    console.warn('⚠️ Missing dependencies in root package.json:', missingDeps.join(', '));
  } else {
    console.log('✅ All required dependencies found in root package.json');
  }
  
} catch (error) {
  console.error('❌ Error reading package.json:', error.message);
}

// Verify api/index.js exists
try {
  if (fs.existsSync(path.join(__dirname, 'index.js'))) {
    console.log('✅ api/index.js file exists');
  } else {
    console.error('❌ api/index.js file is missing');
  }
} catch (error) {
  console.error('❌ Error checking for api/index.js:', error.message);
}

// Verify api/utils.js exists
try {
  if (fs.existsSync(path.join(__dirname, 'utils.js'))) {
    console.log('✅ api/utils.js file exists');
  } else {
    console.error('❌ api/utils.js file is missing');
  }
} catch (error) {
  console.error('❌ Error checking for api/utils.js:', error.message);
}

// Verify environment variables (without logging actual values)
console.log('Environment variable check:');
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (process.env[envVar]) {
    console.log(`  - ${envVar}: ✅ Set`);
  } else {
    console.log(`  - ${envVar}: ❌ NOT SET`);
  }
}

console.log('Build verification complete');