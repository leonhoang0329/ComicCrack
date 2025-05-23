# Required Environment Variables for KinFlick

This document lists all the environment variables required for the KinFlick application to function properly when deployed to Vercel.

## Core Environment Variables

| Variable Name | Description | Example Value |
|---------------|-------------|--------------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret key for JWT token generation | `your-secret-key-at-least-32-chars-long` |

## Cloudinary Configuration

| Variable Name | Description | Example Value |
|---------------|-------------|--------------|
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret | `your-api-secret` |

## Finding Your Cloudinary Credentials

1. Sign in to your [Cloudinary Console](https://cloudinary.com/console)
2. Your cloud name, API key, and API secret are displayed on the dashboard
3. Alternatively, go to Settings > Access Keys in the Cloudinary Console

## Setting Up Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Select "Environment Variables" from the left sidebar
4. Add each variable with its name and value
5. Choose the appropriate environments (Production, Preview, Development)
6. Click "Save" to apply the changes

## Important Notes

- **NEVER commit these variables to your repository**
- The application will use a local fallback for missing Cloudinary credentials, but functionality will be limited
- MongoDB connection is required for the application to store user data, photos, and diary entries
- JWT_SECRET is necessary for secure user authentication

## Verifying Configuration

After deployment, you can check if your environment variables are correctly set by visiting:

`https://your-vercel-domain.vercel.app/api/debug-env`

This endpoint will show which variables are set (true/false) without revealing their values.