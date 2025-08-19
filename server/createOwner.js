const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

// TODO: Replace with your actual MongoDB connection string
const MONGODB_URI = 'mongodb://localhost:27017/goldproject'; // <-- EDIT THIS

// Example owner account details (edit as needed)
const ownerData = {
  username: 'owner1',
  email: 'owner@gmail.com',
  password: '123456', // Plain text, will be hashed
  role: 'owner',
};

async function createOwner() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existing = await User.findOne({ email: ownerData.email });
    if (existing) {
      console.log('User with this email already exists.');
      process.exit(1);
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(ownerData.password, saltRounds);

    // Create the owner user
    const owner = new User({
      username: ownerData.username,
      email: ownerData.email,
      password: hashedPassword,
      role: ownerData.role,
    });
    await owner.save();
    console.log('Owner account created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error creating owner:', err);
    process.exit(1);
  }
}

createOwner(); 