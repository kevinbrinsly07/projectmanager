const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/projectmanager');

    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('User promoted to admin!');
      } else {
        console.log('Admin already exists!');
      }
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      console.log('Role: admin');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedAdmin();