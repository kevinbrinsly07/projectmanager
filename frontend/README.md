# Project Manager Frontend

This is the frontend application for the Project Manager, a full-stack project management tool built with React.js and Vite.

## Overview

The frontend provides a responsive, user-friendly interface for managing projects, tasks, and team collaboration. It communicates with the backend API to handle data operations.

## Tech Stack

- **React.js**: Component-based UI library
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Axios**: HTTP client for API requests
- **React Router**: Client-side routing
- **@dnd-kit**: Drag-and-drop functionality for task management
- **React Calendar Timeline**: Timeline visualization for projects

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Linting

Run ESLint to check for code issues:
```bash
npm run lint
```

## Project Structure

- `src/`: Source code
  - `components/`: Reusable UI components
  - `api/`: API service functions
  - `context/`: React context providers (e.g., AuthContext)
  - `assets/`: Static assets
- `public/`: Public assets
- `index.html`: Main HTML file

## Features

- User authentication and authorization
- Dashboard with project overview
- Project creation and management
- Task organization with drag-and-drop
- Timeline view for project schedules
- Notifications panel
- Admin interface for system management

## Contributing

Follow the main project's contributing guidelines. Ensure all changes pass linting and build successfully.
