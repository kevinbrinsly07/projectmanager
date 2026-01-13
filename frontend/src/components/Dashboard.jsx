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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Professional Header */}
      <header className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ProjectManager
                </h1>
              </div>
            </div>
            
            <nav className="flex items-center space-x-6">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)} 
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 17H9a6 6 0 01-6-6V9a6 6 0 0110.293-4.293L15 6.414V17z" />
                  </svg>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50">
                    <div className="p-4 border-b border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-slate-500">
                          <svg className="w-8 h-8 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 17H9a6 6 0 01-6-6V9a6 6 0 0110.293-4.293L15 6.414V17z" />
                          </svg>
                          No notifications
                        </div>
                      ) : (
                        notifications.slice(0, 5).map(notification => (
                          <div key={notification._id} className={`p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}>
                            <p className="text-sm text-slate-900 mb-1">{notification.message}</p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-slate-500">{new Date(notification.createdAt).toLocaleString()}</p>
                              {!notification.read && (
                                <button 
                                  onClick={() => handleMarkAsRead(notification._id)} 
                                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
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
              <div className="flex items-center space-x-4">
                {user && user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors duration-200 font-medium"
                  >
                    Admin
                  </Link>
                )}
                <Link 
                  to="/timeline" 
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors duration-200 font-medium"
                >
                  Timeline
                </Link>
                <button 
                  onClick={logout} 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-sm"
                >
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Search Projects & Tasks</h2>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects and tasks..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-sm"
              >
                Search
              </button>
            </form>
            
            {/* Search Results */}
            {searchResults.tasks.length > 0 || searchResults.projects.length > 0 ? (
              <div className="mt-6 space-y-4">
                <h3 className="text-md font-semibold text-slate-900 border-b border-slate-200 pb-2">Search Results</h3>
                
                {searchResults.projects.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Projects</h4>
                    <div className="space-y-2">
                      {searchResults.projects.map((project) => (
                        <div key={project._id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                          <Link to={`/projects/${project._id}`} className="text-indigo-600 hover:text-indigo-700 font-medium">
                            {project.name}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {searchResults.tasks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Tasks</h4>
                    <div className="space-y-2">
                      {searchResults.tasks.map((task) => (
                        <div key={task._id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                          <p className="text-slate-900 font-medium">{task.name}</p>
                          <p className="text-sm text-slate-600">in {task.list.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Your Projects</h2>
            <div className="text-sm text-slate-600">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project._id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{project.name}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2">{project.description}</p>
                    </div>
                  </div>
                  
                  {/* Project Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-indigo-600">{projectTasks[project._id]?.length || 0}</div>
                      <div className="text-xs text-slate-600 uppercase tracking-wide">Tasks</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-600">
                        {projectTasks[project._id]?.filter(t => t.status === 'done').length || 0}
                      </div>
                      <div className="text-xs text-slate-600 uppercase tracking-wide">Completed</div>
                    </div>
                  </div>
                  
                  {/* Recent Tasks */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Recent Tasks</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {projectTasks[project._id]?.slice(0, 3).map((task) => (
                        <div key={task._id} className="flex items-center justify-between bg-slate-50 rounded-lg p-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{task.name}</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              task.status === 'done' ? 'bg-green-100 text-green-800' :
                              task.status === 'inprogress' ? 'bg-yellow-100 text-yellow-800' :
                              task.status === 'await_release' ? 'bg-blue-100 text-blue-800' :
                              task.status === 'in_review' ? 'bg-purple-100 text-purple-800' :
                              task.status === 'reopened' ? 'bg-red-100 text-red-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {task.status === 'todo' ? 'To Do' :
                               task.status === 'inprogress' ? 'In Progress' :
                               task.status === 'await_release' ? 'Await Release' :
                               task.status === 'in_review' ? 'In Review' :
                               task.status === 'reopened' ? 'Reopened' :
                               task.status === 'closed' ? 'Closed' : task.status}
                            </span>
                          </div>
                          {task.dueDate && (
                            <div className="text-xs text-slate-500 ml-2">
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )) || (
                        <p className="text-sm text-slate-500 italic">No tasks yet</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <Link
                      to={`/projects/${project._id}`}
                      className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Project
                    </Link>
                    {(user?.id === project.owner || user?.role === 'admin' || user?.role === 'manager') && (
                      <button
                        onClick={() => handleDeleteProject(project._id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                    placeholder="Enter project name"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-none"
                    placeholder="Describe your project"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Team Members
                </label>
                <select
                  value={selectedMembers.length > 0 ? selectedMembers[0] : ''}
                  onChange={(e) => setSelectedMembers(e.target.value ? [e.target.value] : [])}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                >
                  <option value="">Select a team member</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-sm flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Project
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;