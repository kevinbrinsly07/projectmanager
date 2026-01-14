const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://projectmanager-frontend-v1qs.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/projectmanager', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const listRoutes = require('./routes/lists');
const commentRoutes = require('./routes/comments');
const timeLogRoutes = require('./routes/timelogs');
const attachmentRoutes = require('./routes/attachments');
const { router: notificationRoutes } = require('./routes/notifications');
const searchRoutes = require('./routes/search');
const statsRoutes = require('./routes/stats');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/timelogs', timeLogRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('Project Manager API');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});