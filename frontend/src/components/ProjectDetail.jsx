import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getProject, updateProject } from '../api/projects';
import { getLists, createList } from '../api/lists';
import { getTasks, createTask, updateTask } from '../api/tasks';
import { getStats } from '../api/stats';
import { getUsers } from '../api/users';
import TaskModal from './TaskModal';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  
  console.log('ProjectDetail mounted with id:', id);
  const [project, setProject] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [selectedList, setSelectedList] = useState('');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [adminTaskName, setAdminTaskName] = useState('');
  const [adminTaskDescription, setAdminTaskDescription] = useState('');
  const [adminTaskAssignee, setAdminTaskAssignee] = useState('');
  const [adminTaskDueDate, setAdminTaskDueDate] = useState('');
  const [adminTaskList, setAdminTaskList] = useState('');

  useEffect(() => {
    if (user) {
      fetchProject();
      fetchLists();
      fetchTasks();
      fetchStats();
      fetchUsers();
    }
  }, [id, user]);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getStats(id);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchProject = async () => {
    console.log('Fetching project with id:', id);
    try {
      const foundProject = await getProject(id);
      console.log('Fetched project:', foundProject);
      setProject(foundProject);
      setName(foundProject.name);
      setDescription(foundProject.description);
      setMembers(foundProject.members ? foundProject.members.map(m => m._id) : []);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchLists = async () => {
    try {
      const data = await getLists(id);
      setLists(data);
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const data = await getTasks(id);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      await updateProject(id, { name, description, members });
      setIsEditing(false);
      fetchProject();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    try {
      await createList({ name: newListName, project: id });
      setNewListName('');
      fetchLists();
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const handleCreateTask = async (listId) => {
    if (!newTaskName.trim()) return;
    try {
      await createTask({ name: newTaskName, list: listId });
      setNewTaskName('');
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleAdminCreateTask = async (e) => {
    e.preventDefault();
    if (!adminTaskName.trim() || !adminTaskList) return;
    
    try {
      const taskData = {
        name: adminTaskName,
        description: adminTaskDescription,
        list: adminTaskList,
        assignee: adminTaskAssignee || undefined,
        dueDate: adminTaskDueDate || undefined
      };
      
      await createTask(taskData);
      
      // Reset form
      setAdminTaskName('');
      setAdminTaskDescription('');
      setAdminTaskAssignee('');
      setAdminTaskDueDate('');
      setAdminTaskList('');
      
      fetchTasks();
      fetchStats();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleTaskUpdate = () => {
    fetchTasks();
    fetchStats();
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50">
      {/* Professional Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link to="/" className="text-gray-600 hover:text-gray-900 mr-6 p-2 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-50 transition-all duration-300 group">
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-600 to-blue-600 p-3 rounded-2xl mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                  <p className="text-gray-600">Project Management Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {(user?.id === project.owner || user?.role === 'admin' || user?.role === 'manager') && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-gradient-to-r from-blue-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium flex items-center group"
                >
                  <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {isEditing ? 'Cancel' : 'Edit Project'}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Edit Project Form */}
        {isEditing && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-blue-600 p-3 rounded-2xl mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Project</h2>
                <p className="text-gray-600">Update project details and team members</p>
              </div>
            </div>
            <form onSubmit={handleUpdateProject} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3">
                    Project Name
                  </label>
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70"
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-3">
                    Description
                  </label>
                  <div className="relative">
                    <svg className="absolute left-4 top-4 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 resize-none"
                      placeholder="Describe your project"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="members" className="block text-sm font-semibold text-gray-700 mb-3">
                  Team Members
                </label>
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <select
                    id="members"
                    value={members.length > 0 ? members[0] : ''}
                    onChange={(e) => setMembers(e.target.value ? [e.target.value] : [])}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 appearance-none"
                  >
                    <option value="">Select a team member</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {/* Admin Task Creation Section */}
              {user?.role === 'admin' && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-r from-red-600 to-red-600 p-2 rounded-xl mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Admin: Add Task</h3>
                      <p className="text-gray-600">Create tasks directly for this project</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleAdminCreateTask} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="adminTaskName" className="block text-sm font-semibold text-gray-700 mb-3">
                          Task Name *
                        </label>
                        <div className="relative">
                          <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <input
                            type="text"
                            id="adminTaskName"
                            value={adminTaskName}
                            onChange={(e) => setAdminTaskName(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70"
                            placeholder="Enter task name"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="adminTaskList" className="block text-sm font-semibold text-gray-700 mb-3">
                          List *
                        </label>
                        <div className="relative">
                          <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <select
                            id="adminTaskList"
                            value={adminTaskList}
                            onChange={(e) => setAdminTaskList(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 appearance-none"
                            required
                          >
                            <option value="">Select a list</option>
                            {lists.map((list) => (
                              <option key={list._id} value={list._id}>
                                {list.name}
                              </option>
                            ))}
                          </select>
                          <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="adminTaskAssignee" className="block text-sm font-semibold text-gray-700 mb-3">
                          Assignee
                        </label>
                        <div className="relative">
                          <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <select
                            id="adminTaskAssignee"
                            value={adminTaskAssignee}
                            onChange={(e) => setAdminTaskAssignee(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 appearance-none"
                          >
                            <option value="">Select assignee (optional)</option>
                            {users.map((user) => (
                              <option key={user._id} value={user._id}>
                                {user.name} ({user.email})
                              </option>
                            ))}
                          </select>
                          <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="adminTaskDueDate" className="block text-sm font-semibold text-gray-700 mb-3">
                          Due Date
                        </label>
                        <div className="relative">
                          <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <input
                            type="date"
                            id="adminTaskDueDate"
                            value={adminTaskDueDate}
                            onChange={(e) => setAdminTaskDueDate(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="adminTaskDescription" className="block text-sm font-semibold text-gray-700 mb-3">
                        Description
                      </label>
                      <div className="relative">
                        <svg className="absolute left-4 top-4 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        <textarea
                          id="adminTaskDescription"
                          value={adminTaskDescription}
                          onChange={(e) => setAdminTaskDescription(e.target.value)}
                          rows={3}
                          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 resize-none"
                          placeholder="Describe the task (optional)"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-red-600 to-red-600 text-white px-8 py-3 rounded-xl hover:from-red-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold flex items-center group"
                      >
                        <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Task
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-all duration-300 font-medium rounded-xl hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold flex items-center group"
                >
                  <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Update Project
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Project Overview */}
        {!isEditing && (
          <div className="mb-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-blue-600 p-3 rounded-2xl mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Project Overview</h2>
                  <p className="text-gray-600">Track your project's progress and metrics</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-500 p-3 rounded-xl">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">{stats.totalTasks || 0}</div>
                      <div className="text-sm text-gray-600 uppercase tracking-wide">Total Tasks</div>
                    </div>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600">{stats.completedTasks || 0}</div>
                      <div className="text-sm text-gray-600 uppercase tracking-wide">Completed</div>
                    </div>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: stats.totalTasks ? ((stats.completedTasks || 0) / stats.totalTasks) * 100 + '%' : '0%' }}></div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-xl">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-yellow-600">{stats.inProgressTasks || 0}</div>
                      <div className="text-sm text-gray-600 uppercase tracking-wide">In Progress</div>
                    </div>
                  </div>
                  <div className="w-full bg-yellow-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500" style={{ width: stats.totalTasks ? ((stats.inProgressTasks || 0) / stats.totalTasks) * 100 + '%' : '0%' }}></div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-500 p-3 rounded-xl">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">{stats.totalTime || 0}</div>
                      <div className="text-sm text-gray-600 uppercase tracking-wide">Total Time (min)</div>
                    </div>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-blue-600 p-3 rounded-2xl mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Task Board</h2>
                <p className="text-gray-600">Organize and track your team's workflow</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">{lists.length}</div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">Active Lists</div>
            </div>
          </div>
          
          <div className="flex space-x-8 overflow-x-auto pb-4">
            {lists.map((list, index) => (
              <div 
                key={list._id} 
                className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 w-80 flex-shrink-0 hover:shadow-2xl transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-blue-100 to-blue-100 p-2 rounded-xl mr-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{list.name}</h3>
                    </div>
                    <span className="bg-gradient-to-r from-blue-100 to-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {tasks.filter(task => task.list._id === list._id).length}
                    </span>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    {tasks.filter(task => task.list._id === list._id).map((task) => (
                      <div 
                        key={task._id} 
                        className="group bg-white/80 backdrop-blur-sm rounded-xl p-4 cursor-pointer hover:bg-white/90 transition-all duration-300 border border-white/20 hover:shadow-lg hover:scale-105 hover:-translate-y-1"
                        onClick={() => handleTaskClick(task)}
                      >
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-300">{task.name}</h4>
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            task.status === 'done' ? 'bg-green-100 text-green-800' :
                            task.status === 'inprogress' ? 'bg-yellow-100 text-yellow-800' :
                            task.status === 'await_release' ? 'bg-blue-100 text-blue-800' :
                            task.status === 'in_review' ? 'bg-blue-100 text-blue-800' :
                            task.status === 'reopened' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status === 'todo' ? 'To Do' :
                             task.status === 'inprogress' ? 'In Progress' :
                             task.status === 'await_release' ? 'Await Release' :
                             task.status === 'in_review' ? 'In Review' :
                             task.status === 'reopened' ? 'Reopened' :
                             task.status === 'closed' ? 'Closed' : task.status}
                          </span>
                          {task.assignee && (
                            <span className="text-gray-500">{task.assignee.name}</span>
                          )}
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center text-xs text-gray-500">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                    {tasks.filter(task => task.list._id === list._id).length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-sm">No tasks yet</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Add Task Button */}
                  <button className="w-full bg-gradient-to-r from-blue-600 to-blue-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium flex items-center justify-center group">
                    <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
          users={users}
          lists={lists}
        />
      )}
    </div>
  );
};

export default ProjectDetail;