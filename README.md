# KinFlick Comic Panel Generator

An application that uses Claude Vision to transform your photos into comic panels with witty punchlines and stories.

## Features

- Upload and manage photos
- Generate comic panels with AI-powered captions and stories
- View your comic panels
- Download comic panels as PDF

## Local Development

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (optional)
- Claude API key

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
   - (Optional) Add MongoDB connection string: `MONGODB_URI=your_mongodb_uri`

4. Start the application:
   ```
   bash unified-start.sh
   ```

## Deployment

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