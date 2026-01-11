import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getProjects, createProject, deleteProject } from '../api/projects';
import { search } from '../api/search';
import { getNotifications, markAsRead } from '../api/notifications';
import { getUsers } from '../api/users';

const Dashboard = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ tasks: [], projects: [] });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
    else if (!loading && user) {
      fetchProjects();
      fetchNotifications();
      fetchUsers();
    }
  }, [user, loading]);

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      await createProject({ name: newProjectName, description: newProjectDescription, members: selectedMembers });
      setNewProjectName('');
      setNewProjectDescription('');
      setSelectedMembers([]);
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await deleteProject(id);
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults({ tasks: [], projects: [] });
      return;
    }
    try {
      const results = await search(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Project Manager</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="text-gray-600 hover:text-gray-900">
                Notifications ({notifications.filter(n => !n.read).length})
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-2 text-sm text-gray-500">No notifications</p>
                    ) : (
                      notifications.slice(0, 5).map(notification => (
                        <div key={notification._id} className={`px-4 py-2 border-b border-gray-100 ${!notification.read ? 'bg-blue-50' : ''}`}>
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleString()}</p>
                          {!notification.read && (
                            <button onClick={() => handleMarkAsRead(notification._id)} className="text-xs text-indigo-600">Mark as read</button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {user && user.role === 'admin' && (
              <Link to="/admin" className="text-indigo-600 hover:text-indigo-900">Admin</Link>
            )}
            <button onClick={logout} className="text-indigo-600 hover:text-indigo-900">Logout</button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects and tasks..."
                className="flex-1 border-gray-300 rounded-l-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700"
              >
                Search
              </button>
            </form>
            {searchResults.tasks.length > 0 || searchResults.projects.length > 0 ? (
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">Search Results</h3>
                {searchResults.projects.map((project) => (
                  <div key={project._id} className="bg-white p-4 rounded-md shadow mb-2">
                    <Link to={`/projects/${project._id}`} className="text-indigo-600">{project.name}</Link>
                  </div>
                ))}
                {searchResults.tasks.map((task) => (
                  <div key={task._id} className="bg-white p-4 rounded-md shadow mb-2">
                    <p>{task.name} in {task.list.name}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project._id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                    <p className="mt-2 text-sm text-gray-600">{project.description}</p>
                    <div className="mt-4 flex justify-between">
                      <Link
                        to={`/projects/${project._id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Project
                      </Link>
                      {(user?.id === project.owner || user?.role === 'admin') && (
                        <button
                          onClick={() => handleDeleteProject(project._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Project</h3>
            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Project Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Members
                </label>
                <select
                  value={selectedMembers.length > 0 ? selectedMembers[0] : ''}
                  onChange={(e) => setSelectedMembers(e.target.value ? [e.target.value] : [])}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="">Select a member</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Create Project
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;