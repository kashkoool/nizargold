const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  process.exit(1);
}

if (!process.env.JWT_REFRESH_SECRET) {
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// User Controller
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'اسم المستخدم أو البريد الإلكتروني مستخدم بالفعل' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user
    const user = new User({ username, email, password: hashedPassword, role: role || 'customer' });
    await user.save();
    // Generate access token (short-lived)
    const accessToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
    // Generate refresh token (long-lived)
    const refreshToken = jwt.sign({ id: user._id, role: user.role }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    
    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Return user info and access token
    res.status(201).json({
      token: accessToken,
      refreshToken: refreshToken, // Also send refresh token in response body
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الحساب' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    
    if (!password || (!email && !username)) {
      return res.status(400).json({ message: 'Email or username and password are required.' });
    }
    
    // Find user by email or username
    const user = await User.findOne(email ? { email } : { username });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    
    // Generate access token (short-lived)
    const accessToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
    
    // Generate refresh token (long-lived)
    const refreshToken = jwt.sign({ id: user._id, role: user.role }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    
    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    const responseData = {
      token: accessToken,
      refreshToken: refreshToken, // Also send refresh token in response body
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
    
    // Return user info and access token
    res.json(responseData);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.logout = async (req, res) => {
  try {
    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    
    // Optionally: Add the refresh token to a blacklist in database
    // This prevents reuse of the refresh token even if it hasn't expired
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (refreshToken && req.user) {
      // You can implement a token blacklist here
      // await BlacklistedToken.create({ token: refreshToken, userId: req.user.id });
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error during logout' });
  }
};

// Refresh token endpoint
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token' });
    }
    
    let payload;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (verifyError) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    // Verify user still exists
    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Generate new access token
    const accessToken = jwt.sign({ id: payload.id, role: payload.role }, JWT_SECRET, { expiresIn: '15m' });
    
    res.json({ token: accessToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 