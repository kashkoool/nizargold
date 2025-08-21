const Product = require('../models/Product');
const base64ImageStorage = require('../utils/base64ImageStorage');

// Helper: Validate stones for diamond
function validateDiamondStones(stones) {
  const allowedTypes = ['FL','IF','VVS1','VVS2','VS1','VS2','SI1','SI2','I1','I2','I3'];
  const allowedColors = ['D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
  for (const stone of stones) {
    if (!allowedTypes.includes(stone.type)) {
      return `Invalid stone type: ${stone.type}`;
    }
    if (!allowedColors.includes(stone.color)) {
      return `Invalid stone color: ${stone.color}`;
    }
    if (typeof stone.count !== 'number' || stone.count < 1) {
      return `Invalid stone count: ${stone.count}`;
    }
    // caratPrice, totalPrice, totalWeight are validated by schema
  }
  return null;
}

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    let images = [];
    
    // Save images as base64 in MongoDB if files are provided
    if (req.files && req.files.length > 0) {
      try {
        // Convert uploaded files to base64 (already done in middleware)
        images = req.files.map(file => ({
          url: file.url,
          public_id: file.public_id
        }));
      } catch (uploadError) {
        return res.status(500).json({ message: 'Error saving images' });
      }
    }
    const { productType, material, stones } = req.body;
    // Parse arrays if sent as JSON strings (from FormData)
    let ringSizes = req.body.ringSizes;
    let setAccessories = req.body.setAccessories;
    let sizes = req.body.sizes;
    let setComponents = req.body.setComponents;
    let diamonds = req.body.diamonds;
    
    if (typeof ringSizes === 'string') {
      try { ringSizes = JSON.parse(ringSizes); } catch { ringSizes = []; }
    }
    if (typeof setAccessories === 'string') {
      try { setAccessories = JSON.parse(setAccessories); } catch { setAccessories = []; }
    }
    if (typeof sizes === 'string') {
      try { sizes = JSON.parse(sizes); } catch { sizes = []; }
    }
    if (typeof setComponents === 'string') {
      try { setComponents = JSON.parse(setComponents); } catch { setComponents = []; }
    }
    if (typeof diamonds === 'string') {
      try { diamonds = JSON.parse(diamonds); } catch { diamonds = []; }
    }
    
    // Parse images if sent as JSON string (only if no files were uploaded)
    if (!req.files || req.files.length === 0) {
      const bodyImages = req.body.images;
      if (typeof bodyImages === 'string') {
        try { images = JSON.parse(bodyImages); } catch { images = []; }
      }
    }
    
    // Parse gramPrice and totalPrice if sent as JSON strings
    let gramPrice = req.body.gramPrice;
    let totalPrice = req.body.totalPrice;
    if (typeof gramPrice === 'string') {
      try { gramPrice = JSON.parse(gramPrice); } catch { gramPrice = { usd: 0, syp: 0 }; }
    }
    if (typeof totalPrice === 'string') {
      try { totalPrice = JSON.parse(totalPrice); } catch { totalPrice = { usd: 0, syp: 0 }; }
    }
    // Validate ringSizes and setAccessories
    const isRing = productType === 'خاتم' || productType === 'محبس';
    const isSetWithRing = productType === 'طقم' && setAccessories && Array.isArray(setAccessories) && (setAccessories.includes('خاتم') || setAccessories.includes('ring'));
    
    // Ensure ringSizes and setAccessories are arrays
    if (!Array.isArray(ringSizes)) ringSizes = [];
    if (!Array.isArray(setAccessories)) setAccessories = [];
    
    if ((isRing || isSetWithRing) && ringSizes.length === 0) {
      return res.status(400).json({ message: 'ringSizes are required for خاتم أو محبس أو طقم مع خاتم' });
    }
    if (!(isRing || isSetWithRing) && ringSizes.length > 0) {
      return res.status(400).json({ message: 'ringSizes only allowed for خاتم أو محبس أو طقم مع خاتم' });
    }
    if (productType === 'طقم' && setAccessories.length === 0) {
      return res.status(400).json({ message: 'setAccessories are required for طقم' });
    }
    if (productType !== 'طقم' && setAccessories.length > 0) {
      return res.status(400).json({ message: 'setAccessories only allowed for طقم' });
    }
    // Validate stones for diamond
    let stonesArr = stones;
    if (typeof stones === 'string') {
      stonesArr = JSON.parse(stones);
    }
    if (material === 'ألماس' && stonesArr && stonesArr.length > 0) {
      const error = validateDiamondStones(stonesArr);
      if (error) return res.status(400).json({ message: error });
    }
    // Parse createdAt if sent as a string (from FormData)
    let createdAt = req.body.createdAt;
    if (typeof createdAt === 'string') {
      try { createdAt = new Date(JSON.parse(createdAt)); } catch { createdAt = new Date(); }
    }
    const productData = {
      ...req.body,
      stones: stonesArr,
      ringSizes,
      setAccessories,
      sizes,
      setComponents,
      diamonds,
      images,
      owner: req.user._id,
      createdAt,
      gramPrice,
      totalPrice
    };
    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all products (public, or filter by owner if authenticated and owner)
exports.getProducts = async (req, res) => {
  try {
    let filter = {};
    if (req.user && req.user.role === 'owner') {
      filter = { owner: req.user._id };
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .sort({ pinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);
    const hasMore = skip + products.length < total;

    res.json({ products, hasMore });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single product by ID (public, or restrict to owner if authenticated and owner)
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (req.user && req.user.role === 'owner' && !product.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (!product.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    

    const { productType, material, stones } = req.body;
    
    // Parse arrays and objects that might be sent as JSON strings from FormData
    let ringSizes = req.body.ringSizes;
    let setAccessories = req.body.setAccessories;
    let gramPrice = req.body.gramPrice;
    let totalPrice = req.body.totalPrice;
    let sizes = req.body.sizes;
    let setComponents = req.body.setComponents;
    let diamonds = req.body.diamonds;
    
    // Parse ringSizes if sent as JSON string
    if (typeof ringSizes === 'string') {
      try { ringSizes = JSON.parse(ringSizes); } catch { ringSizes = []; }
    }
    
    // Parse setAccessories if sent as JSON string
    if (typeof setAccessories === 'string') {
      try { setAccessories = JSON.parse(setAccessories); } catch { setAccessories = []; }
    }
    
    // Parse gramPrice if sent as JSON string
    if (typeof gramPrice === 'string') {
      try { gramPrice = JSON.parse(gramPrice); } catch { gramPrice = { usd: 0, syp: 0 }; }
    }
    
    // Parse totalPrice if sent as JSON string
    if (typeof totalPrice === 'string') {
      try { totalPrice = JSON.parse(totalPrice); } catch { totalPrice = { usd: 0, syp: 0 }; }
    }
    
    // Parse sizes if sent as JSON string
    if (typeof sizes === 'string') {
      try { sizes = JSON.parse(sizes); } catch { sizes = []; }
    }
    
    // Parse setComponents if sent as JSON string
    if (typeof setComponents === 'string') {
      try { setComponents = JSON.parse(setComponents); } catch { setComponents = []; }
    }
    
    // Parse diamonds if sent as JSON string
    if (typeof diamonds === 'string') {
      try { diamonds = JSON.parse(diamonds); } catch { diamonds = []; }
    }
    
    // Parse images if sent as JSON string
    let bodyImages = req.body.images;
    if (typeof bodyImages === 'string') {
      try { bodyImages = JSON.parse(bodyImages); } catch { bodyImages = []; }
    }
    
    // Validate ringSizes and setAccessories
    const isRing = productType === 'خاتم' || productType === 'محبس';
    const isSetWithRing = productType === 'طقم' && setAccessories && Array.isArray(setAccessories) && (setAccessories.includes('خاتم') || setAccessories.includes('ring'));
    
    // Ensure ringSizes and setAccessories are arrays
    if (!Array.isArray(ringSizes)) ringSizes = [];
    if (!Array.isArray(setAccessories)) setAccessories = [];
    
    if ((isRing || isSetWithRing) && ringSizes.length === 0) {
      return res.status(400).json({ message: 'ringSizes are required for خاتم أو محبس أو طقم مع خاتم' });
    }
    if (!(isRing || isSetWithRing) && ringSizes.length > 0) {
      return res.status(400).json({ message: 'ringSizes only allowed for خاتم أو محبس أو طقم مع خاتم' });
    }
    if (productType === 'طقم' && setAccessories.length === 0) {
      return res.status(400).json({ message: 'setAccessories are required for طقم' });
    }
    if (productType !== 'طقم' && setAccessories.length > 0) {
      return res.status(400).json({ message: 'setAccessories only allowed for طقم' });
    }
    // Validate stones for diamond
    let stonesArr = stones;
    if (typeof stones === 'string') {
      stonesArr = JSON.parse(stones);
    }
    if (material === 'ألماس' && stonesArr && stonesArr.length > 0) {
      const error = validateDiamondStones(stonesArr);
      if (error) return res.status(400).json({ message: error });
    }
    // If new images are uploaded, replace the images array
    if (req.files && req.files.length > 0) {
      try {
        // Convert uploaded files to base64 (already done in middleware)
        const uploadedImages = req.files.map(file => ({
          url: file.url,
          public_id: file.public_id
        }));
        product.images = uploadedImages;
      } catch (uploadError) {
        return res.status(500).json({ message: 'Error saving images' });
      }
    } else if (bodyImages && Array.isArray(bodyImages)) {
      // If no new files but images array is provided, use it
      product.images = bodyImages;
    }
    
    // Create update object with properly parsed data
    const updateData = { ...req.body };
    delete updateData.images; // Remove images from body to avoid overwriting uploaded files
    
    // Remove the stringified versions and use the parsed ones
    delete updateData.stones;
    delete updateData.gramPrice;
    delete updateData.totalPrice;
    delete updateData.ringSizes;
    delete updateData.setAccessories;
    delete updateData.sizes;
    delete updateData.setComponents;
    delete updateData.diamonds;
    delete updateData.images;
    
    Object.assign(product, updateData, { 
      stones: stonesArr, 
      gramPrice, 
      totalPrice,
      ringSizes,
      setAccessories,
      sizes,
      setComponents,
      diamonds
    });
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!product.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    // Delete images (no action needed for base64 since they're in the database)
    // The images will be deleted when the product is deleted from the database
    
    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Pin or unpin a product
exports.togglePin = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (!product.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    product.pinned = !product.pinned;
    await product.save();
    res.json({ pinned: product.pinned });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle like/unlike a product
exports.toggleLike = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const userId = req.user._id;
    
    const liked = product.likes.some(id => id.equals(userId));
    
    if (liked) {
      product.likes = product.likes.filter(id => !id.equals(userId));
    } else {
      product.likes.push(userId);
    }
    
    await product.save();
    res.json({ likes: product.likes.length, liked: !liked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's favorite products
exports.getFavoriteProducts = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all products that the user has liked
    const products = await Product.find({
      likes: { $in: [userId] }
    }).sort({ createdAt: -1 });

    // Add liked property to each product
    const productsWithLiked = products.map(product => ({
      ...product.toObject(),
      liked: true,
      likes: product.likes.length
    }));

    res.json({ products: productsWithLiked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's favorite products count
exports.getFavoriteProductsCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Count all products that the user has liked
    const count = await Product.countDocuments({
      likes: { $in: [userId] }
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 