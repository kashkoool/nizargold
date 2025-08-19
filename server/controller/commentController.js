// Comment Controller
const Comment = require('../models/Comment');
const User = require('../models/User');
const Product = require('../models/Product');

exports.addComment = async (req, res) => {
  try {
    const { product, content } = req.body;
    if (!product || !content) {
      return res.status(400).json({ message: 'Product and content are required' });
    }
    
    const comment = new Comment({
      product,
      user: req.user._id,
      content
    });
    await comment.save();
    
    // Optionally populate user info for immediate response
    await comment.populate('user', 'username');
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (!comment.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'You can only edit your own comments' });
    }
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });
    comment.content = content;
    await comment.save();
    await comment.populate('user', 'username');
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (!comment.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }
    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { product } = req.query;
    if (!product) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    const comments = await Comment.find({ product })
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 