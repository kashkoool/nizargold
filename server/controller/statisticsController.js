const Product = require('../models/Product');
const Comment = require('../models/Comment');

// Get products statistics for owner dashboard
exports.getProductsStatistics = async (req, res) => {
  try {
    const ownerId = req.user._id;

    // Get all products for this owner
    const products = await Product.find({ owner: ownerId })
      .populate('likes', 'username')
      .lean();

    console.log(`Found ${products.length} products for owner ${ownerId}`);
    console.log('Products:', products.map(p => ({ id: p._id, name: p.name, likes: p.likes?.length || 0 })));

    // Debug: Check if there are any likes at all
    const allLikes = products.reduce((sum, product) => sum + (product.likes?.length || 0), 0);
    console.log(`Total likes across all products: ${allLikes}`);

    // Debug: Check all products in the database
    const allProductsInDB = await Product.find({}).populate('likes', 'username').populate('owner', 'username');
    console.log('All products in database:', allProductsInDB.map(p => ({ 
      name: p.name, 
      owner: p.owner?.username || 'Unknown',
      likes: p.likes?.length || 0,
      material: p.material
    })));

    // Debug: Check if there are any comments at all
    const allComments = await Comment.countDocuments({ product: { $in: products.map(p => p._id) } });
    console.log(`Total comments across all products: ${allComments}`);

    // Debug: Check all comments in the database
    const allCommentsInDB = await Comment.find({}).populate('product', 'name').populate('user', 'username');
    console.log('All comments in database:', allCommentsInDB.map(c => ({ 
      product: c.product?.name || 'Unknown', 
      user: c.user?.username || 'Unknown',
      content: c.content.substring(0, 50) + '...'
    })));

    // Get comments count for each product
    const commentsCount = await Comment.aggregate([
      {
        $match: {
          product: { $in: products.map(p => p._id) }
        }
      },
      {
        $group: {
          _id: '$product',
          count: { $sum: 1 }
        }
      }
    ]);

    // Create a map of product ID to comments count
    const commentsMap = {};
    commentsCount.forEach(item => {
      commentsMap[item._id.toString()] = item.count;
    });

    console.log(`Found comments for ${commentsCount.length} products`);
    console.log('Comments map:', commentsMap);

    // Add comments count to products
    const productsWithComments = products.map(product => ({
      ...product,
      commentsCount: commentsMap[product._id.toString()] || 0
    }));

    // Get most liked products (top 5)
    const mostLikedProducts = [...productsWithComments]
      .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
      .slice(0, 5)
      .map(product => ({
        _id: product._id,
        name: product.name,
        material: product.material,
        likes: product.likes?.length || 0,
        commentsCount: product.commentsCount,
        totalPrice: product.totalPrice,
        images: product.images,
        pinned: product.pinned,
        createdAt: product.createdAt
      }));

    console.log('Most liked products:', mostLikedProducts.map(p => ({ name: p.name, likes: p.likes, comments: p.commentsCount })));

    // Get most commented products (top 5)
    const mostCommentedProducts = [...productsWithComments]
      .sort((a, b) => b.commentsCount - a.commentsCount)
      .slice(0, 5)
      .map(product => ({
        _id: product._id,
        name: product.name,
        material: product.material,
        likes: product.likes?.length || 0,
        commentsCount: product.commentsCount,
        totalPrice: product.totalPrice,
        images: product.images,
        pinned: product.pinned,
        createdAt: product.createdAt
      }));

    console.log('Most commented products:', mostCommentedProducts.map(p => ({ name: p.name, likes: p.likes, comments: p.commentsCount })));

    // Get overall statistics
    const totalProducts = products.length;
    const totalLikes = products.reduce((sum, product) => sum + (product.likes?.length || 0), 0);
    const totalComments = productsWithComments.reduce((sum, product) => sum + product.commentsCount, 0);
    const pinnedProducts = products.filter(p => p.pinned).length;

    console.log('Overall stats calculation:');
    console.log('- Total products:', totalProducts);
    console.log('- Total likes:', totalLikes);
    console.log('- Total comments:', totalComments);
    console.log('- Pinned products:', pinnedProducts);

    // Get material distribution
    const materialStats = products.reduce((acc, product) => {
      const material = product.material;
      if (!acc[material]) {
        acc[material] = { count: 0, likes: 0, comments: 0 };
      }
      acc[material].count++;
      acc[material].likes += product.likes?.length || 0;
      acc[material].comments += commentsMap[product._id.toString()] || 0;
      return acc;
    }, {});

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentProducts = products.filter(p => new Date(p.createdAt) >= sevenDaysAgo).length;
    
    // For recent likes, we need to check if likes have timestamps
    // Since likes array doesn't have timestamps, we'll use a simpler approach
    const recentLikes = 0; // Placeholder - would need to track like timestamps separately
    
    const recentComments = await Comment.countDocuments({
      product: { $in: products.map(p => p._id) },
      createdAt: { $gte: sevenDaysAgo }
    });

    const response = {
      mostLikedProducts: mostLikedProducts || [],
      mostCommentedProducts: mostCommentedProducts || [],
      overallStats: {
        totalProducts: totalProducts || 0,
        totalLikes: totalLikes || 0,
        totalComments: totalComments || 0,
        pinnedProducts: pinnedProducts || 0,
        recentProducts: recentProducts || 0,
        recentLikes: recentLikes || 0,
        recentComments: recentComments || 0
      },
      materialStats: materialStats || {}
    };

    console.log('Sending statistics response:', response);
    res.json(response);

  } catch (err) {
    console.error('Error getting products statistics:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get detailed statistics for a specific product
exports.getProductDetailedStats = async (req, res) => {
  try {
    const { productId } = req.params;
    const ownerId = req.user._id;

    // Verify product belongs to owner
    const product = await Product.findOne({ _id: productId, owner: ownerId })
      .populate('likes', 'username')
      .lean();

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get comments for this product
    const comments = await Comment.find({ product: productId })
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .lean();

    // Get likes timeline (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Since likes don't have timestamps, we'll use a placeholder
    const recentLikes = 0; // Placeholder - would need to track like timestamps separately

    // Get comments timeline (last 30 days)
    const recentComments = comments.filter(comment => 
      new Date(comment.createdAt) >= thirtyDaysAgo
    );

    res.json({
      product: {
        _id: product._id,
        name: product.name,
        material: product.material,
        totalPrice: product.totalPrice,
        images: product.images,
        pinned: product.pinned,
        createdAt: product.createdAt
      },
      stats: {
        totalLikes: product.likes?.length || 0,
        totalComments: comments.length,
        recentLikes: recentLikes,
        recentComments: recentComments.length
      },
      likes: product.likes || [],
      comments: comments.slice(0, 10) // Show last 10 comments
    });

  } catch (err) {
    console.error('Error getting product detailed stats:', err);
    res.status(500).json({ message: err.message });
  }
}; 