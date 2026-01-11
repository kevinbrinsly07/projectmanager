import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import Login from './components/Login';
import Register from './components/Register';
import Admin from './components/Admin';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
