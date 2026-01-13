const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Project = require('./models/Project');
const List = require('./models/List');
const Task = require('./models/Task');

require('dotenv').config();

const seedSampleData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/projectmanager');

    // Find or create admin user
    let admin = await User.findOne({ email: 'admin@example.com' });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created');
    }

    // Create sample project
    let project = await Project.findOne({ name: 'Sample Project' });
    if (!project) {
      project = new Project({
        name: 'Sample Project',
        description: 'A sample project for demonstration',
        owner: admin._id,
        members: [admin._id]
      });
      await project.save();
      console.log('Sample project created');
    }

    // Create sample list
    let list = await List.findOne({ name: 'To Do', project: project._id });
    if (!list) {
      list = new List({
        name: 'To Do',
        project: project._id,
        order: 1
      });
      await list.save();
      console.log('Sample list created');
    }

    // Create sample tasks
    const tasks = [
      {
        name: 'Design system architecture',
        description: 'Create the overall system design and architecture',
        list: list._id,
        assignee: admin._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        priority: 'high',
        status: 'inprogress'
      },
      {
        name: 'Implement user authentication',
        description: 'Build login and registration functionality',
        list: list._id,
        assignee: admin._id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        priority: 'high',
        status: 'todo'
      },
      {
        name: 'Create project dashboard',
        description: 'Build the main dashboard for project management',
        list: list._id,
        assignee: admin._id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        priority: 'medium',
        status: 'todo'
      },
      {
        name: 'Setup database schema',
        description: 'Design and implement the database structure',
        list: list._id,
        assignee: admin._id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        priority: 'high',
        status: 'closed'
      },
      {
        name: 'API development',
        description: 'Develop RESTful APIs for the application',
        list: list._id,
        assignee: admin._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        priority: 'high',
        status: 'in_review'
      },
      {
        name: 'Frontend components',
        description: 'Build reusable React components',
        list: list._id,
        assignee: admin._id,
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        priority: 'medium',
        status: 'await_release'
      },
      {
        name: 'Bug fixes',
        description: 'Fix reported bugs and issues',
        list: list._id,
        assignee: admin._id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        priority: 'high',
        status: 'reopened'
      }
    ];

    for (const taskData of tasks) {
      const existingTask = await Task.findOne({ name: taskData.name });
      if (!existingTask) {
        const task = new Task(taskData);
        await task.save();
        console.log(`Task "${taskData.name}" created`);
      }
    }

    console.log('Sample data seeding completed!');
    console.log('Login with: admin@example.com / admin123');

  } catch (error) {
    console.error('Error seeding sample data:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedSampleData();