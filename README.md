# Project Manager

A full-stack project management application similar to ClickUp, built with React.js, Tailwind CSS, Express.js, and MongoDB.

## Features

- User authentication (planned)
- Project creation and management
- View project details
- Edit and delete projects
- Lists and tasks (planned)
- Team collaboration (planned)

## Tech Stack

- **Frontend:** React.js with Vite, Tailwind CSS v3
- **Backend:** Express.js, Node.js
- **Database:** MongoDB

## Getting Started

### Prerequisites

- Node.js
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies for backend and frontend
3. Start MongoDB
4. Run the application

### Running the Application

From the root directory:

```bash
# Start backend
npm run start-backend

# Start frontend
npm run start-frontend
```

Or start both:

```bash
npm start
```

The frontend will run on http://localhost:5174
The backend API will run on http://localhost:5000

## API Endpoints

- GET /api/projects - Get all projects
- POST /api/projects - Create a new project
- GET /api/projects/:id - Get project by ID (not implemented in frontend yet)
- PUT /api/projects/:id - Update project
- DELETE /api/projects/:id - Delete project