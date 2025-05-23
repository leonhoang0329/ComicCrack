# ComicCrack

An application that uses Claude Vision to transform your photos into comic panels with witty punchlines and stories.

## Features

- Upload and manage photos
- Generate comic panels with AI-powered captions and stories
- View your comic panels
- Download comic panels as PDF

## Local Development

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (optional)
- Claude API key
- Cloudinary account (for image storage)

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/leonhoang0329/ComicCrack.git
   cd ComicCrack
   ```

2. Install dependencies:
   ```
   bash install.sh
   ```

3. Set up environment variables:
   - Create a `.env` file in the `KinFlick/backend` directory
   - Add your Claude API key: `CLAUDE_API_KEY=your_api_key_here`
   - Add MongoDB connection string: `MONGODB_URI=your_mongodb_uri`
   - Add Cloudinary credentials:
     ```
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     ```
   - Add JWT secret: `JWT_SECRET=your_jwt_secret`

4. Start the application:
   ```
   bash unified-start.sh
   ```

## Vercel Deployment

### Requirements

To deploy this application on Vercel:

1. Fork or clone this repository to your GitHub account
2. Connect your GitHub repository to Vercel
3. Configure the following environment variables in the Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Secret for JWT token generation
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

### Troubleshooting Deployment Issues

If you encounter deployment issues:

1. Check that all environment variables are properly set in the Vercel dashboard
2. Verify Cloudinary credentials are correct
3. Review Vercel build logs for any specific error messages
4. Ensure MongoDB connection string is valid and accessible from Vercel's servers

## Other Deployment Options

### Frontend Deployment to GitHub Pages

1. Update the homepage in `KinFlick/frontend/package.json`:
   ```json
   "homepage": "https://leonhoang0329.github.io/ComicCrack"
   ```

2. Update the backend API URL in `.env.production`:
   ```
   REACT_APP_API_URL=https://your-backend-api-url.com
   ```

3. Deploy to GitHub Pages:
   ```
   cd KinFlick/frontend
   npm run deploy
   ```

4. Alternatively, push changes to the main branch to trigger the GitHub Actions workflow.

### Backend Deployment

#### Heroku

1. Create a new Heroku app and add environment variables:
   - `CLAUDE_API_KEY`
   - `CORS_ORIGIN` (set to your GitHub Pages URL)
   - `MONGODB_URI` (optional)

2. Deploy the backend:
   ```
   heroku git:remote -a your-heroku-app-name
   git subtree push --prefix KinFlick/backend heroku main
   ```

#### Render

1. Create a new Web Service on Render
2. Configure the build settings:
   - Build Command: `cd KinFlick/backend && npm install`
   - Start Command: `node KinFlick/backend/server.js`
3. Add environment variables as described above

## License

MIT