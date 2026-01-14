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
  const [project, setProject] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [adminTaskName, setAdminTaskName] = useState('');
  const [adminTaskDescription, setAdminTaskDescription] = useState('');
  const [adminTaskAssignee, setAdminTaskAssignee] = useState('');
  const [adminTaskDueDate, setAdminTaskDueDate] = useState('');
  const [adminTaskList, setAdminTaskList] = useState('');
  const [adminTaskStatus, setAdminTaskStatus] = useState('todo');

  useEffect(() => {
    if (user) {
      fetchProject();
      fetchLists();
      fetchTasks();
      fetchStats();
      fetchUsers();
    }
  }, [id, user]); // eslint-disable-line react-hooks/exhaustive-deps

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
    try {
      const foundProject = await getProject(id);
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
      if (data.length === 0) {
        // Create a default list if none exist
        console.log('No lists found, creating default list...');
        const defaultList = await createList({ name: 'Default List', project: id });
        setLists([defaultList]);
      } else {
        setLists(data);
      }
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
      // Update project
      await updateProject(id, { name, description, members });

      // Create admin task if user is admin and task name is provided
      if (user?.role === 'admin' && adminTaskName.trim()) {
        const taskData = {
          name: adminTaskName,
          description: adminTaskDescription,
          list: adminTaskList,
          assignee: adminTaskAssignee || undefined,
          dueDate: adminTaskDueDate || undefined,
          status: adminTaskStatus
        };

        await createTask(taskData);

        // Reset admin task form
        setAdminTaskName('');
        setAdminTaskDescription('');
        setAdminTaskAssignee('');
        setAdminTaskDueDate('');
        setAdminTaskList('');
        setAdminTaskStatus('todo');
        fetchTasks();
        fetchStats();
      }

      setIsEditing(false);
      fetchProject();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleTaskUpdate = () => {
    fetchTasks();
    fetchStats();
  };

  // Auto-select first list for admin task creation
  useEffect(() => {
    if (lists.length > 0 && !adminTaskList) {
      setAdminTaskList(lists[0]._id);
    }
  }, [lists]); // Removed adminTaskList from dependencies

  // Status configuration
  const statusConfig = {
    todo: { label: 'To Do', color: 'bg-gray-100 border-gray-300', headerColor: 'bg-gray-200' },
    reopened: { label: 'Reopened', color: 'bg-red-100 border-red-300', headerColor: 'bg-red-200' },
    inprogress: { label: 'In Progress', color: 'bg-yellow-100 border-yellow-300', headerColor: 'bg-yellow-200' },
    await_release: { label: 'Await Release', color: 'bg-blue-100 border-blue-300', headerColor: 'bg-blue-200' },
    in_review: { label: 'In Review', color: 'bg-blue-100 border-blue-300', headerColor: 'bg-blue-200' },
    closed: { label: 'Closed', color: 'bg-green-100 border-green-300', headerColor: 'bg-green-200' }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Group tasks by status
  const tasksByStatus = tasks.reduce((acc, task) => {
    const status = task.status || 'todo';
    if (!acc[status]) acc[status] = [];
    acc[status].push(task);
    return acc;
  }, {});

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
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
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="adminTaskStatus" className="block text-sm font-semibold text-gray-700 mb-3">
                        Status
                      </label>
                      <div className="relative">
                        <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <select
                          id="adminTaskStatus"
                          value={adminTaskStatus}
                          onChange={(e) => setAdminTaskStatus(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 appearance-none"
                        >
                          <option value="todo">To Do</option>
                          <option value="inprogress">In Progress</option>
                          <option value="await_release">Await Release</option>
                          <option value="in_review">In Review</option>
                          <option value="reopened">Reopened</option>
                          <option value="closed">Closed</option>
                        </select>
                        <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
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
                          <option value="">Unassigned</option>
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
                  {user?.role === 'admin' ? 'Save Changes' : 'Update Project'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Project Overview */}
        {!isEditing && (
          <div className="mb-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
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
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold flex items-center group"
                >
                  <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Project
                </button>
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