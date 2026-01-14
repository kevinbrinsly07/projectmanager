# Project Manager

A full-stack project management application inspired by ClickUp, built with React.js, Tailwind CSS, Express.js, and MongoDB. This application enables users to create and manage projects, organize tasks into lists, track time logs, collaborate with team members, and handle notifications.

## Features

- **User Authentication**: Secure login and registration with JWT tokens
- **Project Management**: Create, view, edit, and delete projects
- **Task Organization**: Manage tasks within lists, with drag-and-drop functionality
- **Time Tracking**: Log time spent on tasks
- **Comments and Attachments**: Add comments and upload files to tasks
- **Notifications**: Stay updated with project and task notifications
- **Admin Panel**: Administrative features for managing users and system settings
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Tech Stack

- **Frontend**: React.js with Vite, Tailwind CSS, Axios for API calls, React Router for navigation
- **Backend**: Express.js, Node.js, MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcrypt for password hashing
- **File Uploads**: Multer for handling file attachments
- **Additional Libraries**: Moment.js for date handling, @dnd-kit for drag-and-drop

## Prerequisites

- Node.js (version 14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd projectmanager
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**:
   - In the `backend` directory, create a `.env` file based on your requirements (e.g., MongoDB connection string, JWT secret)
   - Example:
     ```
     MONGO_URI=mongodb://localhost:27017/projectmanager
     JWT_SECRET=your-secret-key
     PORT=5000
     ```

5. **Start MongoDB**:
   - Ensure MongoDB is running on your system or update the connection string for MongoDB Atlas.

## Running the Application

### Development Mode

- **Start Backend**:
  ```bash
  npm run start-backend
  ```
  This runs the backend server with nodemon for auto-restart.

- **Start Frontend**:
  ```bash
  npm run start-frontend
  ```
  This starts the Vite development server.

- **Start Both** (in separate terminals or using a process manager):
  ```bash
  npm start
  ```

The application will be available at:
- Frontend: `http://localhost:5173` (default Vite port)
- Backend: `http://localhost:5000` (or as configured)

### Production Build

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Start the backend in production:
   ```bash
   cd ../backend
   npm start
   ```

## API Endpoints

The backend provides RESTful API endpoints for:
- Authentication (`/api/auth`)
- Users (`/api/users`)
- Projects (`/api/projects`)
- Tasks (`/api/tasks`)
- Lists (`/api/lists`)
- Comments (`/api/comments`)
- Attachments (`/api/attachments`)
- Time Logs (`/api/timelogs`)
- Notifications (`/api/notifications`)
- Admin (`/api/admin`)
- Search (`/api/search`)
- Stats (`/api/stats`)

Refer to the backend routes for detailed endpoint documentation.

## Seeding Data

To populate the database with sample data:
- Run `node seedAdmin.js` to create an admin user
- Run `node seedSampleData.js` to add sample projects and tasks

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by ClickUp and other project management tools
- Built with modern web technologies for a seamless user experience

The frontend will run on http://localhost:5174
The backend API will run on http://localhost:5000

## API Endpoints

- GET /api/projects - Get all projects
- POST /api/projects - Create a new project
- GET /api/projects/:id - Get project by ID (not implemented in frontend yet)
- PUT /api/projects/:id - Update project
- DELETE /api/projects/:id - Delete project