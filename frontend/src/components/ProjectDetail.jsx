import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
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
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [selectedList, setSelectedList] = useState('');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

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

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleTaskUpdate = () => {
    fetchTasks();
    fetchStats();
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Professional Header */}
      <header className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-slate-600 hover:text-slate-900 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
                <p className="text-sm text-slate-600">Project Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {(user?.id === project.owner || user?.role === 'admin' || user?.role === 'manager') && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Edit Project</h2>
            <form onSubmit={handleUpdateProject} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-none"
                    placeholder="Describe your project"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="members" className="block text-sm font-medium text-slate-700 mb-2">
                  Team Members
                </label>
                <select
                  id="members"
                  value={members.length > 0 ? members[0] : ''}
                  onChange={(e) => setMembers(e.target.value ? [e.target.value] : [])}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                >
                  <option value="">Select a team member</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Project Description */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Project Overview</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Description</h3>
                  <p className="text-slate-600">{project.description || 'No description provided'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Team Members</h3>
                  {project.members && project.members.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {project.members.map((member) => (
                        <span key={member._id} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                          {member.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">No members assigned</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Project Stats */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Project Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-indigo-600">{stats.totalTasks || 0}</div>
                    <div className="text-sm text-slate-600 uppercase tracking-wide">Total Tasks</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-green-600">{stats.completedTasks || 0}</div>
                    <div className="text-sm text-slate-600 uppercase tracking-wide">Completed</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-yellow-600">{stats.inProgressTasks || 0}</div>
                    <div className="text-sm text-slate-600 uppercase tracking-wide">In Progress</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-blue-600">{stats.totalTime || 0}</div>
                    <div className="text-sm text-slate-600 uppercase tracking-wide">Total Time (min)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Task Board</h2>
            <div className="text-sm text-slate-600">
              {lists.length} list{lists.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="flex space-x-6 overflow-x-auto pb-4">
            {lists.map((list) => (
              <div key={list._id} className="bg-white rounded-xl shadow-sm border border-slate-200 w-80 flex-shrink-0">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">{list.name}</h3>
                    <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                      {tasks.filter(task => task.list._id === list._id).length}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    {tasks.filter(task => task.list._id === list._id).map((task) => (
                      <div 
                        key={task._id} 
                        className="bg-slate-50 rounded-lg p-4 cursor-pointer hover:bg-slate-100 transition-colors duration-200 border border-slate-200 hover:shadow-sm"
                        onClick={() => handleTaskClick(task)}
                      >
                        <h4 className="text-sm font-medium text-slate-900 mb-2">{task.name}</h4>
                        <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                          {task.assignee && (
                            <span className="text-slate-500">{task.assignee.name}</span>
                          )}
                        </div>
                        {task.dueDate && (
                          <div className="text-xs text-slate-500">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t border-slate-200">
                    <input
                      type="text"
                      value={selectedList === list._id ? newTaskName : ''}
                      onChange={(e) => {
                        setNewTaskName(e.target.value);
                        setSelectedList(list._id);
                      }}
                      placeholder="Add a new task..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleCreateTask(list._id);
                        }
                      }}
                    />
                  </div>
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