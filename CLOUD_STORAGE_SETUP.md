# Cloud Storage Setup Guide

## Overview
This guide will help you set up cloud storage for your product images using Cloudinary, which will work seamlessly with your MongoDB Atlas database.

## Benefits of Cloud Storage
- ✅ Images persist across deployments
- ✅ Global CDN for fast loading
- ✅ Automatic image optimization
- ✅ Scalable storage
- ✅ No server disk space limitations
- ✅ Works perfectly with MongoDB Atlas

## Step 1: Set up Cloudinary Account

1. Go to [Cloudinary.com](https://cloudinary.com) and create a free account
2. After signing up, go to your Dashboard
3. Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret

## Step 2: Add Environment Variables

Add these to your `.env` file in the server directory:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Step 3: Install Dependencies

Run this command in your server directory:

```bash
npm install cloudinary
```

## Step 4: Run Migration (Optional)

If you have existing products with local images, run the migration script:

```bash
cd server
node scripts/migrate.js
```

This will:
- Find all products with old image format
- Upload local images to Cloudinary
- Update the database with new format
- Clean up local files

## Step 5: Test the Setup

1. Start your server: `npm start`
2. Try creating a new product with images
3. Check that images are stored in Cloudinary
4. Verify images load correctly in your frontend

## New Image Format

Images are now stored as objects instead of strings:

**Old Format:**
```json
{
  "images": ["/uploads/filename.jpg"]
}
```

**New Format:**
```json
{
  "images": [
    {
      "url": "https://res.cloudinary.com/your-cloud/image/upload/fnizar-products/filename.jpg",
      "public_id": "fnizar-products/filename"
    }
  ]
}
```

## Frontend Compatibility

The frontend has been updated with utility functions that handle both old and new formats automatically. No breaking changes for existing functionality.

## Deployment Considerations

When deploying to production:

1. **Railway/Railway**: Add the environment variables in your Railway dashboard
2. **Vercel**: Add the environment variables in your Vercel project settings
3. **Heroku**: Use `heroku config:set` to add the variables

## Cost Considerations

- **Cloudinary Free Tier**: 25 GB storage, 25 GB bandwidth/month
- **MongoDB Atlas**: Your existing plan covers database storage
- **Total Cost**: Minimal for most small to medium applications

## Troubleshooting

### Images not uploading
- Check Cloudinary credentials in `.env`
- Verify internet connection
- Check file size limits (Cloudinary free tier: 10MB per file)

### Images not displaying
- Check if the frontend is using the new `getImageUrl` utility
- Verify CORS settings if needed
- Check browser console for errors

### Migration issues
- Ensure all local image files exist before running migration
- Check MongoDB connection
- Review migration logs for specific errors

## Next Steps

1. Set up your Cloudinary account
2. Add the environment variables
3. Install the cloudinary package
4. Test with a new product
5. Run migration if you have existing products
6. Deploy to production

Your images will now be stored in the cloud and work perfectly with your MongoDB Atlas database!
