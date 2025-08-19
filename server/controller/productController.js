const Product = require('../models/Product');

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
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    const { productType, material, stones } = req.body;
    // Parse arrays if sent as JSON strings (from FormData)
    let ringSizes = req.body.ringSizes;
    let setAccessories = req.body.setAccessories;
    if (typeof ringSizes === 'string') {
      try { ringSizes = JSON.parse(ringSizes); } catch { ringSizes = []; }
    }
    if (typeof setAccessories === 'string') {
      try { setAccessories = JSON.parse(setAccessories); } catch { setAccessories = []; }
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
    if ((isRing || isSetWithRing) && (!ringSizes || ringSizes.length === 0)) {
      return res.status(400).json({ message: 'ringSizes are required for خاتم أو محبس أو طقم مع خاتم' });
    }
    if (!(isRing || isSetWithRing) && ringSizes && Array.isArray(ringSizes) && ringSizes.length > 0) {
      return res.status(400).json({ message: 'ringSizes only allowed for خاتم أو محبس أو طقم مع خاتم' });
    }
    if (productType === 'طقم' && (!setAccessories || setAccessories.length === 0)) {
      return res.status(400).json({ message: 'setAccessories are required for طقم' });
    }
    if (productType !== 'طقم' && setAccessories && Array.isArray(setAccessories) && setAccessories.length > 0) {
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
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!product.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { productType, ringSizes, setAccessories, material, stones } = req.body;
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
    if ((isRing || isSetWithRing) && (!ringSizes || ringSizes.length === 0)) {
      return res.status(400).json({ message: 'ringSizes are required for خاتم أو محبس أو طقم مع خاتم' });
    }
    if (!(isRing || isSetWithRing) && ringSizes && Array.isArray(ringSizes) && ringSizes.length > 0) {
      return res.status(400).json({ message: 'ringSizes only allowed for خاتم أو محبس أو طقم مع خاتم' });
    }
    if (productType === 'طقم' && (!setAccessories || setAccessories.length === 0)) {
      return res.status(400).json({ message: 'setAccessories are required for طقم' });
    }
    if (productType !== 'طقم' && setAccessories && setAccessories.length > 0) {
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
      product.images = req.files.map(file => `/uploads/${file.filename}`);
    }
    Object.assign(product, req.body, { stones: stonesArr, gramPrice, totalPrice });
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
    if (!product) return res.status(404).json({ message: 'Product not found' });
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
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const userId = req.user._id;
    
    console.log('❤️ Toggling like for product:', req.params.id, 'by user:', userId);
    console.log('📦 Current product likes:', product.likes.length);
    
    const liked = product.likes.some(id => id.equals(userId));
    console.log('❤️ Current liked status:', liked);
    
    if (liked) {
      product.likes = product.likes.filter(id => !id.equals(userId));
      console.log('❌ Removing like');
    } else {
      product.likes.push(userId);
      console.log('✅ Adding like');
    }
    
    await product.save();
    console.log('💾 Updated likes count:', product.likes.length);
    res.json({ likes: product.likes.length, liked: !liked });
  } catch (err) {
    console.error('💥 Error in toggleLike:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get user's favorite products
exports.getFavoriteProducts = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('🔍 Getting favorite products for user:', userId);
    
    // Find all products that the user has liked
    const products = await Product.find({
      likes: { $in: [userId] }
    }).sort({ createdAt: -1 });

    console.log('📦 Found products:', products.length);
    console.log('📦 Products:', products.map(p => ({ id: p._id, name: p.name, likes: p.likes.length })));

    // Add liked property to each product
    const productsWithLiked = products.map(product => ({
      ...product.toObject(),
      liked: true,
      likes: product.likes.length
    }));

    console.log('✅ Returning products:', productsWithLiked.length);
    res.json({ products: productsWithLiked });
  } catch (err) {
    console.error('💥 Error in getFavoriteProducts:', err);
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