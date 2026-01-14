import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import Login from './components/Login';
import Register from './components/Register';
import Admin from './components/Admin';
import Timeline from './components/Timeline';
import Notifications from './components/Notifications';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          <Route path="/projects/:id" element={
            <Layout>
              <ProjectDetail />
            </Layout>
          } />
          <Route path="/admin" element={
            <Layout>
              <Admin />
            </Layout>
          } />
          <Route path="/timeline" element={
            <Layout>
              <Timeline />
            </Layout>
          } />
          <Route path="/notifications" element={
            <Layout>
              <Notifications />
            </Layout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
