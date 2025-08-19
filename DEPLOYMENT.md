# Railway Deployment Guide

## Prerequisites
- Railway account
- MongoDB database (MongoDB Atlas recommended)
- Git repository

## Deployment Steps

### 1. Prepare Your Repository
- Ensure all changes are committed to Git
- Make sure `.env` files are in `.gitignore`

### 2. Deploy to Railway

#### Option A: Using Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize Railway project
railway init

# Deploy
railway up
```

#### Option B: Using Railway Dashboard
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository
5. Railway will automatically detect it's a Node.js project

### 3. Configure Environment Variables
In Railway dashboard, go to your project → Variables tab and add:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
CLIENT_URL=https://your-frontend-domain.railway.app
```

### 4. Deploy Frontend (Separate Service)
For the React frontend, you have two options:

#### Option A: Deploy as separate Railway service
1. Create a new service in Railway
2. Point to the same repository but set the source directory to `client`
3. Set build command: `npm run build`
4. Set start command: `npx serve -s build -l $PORT`

#### Option B: Use Vercel/Netlify for frontend
1. Deploy frontend to Vercel or Netlify
2. Update `CLIENT_URL` in Railway to point to your frontend domain

### 5. Update CORS (if needed)
If you deploy frontend separately, update the `CLIENT_URL` environment variable in Railway to match your frontend domain.

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | Yes |
| `PORT` | Server port (Railway sets this) | No |
| `CLIENT_URL` | Frontend URL for CORS | Yes |
| `RAILWAY_STATIC_URL` | Railway static URL (auto-set) | No |

## Troubleshooting

### Common Issues:
1. **Build fails**: Check if all dependencies are in `package.json`
2. **Database connection fails**: Verify `MONGO_URI` is correct
3. **CORS errors**: Ensure `CLIENT_URL` is set correctly
4. **Port issues**: Railway automatically sets `PORT` environment variable

### Health Check
Your app includes a health check endpoint at `/` that returns "API is running..."

### Logs
Check Railway logs in the dashboard for debugging information.
