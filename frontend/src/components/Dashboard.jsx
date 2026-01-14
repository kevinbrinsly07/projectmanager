import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getProjects, createProject, deleteProject } from '../api/projects';
import { getTasks } from '../api/tasks';
import { search } from '../api/search';
import { getNotifications, markAsRead } from '../api/notifications';
import { getUsers } from '../api/users';

const Dashboard = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [projectTasks, setProjectTasks] = useState({});
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ tasks: [], projects: [] });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);

      // Fetch tasks for each project
      const tasksMap = {};
      for (const project of data) {
        try {
          const tasks = await getTasks(project._id);
          tasksMap[project._id] = tasks;
        } catch (error) {
          console.error(`Error fetching tasks for project ${project._id}:`, error);
          tasksMap[project._id] = [];
        }
      }
      setProjectTasks(tasksMap);
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

  useEffect(() => {
    if (!loading && !user) navigate('/login');
    else if (!loading && user) {
      fetchProjects();
      fetchNotifications();
      fetchUsers();
    }
  }, [user, loading, navigate]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      await createProject({
        name: newProjectName,
        description: newProjectDescription,
        members: selectedMembers,
      });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-cyan-50">
      {/* Enhanced Header with Glass Effect */}
      <header className="bg-white/80 backdrop-blur-lg shadow-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl blur opacity-25"></div>
                <div className="relative bg-gradient-to-r from-violet-600 to-indigo-600 p-2 rounded-xl">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  ProjectFlow
                </h1>
                <p className="text-xs text-slate-500 -mt-1">Streamline your workflow</p>
              </div>
            </div>

            <nav className="flex items-center space-x-4">
              {/* Enhanced Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-3 text-slate-600 hover:text-slate-900 hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 rounded-xl transition-all duration-300 hover:shadow-lg group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 17H9a6 6 0 01-6-6V9a6 6 0 0110.293-4.293L15 6.414V17z" />
                  </svg>

                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse shadow-lg">
                      {notifications.filter((n) => !n.read).length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-top-2 duration-300">
                    <div className="p-4 border-b border-slate-200/50">
                      <h3 className="text-sm font-semibold text-slate-900 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 17H9a6 6 0 01-6-6V9a6 6 0 0110.293-4.293L15 6.414V17z" />
                        </svg>
                        Notifications
                      </h3>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-500">
                          <p className="text-sm">You're all caught up!</p>
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification._id}
                            className={`p-4 border-b border-slate-100/50 hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-indigo-50/50 transition-all duration-200 ${
                              !notification.read ? 'bg-gradient-to-r from-blue-50/50 to-indigo-50/50' : ''
                            }`}
                          >
                            <p className="text-sm text-slate-900 mb-2">{notification.message}</p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-slate-500">{new Date(notification.createdAt).toLocaleString()}</p>
                              {!notification.read && (
                                <button
                                  onClick={() => handleMarkAsRead(notification._id)}
                                  className="text-xs text-violet-600 hover:text-violet-700 transition-colors duration-200 font-medium hover:bg-violet-50 px-2 py-1 rounded-lg"
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <div className="flex items-center space-x-2">
                {user && user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-lg font-medium flex items-center group"
                  >
                    Admin
                  </Link>
                )}

                <Link
                  to="/timeline"
                  className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-lg font-medium flex items-center group"
                >
                  Timeline
                </Link>

                <button
                  onClick={logout}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2 rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium flex items-center group"
                >
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div>
          {/* Projects Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Your Projects</h2>
                <p className="text-slate-600">Manage and track your team's progress</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <div
                  key={project._id}
                  className="group bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{project.name}</h3>
                        <p className="text-slate-600 line-clamp-2 text-sm">{project.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-indigo-600">{projectTasks[project._id]?.length || 0}</div>
                        <div className="text-xs text-slate-600 uppercase tracking-wide">Tasks</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-green-600">
                          {projectTasks[project._id]?.filter((t) => t.status === 'done').length || 0}
                        </div>
                        <div className="text-xs text-slate-600 uppercase tracking-wide">Completed</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <Link to={`/projects/${project._id}`} className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                        View Project
                      </Link>

                      {(user?.id === project.owner || user?.role === 'admin' || user?.role === 'manager') && (
                        <button
                          onClick={() => handleDeleteProject(project._id)}
                          className="text-red-600 hover:text-red-700 font-medium text-sm"
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

          {/* Create Project Section */}
          {user && (user.role === 'admin' || user.role === 'manager') && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Create New Project</h3>
              <form onSubmit={handleCreateProject} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-8 py-3 rounded-xl"
                >
                  Create Project
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;