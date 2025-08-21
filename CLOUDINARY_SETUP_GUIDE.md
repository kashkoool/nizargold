# Cloudinary Setup Guide for FNizar

## 🚀 **Why Cloudinary?**
- ✅ **Free Tier**: 25GB storage + 25GB bandwidth/month
- ✅ **Easy Setup**: Simple API integration
- ✅ **Image Optimization**: Automatic resizing and compression
- ✅ **CDN**: Fast global delivery
- ✅ **No Credit Card Required**: Free tier available immediately

## 📋 **Step 1: Create Cloudinary Account**

1. **Go to**: https://cloudinary.com/
2. **Click**: "Sign Up For Free"
3. **Fill in**: Your details
4. **Verify**: Your email
5. **Get your credentials** from the dashboard

## 🔑 **Step 2: Get Your Credentials**

After signing up, you'll get:
```javascript
CLOUDINARY_CLOUD_NAME = "your_cloud_name"
CLOUDINARY_API_KEY = "123456789012345"
CLOUDINARY_API_SECRET = "your_secret_key"
```

## 📦 **Step 3: Install Cloudinary**

```bash
cd server
npm install cloudinary multer-storage-cloudinary
```

## ⚙️ **Step 4: Update Environment Variables**

Add to your `.env` file:
```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_secret_key

# Image Storage Type (base64 or cloudinary)
IMAGE_STORAGE_TYPE=cloudinary
```

## 🔧 **Step 5: Create Cloudinary Configuration**

Create `server/config/cloudinary.js`:
```javascript
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fnizar-products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' }
    ],
  },
});

// Configure multer
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
    }
  }
});

module.exports = { cloudinary, upload };
```

## 🔄 **Step 6: Update Product Controller**

Update `server/controller/productController.js`:
```javascript
const { cloudinary } = require('../config/cloudinary');

// In createProduct function:
const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    
    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const imageUrls = req.files.map(file => ({
        url: file.path,
        publicId: file.filename
      }));
      productData.images = imageUrls;
    }
    
    // Rest of your existing code...
  } catch (error) {
    // Error handling...
  }
};

// In updateProduct function:
const updateProduct = async (req, res) => {
  try {
    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => ({
        url: file.path,
        publicId: file.filename
      }));
      
      // Delete old images from Cloudinary
      if (product.images && product.images.length > 0) {
        for (const image of product.images) {
          if (image.publicId) {
            await cloudinary.uploader.destroy(image.publicId);
          }
        }
      }
      
      productData.images = newImageUrls;
    }
    
    // Rest of your existing code...
  } catch (error) {
    // Error handling...
  }
};
```

## 🗑️ **Step 7: Add Image Deletion Function**

Add to `server/utils/cloudinaryUtils.js`:
```javascript
const { cloudinary } = require('../config/cloudinary');

const deleteImage = async (publicId) => {
  try {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

const deleteMultipleImages = async (images) => {
  try {
    for (const image of images) {
      if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId);
      }
    }
  } catch (error) {
    console.error('Error deleting images from Cloudinary:', error);
  }
};

module.exports = { deleteImage, deleteMultipleImages };
```

## 🔄 **Step 8: Update Frontend Image Utility**

Update `client/src/utils/imageUtils.js`:
```javascript
export const getImageUrl = (images, index = 0) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return 'https://via.placeholder.com/300x300?text=Product';
  }
  
  const image = images[index];
  
  // Cloudinary format: object with url property
  if (image && typeof image === 'object' && image.url) {
    return image.url;
  }
  
  // Base64 format: object with url property (data:image/...)
  if (image && typeof image === 'object' && image.url && image.url.startsWith('data:')) {
    return image.url;
  }
  
  // Old format: string URL
  if (typeof image === 'string') {
    return image;
  }
  
  return 'https://via.placeholder.com/300x300?text=Product';
};
```

## 🚀 **Step 9: Test the Setup**

1. **Start your server**:
   ```bash
   cd server
   npm start
   ```

2. **Test image upload**:
   - Go to owner dashboard
   - Add a new product with image
   - Check if image appears correctly

3. **Verify in Cloudinary**:
   - Go to your Cloudinary dashboard
   - Check the "fnizar-products" folder
   - Your uploaded images should be there

## 📊 **Migration from Base64 to Cloudinary**

If you want to migrate existing Base64 images:

```javascript
// Migration script (run once)
const migrateImages = async () => {
  const products = await Product.find({});
  
  for (const product of products) {
    if (product.images && product.images.length > 0) {
      const newImages = [];
      
      for (const image of product.images) {
        if (typeof image === 'string' && image.startsWith('data:')) {
          // Upload Base64 to Cloudinary
          const result = await cloudinary.uploader.upload(image, {
            folder: 'fnizar-products',
            transformation: [
              { width: 800, height: 800, crop: 'limit' },
              { quality: 'auto', fetch_format: 'auto' }
            ]
          });
          
          newImages.push({
            url: result.secure_url,
            publicId: result.public_id
          });
        } else {
          newImages.push(image);
        }
      }
      
      product.images = newImages;
      await product.save();
    }
  }
};
```

## 💰 **Cost Comparison**

| Storage Type | Free Tier | Monthly Cost (After Free) |
|--------------|-----------|---------------------------|
| **Base64 (MongoDB)** | 512MB | $0.25/GB |
| **Cloudinary** | 25GB | $0.04/GB |
| **AWS S3** | 5GB | $0.023/GB |
| **Firebase** | 5GB | $0.026/GB |

## 🎯 **Recommendation**

**For FNizar, I recommend Cloudinary because:**
- ✅ **Easiest setup** for your current codebase
- ✅ **Generous free tier** (25GB vs 5GB others)
- ✅ **Automatic optimization** saves bandwidth
- ✅ **CDN delivery** for fast loading
- ✅ **No credit card required** to start

**Next Steps:**
1. Create Cloudinary account (5 minutes)
2. Follow the setup guide above (30 minutes)
3. Test with a few products
4. Migrate existing images if needed

Would you like me to help you implement Cloudinary step by step? 🚀
